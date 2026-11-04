import { LitElement, html, nothing, type TemplateResult } from "lit";
import { defineElement } from "./define";
import { normalizeRefs } from "./format";
import { translate, type StringKey } from "./i18n";
import type { CardConfig, HomeAssistant } from "./types";

const ENTITY_FILTER = { integration: "bvg_connections", domain: "sensor", device_class: "timestamp" };

const SCHEMA = [
  { name: "title", selector: { text: {} } },
  { name: "connections", selector: { entity: { multiple: true, filter: ENTITY_FILTER } } },
  { name: "departures", selector: { entity: { multiple: true, filter: ENTITY_FILTER } } },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "max_journeys", selector: { number: { min: 1, max: 8, mode: "box" } } },
      { name: "max_departures", selector: { number: { min: 1, max: 20, mode: "box" } } },
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      { name: "show_header", selector: { boolean: {} } },
      { name: "show_clock", selector: { boolean: {} } },
      { name: "show_footer", selector: { boolean: {} } },
      { name: "expand", selector: { boolean: {} } },
    ],
  },
];

export class BvgConnectionsCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  hass?: HomeAssistant;
  private _config?: CardConfig;

  setConfig(config: CardConfig): void {
    this._config = config;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const data = {
      max_journeys: 3,
      max_departures: 6,
      show_header: true,
      show_clock: true,
      show_footer: true,
      expand: false,
      ...this._config,
      connections: normalizeRefs(this._config.connections).map((r) => r.entity),
      departures: normalizeRefs(this._config.departures).map((r) => r.entity),
    };
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${SCHEMA}
      .computeLabel=${(s: { name?: string }) =>
        s.name ? translate(this.hass?.locale?.language ?? this.hass?.language, `editor_${s.name}` as StringKey) : ""}
      @value-changed=${this._changed}
    ></ha-form>`;
  }

  private _changed(ev: CustomEvent): void {
    ev.stopPropagation();
    const value = { ...ev.detail.value } as CardConfig & Record<string, unknown>;
    // Keep per-entity name overrides from YAML.
    for (const key of ["connections", "departures"] as const) {
      const previous = normalizeRefs(this._config?.[key]);
      value[key] = ((value[key] as string[] | undefined) ?? []).map((entity) => {
        const old = previous.find((r) => r.entity === entity);
        return old?.name ? old : entity;
      });
    }
    if (!value.title) delete value.title;
    this._config = value;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: value }, bubbles: true, composed: true }));
  }
}

defineElement("bvg-connections-card-editor", BvgConnectionsCardEditor);
