"""Setup, entities, coordinator error handling and diagnostics."""

from __future__ import annotations

from datetime import timedelta
import re
from typing import Any
from unittest.mock import patch

from homeassistant.config_entries import ConfigEntryState, ConfigSubentry
from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    device_registry as dr,
    entity_registry as er,
    issue_registry as ir,
)
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)
from pytest_homeassistant_custom_component.components.diagnostics import (
    get_diagnostics_for_config_entry,
)
from pytest_homeassistant_custom_component.test_util.aiohttp import (
    AiohttpClientMocker,
)

from custom_components.bvg_connections import _async_register_card
from custom_components.bvg_connections.const import (
    CONF_EXCLUDED_LINES,
    DOMAIN,
    FAILURES_BEFORE_ISSUE,
)

from .conftest import API, FROZEN_TIME, connection_subentry, load_fixture


def _entity_id(hass: HomeAssistant, entry: MockConfigEntry, key: str, sub: str) -> str:
    registry = er.async_get(hass)
    subentry_id = next(
        s.subentry_id for s in entry.subentries.values() if s.subentry_type == sub
    )
    entity_id = registry.async_get_entity_id(
        "sensor" if key != "disruption" else "binary_sensor",
        DOMAIN,
        f"{subentry_id}_{key}",
    )
    assert entity_id
    return entity_id


async def test_setup_creates_entities(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Sensors and devices exist per subentry with journey data."""
    assert loaded_entry.state is ConfigEntryState.LOADED
    devices = dr.async_entries_for_config_entry(
        dr.async_get(hass), loaded_entry.entry_id
    )
    assert {d.name for d in devices} == {
        "Charlottenburg → Hermannstr.",
        "Charlottenburg",
    }

    next_dep = hass.states.get(
        _entity_id(hass, loaded_entry, "next_departure", "connection")
    )
    assert next_dep is not None
    attrs = next_dep.attributes
    assert attrs["bvg_type"] == "connection"
    assert attrs["origin"] == "S Charlottenburg Bhf"
    assert attrs["destination"] == "S+U Hermannstr."
    assert attrs["walk_minutes"] == 5
    assert len(attrs["journeys"]) == 3
    assert attrs["journeys"][0]["lines"] == ["S7", "S42"]
    assert attrs["stale"] is False
    assert next_dep.state == "2026-11-04T08:47:00+00:00"

    leave = hass.states.get(_entity_id(hass, loaded_entry, "leave_at", "connection"))
    assert leave.state == "2026-11-04T08:42:00+00:00"
    duration = hass.states.get(_entity_id(hass, loaded_entry, "duration", "connection"))
    assert int(duration.state) > 10
    transfers = hass.states.get(
        _entity_id(hass, loaded_entry, "transfers", "connection")
    )
    assert transfers.state == "1"
    delay = hass.states.get(_entity_id(hass, loaded_entry, "delay", "connection"))
    assert delay.state == "0"
    disruption = hass.states.get(
        _entity_id(hass, loaded_entry, "disruption", "connection")
    )
    assert disruption.state == STATE_OFF

    board = hass.states.get(
        _entity_id(hass, loaded_entry, "next_departure", "departure_board")
    )
    assert board.attributes["bvg_type"] == "departure_board"
    assert board.attributes["stop"] == "S Charlottenburg Bhf"
    assert len(board.attributes["departures"]) == 8
    board_disruption = hass.states.get(
        _entity_id(hass, loaded_entry, "disruption", "departure_board")
    )
    assert board_disruption.state == STATE_ON
    assert board_disruption.attributes["remarks"]


async def test_large_attributes_not_recorded(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Journey and departure lists are excluded from the recorder."""
    from custom_components.bvg_connections.sensor import (  # noqa: PLC0415
        ConnectionSensor,
        DepartureBoardSensor,
    )

    assert "journeys" in ConnectionSensor._unrecorded_attributes
    assert "departures" in DepartureBoardSensor._unrecorded_attributes


async def test_stale_data_backoff_and_repair(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    mock_api: AiohttpClientMocker,
    freezer: Any,
) -> None:
    """Failures keep old data, back off, and raise a repair issue."""
    entity_id = _entity_id(hass, loaded_entry, "next_departure", "connection")
    coordinator = next(iter(loaded_entry.runtime_data.coordinators.values()))
    mock_api.clear_requests()
    mock_api.get(f"{API}/journeys", status=429, headers={"Retry-After": "120"})
    mock_api.get(f"{API}/stops/900024101/departures", status=503)

    await coordinator.async_refresh()
    await hass.async_block_till_done()
    state = hass.states.get(entity_id)
    assert state.state != "unavailable"
    assert state.attributes["stale"] is True
    assert coordinator.update_interval == timedelta(seconds=120)

    for _ in range(FAILURES_BEFORE_ISSUE):
        await coordinator.async_refresh()
    assert coordinator.update_interval == timedelta(seconds=600)
    issue_id = f"api_unreachable_{loaded_entry.entry_id}"
    assert ir.async_get(hass).async_get_issue(DOMAIN, issue_id)

    mock_api.clear_requests()
    mock_api.get(f"{API}/journeys", json=load_fixture("journeys.json"))
    await coordinator.async_refresh()
    assert coordinator.update_interval == timedelta(seconds=30)
    assert coordinator.failures == 0
    assert ir.async_get(hass).async_get_issue(DOMAIN, issue_id) is None
    assert hass.states.get(entity_id).attributes["stale"] is False


async def test_scheduled_refresh(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    mock_api: AiohttpClientMocker,
    freezer: Any,
) -> None:
    """Coordinators poll again after the configured interval."""
    calls = mock_api.call_count
    freezer.tick(timedelta(seconds=31))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    assert mock_api.call_count >= calls + 2


async def test_setup_fails_when_api_down(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    aioclient_mock: AiohttpClientMocker,
) -> None:
    """The entry retries later if the first refresh fails."""
    aioclient_mock.get(f"{API}/journeys", status=500)
    config_entry.add_to_hass(hass)
    await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    assert config_entry.state is ConfigEntryState.SETUP_RETRY


async def test_subentry_update_reloads(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Changing a subentry reloads the entry and applies new filters."""
    subentry = next(
        s for s in loaded_entry.subentries.values() if s.subentry_type == "connection"
    )
    data = {**subentry.data, CONF_EXCLUDED_LINES: ["S7"]}
    hass.config_entries.async_update_subentry(loaded_entry, subentry, data=data)
    await hass.async_block_till_done()
    assert loaded_entry.state is ConfigEntryState.LOADED
    state = hass.states.get(
        _entity_id(hass, loaded_entry, "next_departure", "connection")
    )
    assert all("S7" not in j["lines"] for j in state.attributes["journeys"])


async def test_add_subentry_and_unload(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Adding a subentry creates new entities; unloading works."""
    data = connection_subentry()
    hass.config_entries.async_add_subentry(
        loaded_entry,
        ConfigSubentry(
            data=data["data"],
            subentry_type=data["subentry_type"],
            title="Second",
            unique_id=None,
        ),
    )
    await hass.async_block_till_done()
    assert len(loaded_entry.runtime_data.coordinators) == 3
    assert await hass.config_entries.async_unload(loaded_entry.entry_id)
    assert loaded_entry.state is ConfigEntryState.NOT_LOADED
    await hass.config_entries.async_remove(loaded_entry.entry_id)


async def test_diagnostics_redact_locations(
    hass: HomeAssistant, loaded_entry: MockConfigEntry, hass_client: Any
) -> None:
    """Diagnostics never contain the configured stops."""
    assert await async_setup_component(hass, "diagnostics", {})
    diag = await get_diagnostics_for_config_entry(hass, hass_client, loaded_entry)
    text = str(diag)
    assert "Charlottenburg" not in text
    assert "900024101" not in text
    assert diag["entry"]["subentry_count"] == 2
    assert diag["subentries"]["subentry_0"]["journeys"][0]["lines"] == ["S7", "S42"]


async def test_card_registration(hass: HomeAssistant) -> None:
    """The bundled card is served and added as extra module."""
    await _async_register_card(hass)  # no http/frontend: silently skipped

    class FakeHttp:
        def __init__(self) -> None:
            self.paths: list[Any] = []

        async def async_register_static_paths(self, configs: list[Any]) -> None:
            self.paths.extend(configs)

    hass.http = FakeHttp()  # type: ignore[assignment]
    hass.config.components.add("frontend")
    with patch(
        "homeassistant.components.frontend.add_extra_js_url"
    ) as add_extra_js_url:
        await _async_register_card(hass)
    assert hass.http.paths[0].url_path == "/bvg_connections/bvg-connections-card.js"
    assert hass.http.paths[0].path.endswith("frontend/bvg-connections-card.js")
    add_extra_js_url.assert_called_once()
    assert FROZEN_TIME


async def test_connection_pages_with_later_ref(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    aioclient_mock: AiohttpClientMocker,
    freezer: Any,
) -> None:
    """If too few journeys remain after filtering, the next page is loaded."""
    freezer.move_to(FROZEN_TIME)
    first = load_fixture("journeys.json")
    first["journeys"] = first["journeys"][:1]
    aioclient_mock.get(
        re.compile(r"/journeys\?.*laterThan="), json=load_fixture("journeys.json")
    )
    aioclient_mock.get(f"{API}/journeys", json=first)
    aioclient_mock.get(
        f"{API}/stops/900024101/departures", json=load_fixture("departures.json")
    )
    config_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    coordinator = next(iter(config_entry.runtime_data.coordinators.values()))
    assert len(coordinator.data.journeys) == 3
    assert any("laterThan" in call[1].query for call in aioclient_mock.mock_calls)
