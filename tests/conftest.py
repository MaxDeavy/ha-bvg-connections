"""Shared fixtures."""

from __future__ import annotations

from collections.abc import Generator
import json
from pathlib import Path
from typing import Any

from homeassistant.config_entries import ConfigSubentryData
from homeassistant.core import HomeAssistant
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.test_util.aiohttp import (
    AiohttpClientMocker,
)

from custom_components.bvg_connections.const import (
    CONF_BASE_URL,
    CONF_DEPARTURE_INTERVAL,
    CONF_DESTINATION,
    CONF_HIDE_MISSED,
    CONF_JOURNEY_INTERVAL,
    CONF_ORIGIN,
    CONF_REQUEST_BUDGET,
    CONF_RESULTS,
    CONF_STOP,
    CONF_WALK_MINUTES,
    DEFAULT_BASE_URL,
    DOMAIN,
    SUBENTRY_CONNECTION,
    SUBENTRY_DEPARTURE_BOARD,
)

pytest_plugins = "pytest_homeassistant_custom_component"

FIXTURES = Path(__file__).parent / "fixtures"
# Fixtures were recorded on 2026-11-04 around 09:34 Berlin time.
FROZEN_TIME = "2026-11-04T08:30:00+00:00"
API = DEFAULT_BASE_URL

ORIGIN = {
    "type": "stop",
    "id": "900024101",
    "name": "S Charlottenburg Bhf (Berlin)",
    "latitude": 52.504806,
    "longitude": 13.303846,
    "products": ["suburban", "bus", "regional"],
}
DESTINATION = {
    "type": "stop",
    "id": "900079221",
    "name": "S+U Hermannstr. (Berlin)",
    "latitude": 52.467546,
    "longitude": 13.431295,
    "products": ["suburban", "subway", "bus"],
}


def load_fixture(name: str) -> Any:
    """Load a recorded API response."""
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(
    enable_custom_integrations: None,
) -> Generator[None]:
    """Enable custom integrations in all tests."""
    yield


@pytest.fixture
def mock_api(aioclient_mock: AiohttpClientMocker) -> AiohttpClientMocker:
    """Answer API requests with recorded responses."""
    aioclient_mock.get(f"{API}/locations/nearby", json=load_fixture("nearby.json"))
    aioclient_mock.get(
        f"{API}/locations?query=Platz+der+Republik",
        json=load_fixture("locations_address.json"),
    )
    aioclient_mock.get(f"{API}/locations?query=nothing", json=[])
    aioclient_mock.get(f"{API}/locations", json=load_fixture("locations.json"))
    aioclient_mock.get(
        f"{API}/journeys?to.address=Platz", json=load_fixture("journeys_address.json")
    )
    aioclient_mock.get(f"{API}/journeys", json=load_fixture("journeys.json"))
    aioclient_mock.get(
        f"{API}/stops/900024101/departures", json=load_fixture("departures.json")
    )
    return aioclient_mock


def connection_subentry(**extra: Any) -> ConfigSubentryData:
    """Subentry data for a connection."""
    return ConfigSubentryData(
        data={
            CONF_ORIGIN: ORIGIN,
            CONF_DESTINATION: DESTINATION,
            CONF_WALK_MINUTES: 5,
            CONF_RESULTS: 3,
            CONF_HIDE_MISSED: True,
            **extra,
        },
        subentry_type=SUBENTRY_CONNECTION,
        title="Charlottenburg → Hermannstr.",
        unique_id=None,
    )


def board_subentry(**extra: Any) -> ConfigSubentryData:
    """Subentry data for a departure board."""
    return ConfigSubentryData(
        data={
            CONF_STOP: ORIGIN,
            CONF_WALK_MINUTES: 2,
            CONF_RESULTS: 8,
            CONF_HIDE_MISSED: True,
            **extra,
        },
        subentry_type=SUBENTRY_DEPARTURE_BOARD,
        title="Charlottenburg",
        unique_id=None,
    )


@pytest.fixture
def config_entry() -> MockConfigEntry:
    """Config entry with one connection and one departure board."""
    return MockConfigEntry(
        domain=DOMAIN,
        title="BVG Verbindungen",
        unique_id=API,
        data={CONF_BASE_URL: API},
        options={
            CONF_REQUEST_BUDGET: 40,
            CONF_JOURNEY_INTERVAL: 30,
            CONF_DEPARTURE_INTERVAL: 30,
        },
        subentries_data=[connection_subentry(), board_subentry()],
    )


@pytest.fixture
async def loaded_entry(
    hass: HomeAssistant,
    config_entry: MockConfigEntry,
    mock_api: AiohttpClientMocker,
    freezer: Any,
) -> MockConfigEntry:
    """Set up the integration with recorded data at the recording time."""
    freezer.move_to(FROZEN_TIME)
    config_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(config_entry.entry_id)
    await hass.async_block_till_done()
    return config_entry
