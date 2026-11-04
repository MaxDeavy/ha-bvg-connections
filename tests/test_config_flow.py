"""Config, options and subentry flow tests."""

from __future__ import annotations

from homeassistant.config_entries import SOURCE_RECONFIGURE, SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry
from pytest_homeassistant_custom_component.test_util.aiohttp import (
    AiohttpClientMocker,
)

from custom_components.bvg_connections.config_flow import (
    estimate_requests_per_minute,
    location_label,
    normalize_location,
)
from custom_components.bvg_connections.const import (
    CONF_BASE_URL,
    CONF_DEPARTURE_INTERVAL,
    CONF_DESTINATION,
    CONF_DESTINATION_QUERY,
    CONF_DIRECTION,
    CONF_DIRECTIONS,
    CONF_DURATION,
    CONF_EXCLUDED_LINES,
    CONF_HIDE_MISSED,
    CONF_JOURNEY_INTERVAL,
    CONF_LINES,
    CONF_MAX_TRANSFERS,
    CONF_ORIGIN,
    CONF_ORIGIN_QUERY,
    CONF_PRODUCTS,
    CONF_REQUEST_BUDGET,
    CONF_RESULTS,
    CONF_STOP,
    CONF_STOP_QUERY,
    CONF_TRANSFER_TIME,
    CONF_WALK_MINUTES,
    DEFAULT_BASE_URL,
    DOMAIN,
    PRODUCTS,
)

from .conftest import API, load_fixture


async def test_user_flow(hass: HomeAssistant, mock_api: AiohttpClientMocker) -> None:
    """The API is checked and the entry created."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_BASE_URL: DEFAULT_BASE_URL + "/", CONF_REQUEST_BUDGET: 30},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["data"] == {CONF_BASE_URL: DEFAULT_BASE_URL}
    assert result["options"][CONF_REQUEST_BUDGET] == 30
    assert result["options"][CONF_JOURNEY_INTERVAL] == 30

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_BASE_URL: DEFAULT_BASE_URL, CONF_REQUEST_BUDGET: 30}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_user_flow_cannot_connect(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    """Unreachable API shows an error."""
    aioclient_mock.get(f"{API}/locations", status=502)
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_BASE_URL: DEFAULT_BASE_URL, CONF_REQUEST_BUDGET: 30}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "cannot_connect"}


async def test_options_flow(hass: HomeAssistant, loaded_entry: MockConfigEntry) -> None:
    """Intervals are validated against the request budget."""
    result = await hass.config_entries.options.async_init(loaded_entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            CONF_JOURNEY_INTERVAL: 15,
            CONF_DEPARTURE_INTERVAL: 15,
            CONF_REQUEST_BUDGET: 5,
        },
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "budget_exceeded"}
    assert result["description_placeholders"]["estimate"] == "12"
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            CONF_JOURNEY_INTERVAL: 60,
            CONF_DEPARTURE_INTERVAL: 45.0,
            CONF_REQUEST_BUDGET: 30,
        },
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert loaded_entry.options[CONF_DEPARTURE_INTERVAL] == 45
    coordinator = next(iter(loaded_entry.runtime_data.coordinators.values()))
    assert coordinator.base_interval.total_seconds() == 60


def _default(result: dict, field: str) -> object:
    key = next(k for k in result["data_schema"].schema if k == field)
    return key.default()


def test_estimate() -> None:
    """Two connections and two boards at 30 s stay well below 100/min."""
    assert estimate_requests_per_minute(2, 2, 30, 30) == 12


async def test_connection_subentry_flow(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Search, select and configure a connection to an address."""
    result = await hass.config_entries.subentries.async_init(
        (loaded_entry.entry_id, "connection"), context={"source": SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "user"

    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {CONF_ORIGIN_QUERY: "nothing", CONF_DESTINATION_QUERY: "Platz der Republik"},
    )
    assert result["errors"] == {CONF_ORIGIN_QUERY: "no_results"}

    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            CONF_ORIGIN_QUERY: "Alexanderplatz",
            CONF_DESTINATION_QUERY: "Platz der Republik",
        },
    )
    assert result["step_id"] == "select"
    origin_options = result["data_schema"].schema[CONF_ORIGIN].config["options"]
    assert origin_options[0]["value"].startswith("stop:")
    dest_options = result["data_schema"].schema[CONF_DESTINATION].config["options"]
    address_key = dest_options[0]["value"]
    assert address_key.startswith("address:")

    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {CONF_ORIGIN: origin_options[0]["value"], CONF_DESTINATION: address_key},
    )
    assert result["step_id"] == "settings"
    assert _default(result, CONF_WALK_MINUTES) == 5
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            "name": "Zum Reichstag",
            CONF_WALK_MINUTES: 4.0,
            CONF_RESULTS: 3,
            CONF_HIDE_MISSED: True,
            CONF_PRODUCTS: ["subway", "suburban"],
            CONF_EXCLUDED_LINES: [" M10 ", "", "U5"],
            CONF_TRANSFER_TIME: 0,
        },
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    data = result["data"]
    assert data[CONF_ORIGIN]["type"] == "stop"
    assert data[CONF_DESTINATION]["type"] == "address"
    assert data[CONF_WALK_MINUTES] == 4
    assert data[CONF_EXCLUDED_LINES] == ["M10", "U5"]
    assert CONF_MAX_TRANSFERS not in data
    await hass.async_block_till_done()
    assert len(loaded_entry.subentries) == 3


async def test_connection_same_location_and_nearby(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Empty origin lists nearby stops; origin must differ from destination."""
    result = await hass.config_entries.subentries.async_init(
        (loaded_entry.entry_id, "connection"), context={"source": SOURCE_USER}
    )
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {CONF_DESTINATION_QUERY: "Alexanderplatz"}
    )
    origin_options = result["data_schema"].schema[CONF_ORIGIN].config["options"]
    assert "Gontardstr" in origin_options[0]["label"]
    same = "stop:900100003"
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {CONF_ORIGIN: same, CONF_DESTINATION: same}
    )
    assert result["errors"] == {"base": "same_location"}


async def test_connection_reconfigure(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Settings can be changed later; cleared optional values are removed."""
    subentry = next(
        s for s in loaded_entry.subentries.values() if s.subentry_type == "connection"
    )
    hass.config_entries.async_update_subentry(
        loaded_entry,
        subentry,
        data={**subentry.data, CONF_MAX_TRANSFERS: 2, CONF_WALK_MINUTES: 9},
    )
    await hass.async_block_till_done()
    result = await hass.config_entries.subentries.async_init(
        (loaded_entry.entry_id, "connection"),
        context={"source": SOURCE_RECONFIGURE, "subentry_id": subentry.subentry_id},
    )
    assert result["step_id"] == "settings"
    # Stored value wins over the default.
    assert _default(result, CONF_WALK_MINUTES) == 9
    assert _default(result, CONF_RESULTS) == 3
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            "name": "Renamed",
            CONF_WALK_MINUTES: 7,
            CONF_RESULTS: 2,
            CONF_HIDE_MISSED: False,
            CONF_PRODUCTS: list(PRODUCTS),
            CONF_EXCLUDED_LINES: [],
            CONF_TRANSFER_TIME: 2,
        },
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    await hass.async_block_till_done()
    updated = loaded_entry.subentries[subentry.subentry_id]
    assert updated.title == "Renamed"
    assert updated.data[CONF_WALK_MINUTES] == 7
    assert updated.data[CONF_PRODUCTS] == []
    assert CONF_MAX_TRANSFERS not in updated.data
    assert updated.data[CONF_ORIGIN]["id"] == "900024101"


async def test_board_subentry_flow(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Search a stop and configure a departure board."""
    result = await hass.config_entries.subentries.async_init(
        (loaded_entry.entry_id, "departure_board"), context={"source": SOURCE_USER}
    )
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {CONF_STOP_QUERY: "nothing"}
    )
    assert result["errors"] == {CONF_STOP_QUERY: "no_results"}
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {CONF_STOP_QUERY: "Alexanderplatz"}
    )
    assert result["step_id"] == "select"
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {CONF_STOP: "stop:900100003"}
    )
    assert result["step_id"] == "settings"
    assert _default(result, CONF_WALK_MINUTES) == 5
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            "name": "Alex",
            CONF_WALK_MINUTES: 3,
            CONF_RESULTS: 6,
            CONF_DURATION: 30,
            CONF_HIDE_MISSED: True,
            CONF_PRODUCTS: ["subway"],
            CONF_LINES: ["U2", "U8"],
            CONF_DIRECTIONS: [" Pankow ", "", "Osloer"],
        },
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["data"][CONF_STOP]["id"] == "900100003"
    assert result["data"][CONF_LINES] == ["U2", "U8"]
    assert result["data"][CONF_DIRECTIONS] == ["Osloer", "Pankow"]
    assert CONF_DIRECTION not in result["data"]


async def test_board_reconfigure_migrates_direction_string(
    hass: HomeAssistant, loaded_entry: MockConfigEntry
) -> None:
    """Legacy ``direction`` string is shown as a chip and saved as ``directions``."""
    subentry = next(
        s
        for s in loaded_entry.subentries.values()
        if s.subentry_type == "departure_board"
    )
    hass.config_entries.async_update_subentry(
        loaded_entry,
        subentry,
        data={**subentry.data, CONF_DIRECTION: "  Osloer  "},
    )
    await hass.async_block_till_done()
    result = await hass.config_entries.subentries.async_init(
        (loaded_entry.entry_id, "departure_board"),
        context={"source": SOURCE_RECONFIGURE, "subentry_id": subentry.subentry_id},
    )
    assert result["step_id"] == "settings"
    assert _default(result, CONF_DIRECTIONS) == ["Osloer"]
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"],
        {
            "name": subentry.title,
            CONF_WALK_MINUTES: subentry.data.get(CONF_WALK_MINUTES, 5),
            CONF_RESULTS: subentry.data.get(CONF_RESULTS, 8),
            CONF_DURATION: subentry.data.get(CONF_DURATION, 30),
            CONF_HIDE_MISSED: subentry.data.get(CONF_HIDE_MISSED, True),
            CONF_PRODUCTS: subentry.data.get(CONF_PRODUCTS) or list(PRODUCTS),
            CONF_LINES: subentry.data.get(CONF_LINES, []),
            CONF_DIRECTIONS: ["Osloer", "Pankow"],
        },
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    await hass.async_block_till_done()
    updated = loaded_entry.subentries[subentry.subentry_id]
    assert updated.data[CONF_DIRECTIONS] == ["Osloer", "Pankow"]
    assert CONF_DIRECTION not in updated.data


async def test_subentry_cannot_connect(
    hass: HomeAssistant,
    loaded_entry: MockConfigEntry,
    mock_api: AiohttpClientMocker,
) -> None:
    """API errors during search are shown in the form."""
    mock_api.clear_requests()
    mock_api.get(f"{API}/locations/nearby", status=500)
    mock_api.get(f"{API}/locations", status=500)
    for kind, field in (
        ("connection", CONF_DESTINATION_QUERY),
        ("departure_board", CONF_STOP_QUERY),
    ):
        result = await hass.config_entries.subentries.async_init(
            (loaded_entry.entry_id, kind), context={"source": SOURCE_USER}
        )
        result = await hass.config_entries.subentries.async_configure(
            result["flow_id"], {field: "Alexanderplatz"}
        )
        assert result["errors"] == {"base": "cannot_connect"}


async def test_subentry_requires_loaded_entry(hass: HomeAssistant) -> None:
    """Subentries can only be added while the entry is loaded."""
    entry = MockConfigEntry(domain=DOMAIN, data={CONF_BASE_URL: API})
    entry.add_to_hass(hass)
    for kind in ("connection", "departure_board"):
        result = await hass.config_entries.subentries.async_init(
            (entry.entry_id, kind), context={"source": SOURCE_USER}
        )
        assert result["type"] is FlowResultType.ABORT
        assert result["reason"] == "entry_not_loaded"


def test_location_helpers() -> None:
    """Search results are normalized and labelled."""
    stop = normalize_location(load_fixture("locations.json")[0])
    assert stop is not None
    assert stop["type"] == "stop"
    assert "[S · U" in location_label(stop, "de")
    raw = load_fixture("locations_address.json")
    address = normalize_location(raw[0])
    poi = normalize_location(raw[3])
    assert address["type"] == "address"
    assert location_label(address, "de").endswith("(Adresse)")
    assert poi["type"] == "poi"
    assert location_label(poi, "en").endswith("(place)")
    assert normalize_location({"type": "location"}) is None
