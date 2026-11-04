#!/usr/bin/env python3
"""Seed a local Home Assistant dev instance with BVG connections.

Reads `local_defaults.yaml` (gitignored; see `local_defaults.example.yaml`)
and creates the config entry plus one subentry per connection/departure board
by driving the real config flows over the REST API. Optionally writes a
dashboard with the card.

    python scripts/dev_seed.py [--file local_defaults.yaml] [--dashboard]

Credentials: HA_USERNAME / HA_PASSWORD (default dev / dev-password). A fresh
instance is onboarded with these credentials automatically.
"""

from __future__ import annotations

import argparse
import asyncio
import os
from pathlib import Path
import sys
from typing import Any

import aiohttp
import yaml

DOMAIN = "bvg_connections"
DASHBOARD_URL = "bvg-connections"
ROOT = Path(__file__).resolve().parent.parent


class Seeder:
    """Talks to the Home Assistant REST and websocket APIs."""

    def __init__(self, session: aiohttp.ClientSession, url: str) -> None:
        """Initialize."""
        self.session = session
        self.url = url.rstrip("/")
        self.client_id = f"{self.url}/"
        self.token: str | None = None

    @property
    def headers(self) -> dict[str, str]:
        """Authorization header."""
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    async def request(self, method: str, path: str, **kwargs: Any) -> Any:
        """Send a request and return the JSON body."""
        async with self.session.request(
            method, f"{self.url}{path}", headers=self.headers, **kwargs
        ) as resp:
            body = await resp.json(content_type=None)
            if resp.status >= 400:
                raise RuntimeError(f"{method} {path}: HTTP {resp.status} {body}")
            return body

    async def _exchange(self, code: str) -> None:
        tokens = await self.request(
            "POST",
            "/auth/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": self.client_id,
            },
        )
        self.token = tokens["access_token"]

    async def login(self, username: str, password: str) -> None:
        """Onboard a fresh instance or log in."""
        async with self.session.get(f"{self.url}/api/onboarding") as resp:
            # The onboarding views are gone once onboarding is complete.
            status = await resp.json(content_type=None) if resp.status == 200 else []
        steps = {s["step"]: s["done"] for s in status}
        if not steps.get("user", True):
            result = await self.request(
                "POST",
                "/api/onboarding/users",
                json={
                    "client_id": self.client_id,
                    "name": "Dev",
                    "username": username,
                    "password": password,
                    "language": "de",
                },
            )
            await self._exchange(result["auth_code"])
            await self.request("POST", "/api/onboarding/core_config", json={})
            await self.request("POST", "/api/onboarding/analytics", json={})
            await self.request(
                "POST",
                "/api/onboarding/integration",
                json={
                    "client_id": self.client_id,
                    "redirect_uri": f"{self.url}/?auth_callback=1",
                },
            )
            print("onboarded new instance")
            return
        flow = await self.request(
            "POST",
            "/auth/login_flow",
            json={
                "client_id": self.client_id,
                "handler": ["homeassistant", None],
                "redirect_uri": f"{self.url}/?auth_callback=1",
            },
        )
        result = await self.request(
            "POST",
            f"/auth/login_flow/{flow['flow_id']}",
            json={
                "client_id": self.client_id,
                "username": username,
                "password": password,
            },
        )
        if result.get("type") != "create_entry":
            raise RuntimeError(f"login failed: {result.get('errors')}")
        await self._exchange(result["result"])

    async def ensure_entry(self, options: dict[str, Any]) -> str:
        """Create the config entry if needed and return its id."""
        entries = await self.request(
            "GET", f"/api/config/config_entries/entry?domain={DOMAIN}"
        )
        if not entries:
            flow = await self.request(
                "POST", "/api/config/config_entries/flow", json={"handler": DOMAIN}
            )
            result = await self.request(
                "POST",
                f"/api/config/config_entries/flow/{flow['flow_id']}",
                json={
                    "base_url": "https://v6.bvg.transport.rest",
                    "request_budget": options.get("request_budget", 40),
                },
            )
            if result["type"] != "create_entry":
                raise RuntimeError(f"config flow failed: {result}")
            entries = await self.request(
                "GET", f"/api/config/config_entries/entry?domain={DOMAIN}"
            )
        entry_id: str = entries[0]["entry_id"]
        if options:
            flow = await self.request(
                "POST",
                "/api/config/config_entries/options/flow",
                json={"handler": entry_id},
            )
            defaults = {
                "journey_interval": 30,
                "departure_interval": 30,
                "request_budget": 40,
            }
            await self.request(
                "POST",
                f"/api/config/config_entries/options/flow/{flow['flow_id']}",
                json={**defaults, **options},
            )
        return entry_id

    async def ws_call(self, msg_type: str, **payload: Any) -> Any:
        """Send one websocket command and return its result."""
        ws_url = self.url.replace("http", "ws", 1) + "/api/websocket"
        async with self.session.ws_connect(ws_url) as ws:
            await ws.receive_json()
            await ws.send_json({"type": "auth", "access_token": self.token})
            await ws.receive_json()
            await ws.send_json({"id": 1, "type": msg_type, **payload})
            result = await ws.receive_json()
        if not result.get("success"):
            raise RuntimeError(f"{msg_type} failed: {result}")
        return result.get("result")

    async def existing_titles(self, entry_id: str) -> set[str]:
        """Titles of existing subentries."""
        subentries = await self.ws_call(
            "config_entries/subentries/list", entry_id=entry_id
        )
        return {s["title"] for s in subentries}

    async def _subflow(self, entry_id: str, kind: str) -> dict[str, Any]:
        return await self.request(
            "POST",
            "/api/config/config_entries/subentries/flow",
            json={"handler": [entry_id, kind]},
        )

    async def _step(self, flow_id: str, data: dict[str, Any]) -> dict[str, Any]:
        result = await self.request(
            "POST", f"/api/config/config_entries/subentries/flow/{flow_id}", json=data
        )
        if result.get("errors"):
            raise RuntimeError(f"flow error: {result['errors']}")
        return result

    @staticmethod
    def _pick(result: dict[str, Any], field: str, wanted: dict[str, Any]) -> str:
        schema = next(s for s in result["data_schema"] if s["name"] == field)
        options = schema["selector"]["select"]["options"]
        if wanted.get("stop"):
            key = f"stop:{wanted['stop']}"
            if any(o["value"] == key for o in options):
                return key
            raise RuntimeError(f"stop {wanted['stop']} not in results for {field}")
        if wanted.get("match"):
            for option in options:
                if wanted["match"].casefold() in option["label"].casefold():
                    return str(option["value"])
            raise RuntimeError(f"{wanted['match']!r} not in results for {field}")
        return str(options[0]["value"])

    @staticmethod
    def _query(location: dict[str, Any]) -> str:
        return str(location.get("query") or location.get("stop") or "")

    async def add_connection(self, entry_id: str, item: dict[str, Any]) -> None:
        """Run the connection subentry flow."""
        flow = await self._subflow(entry_id, "connection")
        result = await self._step(
            flow["flow_id"],
            {
                "origin_query": self._query(item["origin"]),
                "destination_query": self._query(item["destination"]),
            },
        )
        result = await self._step(
            flow["flow_id"],
            {
                "origin": self._pick(result, "origin", item["origin"]),
                "destination": self._pick(result, "destination", item["destination"]),
            },
        )
        settings = {
            "name": item["name"],
            "walk_minutes": item.get("walk_minutes", 0),
            "results": item.get("results", 4),
            "hide_missed": item.get("hide_missed", True),
            "products": item.get("products")
            or [
                "suburban",
                "subway",
                "tram",
                "bus",
                "ferry",
                "regional",
                "express",
            ],
            "excluded_lines": item.get("excluded_lines", []),
            "transfer_time": item.get("transfer_time", 0),
        }
        if item.get("max_transfers") is not None:
            settings["max_transfers"] = item["max_transfers"]
        await self._step(flow["flow_id"], settings)

    async def add_board(self, entry_id: str, item: dict[str, Any]) -> None:
        """Run the departure board subentry flow."""
        flow = await self._subflow(entry_id, "departure_board")
        result = await self._step(
            flow["flow_id"], {"stop_query": self._query(item["stop"])}
        )
        result = await self._step(
            flow["flow_id"], {"stop": self._pick(result, "stop", item["stop"])}
        )
        settings = {
            "name": item["name"],
            "walk_minutes": item.get("walk_minutes", 0),
            "results": item.get("results", 8),
            "duration": item.get("duration", 30),
            "hide_missed": item.get("hide_missed", True),
            "products": item.get("products")
            or [
                "suburban",
                "subway",
                "tram",
                "bus",
                "ferry",
                "regional",
                "express",
            ],
            "lines": item.get("lines", []),
        }
        directions = item.get("directions")
        if directions is None and item.get("direction"):
            directions = [item["direction"]]
        if directions:
            settings["directions"] = directions
        await self._step(flow["flow_id"], settings)

    async def write_dashboard(self, title: str) -> None:
        """Write a dashboard at /bvg-connections with the card."""
        await asyncio.sleep(3)
        states = await self.request("GET", "/api/states")
        connections = [
            s["entity_id"]
            for s in states
            if s["attributes"].get("bvg_type") == "connection"
        ]
        boards = [
            s["entity_id"]
            for s in states
            if s["attributes"].get("bvg_type") == "departure_board"
        ]
        cards: list[dict[str, Any]] = [
            {
                "type": "custom:bvg-connections-card",
                "title": title,
                "connections": connections,
                "departures": boards[:1],
                "max_journeys": 3,
                "max_departures": 6,
            }
        ]
        cards.extend(
            {
                "type": "custom:bvg-connections-card",
                "connections": [entity],
                "max_journeys": 4,
                "show_clock": False,
                "expand": False,
            }
            for entity in connections
        )
        config = {
            "title": title,
            "views": [
                {
                    "title": title,
                    "path": "bvg",
                    "type": "sections",
                    "max_columns": 2,
                    "sections": [{"type": "grid", "cards": [card]} for card in cards],
                }
            ],
        }
        dashboards = await self.ws_call("lovelace/dashboards/list")
        if not any(d["url_path"] == DASHBOARD_URL for d in dashboards):
            await self.ws_call(
                "lovelace/dashboards/create",
                url_path=DASHBOARD_URL,
                title=title,
                icon="mdi:train-bus",
                show_in_sidebar=True,
                require_admin=False,
                mode="storage",
            )
        await self.ws_call(
            "lovelace/config/save", url_path=DASHBOARD_URL, config=config
        )
        print(
            f"dashboard /{DASHBOARD_URL}/bvg written ({len(connections)} connections, {len(boards)} boards)"
        )


async def main() -> None:
    """Entry point."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", default=str(ROOT / "local_defaults.yaml"))
    parser.add_argument("--dashboard", action="store_true")
    args = parser.parse_args()

    path = Path(args.file)
    if not path.exists():
        sys.exit(
            f"{path} not found. Copy local_defaults.example.yaml to "
            "local_defaults.yaml and add your stops."
        )
    config = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    url = os.environ.get("HA_URL") or config.get("ha_url", "http://localhost:8123")

    async with aiohttp.ClientSession() as session:
        seeder = Seeder(session, url)
        await seeder.login(
            os.environ.get("HA_USERNAME", "dev"),
            os.environ.get("HA_PASSWORD", "dev-password"),
        )
        entry_id = await seeder.ensure_entry(config.get("options") or {})
        await asyncio.sleep(2)
        existing = await seeder.existing_titles(entry_id)
        for item in config.get("connections") or []:
            if item["name"] in existing:
                print(f"skip existing connection {item['name']!r}")
                continue
            await seeder.add_connection(entry_id, item)
            print(f"added connection {item['name']!r}")
            # Adding a subentry reloads the entry, which aborts open flows.
            await asyncio.sleep(4)
        for item in config.get("departure_boards") or []:
            if item["name"] in existing:
                print(f"skip existing board {item['name']!r}")
                continue
            await seeder.add_board(entry_id, item)
            print(f"added departure board {item['name']!r}")
            await asyncio.sleep(4)
        if args.dashboard:
            title = (config.get("dashboard") or {}).get("title", "Unterwegs")
            await seeder.write_dashboard(title)


if __name__ == "__main__":
    asyncio.run(main())
