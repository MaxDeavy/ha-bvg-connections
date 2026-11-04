"""Parser and filter tests."""

from __future__ import annotations

import copy
from datetime import datetime, timedelta

from homeassistant.util import dt as dt_util

from custom_components.bvg_connections.line_colors import (
    DEFAULT_COLOR,
    PRODUCT_COLORS,
    line_color,
)
from custom_components.bvg_connections.models import (
    STATUS_AT_RISK,
    STATUS_CANCELLED,
    STATUS_DELAYED,
    STATUS_NO_REALTIME,
    STATUS_OK,
    clean_name,
    filter_departures,
    filter_journeys,
    next_departure,
    next_journey,
    normalize_directions,
    parse_departures,
    parse_journeys,
    parse_remarks,
)

from .conftest import FROZEN_TIME, load_fixture

NOW = dt_util.parse_datetime(FROZEN_TIME)
assert NOW is not None


def _journeys_payload() -> dict:
    return copy.deepcopy(load_fixture("journeys.json"))


def test_clean_name() -> None:
    """City suffixes are removed."""
    assert clean_name("S Charlottenburg Bhf (Berlin)") == "S Charlottenburg Bhf"
    assert clean_name("Potsdam, Hauptbahnhof") == "Potsdam, Hauptbahnhof"
    assert clean_name(None) == ""


def test_parse_journeys_real_data() -> None:
    """A recorded journey with a transfer is parsed completely."""
    journeys = parse_journeys(_journeys_payload())
    assert len(journeys) == 5
    first = journeys[0]
    assert first.lines == ["S7", "S42"]
    assert first.transfers == 1
    assert first.duration == round(
        (first.arrival - first.departure).total_seconds() / 60
    )
    assert first.status == STATUS_OK
    assert not first.starts_with_walk
    data = first.as_dict(walk_minutes=5)
    assert data["leave_at"] == (first.departure - timedelta(minutes=5)).isoformat()
    assert data["legs"][0]["color"] == "#816DA6"
    assert data["legs"][1]["walking"] is True
    assert data["legs"][0]["from"] == "S Charlottenburg Bhf"
    assert data["lines"] == ["S7", "S42"]


def test_journey_with_initial_walk() -> None:
    """Journeys to an address end with a walk."""
    journeys = parse_journeys(load_fixture("journeys_address.json"))
    assert journeys[0].legs[-1].walking
    assert journeys[0].legs[-1].distance


def test_journey_status_variants() -> None:
    """Delay, cancellation, unreachable connections and missing realtime."""
    payload = _journeys_payload()
    raw = payload["journeys"]
    raw[0]["legs"][0]["departureDelay"] = 180
    raw[1]["legs"][2]["cancelled"] = True
    raw[2]["legs"][2]["reachable"] = False
    for leg in raw[3]["legs"]:
        leg["departureDelay"] = None
        leg["arrivalDelay"] = None
    raw[4]["legs"][-1]["arrivalDelay"] = 240
    journeys = parse_journeys(payload)
    assert [j.status for j in journeys] == [
        STATUS_DELAYED,
        STATUS_CANCELLED,
        STATUS_AT_RISK,
        STATUS_NO_REALTIME,
        STATUS_DELAYED,
    ]
    assert journeys[0].as_dict()["delay"] == 3
    assert next_journey(journeys) is journeys[0]
    assert next_journey([journeys[1]]) is None


def test_filter_journeys_walk_time_and_duplicates() -> None:
    """Missed journeys and duplicates are dropped; excluded lines are removed."""
    journeys = parse_journeys(_journeys_payload())
    first_dep = journeys[0].departure
    assert isinstance(first_dep, datetime)
    now = first_dep - timedelta(minutes=3)

    kept = filter_journeys(journeys, now=now, walk_minutes=5)
    assert journeys[0] not in kept

    kept = filter_journeys(journeys, now=now, walk_minutes=5, hide_missed=False)
    assert kept[0] is journeys[0]

    dup = parse_journeys(_journeys_payload())[0]
    kept = filter_journeys([journeys[0], dup], now=now)
    assert len(kept) == 1

    kept = filter_journeys(journeys, now=now, excluded_lines=["s 7"])
    assert all("S7" not in j.lines for j in kept)

    assert len(filter_journeys(journeys, now=now, limit=2)) == 2


def test_parse_departures_real_data() -> None:
    """Cancelled departures, warnings and platform changes from real data."""
    departures = parse_departures(load_fixture("departures.json"))
    assert len(departures) == 25
    cancelled = [d for d in departures if d.cancelled]
    assert cancelled
    item = cancelled[0].as_dict(walk_minutes=2)
    assert item["when"] == cancelled[0].planned_when.isoformat()
    assert item["delay"] is None
    assert next_departure(departures) is not None
    assert next_departure(departures).cancelled is False
    texts = [r["text"] for d in departures for r in d.remarks]
    assert any("Bus 109" in t for t in texts)
    assert not any("Fahrradmitnahme" in t for t in texts)


def test_normalize_directions() -> None:
    """Legacy string and list inputs become a cleaned fragment list."""
    assert normalize_directions(None) == []
    assert normalize_directions("") == []
    assert normalize_directions("  Osloer  ") == ["Osloer"]
    assert normalize_directions([" Pankow ", "", "osloer", "Pankow"]) == [
        "Pankow",
        "osloer",
    ]


def test_filter_departures() -> None:
    """Line, direction and walking time filters."""
    departures = parse_departures(load_fixture("departures.json"))
    only_s = filter_departures(departures, now=NOW, lines=["S7", "s 3"])
    assert only_s
    assert {d.line for d in only_s} <= {"S7", "S3"}

    direction = filter_departures(departures, now=NOW, directions="zoolog")
    assert direction
    assert all("zoolog" in d.direction.lower() for d in direction)

    # Legacy single-string kwarg still works.
    legacy = filter_departures(departures, now=NOW, direction="zoolog")
    assert {d.trip_id for d in legacy} == {d.trip_id for d in direction}

    # OR match across multiple fragments.
    multi = filter_departures(departures, now=NOW, directions=["zoolog", "Hottengrund"])
    assert multi
    assert all(
        "zoolog" in d.direction.casefold() or "hottengrund" in d.direction.casefold()
        for d in multi
    )
    assert any("zoolog" in d.direction.casefold() for d in multi)
    assert any("hottengrund" in d.direction.casefold() for d in multi)

    late = NOW + timedelta(minutes=10)
    reachable = filter_departures(departures, now=late, walk_minutes=5)
    assert all(d.leave_at(5) >= late - timedelta(seconds=30) for d in reachable)
    assert len(filter_departures(departures, now=NOW, limit=3)) == 3
    times = [d.effective_when for d in filter_departures(departures, now=NOW)]
    assert times == sorted(times)


def test_parse_remarks() -> None:
    """Hints are dropped, duplicates removed."""
    remarks = parse_remarks(
        [
            {"type": "hint", "text": "Fahrradmitnahme möglich"},
            {"type": "warning", "summary": "Bauarbeiten", "text": "Ersatzverkehr"},
            {"type": "warning", "text": "Ersatzverkehr"},
            {"type": "status", "text": "Fällt aus"},
            {"type": "warning", "text": ""},
        ]
    )
    assert remarks == [
        {"type": "warning", "text": "Ersatzverkehr", "summary": "Bauarbeiten"},
        {"type": "status", "text": "Fällt aus"},
    ]


def test_line_colors() -> None:
    """Known lines from GTFS, product fallback otherwise."""
    assert line_color("U9", "subway") == ("#F3791D", "#000000")
    assert line_color("S 41", "suburban") == ("#AD5937", "#FFFFFF")
    assert line_color("M13", "tram") == PRODUCT_COLORS["tram"]
    assert line_color(None, None) == DEFAULT_COLOR
