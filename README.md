# BVG Verbindungen für Home Assistant

[![Validate](https://github.com/MaxDeavy/ha-bvg-connections/actions/workflows/validate.yml/badge.svg)](https://github.com/MaxDeavy/ha-bvg-connections/actions/workflows/validate.yml)
[![CI](https://github.com/MaxDeavy/ha-bvg-connections/actions/workflows/ci.yml/badge.svg)](https://github.com/MaxDeavy/ha-bvg-connections/actions/workflows/ci.yml)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories)

Verbindungen mit Umstiegen und Abfahrtstafeln für den Berliner ÖPNV (BVG, S-Bahn, Regionalverkehr) – als Home-Assistant-Integration mit eigener Lovelace-Karte.

*English version below.*

<p>
  <img src="docs/images/card-light.png" alt="Karte im hellen Theme" width="420">
  <img src="docs/images/card-dark-details.png" alt="Karte im dunklen Theme mit aufgeklappten Details" width="420">
</p>

## Funktionen

- **Verbindungen von A nach B** mit allen Umstiegen. Start und Ziel können Haltestellen, Adressen oder Orte sein.
- **Abfahrtstafeln** für beliebige Haltestellen, optional gefiltert nach Verkehrsmittel, Linie und Richtung.
- **Fußweg zur Haltestelle** pro Verbindung bzw. Tafel: Die Integration blendet Fahrten aus, die du nicht mehr erreichst, und die Karte zeigt „Los in X min“ bzw. „Jetzt los!“.
- **Echtzeit:** Verspätungen, Ausfälle, gefährdete Anschlüsse, Gleiswechsel, Auslastung und Störungsmeldungen.
- **Lovelace-Karte** im nativen Home-Assistant-Look (helles und dunkles Theme): Linien-Badges in BVG-Farben, Umstiegsketten, Countdown, Dringlichkeitsbalken, aufklappbare Fahrtdetails, Uhr und grafischer Editor.
- **Alles über die Oberfläche:** Verbindungen und Tafeln sind Unterelemente (Config Subentries) der Integration und lassen sich jederzeit hinzufügen, bearbeiten oder löschen.
- **Schonend zur API:** Request-Budget mit Token-Bucket (Standard 40/min, die öffentliche API erlaubt 100/min), Backoff bei Fehlern, die letzten Daten bleiben bei Ausfällen sichtbar, Reparaturhinweis bei längerem Ausfall.

Datenquelle ist [`v6.bvg.transport.rest`](https://v6.bvg.transport.rest) (Community-Dienst ohne SLA, keine Anmeldung nötig). Eine selbst gehostete [`bvg-rest`](https://github.com/derhuerst/bvg-rest)-Instanz funktioniert ebenfalls.

## Installation

Voraussetzung: Home Assistant **2025.3** oder neuer.

1. HACS → Integrationen → Menü → *Benutzerdefinierte Repositories* → `https://github.com/MaxDeavy/ha-bvg-connections`, Kategorie *Integration*.
2. „BVG Verbindungen“ installieren und Home Assistant neu starten.
3. *Einstellungen → Geräte & Dienste → Integration hinzufügen → BVG Verbindungen.*

Ohne HACS: den Ordner `custom_components/bvg_connections` nach `<config>/custom_components/` kopieren.

Die Karte wird von der Integration mitgeliefert und automatisch geladen; eine Lovelace-Ressource musst du nicht anlegen.

## Einrichtung

1. **Integration:** API-URL (Standard passt) und Request-Budget.
2. **Verbindung hinzufügen** (auf der Integrationsseite): Start und Ziel suchen, Treffer auswählen, dann Name, Fußweg, Anzahl, Verkehrsmittel, ausgeschlossene Linien, maximale Umstiege und Mindest-Umstiegszeit festlegen. Bleibt der Start leer, werden Haltestellen in der Nähe deines Zuhauses angeboten.
3. **Abfahrtstafel hinzufügen:** Haltestelle suchen, dann Fußweg, Zeitfenster, Anzahl, Verkehrsmittel, Linien und Richtung.
4. **Optionen** der Integration: Aktualisierungsintervalle für Verbindungen und Tafeln (Standard je 30 s) und das Request-Budget. Die Optionen prüfen, ob die Intervalle ins Budget passen.

Einstellungen einer Verbindung oder Tafel änderst du über das Drei-Punkte-Menü des Eintrags („Neu konfigurieren“).

## Entitäten

Pro Verbindung (ein Gerät):

| Entität | Inhalt |
|---|---|
| `sensor.<name>_nachste_abfahrt` | Zeitpunkt der nächsten erreichbaren Abfahrt. Attribut `journeys` enthält alle Verbindungen inkl. Teilstrecken (für die Karte). |
| `sensor.<name>_losgehen_um` | Wann du losgehen musst (Abfahrt minus Fußweg). |
| `sensor.<name>_fahrtdauer` | Fahrtdauer in Minuten. |
| `sensor.<name>_umstiege` | Anzahl Umstiege. |
| `sensor.<name>_verspatung` | Abfahrtsverspätung in Minuten (leer ohne Echtzeitdaten). |
| `binary_sensor.<name>_storung` | An bei Ausfall, gefährdetem Anschluss oder Störungsmeldung der nächsten Verbindung. |

Pro Abfahrtstafel: `sensor.<name>_nachste_abfahrt` (Attribut `departures`) und `binary_sensor.<name>_storung`.

Die großen Listen-Attribute werden nicht in der Recorder-Datenbank gespeichert. Die Minuten bis zur Abfahrt rechnet die Karte selbst aus, dafür sind keine zusätzlichen Abfragen nötig.

## Karte

```yaml
type: custom:bvg-connections-card
title: Unterwegs             # optional
connections:                 # Sensoren „Nächste Abfahrt“ von Verbindungen
  - sensor.alexanderplatz_reichstag_nachste_abfahrt
  - entity: sensor.zoo_hauptbahnhof_nachste_abfahrt
    name: Über Zoo           # optional eigener Gruppenname
departures:                  # Sensoren „Nächste Abfahrt“ von Abfahrtstafeln
  - sensor.alexanderplatz_nachste_abfahrt
max_journeys: 3              # je Verbindung, Standard 3
max_departures: 6            # je Tafel, Standard 6
show_header: true
show_clock: true
show_footer: true            # „Stand 10:05“
expand: false                # Fahrtdetails immer aufgeklappt
```

Ein Tipp auf eine Verbindung klappt die Details auf (Teilstrecken, Fußwege, Richtung, Gleis, Auslastung, Hinweise). Der farbige Balken links zeigt, wie dringend du los musst: grün = entspannt, orange = bald/jetzt, rot = nicht mehr zu schaffen oder Ausfall.

## Entwicklung

```bash
# Python (HA 2026.10 benötigt Python 3.14)
pip install -r requirements_test.txt
ruff check . && pytest

# Karte
cd frontend && npm ci && npm test && npm run build   # schreibt custom_components/bvg_connections/frontend/
```

**Lokale Testdaten:** Eigene Haltestellen gehören **nie** ins Repository. Kopiere `local_defaults.example.yaml` nach `local_defaults.yaml` (steht in `.gitignore`) und trage dort deine Verbindungen ein. Dann:

```bash
./scripts/dev_ha.sh                    # startet HA in .dev/config mit dieser Integration
python scripts/dev_seed.py --dashboard # legt Einträge über die echten Config Flows an
```

Das Seed-Skript richtet eine frische Instanz mit dem Benutzer `dev` / `dev-password` ein (über `HA_USERNAME`/`HA_PASSWORD` änderbar) und erstellt das Dashboard `/bvg-connections`.

Die Linienfarben (`line_colors.py`) erzeugt `scripts/gen_line_colors.py` aus dem VBB-GTFS-Feed. Der Feed enthält Farben nur für S- und U-Bahn; Tram, Bus, Fähre und Regionalverkehr nutzen Produktfarben.

---

## English

Journeys with transfers and departure boards for Berlin public transport (BVG, S-Bahn, regional trains), as a Home Assistant integration with a bundled Lovelace card.

**Features:** journeys from stop/address/place to stop/address/place with all transfers; departure boards with product, line and direction filters; per-entry walking time that hides connections you can no longer catch and drives “leave in X min” hints; realtime delays, cancellations, at-risk connections, platform changes, occupancy and disruption notices; a native-looking card (light and dark theme) with BVG-coloured line badges, transfer chains, countdowns, urgency bars, expandable trip details and a visual editor; everything configured in the UI via config subentries; a request budget (default 40/min, the public API allows 100/min), backoff, stale-data display and a repair issue on longer outages.

**Install:** HACS → custom repository `https://github.com/MaxDeavy/ha-bvg-connections` (category *Integration*), install, restart, then add “BVG Verbindungen” under *Settings → Devices & services*. Requires Home Assistant 2025.3 or newer. The card is served and loaded by the integration automatically.

**Setup:** add *connections* and *departure boards* from the integration page. Polling intervals (default 30 s each) and the request budget are in the integration options. Use “Reconfigure” on a connection or board to change filters and walking time.

**Card:** see the YAML example above; all options are also available in the visual editor.

**Development:** see the commands above. Keep personal stops in the gitignored `local_defaults.yaml`; `scripts/dev_seed.py` creates the entries in a local dev instance through the real config flows.

## Lizenz / License

MIT, siehe [LICENSE](LICENSE). Fahrplandaten: VBB/BVG via HAFAS und transport.rest.
