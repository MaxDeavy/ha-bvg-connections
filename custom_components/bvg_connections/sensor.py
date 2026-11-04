"""Sensors for connections and departure boards."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
)
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import BvgConfigEntry
from .const import (
    ATTR_BVG_TYPE,
    CONF_DESTINATION,
    CONF_ORIGIN,
    CONF_STOP,
    SUBENTRY_CONNECTION,
    SUBENTRY_DEPARTURE_BOARD,
)
from .coordinator import ConnectionCoordinator, DepartureBoardCoordinator
from .entity import BvgEntity
from .models import clean_name, next_departure, next_journey

PARALLEL_UPDATES = 0


@dataclass(frozen=True, kw_only=True)
class ConnectionSensorDescription(SensorEntityDescription):
    """Describes a connection sensor."""

    value_fn: Callable[[ConnectionCoordinator], Any]


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def _location_name(location: dict[str, Any] | None) -> str:
    return clean_name((location or {}).get("name"))


def _next(coordinator: ConnectionCoordinator):  # type: ignore[no-untyped-def]
    return next_journey(coordinator.data.journeys) if coordinator.data else None


def _delay_minutes(coordinator: ConnectionCoordinator) -> int | None:
    journey = _next(coordinator)
    if journey is None or journey.delay is None:
        return None
    return round(journey.delay / 60)


CONNECTION_SENSORS: tuple[ConnectionSensorDescription, ...] = (
    ConnectionSensorDescription(
        key="next_departure",
        translation_key="next_departure",
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=lambda c: j.departure if (j := _next(c)) else None,
    ),
    ConnectionSensorDescription(
        key="leave_at",
        translation_key="leave_at",
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=lambda c: j.leave_at(c.walk_minutes) if (j := _next(c)) else None,
    ),
    ConnectionSensorDescription(
        key="duration",
        translation_key="duration",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.MINUTES,
        value_fn=lambda c: j.duration if (j := _next(c)) else None,
    ),
    ConnectionSensorDescription(
        key="transfers",
        translation_key="transfers",
        value_fn=lambda c: j.transfers if (j := _next(c)) else None,
    ),
    ConnectionSensorDescription(
        key="delay",
        translation_key="delay",
        device_class=SensorDeviceClass.DURATION,
        native_unit_of_measurement=UnitOfTime.MINUTES,
        value_fn=_delay_minutes,
    ),
)

BOARD_SENSOR = SensorEntityDescription(
    key="next_departure",
    translation_key="board_next_departure",
    device_class=SensorDeviceClass.TIMESTAMP,
)

_COMMON_UNRECORDED = frozenset(
    {
        ATTR_BVG_TYPE,
        "walk_minutes",
        "fetched_at",
        "realtime_data_updated_at",
        "stale",
    }
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: BvgConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create sensors per subentry."""
    for subentry_id, coordinator in entry.runtime_data.coordinators.items():
        entities: list[SensorEntity] = []
        if coordinator.subentry.subentry_type == SUBENTRY_CONNECTION:
            assert isinstance(coordinator, ConnectionCoordinator)
            entities.extend(
                ConnectionSensor(coordinator, description)
                for description in CONNECTION_SENSORS
            )
        elif coordinator.subentry.subentry_type == SUBENTRY_DEPARTURE_BOARD:
            assert isinstance(coordinator, DepartureBoardCoordinator)
            entities.append(DepartureBoardSensor(coordinator, BOARD_SENSOR))
        async_add_entities(entities, config_subentry_id=subentry_id)


class ConnectionSensor(BvgEntity[ConnectionCoordinator], SensorEntity):
    """Sensor of a connection."""

    entity_description: ConnectionSensorDescription
    _unrecorded_attributes = _COMMON_UNRECORDED | {
        "journeys",
        "origin",
        "destination",
    }

    @property
    def native_value(self) -> Any:
        """Return the sensor value."""
        return self.entity_description.value_fn(self.coordinator)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Full journey list on the main sensor (consumed by the card)."""
        if self.entity_description.key != "next_departure":
            return None
        data = self.coordinator.data
        opts = self.coordinator.options
        walk = self.coordinator.walk_minutes
        return {
            ATTR_BVG_TYPE: SUBENTRY_CONNECTION,
            "origin": _location_name(opts.get(CONF_ORIGIN)),
            "destination": _location_name(opts.get(CONF_DESTINATION)),
            "walk_minutes": walk,
            "journeys": [j.as_dict(walk) for j in data.journeys] if data else [],
            "fetched_at": _iso(data.fetched_at) if data else None,
            "realtime_data_updated_at": (
                _iso(data.realtime_updated_at) if data else None
            ),
            "stale": self.coordinator.stale,
        }


class DepartureBoardSensor(BvgEntity[DepartureBoardCoordinator], SensorEntity):
    """Next departure of a stop with the full board as attribute."""

    _unrecorded_attributes = _COMMON_UNRECORDED | {"departures", "stop"}

    @property
    def native_value(self) -> datetime | None:
        """Next departure that is not cancelled."""
        data = self.coordinator.data
        dep = next_departure(data.departures) if data else None
        return dep.effective_when if dep else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Departure list consumed by the card."""
        data = self.coordinator.data
        walk = self.coordinator.walk_minutes
        return {
            ATTR_BVG_TYPE: SUBENTRY_DEPARTURE_BOARD,
            "stop": _location_name(self.coordinator.options.get(CONF_STOP)),
            "walk_minutes": walk,
            "departures": [d.as_dict(walk) for d in data.departures] if data else [],
            "fetched_at": _iso(data.fetched_at) if data else None,
            "realtime_data_updated_at": (
                _iso(data.realtime_updated_at) if data else None
            ),
            "stale": self.coordinator.stale,
        }
