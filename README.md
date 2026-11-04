<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="custom_components/bvg_connections/brand/dark_logo.png">
    <img src="custom_components/bvg_connections/brand/logo.png" alt="BVG Verbindungen" width="420">
  </picture>
</p>

# BVG Verbindungen für Home Assistant

[![Validate](https://github.com/MaxDeavy/ha-bvg-connections/actions/workflows/validate.yml/badge.svg)](https://github.com/MaxDeavy/ha-bvg-connections/actions/workflows/validate.yml)
[![CI](https://github.com/MaxDeavy/ha-bvg-connections/actions/workflows/ci.yml/badge.svg)](https://github.com/MaxDeavy/ha-bvg-connections/actions/workflows/ci.yml)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories)

Verbindungen mit Umstiegen und Abfahrtstafeln für den Berliner ÖPNV (BVG, S-Bahn, Regionalverkehr) – als Home-Assistant-Integration mit eigener Lovelace-Karte.

*English version below.*

> [!TIP]
> **Wo lege ich Verbindungen an?** Nicht über „Integration hinzufügen“, sondern auf der Seite der Integration: *Einstellungen → Geräte & Dienste → BVG Verbindungen* → oben die Knöpfe **„Verbindung hinzufügen“** bzw. **„Abfahrtstafel hinzufügen“**. Details in [Schritt 3](#3-verbindungen-und-abfahrtstafeln-anlegen).

<p>
  <img src="docs/images/card-light.png" alt="Karte im hellen Theme" width="420">
  <img src="docs/images/card-dark-details.png" alt="Karte im dunklen Theme mit aufgeklappten Details" width="420">
</p>

## Funktionen

- **Verbindungen von A nach B** mit allen Umstiegen. Start und Ziel können Haltestellen, Adressen oder Orte sein.
- **Abfahrtstafeln** für beliebige Haltestellen, optional gefiltert nach Verkehrsmittel, Linie und Richtung.
- **Fußweg zur Haltestelle** pro Verbindung bzw. Tafel: Die Integration blendet Fahrten aus, die du nicht mehr erreichst, und die Karte zeigt „Los in X min“ bzw. „Jetzt los!“.
- **Echtzeit:** Verspätungen, Ausfälle, gefährdete Anschlüsse, Gleiswechsel, Auslastung und Störungsmeldungen.
- **Lovelace-Karte** im nativen Home-Assistant-Look (helles und dunkles Theme): Linien-Badges in BVG-Farben, Symbole in farbigen Kreisen wie bei den HA-Kachelkarten (nach Verkehrsmittel und Status eingefärbt), Umstiegsketten, Countdown, Dringlichkeitsbalken, aufklappbare Fahrtdetails, Uhr und grafischer Editor.
- **Eigenes Symbol und Logo:** Home Assistant zeigt sie direkt aus dem Ordner `brand/` der Integration an, ein Eintrag im Brands-Repository ist nicht nötig.
- **Alles über die Oberfläche:** Verbindungen und Tafeln sind Unterelemente (Config Subentries) der Integration und lassen sich jederzeit hinzufügen, bearbeiten oder löschen.
- **Schonend zur API:** Request-Budget mit Token-Bucket (Standard 40/min, die öffentliche API erlaubt 100/min), Backoff bei Fehlern, die letzten Daten bleiben bei Ausfällen sichtbar, Reparaturhinweis bei längerem Ausfall.

Datenquelle ist [`v6.bvg.transport.rest`](https://v6.bvg.transport.rest) (Community-Dienst ohne SLA, keine Anmeldung nötig). Eine selbst gehostete [`bvg-rest`](https://github.com/derhuerst/bvg-rest)-Instanz funktioniert ebenfalls.

## Installation und Einrichtung

Voraussetzung: Home Assistant **2026.10** oder neuer.

### 1. Integration installieren

**Variante A – über HACS (empfohlen)**

1. HACS öffnen → Drei-Punkte-Menü oben rechts → **Benutzerdefinierte Repositories**.
2. Repository `https://github.com/MaxDeavy/ha-bvg-connections` eintragen, Typ **Integration**, *Hinzufügen*.
3. In HACS nach **BVG Verbindungen** suchen → **Herunterladen**.
4. Home Assistant **neu starten** (*Einstellungen → System → Neu starten*).

**Variante B – manuell**

1. Die [aktuelle Version](https://github.com/MaxDeavy/ha-bvg-connections/releases/latest) herunterladen (*Source code (zip)*) und entpacken.
2. Den Ordner `custom_components/bvg_connections` nach `<config>/custom_components/` kopieren (z. B. per Samba, SSH oder File-Editor-Add-on). Der Zielordner muss **genau** `bvg_connections` heißen:

   ```text
   config/
   └── custom_components/
       └── bvg_connections/
           ├── __init__.py
           ├── manifest.json
           ├── brand/
           ├── frontend/
           └── …
   ```

3. Home Assistant **neu starten**.

### 2. Integration hinzufügen

1. *Einstellungen → Geräte & Dienste → **Integration hinzufügen*** → nach **BVG Verbindungen** suchen.
2. API-URL und Request-Budget bestätigen. Die Standardwerte passen.

Damit ist nur die Integration selbst angelegt; Verbindungen gibt es noch keine.

### 3. Verbindungen und Abfahrtstafeln anlegen

1. *Einstellungen → Geräte & Dienste* → auf **BVG Verbindungen** klicken (nicht erneut „Integration hinzufügen“).
2. Oben auf der Integrationsseite stehen die Knöpfe **„Verbindung hinzufügen“** und **„Abfahrtstafel hinzufügen“** (nicht „Dienst hinzufügen“, das legt eine zweite Integration an):

   <img src="docs/images/integration-page.png" alt="Integrationsseite mit den Knöpfen „Verbindung hinzufügen“ und „Abfahrtstafel hinzufügen“" width="600">
3. **Verbindung hinzufügen:** Start und Ziel eingeben (Haltestelle, Adresse oder Ort), passenden Treffer auswählen. Im letzten Schritt Name, **Gehzeit zur Haltestelle** (vorbelegt mit 5 min), Anzahl der Verbindungen, Verkehrsmittel, ausgeschlossene Linien, maximale Umstiege und Mindest-Umstiegszeit festlegen. Bleibt der Start leer, werden Haltestellen in der Nähe deines Zuhauses angeboten.
4. **Abfahrtstafel hinzufügen:** Haltestelle suchen, dann Gehzeit, Zeitfenster, Anzahl, Verkehrsmittel, Linien und Richtung festlegen.
5. Für jede Verbindung und Tafel entsteht ein eigenes Gerät mit Sensoren (siehe [Entitäten](#entitäten)).

**Gehzeit:** die Minuten von deiner Tür bis zur Haltestelle, pro Verbindung bzw. Tafel einzeln. Fahrten, die du zu Fuß nicht mehr erreichst, blendet die Integration aus, und die Karte zeigt „Los in X min“ bzw. „Jetzt los!“.

**Später ändern:** In der Liste auf der Integrationsseite beim Eintrag auf das **Stift-Symbol** („Neu konfigurieren“) klicken. Löschen geht über das Drei-Punkte-Menü des Eintrags. Aktualisierungsintervalle (Standard je 30 s) und Request-Budget stehen in den **Optionen** der Integration (Zahnrad).

### 4. Karte zum Dashboard hinzufügen

1. Dashboard öffnen → Stift oben rechts (**Bearbeiten**) → **Karte hinzufügen**.
2. Nach **BVG Verbindungen** suchen und auswählen. Der Editor schlägt die Sensoren deiner Verbindungen und Tafeln bereits vor.
3. Speichern.

Die Karte wird von der Integration mitgeliefert und automatisch geladen. Eine Lovelace-Ressource musst du normalerweise **nicht** anlegen. Alle Optionen gibt es auch als YAML (siehe [Karte](#karte)).

### Fehlerbehebung

- **„BVG Verbindungen“ fehlt in der Kartenauswahl oder die Karte zeigt „Konfigurationsfehler“ / „Custom element doesn't exist“:**
  1. Browser hart neu laden (Strg+Umschalt+R bzw. Cmd+Umschalt+R). In der Companion-App den Frontend-Cache zurücksetzen (*Einstellungen → Companion-App → Fehlerbehebung* bzw. *Debugging*).
  2. Prüfen, ob Home Assistant nach der Installation neu gestartet wurde.
  3. Falls die Karte weiterhin fehlt, die Ressource von Hand eintragen: *Einstellungen → Dashboards → Drei-Punkte-Menü → Ressourcen → Ressource hinzufügen*, URL `/bvg_connections/bvg-connections-card.js`, Typ **JavaScript-Modul**. Der Menüpunkt *Ressourcen* erscheint nur, wenn im Benutzerprofil der *Erweiterte Modus* aktiv ist. Doppelt geladen schadet die Karte nicht.
- **Integration erscheint nicht in der Suche:** Liegt der Ordner unter `<config>/custom_components/bvg_connections/` (nicht `ha-bvg-connections`, nicht doppelt verschachtelt)? Danach neu starten.
- **Seltsames Verhalten nach einem Update oder nach Tests mit anderen Versionen:**
  1. Alte oder andere BVG-/VBB-Integrationen und alte Einträge dieser Integration unter *Geräte & Dienste* entfernen.
  2. Übrig gebliebene Ordner unter `custom_components/` löschen (z. B. alte Kopien unter anderem Namen). Dabei den ganzen Ordner löschen, auch den Unterordner `__pycache__`, den manche Dateibrowser ausblenden.
  3. Neu installieren, neu starten, Browser hart neu laden.
- **„Keine Verbindungen“ oder veraltete Daten:** `v6.bvg.transport.rest` ist ein Community-Dienst ohne SLA. Bei Ausfällen zeigt die Karte die letzten Daten mit dem Hinweis „Daten veraltet“, nach längerer Störung erscheint ein Reparaturhinweis.

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

**Features:** journeys from stop/address/place to stop/address/place with all transfers; departure boards with product, line and direction filters; per-entry walking time that hides connections you can no longer catch and drives “leave in X min” hints; realtime delays, cancellations, at-risk connections, platform changes, occupancy and disruption notices; a native-looking card (light and dark theme) with BVG-coloured line badges, tile-style symbols (MDI icons in tinted circles, coloured by product and status), transfer chains, countdowns, urgency bars, expandable trip details and a visual editor; its own icon and logo, served by Home Assistant from the integration's `brand/` folder; everything configured in the UI via config subentries; a request budget (default 40/min, the public API allows 100/min), backoff, stale-data display and a repair issue on longer outages.

> [!TIP]
> **Where do I add connections?** Not via “Add integration”, but on the integration's own page: *Settings → Devices & services → BVG Verbindungen* → the **“Verbindung hinzufügen”** (add connection) and **“Abfahrtstafel hinzufügen”** (add departure board) buttons at the top.

**Setup, step by step** (requires Home Assistant 2026.10 or newer):

1. **Install.**
   - *HACS:* HACS → three-dot menu → **Custom repositories** → `https://github.com/MaxDeavy/ha-bvg-connections`, type **Integration** → search **BVG Verbindungen** → **Download**.
   - *Manual:* download the [latest release](https://github.com/MaxDeavy/ha-bvg-connections/releases/latest) and copy `custom_components/bvg_connections` to `<config>/custom_components/`. The folder name must be exactly `bvg_connections`.
   - Restart Home Assistant.
2. **Add the integration:** *Settings → Devices & services → **Add integration** → BVG Verbindungen*. The defaults are fine. This creates the integration only, no connections yet.
3. **Add connections and boards:** open *Settings → Devices & services → **BVG Verbindungen*** and use the **“Verbindung hinzufügen”** / **“Abfahrtstafel hinzufügen”** buttons at the top (not “Dienst hinzufügen” / “Add service”, which creates a second integration entry). Search origin and destination (stop, address or place), pick the match, then set name, **walking time to the stop** (prefilled with 5 min), number of results, products, excluded lines, max. transfers and min. transfer time. Change an entry later with its **pencil icon** (“Reconfigure”). Polling intervals (default 30 s each) and the request budget are in the integration **options** (gear icon).
4. **Add the card:** dashboard → **Edit** → **Add card** → search **BVG Verbindungen**. The editor suggests your sensors. The integration serves and loads the card itself, so no Lovelace resource is needed.

**Troubleshooting:**

- *Card missing from the picker, or “Configuration error” / “Custom element doesn't exist”:* hard-reload the browser (Ctrl+Shift+R; Companion app: reset the frontend cache) and make sure you restarted after installing. If it is still missing, add the resource manually: *Settings → Dashboards → three-dot menu → Resources → Add resource*, URL `/bvg_connections/bvg-connections-card.js`, type **JavaScript module** (the *Resources* entry needs *Advanced mode* in your user profile).
- *Integration not found:* check that the files are in `<config>/custom_components/bvg_connections/` (not `ha-bvg-connections`, not nested twice), then restart.
- *Odd behaviour after updates or tests with other versions:* remove old or other BVG/VBB integrations and old entries of this one, delete leftover folders under `custom_components/` completely (including the `__pycache__` subfolder that some file browsers hide), reinstall, restart and hard-reload.

**Card:** see the YAML example above; all options are also available in the visual editor.

**Development:** see the commands above. Keep personal stops in the gitignored `local_defaults.yaml`; `scripts/dev_seed.py` creates the entries in a local dev instance through the real config flows.

## Changelog

Siehe / see [CHANGELOG.md](CHANGELOG.md).

## Lizenz / License

MIT, siehe [LICENSE](LICENSE). Fahrplandaten: VBB/BVG via HAFAS und transport.rest.
