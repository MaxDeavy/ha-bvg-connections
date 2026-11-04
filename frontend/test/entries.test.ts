import { describe, expect, it } from "vitest";
import { BvgConnectionsCard } from "../src/card";
import { editorConfig, editorSchema } from "../src/editor";
import type { CardConfig, HassEntity, HomeAssistant } from "../src/types";

const type = "custom:bvg-connections-card";

const entity = (entity_id: string, attributes: Record<string, unknown>): HassEntity => ({
  entity_id,
  state: "unknown",
  attributes,
  last_updated: "2026-11-04T09:30:00+01:00",
});

function hass(states: HassEntity[]): HomeAssistant {
  return {
    states: Object.fromEntries(states.map((s) => [s.entity_id, s])),
    language: "en",
    config: { time_zone: "Europe/Berlin" },
  };
}

const TRIP = entity("sensor.alexanderplatz_reichstag", {
  bvg_type: "connection",
  origin: "S+U Alexanderplatz",
  destination: "Reichstag",
  journeys: [],
});
const BOARD = entity("sensor.hauptbahnhof", { bvg_type: "departure_board", stop: "S+U Hauptbahnhof", departures: [] });
const LEAVE_AT = entity("sensor.alexanderplatz_reichstag_leave_at", { device_class: "timestamp" });

async function render(config: CardConfig, states: HassEntity[]): Promise<string[]> {
  const card = document.createElement("bvg-connections-card") as BvgConnectionsCard;
  card.setConfig(config);
  card.hass = hass(states);
  document.body.append(card);
  await card.updateComplete;
  const places = [...card.shadowRoot!.querySelectorAll(".group-head .place, .empty, .warning")].map(
    (el) => el.textContent!.trim(),
  );
  card.remove();
  return places;
}

describe("card entries", () => {
  it("shows all connections and boards when nothing is selected", async () => {
    expect(await render({ type }, [BOARD, LEAVE_AT, TRIP])).toEqual([
      "S+U Alexanderplatz",
      "Reichstag",
      "No connections found",
      "S+U Hauptbahnhof",
      "No departures",
    ]);
  });

  it("shows only the selection, in its order and with its names", async () => {
    const config = { type, entries: [{ entity: BOARD.entity_id, name: "Hbf" }, TRIP.entity_id] };
    const places = await render(config, [TRIP, BOARD]);
    expect(places.filter((p) => !p.startsWith("No "))).toEqual(["Hbf", "S+U Alexanderplatz", "Reichstag"]);
  });

  it("can show a single board", async () => {
    expect(await render({ type, entries: [BOARD.entity_id] }, [TRIP, BOARD])).toEqual([
      "S+U Hauptbahnhof",
      "No departures",
    ]);
  });

  it("still renders 0.1.x configs", async () => {
    const places = await render({ type, departures: [BOARD.entity_id] }, [TRIP, BOARD]);
    expect(places[0]).toBe("S+U Hauptbahnhof");
  });

  it("explains an empty card and flags unknown or foreign entities", async () => {
    expect(await render({ type }, [])).toEqual(["No connections or departure boards set up yet"]);
    expect(await render({ type, entries: ["sensor.gone", LEAVE_AT.entity_id] }, [LEAVE_AT])).toEqual([
      "Entity not found: sensor.gone",
      `${LEAVE_AT.entity_id}: Not a BVG entity (pick “Next departure”)`,
    ]);
  });

  it("offers a stub config that shows everything", () => {
    expect(BvgConnectionsCard.getStubConfig()).toEqual({ type });
  });
});

describe("editor", () => {
  it("labels every form field, including unnamed grid groups", async () => {
    const editor = document.createElement("bvg-connections-card-editor") as HTMLElement & {
      hass: HomeAssistant;
      setConfig(c: CardConfig): void;
      updateComplete: Promise<boolean>;
    };
    editor.hass = hass([TRIP, BOARD]);
    editor.setConfig({ type });
    document.body.append(editor);
    await editor.updateComplete;
    const form = editor.shadowRoot!.querySelector("ha-form") as unknown as {
      computeLabel(s: { name?: string }): string;
      computeHelper(s: { name?: string }): string | undefined;
      data: Record<string, unknown>;
    };
    expect(form.computeLabel({ name: "" })).toBe("");
    expect(form.computeLabel({ name: "entries" })).toBe("Connections and departure boards");
    expect(form.computeHelper({ name: "entries" })).toMatch(/^Leave empty/);
    expect(form.computeHelper({ name: "title" })).toBeUndefined();
    expect(form.data.entries).toEqual([]);
    editor.remove();
  });

  it("offers only connections and boards in the picker", () => {
    const states = hass([BOARD, LEAVE_AT, TRIP]).states;
    const picker = editorSchema(states).find((s) => "name" in s && s.name === "entries") as {
      selector: { entity: { include_entities: string[] } };
    };
    expect(picker.selector.entity.include_entities).toEqual([TRIP.entity_id, BOARD.entity_id]);
  });

  it("migrates old keys, keeps YAML names and drops an empty selection", () => {
    const previous: CardConfig = {
      type,
      connections: [{ entity: TRIP.entity_id, name: "Work" }],
      departures: [BOARD.entity_id],
    };
    expect(editorConfig(previous, { type, title: "", entries: [BOARD.entity_id, TRIP.entity_id] })).toEqual({
      type,
      entries: [BOARD.entity_id, { entity: TRIP.entity_id, name: "Work" }],
    });
    expect(editorConfig(previous, { type, title: "Home", entries: [] })).toEqual({ type, title: "Home" });
  });
});
