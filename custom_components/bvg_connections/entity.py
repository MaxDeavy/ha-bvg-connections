"""Base entity."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity import EntityDescription
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, SUBENTRY_CONNECTION
from .coordinator import BvgCoordinator


class BvgEntity[CoordinatorT: BvgCoordinator](CoordinatorEntity[CoordinatorT]):
    """Entity belonging to one connection or departure board (one device each)."""

    _attr_has_entity_name = True

    def __init__(
        self, coordinator: CoordinatorT, description: EntityDescription
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)
        self.entity_description = description
        subentry = coordinator.subentry
        self._attr_unique_id = f"{subentry.subentry_id}_{description.key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, subentry.subentry_id)},
            name=subentry.title,
            entry_type=DeviceEntryType.SERVICE,
            manufacturer="BVG / VBB",
            model=(
                "Verbindung"
                if subentry.subentry_type == SUBENTRY_CONNECTION
                else "Abfahrtstafel"
            ),
            configuration_url="https://v6.bvg.transport.rest/",
        )

    @property
    def available(self) -> bool:
        """Keep showing the last data while the API is unreachable."""
        return self.coordinator.data is not None
