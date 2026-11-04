"""Config flow: one entry per API endpoint, subentries per connection/board."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from homeassistant.config_entries import (
    SOURCE_RECONFIGURE,
    ConfigEntry,
    ConfigEntryState,
    ConfigFlow,
    ConfigFlowResult,
    ConfigSubentryFlow,
    OptionsFlow,
    SubentryFlowResult,
)
from homeassistant.const import CONF_NAME
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    BooleanSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)
import voluptuous as vol

from .api import BvgApiClient, BvgApiError
from .const import (
    CONF_BASE_URL,
    CONF_DEPARTURE_INTERVAL,
    CONF_DESTINATION,
    CONF_DESTINATION_QUERY,
    CONF_DIRECTION,
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
    DEFAULT_BOARD_DURATION,
    DEFAULT_BOARD_RESULTS,
    DEFAULT_CONNECTION_RESULTS,
    DEFAULT_DEPARTURE_INTERVAL,
    DEFAULT_JOURNEY_INTERVAL,
    DEFAULT_REQUEST_BUDGET,
    DOMAIN,
    MAX_INTERVAL,
    MAX_REQUEST_BUDGET,
    MIN_INTERVAL,
    PRODUCTS,
    REQUESTS_PER_BOARD_POLL,
    REQUESTS_PER_CONNECTION_POLL,
    SUBENTRY_CONNECTION,
    SUBENTRY_DEPARTURE_BOARD,
)
from .models import clean_name

PRODUCT_LABELS = {
    "suburban": "S",
    "subway": "U",
    "tram": "Tram",
    "bus": "Bus",
    "ferry": "Fähre",
    "regional": "RE/RB",
    "express": "IC/ICE",
}


def _number(
    minimum: float, maximum: float, step: float = 1, unit: str | None = None
) -> NumberSelector:
    config = NumberSelectorConfig(
        min=minimum, max=maximum, step=step, mode=NumberSelectorMode.BOX
    )
    if unit:
        config["unit_of_measurement"] = unit
    return NumberSelector(config)


PRODUCT_SELECTOR = SelectSelector(
    SelectSelectorConfig(
        options=list(PRODUCTS),
        multiple=True,
        translation_key="product",
        mode=SelectSelectorMode.LIST,
    )
)
LINES_SELECTOR = SelectSelector(
    SelectSelectorConfig(options=[], multiple=True, custom_value=True)
)


def estimate_requests_per_minute(
    connections: int, boards: int, journey_interval: int, board_interval: int
) -> float:
    """Worst-case API requests per minute for the given setup."""
    return (
        connections * REQUESTS_PER_CONNECTION_POLL * 60 / journey_interval
        + boards * REQUESTS_PER_BOARD_POLL * 60 / board_interval
    )


def normalize_location(raw: Mapping[str, Any]) -> dict[str, Any] | None:
    """Convert a /locations result into the stored location format."""
    kind = raw.get("type")
    if kind in ("stop", "station") and raw.get("id"):
        loc = raw.get("location") or {}
        return {
            "type": "stop",
            "id": str(raw["id"]),
            "name": str(raw.get("name") or raw["id"]),
            "latitude": loc.get("latitude"),
            "longitude": loc.get("longitude"),
            "products": [p for p, on in (raw.get("products") or {}).items() if on],
        }
    if kind == "location" and raw.get("latitude") is not None:
        if raw.get("poi"):
            return {
                "type": "poi",
                "id": raw.get("id"),
                "name": str(raw.get("name") or ""),
                "latitude": raw["latitude"],
                "longitude": raw["longitude"],
            }
        if raw.get("address"):
            return {
                "type": "address",
                "name": str(raw["address"]),
                "latitude": raw["latitude"],
                "longitude": raw["longitude"],
            }
    return None


def location_key(location: Mapping[str, Any], index: int) -> str:
    """Stable option value: stop id for stops, index otherwise."""
    if location["type"] == "stop":
        return f"stop:{location['id']}"
    return f"{location['type']}:{index}"


def location_label(location: Mapping[str, Any], language: str) -> str:
    """Human readable option label."""
    name = clean_name(location["name"])
    if location["type"] == "stop":
        products = " · ".join(
            PRODUCT_LABELS[p] for p in PRODUCTS if p in location.get("products", [])
        )
        return f"{name}  [{products}]" if products else name
    kind = {
        "address": ("Adresse", "address"),
        "poi": ("Ort", "place"),
    }[location["type"]]
    return f"{name}  ({kind[0] if language == 'de' else kind[1]})"


class BvgConfigFlow(ConfigFlow, domain=DOMAIN):
    """Set up the API endpoint."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Ask for the API URL and request budget."""
        errors: dict[str, str] = {}
        if user_input is not None:
            base_url = str(user_input[CONF_BASE_URL]).strip().rstrip("/")
            await self.async_set_unique_id(base_url)
            self._abort_if_unique_id_configured()
            client = BvgApiClient(async_get_clientsession(self.hass), base_url, 10)
            try:
                await client.search_locations("Alexanderplatz", results=1)
            except BvgApiError:
                errors["base"] = "cannot_connect"
            else:
                return self.async_create_entry(
                    title="BVG Verbindungen",
                    data={CONF_BASE_URL: base_url},
                    options={
                        CONF_REQUEST_BUDGET: int(user_input[CONF_REQUEST_BUDGET]),
                        CONF_JOURNEY_INTERVAL: DEFAULT_JOURNEY_INTERVAL,
                        CONF_DEPARTURE_INTERVAL: DEFAULT_DEPARTURE_INTERVAL,
                    },
                )
        schema = vol.Schema(
            {
                vol.Required(CONF_BASE_URL, default=DEFAULT_BASE_URL): TextSelector(),
                vol.Required(
                    CONF_REQUEST_BUDGET, default=DEFAULT_REQUEST_BUDGET
                ): _number(5, MAX_REQUEST_BUDGET),
            }
        )
        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(schema, user_input),
            errors=errors,
            description_placeholders={"default_url": DEFAULT_BASE_URL},
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> BvgOptionsFlow:
        """Return the options flow."""
        return BvgOptionsFlow()

    @classmethod
    @callback
    def async_get_supported_subentry_types(
        cls, config_entry: ConfigEntry
    ) -> dict[str, type[ConfigSubentryFlow]]:
        """Connections and departure boards are subentries."""
        return {
            SUBENTRY_CONNECTION: ConnectionSubentryFlow,
            SUBENTRY_DEPARTURE_BOARD: DepartureBoardSubentryFlow,
        }


class BvgOptionsFlow(OptionsFlow):
    """Polling intervals and request budget."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        errors: dict[str, str] = {}
        placeholders = {"estimate": "0"}
        entry = self.config_entry
        connections = sum(
            1
            for s in entry.subentries.values()
            if s.subentry_type == SUBENTRY_CONNECTION
        )
        boards = sum(
            1
            for s in entry.subentries.values()
            if s.subentry_type == SUBENTRY_DEPARTURE_BOARD
        )
        if user_input is not None:
            data = {key: int(value) for key, value in user_input.items()}
            estimate = estimate_requests_per_minute(
                connections,
                boards,
                data[CONF_JOURNEY_INTERVAL],
                data[CONF_DEPARTURE_INTERVAL],
            )
            if estimate > data[CONF_REQUEST_BUDGET]:
                errors["base"] = "budget_exceeded"
                placeholders["estimate"] = f"{estimate:.0f}"
            else:
                return self.async_create_entry(data=data)
        current = {
            CONF_JOURNEY_INTERVAL: DEFAULT_JOURNEY_INTERVAL,
            CONF_DEPARTURE_INTERVAL: DEFAULT_DEPARTURE_INTERVAL,
            CONF_REQUEST_BUDGET: DEFAULT_REQUEST_BUDGET,
            **entry.options,
            **(user_input or {}),
        }
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_JOURNEY_INTERVAL, default=current[CONF_JOURNEY_INTERVAL]
                ): _number(MIN_INTERVAL, MAX_INTERVAL, unit="s"),
                vol.Required(
                    CONF_DEPARTURE_INTERVAL, default=current[CONF_DEPARTURE_INTERVAL]
                ): _number(MIN_INTERVAL, MAX_INTERVAL, unit="s"),
                vol.Required(
                    CONF_REQUEST_BUDGET, default=current[CONF_REQUEST_BUDGET]
                ): _number(5, MAX_REQUEST_BUDGET),
            }
        )
        return self.async_show_form(
            step_id="init",
            data_schema=schema,
            errors=errors,
            description_placeholders=placeholders,
        )


class _BvgSubentryFlow(ConfigSubentryFlow):
    """Shared helpers: location search and the settings step."""

    def __init__(self) -> None:
        """Initialize flow state."""
        self._data: dict[str, Any] = {}
        self._title: str | None = None
        self._choices: dict[str, dict[str, dict[str, Any]]] = {}

    @property
    def _client(self) -> BvgApiClient:
        entry = self._get_entry()
        return entry.runtime_data.client  # type: ignore[no-any-return]

    def _entry_ready(self) -> bool:
        return self._get_entry().state is ConfigEntryState.LOADED

    async def _search(
        self, query: str, *, stops_only: bool
    ) -> dict[str, dict[str, Any]]:
        """Return {option value: location}; empty query = stops near home."""
        query = query.strip()
        if query:
            raw = await self._client.search_locations(
                query, results=8, addresses=not stops_only, poi=not stops_only
            )
        else:
            raw = await self._client.nearby_stops(
                self.hass.config.latitude, self.hass.config.longitude
            )
        result: dict[str, dict[str, Any]] = {}
        for index, item in enumerate(raw):
            location = normalize_location(item)
            if location and (not stops_only or location["type"] == "stop"):
                result.setdefault(location_key(location, index), location)
        return result

    def _select(self, field: str) -> SelectSelector:
        language = self.hass.config.language
        return SelectSelector(
            SelectSelectorConfig(
                options=[
                    SelectOptionDict(value=key, label=location_label(loc, language))
                    for key, loc in self._choices[field].items()
                ],
                mode=SelectSelectorMode.DROPDOWN,
            )
        )

    def _finish(self, title: str, data: dict[str, Any]) -> SubentryFlowResult:
        if self.source == SOURCE_RECONFIGURE:
            return self.async_update_and_abort(
                self._get_entry(),
                self._get_reconfigure_subentry(),
                title=title,
                data=data,
            )
        return self.async_create_entry(title=title, data=data)

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Edit filters and walking time of an existing subentry."""
        subentry = self._get_reconfigure_subentry()
        self._data = dict(subentry.data)
        self._title = subentry.title
        return await self.async_step_settings()

    async def async_step_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Implemented by subclasses."""
        raise NotImplementedError


def _locations(data: Mapping[str, Any]) -> dict[str, Any]:
    """Keep only the location part of stored data (settings are re-entered)."""
    return {
        key: data[key]
        for key in (CONF_ORIGIN, CONF_DESTINATION, CONF_STOP)
        if key in data
    }


def _clean_settings(user_input: dict[str, Any]) -> dict[str, Any]:
    """Convert number fields to int and drop empty optional values."""
    result: dict[str, Any] = {}
    for key, raw in user_input.items():
        if key == CONF_NAME:
            continue
        value = int(raw) if isinstance(raw, float) else raw
        if key in (CONF_EXCLUDED_LINES, CONF_LINES):
            value = sorted({str(v).strip() for v in raw if str(v).strip()})
        elif key == CONF_PRODUCTS and set(raw) == set(PRODUCTS):
            value = []
        elif key == CONF_DIRECTION:
            value = str(raw).strip()
        result[key] = value
    return result


class ConnectionSubentryFlow(_BvgSubentryFlow):
    """Add or edit a connection (origin -> destination)."""

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Search origin and destination."""
        if not self._entry_ready():
            return self.async_abort(reason="entry_not_loaded")
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                origins = await self._search(
                    user_input.get(CONF_ORIGIN_QUERY, ""), stops_only=False
                )
                destinations = await self._search(
                    user_input[CONF_DESTINATION_QUERY], stops_only=False
                )
            except BvgApiError:
                errors["base"] = "cannot_connect"
            else:
                if not origins:
                    errors[CONF_ORIGIN_QUERY] = "no_results"
                if not destinations:
                    errors[CONF_DESTINATION_QUERY] = "no_results"
                if not errors:
                    self._choices = {
                        CONF_ORIGIN: origins,
                        CONF_DESTINATION: destinations,
                    }
                    return await self.async_step_select()
        schema = vol.Schema(
            {
                vol.Optional(CONF_ORIGIN_QUERY): TextSelector(),
                vol.Required(CONF_DESTINATION_QUERY): TextSelector(),
            }
        )
        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(schema, user_input),
            errors=errors,
        )

    async def async_step_select(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Pick origin and destination from the search results."""
        errors: dict[str, str] = {}
        if user_input is not None:
            origin = self._choices[CONF_ORIGIN][user_input[CONF_ORIGIN]]
            destination = self._choices[CONF_DESTINATION][user_input[CONF_DESTINATION]]
            if (origin["type"], origin.get("id"), origin["name"]) == (
                destination["type"],
                destination.get("id"),
                destination["name"],
            ):
                errors["base"] = "same_location"
            else:
                self._data = {CONF_ORIGIN: origin, CONF_DESTINATION: destination}
                return await self.async_step_settings()
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_ORIGIN, default=next(iter(self._choices[CONF_ORIGIN]))
                ): self._select(CONF_ORIGIN),
                vol.Required(
                    CONF_DESTINATION,
                    default=next(iter(self._choices[CONF_DESTINATION])),
                ): self._select(CONF_DESTINATION),
            }
        )
        return self.async_show_form(step_id="select", data_schema=schema, errors=errors)

    async def async_step_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Walking time, filters and number of results."""
        if user_input is not None:
            title = str(user_input[CONF_NAME]).strip()
            return self._finish(
                title, {**_locations(self._data), **_clean_settings(user_input)}
            )
        data = self._data
        default_name = self._title or (
            f"{clean_name(data[CONF_ORIGIN]['name'])} → "
            f"{clean_name(data[CONF_DESTINATION]['name'])}"
        )
        schema = vol.Schema(
            {
                vol.Required(CONF_NAME, default=default_name): TextSelector(),
                vol.Required(
                    CONF_WALK_MINUTES, default=data.get(CONF_WALK_MINUTES, 0)
                ): _number(0, 60, unit="min"),
                vol.Required(
                    CONF_RESULTS,
                    default=data.get(CONF_RESULTS, DEFAULT_CONNECTION_RESULTS),
                ): _number(1, 8),
                vol.Required(
                    CONF_HIDE_MISSED, default=data.get(CONF_HIDE_MISSED, True)
                ): BooleanSelector(),
                vol.Optional(
                    CONF_PRODUCTS, default=data.get(CONF_PRODUCTS) or list(PRODUCTS)
                ): PRODUCT_SELECTOR,
                vol.Optional(
                    CONF_EXCLUDED_LINES, default=data.get(CONF_EXCLUDED_LINES, [])
                ): LINES_SELECTOR,
                vol.Optional(
                    CONF_MAX_TRANSFERS,
                    description={"suggested_value": data.get(CONF_MAX_TRANSFERS)},
                ): _number(0, 6),
                vol.Required(
                    CONF_TRANSFER_TIME, default=data.get(CONF_TRANSFER_TIME, 0)
                ): _number(0, 30, unit="min"),
            }
        )
        return self.async_show_form(step_id="settings", data_schema=schema)


class DepartureBoardSubentryFlow(_BvgSubentryFlow):
    """Add or edit a departure board for a stop."""

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Search the stop."""
        if not self._entry_ready():
            return self.async_abort(reason="entry_not_loaded")
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                stops = await self._search(
                    user_input.get(CONF_STOP_QUERY, ""), stops_only=True
                )
            except BvgApiError:
                errors["base"] = "cannot_connect"
            else:
                if stops:
                    self._choices = {CONF_STOP: stops}
                    return await self.async_step_select()
                errors[CONF_STOP_QUERY] = "no_results"
        schema = vol.Schema({vol.Optional(CONF_STOP_QUERY): TextSelector()})
        return self.async_show_form(
            step_id="user",
            data_schema=self.add_suggested_values_to_schema(schema, user_input),
            errors=errors,
        )

    async def async_step_select(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Pick the stop."""
        if user_input is not None:
            self._data = {CONF_STOP: self._choices[CONF_STOP][user_input[CONF_STOP]]}
            return await self.async_step_settings()
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_STOP, default=next(iter(self._choices[CONF_STOP]))
                ): self._select(CONF_STOP)
            }
        )
        return self.async_show_form(step_id="select", data_schema=schema)

    async def async_step_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> SubentryFlowResult:
        """Filters, time window and walking time."""
        if user_input is not None:
            title = str(user_input[CONF_NAME]).strip()
            return self._finish(
                title, {**_locations(self._data), **_clean_settings(user_input)}
            )
        data = self._data
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_NAME,
                    default=self._title or clean_name(data[CONF_STOP]["name"]),
                ): TextSelector(),
                vol.Required(
                    CONF_WALK_MINUTES, default=data.get(CONF_WALK_MINUTES, 0)
                ): _number(0, 60, unit="min"),
                vol.Required(
                    CONF_RESULTS, default=data.get(CONF_RESULTS, DEFAULT_BOARD_RESULTS)
                ): _number(1, 20),
                vol.Required(
                    CONF_DURATION,
                    default=data.get(CONF_DURATION, DEFAULT_BOARD_DURATION),
                ): _number(10, 180, step=5, unit="min"),
                vol.Required(
                    CONF_HIDE_MISSED, default=data.get(CONF_HIDE_MISSED, True)
                ): BooleanSelector(),
                vol.Optional(
                    CONF_PRODUCTS, default=data.get(CONF_PRODUCTS) or list(PRODUCTS)
                ): PRODUCT_SELECTOR,
                vol.Optional(CONF_LINES, default=data.get(CONF_LINES, [])): (
                    LINES_SELECTOR
                ),
                vol.Optional(
                    CONF_DIRECTION,
                    description={"suggested_value": data.get(CONF_DIRECTION)},
                ): TextSelector(),
            }
        )
        return self.async_show_form(step_id="settings", data_schema=schema)
