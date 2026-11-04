import { translate } from "./i18n";
import type { CardConfig, EntityRef, Journey, Urgency } from "./types";

export const MINUTE = 60_000;

/** Journey duration for the meta row: "49 min", "1 Stunde" / "1 hour", "2 Std. 15 min" / "2 h 15 min". */
export function formatJourneyDuration(minutes: number, language: string | undefined): string {
  if (minutes < 60) return translate(language, "duration_m", { m: minutes });
  if (minutes === 60) return translate(language, "duration_1h");
  return translate(language, "duration_hm", {
    h: Math.floor(minutes / 60),
    m: minutes % 60,
  });
}

export function parseTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

/** Whole minutes from now until `target` (floored, like station displays). */
export function minutesUntil(target: number, now: number): number {
  return Math.floor((target - now) / MINUTE);
}

/** Countdown text: "jetzt", "9", "1h 22". The unit is rendered separately. */
export function countdown(target: number | null, now: number, nowText: string): {
  value: string;
  unit: boolean;
} {
  if (target === null) return { value: "–", unit: false };
  const minutes = minutesUntil(target, now);
  if (minutes <= 0) return { value: nowText, unit: false };
  if (minutes < 60) return { value: String(minutes), unit: true };
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return { value: `${hours}h ${String(rest).padStart(2, "0")}`, unit: false };
}

export function formatClock(ms: number, language: string, timeZone?: string): string {
  try {
    return new Intl.DateTimeFormat(language, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    }).format(ms);
  } catch {
    const date = new Date(ms);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
}

export function formatDelay(minutes: number | null | undefined): string | null {
  if (minutes === null || minutes === undefined || minutes === 0) return null;
  return minutes > 0 ? `+${minutes}` : `${minutes}`;
}

/** How urgent it is to leave home for a journey or departure. */
export function urgency(
  leaveAt: number | null,
  now: number,
  cancelled: boolean,
): Urgency {
  if (cancelled) return "cancelled";
  if (leaveAt === null) return "relaxed";
  const minutes = (leaveAt - now) / MINUTE;
  if (minutes < -0.5) return "missed";
  if (minutes < 1) return "now";
  if (minutes < 4) return "soon";
  return "relaxed";
}

export function isDeparted(departure: number | null, now: number): boolean {
  return departure !== null && departure < now - 30_000;
}

export function visibleJourneys(journeys: Journey[], now: number, max: number): Journey[] {
  return journeys
    .filter((j) => !isDeparted(parseTime(j.departure), now))
    .slice(0, max);
}

export function normalizeRefs(refs: (string | EntityRef)[] | undefined): EntityRef[] {
  return (refs ?? [])
    .map((ref) => (typeof ref === "string" ? { entity: ref } : ref))
    .filter((ref) => Boolean(ref?.entity));
}

export type EntryType = "connection" | "departure_board";

export interface NormalizedConfig {
  type: string;
  title?: string;
  /** Selected connections and boards in display order; empty means all. */
  entries: EntityRef[];
  max_journeys: number;
  max_departures: number;
  show_clock: boolean;
  show_header: boolean;
  show_footer: boolean;
  expand: boolean;
}

/** The configured entries; cards from 0.1.x list them under `connections` and `departures`. */
export function configEntries(config: CardConfig): EntityRef[] {
  const entries = normalizeRefs(config.entries);
  if (entries.length) return entries;
  return [...normalizeRefs(config.connections), ...normalizeRefs(config.departures)];
}

export function entryType(entity: { attributes?: Record<string, unknown> } | undefined): EntryType | null {
  const type = entity?.attributes?.bvg_type;
  return type === "connection" || type === "departure_board" ? type : null;
}

/** All connections, then all departure boards, in the order Home Assistant lists them. */
export function allEntries(states: Record<string, { attributes?: Record<string, unknown> }>): string[] {
  const ids = Object.keys(states);
  return [
    ...ids.filter((id) => entryType(states[id]) === "connection"),
    ...ids.filter((id) => entryType(states[id]) === "departure_board"),
  ];
}

export function resolveEntries(
  config: Pick<NormalizedConfig, "entries">,
  states: Record<string, { attributes?: Record<string, unknown> }>,
): EntityRef[] {
  return config.entries.length ? config.entries : allEntries(states).map((entity) => ({ entity }));
}

export function normalizeConfig(config: CardConfig): NormalizedConfig {
  return {
    type: config.type,
    title: config.title,
    entries: configEntries(config),
    max_journeys: Math.max(1, Number(config.max_journeys ?? 3)),
    max_departures: Math.max(1, Number(config.max_departures ?? 6)),
    show_clock: config.show_clock ?? true,
    show_header: config.show_header ?? true,
    show_footer: config.show_footer ?? true,
    expand: config.expand ?? false,
  };
}

export type BadgeShape = "pill" | "square" | "rect";

export function badgeShape(product: string | null | undefined): BadgeShape {
  if (product === "suburban") return "pill";
  if (product === "subway") return "square";
  return "rect";
}

const PRODUCT_ICONS: Record<string, string> = {
  suburban: "mdi:train-variant",
  subway: "mdi:subway-variant",
  tram: "mdi:tram",
  bus: "mdi:bus",
  ferry: "mdi:ferry",
  regional: "mdi:train",
  express: "mdi:train",
};

/** MDI icon and colour tone for a product symbol; tones map to CSS classes. */
export function productSymbol(product: string | null | undefined): { icon: string; tone: string } {
  if (product && Object.hasOwn(PRODUCT_ICONS, product)) {
    return { icon: PRODUCT_ICONS[product], tone: product };
  }
  return { icon: "mdi:transit-connection-variant", tone: "muted" };
}

/** Readable text colour if the integration did not provide one. */
export function contrastText(hex: string): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return "#fff";
  const n = parseInt(match[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#000" : "#fff";
}
