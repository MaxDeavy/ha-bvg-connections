"""Disruption binary sensors."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import BvgConfigEntry
from .coordinator import BvgCoordinator, ConnectionCoordinator
from .entity import BvgEntity
from .models import STATUS_AT_RISK, STATUS_CANCELLED

PARALLEL_UPDATES = 0

DISRUPTION = BinarySensorEntityDescription(
    key="disruption",
    translation_key="disruption",
    device_class=BinarySensorDeviceClass.PROBLEM,
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: BvgConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create one disruption sensor per subentry."""
    for subentry_id, coordinator in entry.runtime_data.coordinators.items():
        async_add_entities(
            [DisruptionSensor(coordinator, DISRUPTION)],
            config_subentry_id=subentry_id,
        )


def _warnings(remarks: list[dict[str, str]]) -> list[dict[str, str]]:
    return [r for r in remarks if r["type"] == "warning"]


class DisruptionSensor(BvgEntity[BvgCoordinator], BinarySensorEntity):
    """On when the next journey/departures are cancelled, at risk or have warnings."""

    _unrecorded_attributes = frozenset({"remarks"})

    def _evaluate(self) -> tuple[bool, dict[str, Any]]:
        data = self.coordinator.data
        if data is None:
            return False, {}
        if isinstance(self.coordinator, ConnectionCoordinator):
            journeys = data.journeys
            if not journeys:
                return False, {"status": None, "remarks": []}
            journey = journeys[0]
            remarks = _warnings(journey.all_remarks)
            status = journey.status
            problem = status in (STATUS_CANCELLED, STATUS_AT_RISK) or bool(remarks)
            return problem, {"status": status, "remarks": remarks}
        departures = data.departures
        cancelled = sum(1 for d in departures if d.cancelled)
        seen: set[str] = set()
        remarks = []
        for dep in departures:
            for remark in _warnings(dep.remarks):
                if remark["text"] not in seen:
                    seen.add(remark["text"])
                    remarks.append({**remark, "line": dep.line or ""})
        return bool(cancelled or remarks), {"cancelled": cancelled, "remarks": remarks}

    @property
    def is_on(self) -> bool:
        """Return True if there is a disruption."""
        return self._evaluate()[0]

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Details about the disruption."""
        return self._evaluate()[1]
