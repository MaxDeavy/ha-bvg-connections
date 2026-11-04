"""BVG Verbindungen: journeys and departure boards for Berlin public transport."""

from __future__ import annotations

from dataclasses import dataclass, field
import logging
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, issue_registry as ir
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.typing import ConfigType

from .api import BvgApiClient
from .const import (
    CARD_FILENAME,
    CARD_URL_BASE,
    CONF_BASE_URL,
    CONF_DEPARTURE_INTERVAL,
    CONF_JOURNEY_INTERVAL,
    CONF_REQUEST_BUDGET,
    DEFAULT_BASE_URL,
    DEFAULT_DEPARTURE_INTERVAL,
    DEFAULT_JOURNEY_INTERVAL,
    DEFAULT_REQUEST_BUDGET,
    DOMAIN,
    SUBENTRY_CONNECTION,
    SUBENTRY_DEPARTURE_BOARD,
    VERSION,
)
from .coordinator import (
    BvgCoordinator,
    ConnectionCoordinator,
    DepartureBoardCoordinator,
)

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.BINARY_SENSOR, Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type BvgConfigEntry = ConfigEntry[BvgRuntimeData]


@dataclass
class BvgRuntimeData:
    """Objects shared by the platforms of one config entry."""

    client: BvgApiClient
    coordinators: dict[str, BvgCoordinator] = field(default_factory=dict)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Serve the bundled Lovelace card and load it on every dashboard."""
    await _async_register_card(hass)
    return True


async def _async_register_card(hass: HomeAssistant) -> None:
    if hass.http is None or "frontend" not in hass.config.components:
        _LOGGER.debug("Frontend not loaded, card not registered")
        return
    # Imported lazily: the frontend package is only required at runtime.
    from homeassistant.components.frontend import add_extra_js_url  # noqa: PLC0415
    from homeassistant.components.http import StaticPathConfig  # noqa: PLC0415

    path = Path(__file__).parent / "frontend" / CARD_FILENAME
    url = f"{CARD_URL_BASE}/{CARD_FILENAME}"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(url, str(path), cache_headers=False)]
    )
    add_extra_js_url(hass, f"{url}?v={VERSION}")


async def async_setup_entry(hass: HomeAssistant, entry: BvgConfigEntry) -> bool:
    """Set up one API endpoint with its connections and departure boards."""
    client = BvgApiClient(
        async_get_clientsession(hass),
        entry.data.get(CONF_BASE_URL, DEFAULT_BASE_URL),
        int(entry.options.get(CONF_REQUEST_BUDGET, DEFAULT_REQUEST_BUDGET)),
    )
    runtime = BvgRuntimeData(client=client)
    journey_interval = int(
        entry.options.get(CONF_JOURNEY_INTERVAL, DEFAULT_JOURNEY_INTERVAL)
    )
    board_interval = int(
        entry.options.get(CONF_DEPARTURE_INTERVAL, DEFAULT_DEPARTURE_INTERVAL)
    )

    for subentry_id, subentry in entry.subentries.items():
        coordinator: BvgCoordinator
        if subentry.subentry_type == SUBENTRY_CONNECTION:
            coordinator = ConnectionCoordinator(
                hass, entry, subentry, client, journey_interval
            )
        elif subentry.subentry_type == SUBENTRY_DEPARTURE_BOARD:
            coordinator = DepartureBoardCoordinator(
                hass, entry, subentry, client, board_interval
            )
        else:
            continue
        await coordinator.async_config_entry_first_refresh()
        runtime.coordinators[subentry_id] = coordinator

    entry.runtime_data = runtime
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def _async_update_listener(hass: HomeAssistant, entry: BvgConfigEntry) -> None:
    """Reload when options or subentries change."""
    hass.config_entries.async_schedule_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: BvgConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: BvgConfigEntry) -> None:
    """Clean up repair issues of a removed entry."""
    ir.async_delete_issue(hass, DOMAIN, f"api_unreachable_{entry.entry_id}")
