import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import {
  badgeShape,
  contrastText,
  countdown,
  formatClock,
  formatDelay,
  isDeparted,
  normalizeConfig,
  type NormalizedConfig,
  parseTime,
  productSymbol,
  urgency,
  visibleJourneys,
} from "./format";
import { translate, type StringKey } from "./i18n";
import { defineElement } from "./define";
import { parseRemark, remarkPlainText } from "./remark-text";
import { cardStyles } from "./styles";
import type {
  CardConfig,
  Departure,
  EntityRef,
  HassEntity,
  HomeAssistant,
  Journey,
  Leg,
  Remark,
} from "./types";
import "./editor";

const VERSION = "0.1.1";

const STATUS_SYMBOLS: Record<string, [icon: string, tone: string]> = {
  ok: ["mdi:check", "ok"],
  delayed: ["mdi:clock-alert-outline", "warn"],
  connection_at_risk: ["mdi:transit-transfer", "warn"],
  cancelled: ["mdi:cancel", "error"],
  no_realtime: ["mdi:clock-outline", "muted"],
};
const TICK_MS = 5_000;

type Normalized = NormalizedConfig;

export class BvgConnectionsCard extends LitElement {
  static styles = cardStyles;

  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _now: { state: true },
    _expanded: { state: true },
    _openNotices: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: Normalized;
  private _now = Date.now();
  private _expanded = new Set<string>();
  private _openNotices = new Set<string>();
  private _timer?: number;

  static getConfigElement(): HTMLElement {
    return document.createElement("bvg-connections-card-editor");
  }

  static getStubConfig(hass: HomeAssistant): CardConfig {
    const connections: string[] = [];
    const departures: string[] = [];
    for (const entity of Object.values(hass.states)) {
      const type = entity.attributes?.bvg_type;
      if (type === "connection") connections.push(entity.entity_id);
      if (type === "departure_board") departures.push(entity.entity_id);
    }
    return { type: "custom:bvg-connections-card", connections, departures };
  }

  setConfig(config: CardConfig): void {
    if (!config) throw new Error("Invalid configuration");
    const normalized = normalizeConfig(config);
    if (!normalized.connections.length && !normalized.departures.length) {
      throw new Error("Add at least one entity under `connections` or `departures`.");
    }
    this._config = normalized;
  }

  getCardSize(): number {
    const c = this._config;
    if (!c) return 3;
    return (
      (c.show_header ? 1 : 0) +
      c.connections.length * (1 + c.max_journeys) +
      Math.ceil((c.departures.length * (1 + c.max_departures)) / 1.5)
    );
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._now = Date.now();
    this._timer = window.setInterval(() => {
      this._now = Date.now();
    }, TICK_MS);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._timer) window.clearInterval(this._timer);
  }

  protected shouldUpdate(changed: PropertyValues): boolean {
    if (!changed.has("hass") || changed.size > 1) return true;
    const old = changed.get("hass") as HomeAssistant | undefined;
    if (!old || !this._config) return true;
    return [...this._config.connections, ...this._config.departures].some(
      (ref) => old.states[ref.entity] !== this.hass?.states[ref.entity],
    );
  }

  private get _lang(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? "de";
  }

  private _t(key: StringKey, vars?: Record<string, string | number>): string {
    return translate(this._lang, key, vars);
  }

  private _time(value: string | number | null | undefined): string {
    const ms = typeof value === "number" ? value : parseTime(value);
    if (ms === null) return "–";
    const tz = this.hass?.locale?.time_zone === "local" ? undefined : this.hass?.config?.time_zone;
    return formatClock(ms, this._lang, tz);
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this._config || !this.hass) return nothing;
    const c = this._config;
    const entities = [...c.connections, ...c.departures]
      .map((ref) => this.hass!.states[ref.entity])
      .filter(Boolean);
    const firstConnection = c.connections.length
      ? this.hass.states[c.connections[0].entity]
      : undefined;
    const title =
      c.title ??
      (c.connections.length === 1 && firstConnection
        ? String(firstConnection.attributes.origin ?? "")
        : "");

    return html`
      <ha-card class=${this.hass.themes?.darkMode ? "dark" : ""}>
        ${c.show_header && (title || c.show_clock)
          ? html`<div class="header">
              <div class="title">${title}</div>
              ${c.show_clock ? html`<div class="clock">${this._time(this._now)}</div>` : nothing}
            </div>`
          : nothing}
        ${c.connections.map((ref) => this._renderConnection(ref))}
        ${c.departures.map((ref) => this._renderBoard(ref))}
        ${c.show_footer ? this._renderFooter(entities) : nothing}
      </ha-card>
    `;
  }

  private _entity(ref: EntityRef, type: string): HassEntity | TemplateResult {
    const entity = this.hass!.states[ref.entity];
    if (!entity) {
      return html`<section><div class="warning">${this._t("not_found")}: ${ref.entity}</div></section>`;
    }
    if (entity.attributes.bvg_type !== type) {
      return html`<section><div class="warning">${ref.entity}: ${this._t("wrong_entity")}</div></section>`;
    }
    return entity;
  }

  private _renderConnection(ref: EntityRef): TemplateResult {
    const entity = this._entity(ref, "connection");
    if (!("attributes" in entity)) return entity;
    const a = entity.attributes;
    const walk = Number(a.walk_minutes ?? 0);
    const journeys = visibleJourneys(
      (a.journeys ?? []) as Journey[],
      this._now,
      this._config!.max_journeys,
    );
    return html`
      <section>
        <div class="group-head">
          ${this._sym("mdi:map-marker", "place", "l")}
          <span class="place">${ref.name ?? a.origin}</span>
          ${ref.name
            ? nothing
            : html`<ha-icon icon="mdi:arrow-right"></ha-icon><span class="place">${a.destination}</span>`}
          <span class="spacer"></span>
          ${a.stale
            ? html`<span class="chip stale">${this._sym("mdi:cloud-alert", "warn", "s")}${this._t("stale")}</span>`
            : nothing}
          ${walk
            ? html`<span class="chip" title=${this._t("walk_to_stop")}
                >${this._sym("mdi:walk", "walk", "s")}${walk} ${this._t("min")}</span
              >`
            : nothing}
        </div>
        ${journeys.length
          ? journeys.map((j, i) => this._renderJourney(entity.entity_id, j, i, walk))
          : html`<div class="empty">${this._t("no_journeys")}</div>`}
      </section>
    `;
  }

  private _renderJourney(entityId: string, j: Journey, index: number, walk: number): TemplateResult {
    const key = `${entityId}:${j.departure}:${j.lines.join(">")}`;
    const departure = parseTime(j.departure);
    const leaveAt = parseTime(j.leave_at);
    const cancelled = j.status === "cancelled";
    const level = urgency(walk ? leaveAt : departure, this._now, cancelled);
    const expanded = this._config!.expand || this._expanded.has(key);
    const cd = countdown(departure, this._now, this._t("now"));
    const delay = formatDelay(j.delay);
    const arrivalDelay = formatDelay(j.arrival_delay);
    const firstRide = j.legs.find((l) => !l.walking);

    return html`
      <div
        class="journey u-${level}"
        role="button"
        tabindex="0"
        aria-expanded=${expanded ? "true" : "false"}
        @click=${() => this._toggle(key)}
        @keydown=${(ev: KeyboardEvent) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            this._toggle(key);
          }
        }}
        data-index=${index}
      >
        <div class="times">
          <span class="dep ${cancelled ? "cancelled-text" : delay ? this._delayClass(j.delay) : ""}"
            >${this._time(j.departure)}</span
          >
          ${delay && j.planned_departure && !cancelled
            ? html`<span class="planned">${this._time(j.planned_departure)}</span>`
            : nothing}
        </div>
        <div class="main">
          <div class="chain">
            ${j.starts_with_walk ? this._sym("mdi:walk", "walk") : nothing}
            ${j.legs
              .filter((l) => !l.walking)
              .map(
                (leg, i) => html`${i || j.starts_with_walk ? html`<span class="sep">›</span>` : nothing}${this._badge(
                    leg.line,
                    leg.product,
                    leg.color,
                    leg.text_color,
                    leg.cancelled,
                  )}`,
              )}
          </div>
          <div class="meta">
            <span class="arr ${cancelled ? "cancelled-text" : ""}"
              >${this._t("arrival")} ${this._time(j.arrival)}${arrivalDelay
                ? html` <span class=${this._delayClass(j.arrival_delay)}>(${arrivalDelay})</span>`
                : nothing}</span
            >
            ${j.duration !== null ? html`<span>${j.duration} ${this._t("min")}</span>` : nothing}
            <span>${this._transfers(j.transfers)}</span>
            ${firstRide?.platform
              ? html`<span class=${firstRide.platform_changed ? "platform-changed" : ""}
                  >${this._platform(firstRide.platform)}</span
                >`
              : nothing}
            ${j.remarks.some((r) => r.type === "warning")
              ? this._sym("mdi:alert", "warn", "xs")
              : nothing}
          </div>
        </div>
        <div class="right">
          ${this._status(j)}
          <span class="countdown">${cd.value}${cd.unit ? html`<span class="unit">${this._t("min")}</span>` : nothing}</span>
          ${walk && !cancelled ? this._leaveHint(leaveAt, level) : nothing}
        </div>
      </div>
      ${expanded ? this._renderDetails(j) : nothing}
    `;
  }

  private _platform(platform: string): string {
    return /^\d/.test(platform) ? `${this._t("platform")} ${platform}` : platform;
  }

  private _delayClass(delay: number | null): string {
    if (delay === null || delay <= 0) return "";
    return delay >= 5 ? "very-late" : "late";
  }

  private _transfers(n: number): string {
    if (n === 0) return this._t("transfers_0");
    if (n === 1) return this._t("transfers_1");
    return this._t("transfers_n", { n });
  }

  private _status(j: Journey): TemplateResult {
    const labels: Record<string, string> = {
      ok: this._t("on_time"),
      cancelled: this._t("cancelled"),
      connection_at_risk: this._t("at_risk"),
      no_realtime: this._t("no_realtime"),
    };
    const text = j.status === "delayed" ? (formatDelay(j.delay) ?? formatDelay(j.arrival_delay) ?? "+") : labels[j.status];
    return this._tag(j.status, text);
  }

  private _tag(status: string, text: string): TemplateResult {
    const [icon, tone] = STATUS_SYMBOLS[status] ?? STATUS_SYMBOLS.no_realtime;
    return html`<span class="status tone-${tone}">${this._sym(icon, tone, "s")}${text}</span>`;
  }

  private _sym(icon: string, tone: string, size: "xs" | "s" | "m" | "l" = "m"): TemplateResult {
    return html`<span class="sym ${size} tone-${tone}"><ha-icon icon=${icon}></ha-icon></span>`;
  }

  private _productSym(product: string | null, size: "s" | "m" = "m"): TemplateResult {
    const { icon, tone } = productSymbol(product);
    return this._sym(icon, tone, size);
  }

  private _leaveHint(leaveAt: number | null, level: string): TemplateResult | typeof nothing {
    if (leaveAt === null) return nothing;
    const minutes = Math.floor((leaveAt - this._now) / 60_000);
    let text: string;
    if (level === "missed") text = this._t("missed");
    else if (minutes <= 0) text = this._t("leave_now");
    else text = this._t("leave_in", { m: minutes });
    return html`<span class="leave">${this._sym("mdi:walk", level === "relaxed" ? "walk" : "current", "s")}${text}</span>`;
  }

  private _badge(
    line: string | null,
    product: string | null,
    color: string,
    textColor: string | undefined,
    cancelled = false,
    large = false,
  ): TemplateResult {
    const bg = color || "#5f6368";
    const fg = textColor || contrastText(bg);
    return html`<span
      class="badge ${badgeShape(product)} ${cancelled ? "cancelled" : ""} ${large ? "large" : ""}"
      style="background:${bg};color:${fg}"
      >${line ?? "?"}</span
    >`;
  }

  private _renderDetails(j: Journey): TemplateResult {
    return html`<div class="details">
      ${j.legs.map((leg) => (leg.walking ? this._renderWalk(leg) : this._renderLeg(leg)))}
      ${j.remarks
        .filter((r) => !j.legs.some((l) => l.remarks.some((lr) => lr.text === r.text)))
        .map((r) => this._remark(r))}
    </div>`;
  }

  private _renderWalk(leg: Leg): TemplateResult {
    const minutes =
      leg.departure && leg.arrival
        ? Math.max(1, Math.round((Date.parse(leg.arrival) - Date.parse(leg.departure)) / 60_000))
        : null;
    const text = leg.distance
      ? this._t("walk_distance", { d: leg.distance })
      : this._t("transfer");
    return html`<div class="leg walk">
      <span class="t">${this._time(leg.departure)}</span>
      ${leg.distance ? this._sym("mdi:walk", "walk") : this._sym("mdi:transit-transfer", "muted")}
      <span>${text}${minutes ? ` · ${minutes} ${this._t("min")}` : ""}${leg.to ? ` → ${leg.to}` : ""}</span>
    </div>`;
  }

  private _renderLeg(leg: Leg): TemplateResult {
    const depDelay = formatDelay(leg.departure_delay);
    const arrDelay = formatDelay(leg.arrival_delay);
    return html`<div class="leg">
      <span class="t">
        <span class=${leg.cancelled ? "cancelled-text" : this._delayClass(leg.departure_delay)}
          >${this._time(leg.departure)}${depDelay ? html` <small>${depDelay}</small>` : nothing}</span
        >
        <span class=${leg.cancelled ? "cancelled-text" : this._delayClass(leg.arrival_delay)}
          >${this._time(leg.arrival)}${arrDelay ? html` <small>${arrDelay}</small>` : nothing}</span
        >
      </span>
      <span class="line">
        ${this._productSym(leg.product)}${this._badge(leg.line, leg.product, leg.color, leg.text_color, leg.cancelled)}
      </span>
      <div class="route">
        <div class="stop ${leg.cancelled ? "cancelled-text" : ""}">${leg.from}</div>
        <div class="sub">
          ${leg.direction ? html`<span>${this._t("direction")} ${leg.direction}</span>` : nothing}
          ${leg.platform
            ? html`<span class=${leg.platform_changed ? "platform-changed" : ""}>${this._platform(leg.platform)}</span>`
            : nothing}
          ${this._occupancy(leg.occupancy)}
          ${leg.cancelled ? this._tag("cancelled", this._t("cancelled")) : nothing}
          ${!leg.reachable && !leg.cancelled ? this._tag("connection_at_risk", this._t("at_risk")) : nothing}
        </div>
        <div class="stop ${leg.cancelled ? "cancelled-text" : ""}">${leg.to}</div>
        ${leg.remarks.map((r) => this._remark(r))}
      </div>
    </div>`;
  }

  private _occupancy(value: string | null): TemplateResult | typeof nothing {
    if (!value) return nothing;
    const icon =
      value === "high" ? "mdi:account-group" : value === "medium" ? "mdi:account-multiple" : "mdi:account";
    const label = this._t(`occupancy_${value}` as StringKey);
    return html`<span class="occupancy ${value}" title=${label}><ha-icon icon=${icon}></ha-icon></span>`;
  }

  private _remark(r: Remark): TemplateResult {
    const more = this._t("more");
    const summary = remarkPlainText(r.summary, more);
    const parts = parseRemark(r.text, more);
    const showSummary = summary && summary !== remarkPlainText(r.text, more);
    return html`<div class="remark is-${r.type}">
      ${r.type === "warning" ? this._sym("mdi:alert", "warn", "s") : this._sym("mdi:information-variant", "muted", "s")}
      <span
        >${showSummary ? html`<b>${summary}:</b> ` : nothing}${parts.map((part) =>
          part.href
            ? html`<a
                href=${part.href}
                target="_blank"
                rel="noopener noreferrer"
                @click=${(ev: Event) => ev.stopPropagation()}
                >${part.text}</a
              >`
            : part.text,
        )}</span
      >
    </div>`;
  }

  private _renderBoard(ref: EntityRef): TemplateResult {
    const entity = this._entity(ref, "departure_board");
    if (!("attributes" in entity)) return entity;
    const a = entity.attributes;
    const walk = Number(a.walk_minutes ?? 0);
    const departures = ((a.departures ?? []) as Departure[])
      .filter((d) => !isDeparted(parseTime(d.when), this._now))
      .slice(0, this._config!.max_departures);
    const notices = this._boardNotices(departures);
    const open = this._openNotices.has(entity.entity_id);
    return html`
      <section>
        <div class="group-head">
          ${this._sym("mdi:bus-stop", "place", "l")}
          <span class="place">${ref.name ?? a.stop}</span>
          <span class="spacer"></span>
          ${a.stale
            ? html`<span class="chip stale">${this._sym("mdi:cloud-alert", "warn", "s")}${this._t("stale")}</span>`
            : nothing}
          ${walk
            ? html`<span class="chip">${this._sym("mdi:walk", "walk", "s")}${walk} ${this._t("min")}</span>`
            : nothing}
        </div>
        ${departures.length
          ? departures.map((d) => this._renderDeparture(d, walk))
          : html`<div class="empty">${this._t("no_departures")}</div>`}
        ${notices.length
          ? html`<div class="notices" @click=${() => this._toggleNotices(entity.entity_id)}>
              <div class="summary">
                ${this._sym("mdi:alert", "warn", "s")}
                <span>${notices.length === 1 ? this._t("remark") : this._t("remarks", { n: notices.length })}</span>
                ${open ? nothing : html`<span class="preview">${remarkPlainText(notices[0].text, this._t("more"))}</span>`}
                <span class="spacer"></span>
                <ha-icon icon=${open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
              </div>
              ${open ? notices.map((r) => this._remark(r)) : nothing}
            </div>`
          : nothing}
      </section>
    `;
  }

  private _boardNotices(departures: Departure[]): Remark[] {
    const seen = new Set<string>();
    const result: Remark[] = [];
    for (const d of departures) {
      for (const r of d.remarks) {
        if (r.type === "warning" && !seen.has(r.text)) {
          seen.add(r.text);
          result.push(r);
        }
      }
    }
    return result;
  }

  private _renderDeparture(d: Departure, walk: number): TemplateResult {
    const when = parseTime(d.when);
    const leaveAt = parseTime(d.leave_at);
    const reachable = !walk || leaveAt === null || leaveAt >= this._now - 30_000;
    const cd = countdown(when, this._now, this._t("now"));
    const delay = formatDelay(d.delay);
    const planned = delay && d.planned_when && !d.cancelled ? this._time(d.planned_when) : null;
    return html`<div class="departure ${d.cancelled ? "is-cancelled" : ""} ${reachable ? "" : "unreachable"}">
      ${this._productSym(d.product)}
      ${this._badge(d.line, d.product, d.color, d.text_color, false, true)}
      <div class="dir">
        <span>${d.direction}</span>
        ${d.platform || planned || d.cancelled
          ? html`<small>
              ${d.cancelled ? this._tag("cancelled", this._t("cancelled")) : nothing}
              ${planned ? html`<span class="planned-inline">${planned}</span>` : nothing}
              ${d.platform
                ? html`<span class=${d.platform_changed ? "platform-changed" : ""}>${this._platform(d.platform)}</span>`
                : nothing}
            </small>`
          : nothing}
      </div>
      <span class="delay ${this._delayClass(d.delay)}"
        >${d.cancelled
          ? ""
          : html`${(d.delay ?? 0) > 0 ? this._sym("mdi:clock-alert-outline", "current", "xs") : nothing}${delay ?? ""}`}</span
      >
      <span class="countdown ${d.cancelled ? "cancelled-text" : ""}"
        >${cd.value}${cd.unit ? html`<span class="unit">${this._t("min")}</span>` : nothing}</span
      >
    </div>`;
  }

  private _renderFooter(entities: HassEntity[]): TemplateResult | typeof nothing {
    const times = entities
      .map((e) => parseTime(e.attributes.fetched_at))
      .filter((t): t is number => t !== null);
    if (!times.length) return nothing;
    const stale = entities.some((e) => e.attributes.stale);
    return html`<div class="footer">
      ${stale ? html`<span class="stale-text">${this._t("stale")} ·</span>` : nothing}
      <span>${this._t("updated")} ${this._time(Math.min(...times))}</span>
    </div>`;
  }

  private _toggle(key: string): void {
    const next = new Set(this._expanded);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this._expanded = next;
  }

  private _toggleNotices(key: string): void {
    const next = new Set(this._openNotices);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this._openNotices = next;
  }
}

defineElement("bvg-connections-card", BvgConnectionsCard);

const w = window as unknown as { customCards?: ({ type: string } & Record<string, unknown>)[] };
w.customCards = w.customCards ?? [];
if (!w.customCards.some((c) => c.type === "bvg-connections-card")) {
  w.customCards.push({
    type: "bvg-connections-card",
    name: "BVG Verbindungen",
    description: "Verbindungen mit Umstiegen, Abfahrtstafeln und Losgeh-Hinweisen",
    preview: true,
    documentationURL: "https://github.com/MaxDeavy/ha-bvg-connections",
  });
  console.info(`%c BVG-CONNECTIONS-CARD %c ${VERSION} `, "color:#fff;background:#f0d722;color:#000;font-weight:700", "");
}
