"""Constants for the BVG Verbindungen integration."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "bvg_connections"
VERSION: Final = "0.1.6"

DEFAULT_BASE_URL: Final = "https://v6.bvg.transport.rest"

CONF_BASE_URL: Final = "base_url"
CONF_REQUEST_BUDGET: Final = "request_budget"
CONF_JOURNEY_INTERVAL: Final = "journey_interval"
CONF_DEPARTURE_INTERVAL: Final = "departure_interval"

DEFAULT_REQUEST_BUDGET: Final = 40
MAX_REQUEST_BUDGET: Final = 90
DEFAULT_JOURNEY_INTERVAL: Final = 30
DEFAULT_DEPARTURE_INTERVAL: Final = 30
MIN_INTERVAL: Final = 15
MAX_INTERVAL: Final = 900

SUBENTRY_CONNECTION: Final = "connection"
SUBENTRY_DEPARTURE_BOARD: Final = "departure_board"

CONF_ORIGIN: Final = "origin"
CONF_DESTINATION: Final = "destination"
CONF_STOP: Final = "stop"
CONF_ORIGIN_QUERY: Final = "origin_query"
CONF_DESTINATION_QUERY: Final = "destination_query"
CONF_STOP_QUERY: Final = "stop_query"

CONF_WALK_MINUTES: Final = "walk_minutes"
CONF_PRODUCTS: Final = "products"
CONF_EXCLUDED_LINES: Final = "excluded_lines"
CONF_LINES: Final = "lines"
CONF_DIRECTIONS: Final = "directions"
# Legacy single-string key; still read for migration of existing subentries.
CONF_DIRECTION: Final = "direction"
CONF_MAX_TRANSFERS: Final = "max_transfers"
CONF_TRANSFER_TIME: Final = "transfer_time"
CONF_RESULTS: Final = "results"
CONF_DURATION: Final = "duration"
CONF_HIDE_MISSED: Final = "hide_missed"

DEFAULT_WALK_MINUTES: Final = 5
DEFAULT_CONNECTION_RESULTS: Final = 4
DEFAULT_BOARD_RESULTS: Final = 8
DEFAULT_BOARD_DURATION: Final = 30

# Order matters: used for the selector and for API query parameters.
PRODUCTS: Final = (
    "suburban",
    "subway",
    "tram",
    "bus",
    "ferry",
    "regional",
    "express",
)

# Requests per poll in the worst case (connections may page once via laterRef).
REQUESTS_PER_CONNECTION_POLL: Final = 2
REQUESTS_PER_BOARD_POLL: Final = 1

# After this many consecutive failures a repair issue is raised.
FAILURES_BEFORE_ISSUE: Final = 6
MAX_BACKOFF_SECONDS: Final = 600

ATTR_BVG_TYPE: Final = "bvg_type"

CARD_FILENAME: Final = "bvg-connections-card.js"
CARD_URL_BASE: Final = f"/{DOMAIN}"
