import { LitElement, html, nothing, type TemplateResult } from "lit";
import { defineElement } from "./define";
import { allEntries, configEntries } from "./format";
import { translate, type StringKey } from "./i18n";
import type { CardConfig, EntityRef, HomeAssistant } from "./types";

const ENTITY_FILTER = { integration: "bvg_connections", domain: "sensor", device_class: "timestamp" };

const OPTIONS = [
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

/** Form schema; the picker only offers the sensors the card can show. */
export function editorSchema(states: HomeAssistant["states"]) {
  return [
    { name: "title", selector: { text: {} } },
    {
      name: "entries",
      selector: {
        entity: { multiple: true, filter: ENTITY_FILTER, include_entities: allEntries(states) },
      },
    },
    ...OPTIONS,
  ];
}

/** Turns the form value back into a card config, keeping per-entry names from YAML. */
export function editorConfig(previous: CardConfig, value: Record<string, unknown>): CardConfig {
  const config: CardConfig = { type: previous.type, ...value };
  const old = configEntries(previous);
  const entries: (string | EntityRef)[] = ((value.entries as string[] | undefined) ?? []).map(
    (entity) => old.find((ref) => ref.entity === entity && ref.name) ?? entity,
  );
  delete config.connections;
  delete config.departures;
  if (entries.length) config.entries = entries;
  else delete config.entries;
  if (!config.title) delete config.title;
  return config;
}

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

  private _t(key: StringKey): string {
    return translate(this.hass?.locale?.language ?? this.hass?.language, key);
  }

  /** ha-form also asks for labels of the unnamed grid groups. */
  private _label = (s: { name?: string }): string => (s.name ? this._t(`editor_${s.name}` as StringKey) : "");

  private _helper = (s: { name?: string }): string | undefined =>
    s.name === "entries" ? this._t("editor_entries_helper") : undefined;

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const { connections: _c, departures: _d, ...rest } = this._config;
    const data = {
      max_journeys: 3,
      max_departures: 6,
      show_header: true,
      show_clock: true,
      show_footer: true,
      expand: false,
      ...rest,
      entries: configEntries(this._config).map((r) => r.entity),
    };
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${editorSchema(this.hass.states)}
      .computeLabel=${this._label}
      .computeHelper=${this._helper}
      @value-changed=${this._changed}
    ></ha-form>`;
  }

  private _changed(ev: CustomEvent): void {
    ev.stopPropagation();
    const config = editorConfig(this._config ?? { type: "custom:bvg-connections-card" }, ev.detail.value);
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
}

defineElement("bvg-connections-card-editor", BvgConnectionsCardEditor);
