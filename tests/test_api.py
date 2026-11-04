"""API client tests."""

from __future__ import annotations

from datetime import datetime

import aiohttp
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
import pytest
from pytest_homeassistant_custom_component.test_util.aiohttp import (
    AiohttpClientMocker,
)

from custom_components.bvg_connections.api import (
    BvgApiClient,
    BvgConnectionError,
    BvgRateLimitError,
    BvgRequestError,
    TokenBucket,
    location_params,
    product_params,
)

from .conftest import API, DESTINATION, ORIGIN, load_fixture


def test_location_params() -> None:
    """Stops use the id, addresses use address + coordinates."""
    assert location_params("from", ORIGIN) == {"from": "900024101"}
    address = {
        "type": "address",
        "name": "Platz der Republik 1, Berlin-Tiergarten",
        "latitude": 52.5186,
        "longitude": 13.3761,
    }
    assert location_params("to", address) == {
        "to.address": "Platz der Republik 1, Berlin-Tiergarten",
        "to.latitude": "52.5186",
        "to.longitude": "13.3761",
    }


def test_product_params() -> None:
    """Unselected products are disabled; empty means all."""
    assert product_params(None) == {}
    params = product_params(["subway", "suburban"])
    assert params["bus"] == "false"
    assert "subway" not in params


async def test_token_bucket_waits() -> None:
    """The bucket sleeps once its capacity is used up."""
    now = [0.0]
    sleeps: list[float] = []

    async def fake_sleep(seconds: float) -> None:
        sleeps.append(seconds)
        now[0] += seconds

    bucket = TokenBucket(2, clock=lambda: now[0], sleep=fake_sleep)
    await bucket.acquire()
    await bucket.acquire()
    assert not sleeps
    await bucket.acquire()
    assert sleeps == [pytest.approx(30.0)]


async def test_requests(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    """Journeys and departures are requested with the expected parameters."""
    aioclient_mock.get(f"{API}/journeys", json=load_fixture("journeys.json"))
    aioclient_mock.get(
        f"{API}/stops/900024101/departures", json=load_fixture("departures.json")
    )
    client = BvgApiClient(async_get_clientsession(hass), API + "/")
    data = await client.journeys(
        ORIGIN,
        DESTINATION,
        departure=datetime.fromisoformat("2026-11-04T09:30:00+01:00"),
        products=["suburban"],
        max_transfers=2,
        transfer_time=3,
    )
    assert len(data["journeys"]) == 5
    url = aioclient_mock.mock_calls[-1][1]
    assert url.query["from"] == "900024101"
    assert url.query["to"] == "900079221"
    assert url.query["bus"] == "false"
    assert url.query["transfers"] == "2"
    assert url.query["transferTime"] == "3"
    assert url.query["departure"] == "2026-11-04T09:30:00+01:00"

    await client.journeys(ORIGIN, DESTINATION, later_than="ref")
    url = aioclient_mock.mock_calls[-1][1]
    assert url.query["laterThan"] == "ref"
    assert "departure" not in url.query

    deps = await client.departures("900024101", duration=20, results=5)
    assert len(deps["departures"]) == 25
    assert "when" not in aioclient_mock.mock_calls[-1][1].query
    await client.departures(
        "900024101", when=datetime.fromisoformat("2026-11-04T09:35:00+01:00")
    )
    assert aioclient_mock.mock_calls[-1][1].query["when"] == "2026-11-04T09:35:00+01:00"
    assert client.request_count == 4


async def test_bare_list_departures(
    hass: HomeAssistant, aioclient_mock: AiohttpClientMocker
) -> None:
    """Older API versions answer with a plain list."""
    aioclient_mock.get(f"{API}/stops/1/departures", json=[])
    client = BvgApiClient(async_get_clientsession(hass))
    assert await client.departures("1") == {"departures": []}


@pytest.mark.parametrize(
    ("kwargs", "error"),
    [
        ({"status": 429, "headers": {"Retry-After": "42"}}, BvgRateLimitError),
        ({"status": 503}, BvgConnectionError),
        ({"status": 400, "json": {"message": "invalid POI"}}, BvgRequestError),
        ({"exc": aiohttp.ClientError("boom")}, BvgConnectionError),
        ({"exc": TimeoutError()}, BvgConnectionError),
        ({"text": "not json"}, BvgConnectionError),
    ],
)
async def test_errors(
    hass: HomeAssistant,
    aioclient_mock: AiohttpClientMocker,
    kwargs: dict,
    error: type[Exception],
) -> None:
    """HTTP and transport errors are mapped to client errors."""
    aioclient_mock.get(f"{API}/locations", **kwargs)
    client = BvgApiClient(async_get_clientsession(hass))
    with pytest.raises(error) as info:
        await client.search_locations("x")
    if error is BvgRateLimitError:
        assert info.value.retry_after == 42
    if error is BvgRequestError:
        assert "invalid POI" in str(info.value)
