import { describe, expect, it } from "vitest";
import {
  allEntries,
  badgeShape,
  contrastText,
  countdown,
  entryType,
  formatClock,
  formatDelay,
  formatJourneyDuration,
  normalizeConfig,
  productSymbol,
  resolveEntries,
  urgency,
  visibleJourneys,
} from "../src/format";
import { translate } from "../src/i18n";
import type { Journey } from "../src/types";

const NOW = Date.parse("2026-11-04T09:30:00+01:00");
const at = (minutes: number) => NOW + minutes * 60_000;

describe("countdown", () => {
  it("shows minutes, now and hours", () => {
    expect(countdown(at(9.5), NOW, "jetzt")).toEqual({ value: "9", unit: true });
    expect(countdown(at(0.5), NOW, "jetzt")).toEqual({ value: "jetzt", unit: false });
    expect(countdown(at(-2), NOW, "jetzt")).toEqual({ value: "jetzt", unit: false });
    expect(countdown(at(82), NOW, "jetzt")).toEqual({ value: "1h 22", unit: false });
    expect(countdown(at(125), NOW, "now")).toEqual({ value: "2h 05", unit: false });
    expect(countdown(null, NOW, "now").value).toBe("–");
  });
});

describe("formatJourneyDuration", () => {
  it("keeps minutes under an hour", () => {
    expect(formatJourneyDuration(0, "de")).toBe("0 min");
    expect(formatJourneyDuration(49, "de")).toBe("49 min");
    expect(formatJourneyDuration(59, "en")).toBe("59 min");
  });

  it("uses a full hour word for exactly 60 minutes", () => {
    expect(formatJourneyDuration(60, "de")).toBe("1 Stunde");
    expect(formatJourneyDuration(60, "en")).toBe("1 hour");
  });

  it("splits hours and minutes above 60", () => {
    expect(formatJourneyDuration(61, "de")).toBe("1 Std. 1 min");
    expect(formatJourneyDuration(61, "en")).toBe("1 h 1 min");
    expect(formatJourneyDuration(135, "de")).toBe("2 Std. 15 min");
    expect(formatJourneyDuration(135, "en-GB")).toBe("2 h 15 min");
  });
});

describe("urgency", () => {
  it("grades the time left before leaving", () => {
    expect(urgency(at(10), NOW, false)).toBe("relaxed");
    expect(urgency(at(3), NOW, false)).toBe("soon");
    expect(urgency(at(0.2), NOW, false)).toBe("now");
    expect(urgency(at(-1), NOW, false)).toBe("missed");
    expect(urgency(at(10), NOW, true)).toBe("cancelled");
    expect(urgency(null, NOW, false)).toBe("relaxed");
  });
});

describe("formatting", () => {
  it("formats delays without +0", () => {
    expect(formatDelay(3)).toBe("+3");
    expect(formatDelay(0)).toBeNull();
    expect(formatDelay(null)).toBeNull();
    expect(formatDelay(-1)).toBe("-1");
  });

  it("formats clock times in the configured time zone", () => {
    expect(formatClock(NOW, "de", "Europe/Berlin")).toBe("09:30");
    expect(formatClock(NOW, "en", "UTC")).toBe("08:30");
  });

  it("uses product specific badge shapes", () => {
    expect(badgeShape("suburban")).toBe("pill");
    expect(badgeShape("subway")).toBe("square");
    expect(badgeShape("bus")).toBe("rect");
  });

  it("picks a readable text colour", () => {
    expect(contrastText("#F0D722")).toBe("#000");
    expect(contrastText("#224F86")).toBe("#fff");
    expect(contrastText("nope")).toBe("#fff");
  });

  it("maps products to tinted MDI symbols", () => {
    expect(productSymbol("subway")).toEqual({ icon: "mdi:subway-variant", tone: "subway" });
    expect(productSymbol("regional").tone).toBe("regional");
    expect(productSymbol(null)).toEqual({ icon: "mdi:transit-connection-variant", tone: "muted" });
    expect(productSymbol("toString").tone).toBe("muted");
  });
});

describe("config", () => {
  const type = "custom:bvg-connections-card";

  it("normalizes entity references and defaults", () => {
    const c = normalizeConfig({ type, entries: ["sensor.a", { entity: "sensor.b", name: "B" }] });
    expect(c.entries).toEqual([{ entity: "sensor.a" }, { entity: "sensor.b", name: "B" }]);
    expect(c.max_journeys).toBe(3);
    expect(c.show_clock).toBe(true);
  });

  it("reads 0.1.x connections and departures as entries", () => {
    const c = normalizeConfig({ type, connections: ["sensor.a"], departures: [{ entity: "sensor.d", name: "D" }] });
    expect(c.entries).toEqual([{ entity: "sensor.a" }, { entity: "sensor.d", name: "D" }]);
  });

  it("prefers entries over the old keys", () => {
    expect(normalizeConfig({ type, entries: ["sensor.x"], connections: ["sensor.a"] }).entries).toEqual([
      { entity: "sensor.x" },
    ]);
  });

  it("treats an empty or missing list as all", () => {
    expect(normalizeConfig({ type }).entries).toEqual([]);
    expect(normalizeConfig({ type, entries: [] }).entries).toEqual([]);
  });
});

describe("entries", () => {
  const states = {
    "sensor.board": { attributes: { bvg_type: "departure_board" } },
    "sensor.trip_1": { attributes: { bvg_type: "connection" } },
    "sensor.leave_at": { attributes: { device_class: "timestamp" } },
    "sensor.trip_2": { attributes: { bvg_type: "connection" } },
  };

  it("lists connections first, then boards, and skips other sensors", () => {
    expect(allEntries(states)).toEqual(["sensor.trip_1", "sensor.trip_2", "sensor.board"]);
    expect(entryType(states["sensor.leave_at"])).toBeNull();
    expect(entryType(undefined)).toBeNull();
  });

  it("resolves an empty selection to all entries and keeps a selection as is", () => {
    expect(resolveEntries({ entries: [] }, states).map((r) => r.entity)).toEqual([
      "sensor.trip_1",
      "sensor.trip_2",
      "sensor.board",
    ]);
    const picked = [{ entity: "sensor.board" }, { entity: "sensor.trip_2", name: "Home" }];
    expect(resolveEntries({ entries: picked }, states)).toBe(picked);
  });
});

describe("visibleJourneys", () => {
  it("drops departed journeys and limits the list", () => {
    const j = (minutes: number) => ({ departure: new Date(at(minutes)).toISOString() }) as Journey;
    const list = [j(-5), j(-0.2), j(4), j(9), j(15)];
    expect(visibleJourneys(list, NOW, 2)).toEqual([list[1], list[2]]);
  });
});

describe("i18n", () => {
  it("translates with placeholders and falls back to English", () => {
    expect(translate("de", "leave_in_prefix")).toBe("in");
    expect(translate("en-GB", "leave_in_prefix")).toBe("in");
    expect(translate("de", "leave_now")).toBe("Jetzt!");
    expect(translate("en", "leave_now")).toBe("Now!");
    expect(translate("fr", "cancelled")).toBe("Cancelled");
    expect(translate("de", "missed")).toBe("Nicht mehr\nzu schaffen");
    expect(translate("en", "missed")).toBe("Too late\nto catch");
    expect(translate("de", "at_risk")).toBe("Anschluss?");
    expect(translate("de", "at_risk_detail")).toBe("knapper Umstieg");
    expect(translate("en", "at_risk_detail")).toBe("tight transfer");
  });
});
