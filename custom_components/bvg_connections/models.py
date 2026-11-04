"""Data models and parsers for journeys and departures."""

from __future__ import annotations

from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import re
from typing import Any

from homeassistant.util import dt as dt_util

from .line_colors import line_color

STATUS_OK = "ok"
STATUS_DELAYED = "delayed"
STATUS_AT_RISK = "connection_at_risk"
STATUS_CANCELLED = "cancelled"
STATUS_NO_REALTIME = "no_realtime"

# Delays below this (seconds) still count as "on time".
DELAY_THRESHOLD = 120
# A journey or departure stays visible this long after its leave time.
MISSED_GRACE = timedelta(seconds=30)

_CITY_SUFFIX = re.compile(r"\s*\((Berlin|Potsdam)\)$")


def clean_name(name: str | None) -> str:
    """Drop the redundant city suffix, e.g. 'S+U Alexanderplatz Bhf (Berlin)' -> 'S+U Alexanderplatz Bhf'."""
    return _CITY_SUFFIX.sub("", name or "").strip()


def _dt(value: Any) -> datetime | None:
    if not value or not isinstance(value, str):
        return None
    return dt_util.parse_datetime(value)


def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def _minutes(seconds: int | None) -> int | None:
    return None if seconds is None else round(seconds / 60)


def _place_name(place: Mapping[str, Any] | None) -> str:
    if not place:
        return ""
    return clean_name(place.get("name") or place.get("address"))


def parse_remarks(remarks: Iterable[Mapping[str, Any]] | None) -> list[dict[str, str]]:
    """Keep warnings and realtime status messages; drop hints like bike carriage."""
    result: list[dict[str, str]] = []
    seen: set[str] = set()
    for remark in remarks or ():
        kind = remark.get("type")
        if kind not in ("warning", "status"):
            continue
        text = str(remark.get("text") or remark.get("summary") or "").strip()
        if not text or text in seen:
            continue
        seen.add(text)
        item = {"type": str(kind), "text": text}
        if remark.get("summary"):
            item["summary"] = str(remark["summary"])
        result.append(item)
    return result


@dataclass(slots=True)
class Leg:
    """One leg of a journey: a ride or a walk."""

    walking: bool
    line: str | None
    product: str | None
    color: str
    text_color: str
    origin: str
    destination: str
    direction: str | None
    departure: datetime | None
    planned_departure: datetime | None
    departure_delay: int | None
    arrival: datetime | None
    planned_arrival: datetime | None
    arrival_delay: int | None
    departure_platform: str | None
    planned_departure_platform: str | None
    arrival_platform: str | None
    planned_arrival_platform: str | None
    cancelled: bool
    reachable: bool
    occupancy: str | None
    distance: int | None
    trip_id: str | None
    remarks: list[dict[str, str]]

    @classmethod
    def from_api(cls, raw: Mapping[str, Any]) -> Leg:
        """Parse a leg object."""
        line = raw.get("line") or {}
        walking = bool(raw.get("walking"))
        name = None if walking else line.get("name")
        product = None if walking else line.get("product")
        bg, fg = line_color(name, product)
        return cls(
            walking=walking,
            line=name,
            product=product,
            color=bg,
            text_color=fg,
            origin=_place_name(raw.get("origin")),
            destination=_place_name(raw.get("destination")),
            direction=clean_name(raw.get("direction")) or None,
            departure=_dt(raw.get("departure")),
            planned_departure=_dt(raw.get("plannedDeparture")),
            departure_delay=raw.get("departureDelay"),
            arrival=_dt(raw.get("arrival")),
            planned_arrival=_dt(raw.get("plannedArrival")),
            arrival_delay=raw.get("arrivalDelay"),
            departure_platform=raw.get("departurePlatform"),
            planned_departure_platform=raw.get("plannedDeparturePlatform"),
            arrival_platform=raw.get("arrivalPlatform"),
            planned_arrival_platform=raw.get("plannedArrivalPlatform"),
            cancelled=bool(raw.get("cancelled")),
            reachable=raw.get("reachable") is not False,
            occupancy=raw.get("occupancy"),
            distance=raw.get("distance"),
            trip_id=raw.get("tripId"),
            remarks=parse_remarks(raw.get("remarks")),
        )

    @property
    def effective_departure(self) -> datetime | None:
        """Realtime departure, planned time for cancelled legs."""
        return self.departure or self.planned_departure

    @property
    def effective_arrival(self) -> datetime | None:
        """Realtime arrival, planned time for cancelled legs."""
        return self.arrival or self.planned_arrival

    def as_dict(self) -> dict[str, Any]:
        """Serialize for entity attributes (read by the Lovelace card)."""
        return {
            "walking": self.walking,
            "line": self.line,
            "product": self.product,
            "color": self.color,
            "text_color": self.text_color,
            "from": self.origin,
            "to": self.destination,
            "direction": self.direction,
            "departure": _iso(self.effective_departure),
            "planned_departure": _iso(self.planned_departure),
            "departure_delay": _minutes(self.departure_delay),
            "arrival": _iso(self.effective_arrival),
            "planned_arrival": _iso(self.planned_arrival),
            "arrival_delay": _minutes(self.arrival_delay),
            "platform": self.departure_platform or self.planned_departure_platform,
            "platform_changed": bool(
                self.departure_platform
                and self.planned_departure_platform
                and self.departure_platform != self.planned_departure_platform
            ),
            "arrival_platform": self.arrival_platform or self.planned_arrival_platform,
            "cancelled": self.cancelled,
            "reachable": self.reachable,
            "occupancy": self.occupancy,
            "distance": self.distance,
            "remarks": self.remarks,
        }


@dataclass(slots=True)
class Journey:
    """A journey from origin to destination."""

    legs: list[Leg]
    refresh_token: str | None = None
    remarks: list[dict[str, str]] = field(default_factory=list)

    @classmethod
    def from_api(cls, raw: Mapping[str, Any]) -> Journey:
        """Parse a journey object."""
        return cls(
            legs=[Leg.from_api(leg) for leg in raw.get("legs") or ()],
            refresh_token=raw.get("refreshToken"),
            remarks=parse_remarks(raw.get("remarks")),
        )

    @property
    def rides(self) -> list[Leg]:
        """Legs using a vehicle."""
        return [leg for leg in self.legs if not leg.walking]

    @property
    def departure(self) -> datetime | None:
        """When the journey starts at the origin (including an initial walk)."""
        return self.legs[0].effective_departure if self.legs else None

    @property
    def planned_departure(self) -> datetime | None:
        """Planned start."""
        return self.legs[0].planned_departure if self.legs else None

    @property
    def arrival(self) -> datetime | None:
        """Arrival at the destination."""
        return self.legs[-1].effective_arrival if self.legs else None

    @property
    def planned_arrival(self) -> datetime | None:
        """Planned arrival."""
        return self.legs[-1].planned_arrival if self.legs else None

    @property
    def delay(self) -> int | None:
        """Departure delay of the first ride in seconds (None = no realtime)."""
        rides = self.rides
        return rides[0].departure_delay if rides else None

    @property
    def arrival_delay(self) -> int | None:
        """Arrival delay of the last ride in seconds."""
        rides = self.rides
        return rides[-1].arrival_delay if rides else None

    @property
    def duration(self) -> int | None:
        """Total travel time in minutes."""
        if self.departure is None or self.arrival is None:
            return None
        return round((self.arrival - self.departure).total_seconds() / 60)

    @property
    def transfers(self) -> int:
        """Number of changes between vehicles."""
        return max(0, len(self.rides) - 1)

    @property
    def cancelled(self) -> bool:
        """True if any ride is cancelled."""
        return any(leg.cancelled for leg in self.rides)

    @property
    def at_risk(self) -> bool:
        """True if a connection is marked as not reachable."""
        return any(not leg.reachable for leg in self.rides)

    @property
    def starts_with_walk(self) -> bool:
        """True if the journey begins with a walk to another stop."""
        return bool(self.legs) and self.legs[0].walking

    @property
    def lines(self) -> list[str]:
        """Line names in order."""
        return [leg.line for leg in self.rides if leg.line]

    @property
    def trip_key(self) -> tuple[str, ...]:
        """Identity used to drop near-identical journeys."""
        return tuple(leg.trip_id or leg.line or "" for leg in self.rides)

    @property
    def all_remarks(self) -> list[dict[str, str]]:
        """Journey and leg remarks, de-duplicated."""
        seen: set[str] = set()
        result = []
        for remark in [*self.remarks, *(r for leg in self.legs for r in leg.remarks)]:
            if remark["text"] not in seen:
                seen.add(remark["text"])
                result.append(remark)
        return result

    @property
    def status(self) -> str:
        """Overall status for display."""
        if self.cancelled:
            return STATUS_CANCELLED
        if self.at_risk:
            return STATUS_AT_RISK
        delays = [
            d
            for leg in self.rides
            for d in (leg.departure_delay, leg.arrival_delay)
            if d is not None
        ]
        if not delays:
            return STATUS_NO_REALTIME
        if self.delay is not None and self.delay >= DELAY_THRESHOLD:
            return STATUS_DELAYED
        if self.arrival_delay is not None and self.arrival_delay >= DELAY_THRESHOLD:
            return STATUS_DELAYED
        return STATUS_OK

    def leave_at(self, walk_minutes: int) -> datetime | None:
        """When to leave home to catch this journey."""
        dep = self.departure
        return dep - timedelta(minutes=walk_minutes) if dep else None

    def as_dict(self, walk_minutes: int = 0) -> dict[str, Any]:
        """Serialize for entity attributes (read by the Lovelace card)."""
        return {
            "departure": _iso(self.departure),
            "planned_departure": _iso(self.planned_departure),
            "arrival": _iso(self.arrival),
            "planned_arrival": _iso(self.planned_arrival),
            "leave_at": _iso(self.leave_at(walk_minutes)),
            "delay": _minutes(self.delay),
            "arrival_delay": _minutes(self.arrival_delay),
            "duration": self.duration,
            "transfers": self.transfers,
            "status": self.status,
            "starts_with_walk": self.starts_with_walk,
            "lines": self.lines,
            "legs": [leg.as_dict() for leg in self.legs],
            "remarks": self.all_remarks,
            "refresh_token": self.refresh_token,
        }


@dataclass(slots=True)
class Departure:
    """One entry of a departure board."""

    line: str | None
    product: str | None
    color: str
    text_color: str
    direction: str
    when: datetime | None
    planned_when: datetime | None
    delay: int | None
    platform: str | None
    planned_platform: str | None
    cancelled: bool
    occupancy: str | None
    trip_id: str | None
    remarks: list[dict[str, str]]

    @classmethod
    def from_api(cls, raw: Mapping[str, Any]) -> Departure:
        """Parse a departure object."""
        line = raw.get("line") or {}
        bg, fg = line_color(line.get("name"), line.get("product"))
        return cls(
            line=line.get("name"),
            product=line.get("product"),
            color=bg,
            text_color=fg,
            direction=clean_name(raw.get("direction")),
            when=_dt(raw.get("when")),
            planned_when=_dt(raw.get("plannedWhen")),
            delay=raw.get("delay"),
            platform=raw.get("platform"),
            planned_platform=raw.get("plannedPlatform"),
            cancelled=bool(raw.get("cancelled")),
            occupancy=raw.get("occupancy"),
            trip_id=raw.get("tripId"),
            remarks=parse_remarks(raw.get("remarks")),
        )

    @property
    def effective_when(self) -> datetime | None:
        """Realtime departure, planned time for cancelled trips."""
        return self.when or self.planned_when

    def leave_at(self, walk_minutes: int) -> datetime | None:
        """When to leave to catch this departure."""
        when = self.effective_when
        return when - timedelta(minutes=walk_minutes) if when else None

    def as_dict(self, walk_minutes: int = 0) -> dict[str, Any]:
        """Serialize for entity attributes (read by the Lovelace card)."""
        return {
            "line": self.line,
            "product": self.product,
            "color": self.color,
            "text_color": self.text_color,
            "direction": self.direction,
            "when": _iso(self.effective_when),
            "planned_when": _iso(self.planned_when),
            "leave_at": _iso(self.leave_at(walk_minutes)),
            "delay": _minutes(self.delay),
            "platform": self.platform or self.planned_platform,
            "platform_changed": bool(
                self.platform
                and self.planned_platform
                and self.platform != self.planned_platform
            ),
            "cancelled": self.cancelled,
            "occupancy": self.occupancy,
            "remarks": self.remarks,
        }


def parse_journeys(payload: Mapping[str, Any]) -> list[Journey]:
    """Parse a /journeys response."""
    return [Journey.from_api(raw) for raw in payload.get("journeys") or ()]


def parse_departures(payload: Mapping[str, Any]) -> list[Departure]:
    """Parse a /stops/:id/departures response."""
    return [Departure.from_api(raw) for raw in payload.get("departures") or ()]


def _normalize_lines(lines: Iterable[str] | None) -> set[str]:
    return {line.replace(" ", "").upper() for line in lines or () if line.strip()}


def filter_journeys(
    journeys: Sequence[Journey],
    *,
    now: datetime,
    walk_minutes: int = 0,
    hide_missed: bool = True,
    excluded_lines: Iterable[str] | None = None,
    limit: int | None = None,
) -> list[Journey]:
    """Drop departed, unreachable, duplicate and excluded journeys; sort by departure."""
    excluded = _normalize_lines(excluded_lines)
    seen: set[tuple[str, ...]] = set()
    result: list[Journey] = []
    for journey in sorted(
        (j for j in journeys if j.departure is not None),
        key=lambda j: (j.departure, j.arrival or j.departure),
    ):
        if journey.departure is None or journey.departure < now - MISSED_GRACE:
            continue
        leave_at = journey.leave_at(walk_minutes)
        if hide_missed and leave_at is not None and leave_at < now - MISSED_GRACE:
            continue
        if excluded and any(
            line.replace(" ", "").upper() in excluded for line in journey.lines
        ):
            continue
        key = journey.trip_key
        if key and key in seen:
            continue
        seen.add(key)
        result.append(journey)
    return result[:limit] if limit else result


def filter_departures(
    departures: Sequence[Departure],
    *,
    now: datetime,
    walk_minutes: int = 0,
    hide_missed: bool = True,
    lines: Iterable[str] | None = None,
    direction: str | None = None,
    limit: int | None = None,
) -> list[Departure]:
    """Apply line/direction filters, drop missed and duplicate departures."""
    wanted = _normalize_lines(lines)
    direction_filter = (direction or "").strip().casefold()
    seen: set[tuple[str | None, str | None]] = set()
    result: list[Departure] = []
    for dep in sorted(
        (d for d in departures if d.effective_when is not None),
        key=lambda d: d.effective_when,  # type: ignore[arg-type,return-value]
    ):
        when = dep.effective_when
        if when is None or when < now - MISSED_GRACE:
            continue
        leave_at = dep.leave_at(walk_minutes)
        if hide_missed and leave_at is not None and leave_at < now - MISSED_GRACE:
            continue
        if wanted and (dep.line or "").replace(" ", "").upper() not in wanted:
            continue
        if direction_filter and direction_filter not in dep.direction.casefold():
            continue
        key = (dep.trip_id, dep.line)
        if dep.trip_id and key in seen:
            continue
        seen.add(key)
        result.append(dep)
    return result[:limit] if limit else result


def next_journey(journeys: Sequence[Journey]) -> Journey | None:
    """First journey that is not cancelled."""
    return next((j for j in journeys if not j.cancelled), None)


def next_departure(departures: Sequence[Departure]) -> Departure | None:
    """First departure that is not cancelled."""
    return next((d for d in departures if not d.cancelled), None)
