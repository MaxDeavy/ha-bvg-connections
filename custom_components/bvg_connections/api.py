"""Minimal async client for the transport.rest HAFAS API (bvg-rest / vbb-rest)."""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable, Mapping, Sequence
from datetime import datetime
import logging
import time
from typing import Any

import aiohttp

from .const import DEFAULT_BASE_URL, DEFAULT_REQUEST_BUDGET, PRODUCTS, VERSION

_LOGGER = logging.getLogger(__name__)

REQUEST_TIMEOUT = aiohttp.ClientTimeout(total=20)
USER_AGENT = f"ha-bvg-connections/{VERSION} (Home Assistant custom integration)"


class BvgApiError(Exception):
    """Base error of the API client."""


class BvgConnectionError(BvgApiError):
    """The API could not be reached or answered with a server error."""


class BvgRateLimitError(BvgApiError):
    """The API answered with HTTP 429."""

    def __init__(self, retry_after: float | None) -> None:
        """Store the server provided Retry-After value (seconds)."""
        super().__init__(f"Rate limited (retry after {retry_after}s)")
        self.retry_after = retry_after


class BvgRequestError(BvgApiError):
    """The API rejected the request (HTTP 4xx)."""


class TokenBucket:
    """Token bucket limiting requests per minute; waits instead of failing."""

    def __init__(
        self,
        per_minute: int,
        *,
        clock: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], Awaitable[Any]] = asyncio.sleep,
    ) -> None:
        """Initialize a full bucket."""
        self.capacity = float(max(1, per_minute))
        self.rate = self.capacity / 60.0
        self._tokens = self.capacity
        self._clock = clock
        self._sleep = sleep
        self._updated = clock()
        self._lock = asyncio.Lock()

    def _refill(self) -> None:
        now = self._clock()
        self._tokens = min(
            self.capacity, self._tokens + (now - self._updated) * self.rate
        )
        self._updated = now

    async def acquire(self) -> None:
        """Take one token, waiting until one is available."""
        async with self._lock:
            while True:
                self._refill()
                if self._tokens >= 1:
                    self._tokens -= 1
                    return
                await self._sleep((1 - self._tokens) / self.rate)


def _bool(value: bool) -> str:
    return "true" if value else "false"


def location_params(prefix: str, location: Mapping[str, Any]) -> dict[str, str]:
    """Build `from`/`to` query parameters for a stored location.

    Stops are referenced by id. Addresses and POIs must be passed as address
    with coordinates; sending an id/type for them makes HAFAS answer
    "invalid POI".
    """
    if location.get("type") == "stop":
        return {prefix: str(location["id"])}
    return {
        f"{prefix}.address": str(location.get("name") or location.get("address")),
        f"{prefix}.latitude": str(location["latitude"]),
        f"{prefix}.longitude": str(location["longitude"]),
    }


def product_params(products: Sequence[str] | None) -> dict[str, str]:
    """Disable all products not contained in `products` (empty = all)."""
    if not products:
        return {}
    return {p: "false" for p in PRODUCTS if p not in products}


class BvgApiClient:
    """Client for a transport.rest v6 compatible endpoint."""

    def __init__(
        self,
        session: aiohttp.ClientSession,
        base_url: str = DEFAULT_BASE_URL,
        requests_per_minute: int = DEFAULT_REQUEST_BUDGET,
        *,
        bucket: TokenBucket | None = None,
    ) -> None:
        """Initialize the client."""
        self._session = session
        self.base_url = base_url.rstrip("/")
        self.bucket = bucket or TokenBucket(requests_per_minute)
        self._semaphore = asyncio.Semaphore(2)
        self.request_count = 0

    async def _get(self, path: str, params: Mapping[str, str]) -> Any:
        await self.bucket.acquire()
        url = f"{self.base_url}{path}"
        async with self._semaphore:
            self.request_count += 1
            try:
                async with self._session.get(
                    url,
                    params=dict(params),
                    timeout=REQUEST_TIMEOUT,
                    headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
                ) as resp:
                    if resp.status == 429:
                        raise BvgRateLimitError(_retry_after(resp.headers))
                    if resp.status >= 500:
                        raise BvgConnectionError(f"HTTP {resp.status} for {path}")
                    if resp.status >= 400:
                        message = await _error_message(resp)
                        raise BvgRequestError(f"HTTP {resp.status}: {message}")
                    return await resp.json(content_type=None)
            except (TimeoutError, aiohttp.ClientError) as err:
                raise BvgConnectionError(f"{type(err).__name__}: {err}") from err
            except ValueError as err:
                raise BvgConnectionError(f"Invalid JSON from {path}") from err

    async def search_locations(
        self,
        query: str,
        *,
        results: int = 8,
        stops: bool = True,
        addresses: bool = True,
        poi: bool = True,
    ) -> list[dict[str, Any]]:
        """Search stops, addresses and POIs."""
        data = await self._get(
            "/locations",
            {
                "query": query,
                "results": str(results),
                "stops": _bool(stops),
                "addresses": _bool(addresses),
                "poi": _bool(poi),
                "fuzzy": "true",
                "linesOfStops": "false",
                "language": "de",
            },
        )
        return list(data) if isinstance(data, list) else []

    async def nearby_stops(
        self, latitude: float, longitude: float, *, results: int = 8
    ) -> list[dict[str, Any]]:
        """Return stops close to a coordinate."""
        data = await self._get(
            "/locations/nearby",
            {
                "latitude": str(latitude),
                "longitude": str(longitude),
                "results": str(results),
                "distance": "1500",
                "stops": "true",
                "poi": "false",
                "linesOfStops": "false",
                "language": "de",
            },
        )
        return list(data) if isinstance(data, list) else []

    async def journeys(
        self,
        origin: Mapping[str, Any],
        destination: Mapping[str, Any],
        *,
        departure: datetime | None = None,
        later_than: str | None = None,
        results: int = 4,
        products: Sequence[str] | None = None,
        max_transfers: int | None = None,
        transfer_time: int = 0,
    ) -> dict[str, Any]:
        """Search journeys from origin to destination."""
        params: dict[str, str] = {
            **location_params("from", origin),
            **location_params("to", destination),
            **product_params(products),
            "results": str(results),
            "stopovers": "false",
            "polylines": "false",
            "remarks": "true",
            "startWithWalking": "true",
            "language": "de",
        }
        if later_than:
            params["laterThan"] = later_than
        elif departure is not None:
            params["departure"] = departure.isoformat()
        if max_transfers is not None:
            params["transfers"] = str(max_transfers)
        if transfer_time:
            params["transferTime"] = str(transfer_time)
        data = await self._get("/journeys", params)
        return data if isinstance(data, dict) else {}

    async def departures(
        self,
        stop_id: str,
        *,
        when: datetime | None = None,
        duration: int = 30,
        results: int = 10,
        products: Sequence[str] | None = None,
    ) -> dict[str, Any]:
        """Return the departure board of a stop."""
        params = {
            **product_params(products),
            "duration": str(duration),
            "results": str(results),
            "remarks": "true",
            "linesOfStops": "false",
            "language": "de",
        }
        if when is not None:
            params["when"] = when.isoformat()
        data = await self._get(f"/stops/{stop_id}/departures", params)
        if isinstance(data, list):  # older API versions returned a bare list
            return {"departures": data}
        return data if isinstance(data, dict) else {}


def _retry_after(headers: Mapping[str, str]) -> float | None:
    value = headers.get("Retry-After")
    if value is None:
        return None
    try:
        return max(0.0, float(value))
    except ValueError:
        return None


async def _error_message(resp: aiohttp.ClientResponse) -> str:
    try:
        body = await resp.json(content_type=None)
    except (ValueError, aiohttp.ClientError):
        return resp.reason or ""
    if isinstance(body, dict) and body.get("message"):
        return str(body["message"])
    return resp.reason or ""
