"""Diagnostics with personal locations redacted."""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from . import BvgConfigEntry
from .const import CONF_DESTINATION, CONF_ORIGIN, CONF_STOP
from .coordinator import ConnectionCoordinator

TO_REDACT = {CONF_ORIGIN, CONF_DESTINATION, CONF_STOP, "title"}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: BvgConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    runtime = entry.runtime_data
    coordinators: dict[str, Any] = {}
    for index, coordinator in enumerate(runtime.coordinators.values()):
        data = coordinator.data
        info: dict[str, Any] = {
            "type": coordinator.subentry.subentry_type,
            "subentry": async_redact_data(dict(coordinator.subentry.data), TO_REDACT),
            "last_update_success": coordinator.last_update_success,
            "failures": coordinator.failures,
            "update_interval": coordinator.update_interval.total_seconds()
            if coordinator.update_interval
            else None,
            "last_success": coordinator.last_success.isoformat()
            if coordinator.last_success
            else None,
        }
        if data is not None:
            if isinstance(coordinator, ConnectionCoordinator):
                info["journeys"] = [
                    {"lines": j.lines, "status": j.status, "duration": j.duration}
                    for j in data.journeys
                ]
            else:
                info["departures"] = [
                    {"line": d.line, "cancelled": d.cancelled, "delay": d.delay}
                    for d in data.departures
                ]
        coordinators[f"subentry_{index}"] = info
    return {
        "entry": {
            "data": dict(entry.data),
            "options": dict(entry.options),
            "subentry_count": len(entry.subentries),
        },
        "requests_sent": runtime.client.request_count,
        "subentries": coordinators,
    }
