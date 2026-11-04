"""Data update coordinators, one per subentry (connection or departure board)."""

from __future__ import annotations

from abc import abstractmethod
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from typing import TYPE_CHECKING, Any

from homeassistant.config_entries import ConfigSubentry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .api import BvgApiClient, BvgApiError, BvgRateLimitError
from .const import (
    CONF_DESTINATION,
    CONF_DIRECTION,
    CONF_DURATION,
    CONF_EXCLUDED_LINES,
    CONF_HIDE_MISSED,
    CONF_LINES,
    CONF_MAX_TRANSFERS,
    CONF_ORIGIN,
    CONF_PRODUCTS,
    CONF_RESULTS,
    CONF_STOP,
    CONF_TRANSFER_TIME,
    CONF_WALK_MINUTES,
    DEFAULT_BOARD_DURATION,
    DEFAULT_BOARD_RESULTS,
    DEFAULT_CONNECTION_RESULTS,
    DOMAIN,
    FAILURES_BEFORE_ISSUE,
    MAX_BACKOFF_SECONDS,
)
from .models import (
    Departure,
    Journey,
    filter_departures,
    filter_journeys,
    parse_departures,
    parse_journeys,
)

if TYPE_CHECKING:
    from . import BvgConfigEntry

_LOGGER = logging.getLogger(__name__)


@dataclass(slots=True)
class ConnectionData:
    """Result of a journey search."""

    journeys: list[Journey]
    fetched_at: datetime
    realtime_updated_at: datetime | None = None


@dataclass(slots=True)
class DepartureBoardData:
    """Result of a departure board query."""

    departures: list[Departure]
    fetched_at: datetime
    realtime_updated_at: datetime | None = None


def _realtime(payload: dict[str, Any]) -> datetime | None:
    value = payload.get("realtimeDataUpdatedAt")
    if isinstance(value, (int, float)):
        return dt_util.utc_from_timestamp(value)
    return None


class BvgCoordinator[DataT](DataUpdateCoordinator[DataT]):
    """Base coordinator with backoff and stale-data handling."""

    config_entry: BvgConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        entry: BvgConfigEntry,
        subentry: ConfigSubentry,
        client: BvgApiClient,
        interval: int,
    ) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN} {subentry.title}",
            update_interval=timedelta(seconds=interval),
        )
        self.subentry = subentry
        self.client = client
        self.base_interval = timedelta(seconds=interval)
        self.failures = 0
        self.last_success: datetime | None = None

    @property
    def options(self) -> dict[str, Any]:
        """Subentry configuration."""
        return dict(self.subentry.data)

    @property
    def walk_minutes(self) -> int:
        """Walking time from home to the stop."""
        return int(self.options.get(CONF_WALK_MINUTES, 0) or 0)

    @property
    def stale(self) -> bool:
        """True if the shown data is from an earlier successful update."""
        return self.data is not None and not self.last_update_success

    @property
    def issue_id(self) -> str:
        """Repair issue id for this config entry."""
        return f"api_unreachable_{self.config_entry.entry_id}"

    @abstractmethod
    async def _fetch(self) -> DataT:
        """Fetch new data from the API."""

    async def _async_update_data(self) -> DataT:
        try:
            data = await self._fetch()
        except BvgRateLimitError as err:
            self._backoff(err.retry_after)
            raise UpdateFailed(f"Rate limited by API: {err}") from err
        except BvgApiError as err:
            self._backoff(None)
            raise UpdateFailed(f"Error talking to API: {err}") from err
        if self.failures:
            _LOGGER.info("%s: API reachable again", self.name)
        self.failures = 0
        self.update_interval = self.base_interval
        self.last_success = dt_util.utcnow()
        ir.async_delete_issue(self.hass, DOMAIN, self.issue_id)
        return data

    def _backoff(self, retry_after: float | None) -> None:
        self.failures += 1
        base = self.base_interval.total_seconds()
        seconds = min(base * 2 ** (self.failures - 1), MAX_BACKOFF_SECONDS)
        if retry_after:
            seconds = max(seconds, retry_after)
        self.update_interval = timedelta(seconds=seconds)
        if self.failures >= FAILURES_BEFORE_ISSUE:
            ir.async_create_issue(
                self.hass,
                DOMAIN,
                self.issue_id,
                is_fixable=False,
                severity=ir.IssueSeverity.WARNING,
                translation_key="api_unreachable",
                translation_placeholders={"url": self.client.base_url},
            )


class ConnectionCoordinator(BvgCoordinator[ConnectionData]):
    """Journeys for one origin/destination pair."""

    async def _fetch(self) -> ConnectionData:
        opts = self.options
        now = dt_util.now()
        hide_missed = bool(opts.get(CONF_HIDE_MISSED, True))
        limit = int(opts.get(CONF_RESULTS, DEFAULT_CONNECTION_RESULTS))
        query: dict[str, Any] = {
            "products": opts.get(CONF_PRODUCTS) or None,
            "max_transfers": opts.get(CONF_MAX_TRANSFERS),
            "transfer_time": int(opts.get(CONF_TRANSFER_TIME, 0) or 0),
        }

        def _filter(journeys: list[Journey]) -> list[Journey]:
            return filter_journeys(
                journeys,
                now=now,
                walk_minutes=self.walk_minutes,
                hide_missed=hide_missed,
                excluded_lines=opts.get(CONF_EXCLUDED_LINES),
                limit=limit,
            )

        departure = now + timedelta(minutes=self.walk_minutes if hide_missed else 0)
        payload = await self.client.journeys(
            opts[CONF_ORIGIN],
            opts[CONF_DESTINATION],
            departure=departure,
            results=max(limit + 2, 4),
            **query,
        )
        journeys = parse_journeys(payload)
        kept = _filter(journeys)
        if len(kept) < limit and payload.get("laterRef"):
            more = await self.client.journeys(
                opts[CONF_ORIGIN],
                opts[CONF_DESTINATION],
                later_than=payload["laterRef"],
                results=max(limit, 4),
                **query,
            )
            kept = _filter([*journeys, *parse_journeys(more)])
        return ConnectionData(
            journeys=kept,
            fetched_at=dt_util.utcnow(),
            realtime_updated_at=_realtime(payload),
        )


class DepartureBoardCoordinator(BvgCoordinator[DepartureBoardData]):
    """Departure board of one stop."""

    async def _fetch(self) -> DepartureBoardData:
        opts = self.options
        limit = int(opts.get(CONF_RESULTS, DEFAULT_BOARD_RESULTS))
        filtered = bool(opts.get(CONF_LINES) or opts.get(CONF_DIRECTION))
        hide_missed = bool(opts.get(CONF_HIDE_MISSED, True))
        now = dt_util.now()
        payload = await self.client.departures(
            opts[CONF_STOP]["id"],
            # Start the board when the user can be at the stop at the earliest.
            when=now + timedelta(minutes=self.walk_minutes) if hide_missed else None,
            duration=int(opts.get(CONF_DURATION, DEFAULT_BOARD_DURATION)),
            # Fetch more when filtering locally so enough rows remain.
            results=limit * 4 if filtered else limit + 4,
            products=opts.get(CONF_PRODUCTS) or None,
        )
        departures = filter_departures(
            parse_departures(payload),
            now=now,
            walk_minutes=self.walk_minutes,
            hide_missed=hide_missed,
            lines=opts.get(CONF_LINES),
            direction=opts.get(CONF_DIRECTION),
            limit=limit,
        )
        return DepartureBoardData(
            departures=departures,
            fetched_at=dt_util.utcnow(),
            realtime_updated_at=_realtime(payload),
        )
