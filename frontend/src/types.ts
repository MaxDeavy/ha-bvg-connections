export interface Remark {
  type: "warning" | "status";
  text: string;
  summary?: string;
  line?: string;
}

export interface Leg {
  walking: boolean;
  line: string | null;
  product: string | null;
  color: string;
  text_color: string;
  from: string;
  to: string;
  direction: string | null;
  departure: string | null;
  planned_departure: string | null;
  departure_delay: number | null;
  arrival: string | null;
  planned_arrival: string | null;
  arrival_delay: number | null;
  platform: string | null;
  platform_changed: boolean;
  arrival_platform: string | null;
  cancelled: boolean;
  reachable: boolean;
  occupancy: string | null;
  distance: number | null;
  remarks: Remark[];
}

export type JourneyStatus =
  | "ok"
  | "delayed"
  | "connection_at_risk"
  | "cancelled"
  | "no_realtime";

export interface Journey {
  departure: string | null;
  planned_departure: string | null;
  arrival: string | null;
  planned_arrival: string | null;
  leave_at: string | null;
  delay: number | null;
  arrival_delay: number | null;
  duration: number | null;
  transfers: number;
  status: JourneyStatus;
  starts_with_walk: boolean;
  lines: string[];
  legs: Leg[];
  remarks: Remark[];
}

export interface Departure {
  line: string | null;
  product: string | null;
  color: string;
  text_color: string;
  direction: string;
  when: string | null;
  planned_when: string | null;
  leave_at: string | null;
  delay: number | null;
  platform: string | null;
  platform_changed: boolean;
  cancelled: boolean;
  occupancy: string | null;
  remarks: Remark[];
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_updated: string;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  language: string;
  locale?: { language: string; time_zone?: string };
  config: { time_zone: string };
  entities?: Record<string, { platform?: string }>;
  themes?: { darkMode?: boolean };
}

export interface EntityRef {
  entity: string;
  name?: string;
}

export interface CardConfig {
  type: string;
  title?: string;
  entries?: (string | EntityRef)[];
  /** @deprecated 0.1.x, read as `entries` */
  connections?: (string | EntityRef)[];
  /** @deprecated 0.1.x, read as `entries` */
  departures?: (string | EntityRef)[];
  max_journeys?: number;
  max_departures?: number;
  show_clock?: boolean;
  show_header?: boolean;
  show_footer?: boolean;
  expand?: boolean;
}

export type Urgency = "relaxed" | "soon" | "now" | "missed" | "cancelled";
