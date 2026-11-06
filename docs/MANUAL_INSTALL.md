# Manuelle Installation / Custom Repository

Für die normale Installation über den Marketplace-Katalog (HA 2026.11+) bzw. den HACS-Standardkatalog (HA 2026.10) reicht die Anleitung in der [README](../README.md#1-integration-installieren). Diese Seite ist für:

- eine Version **bevor** die Integration im Standardkatalog landet bzw. ein Update, das dort noch nicht sichtbar ist
- Installation **ohne Marketplace/HACS** (Zip kopieren)
- Entwickler, die lokal am Repo arbeiten (siehe auch [CONTRIBUTING.md](../CONTRIBUTING.md))

Voraussetzung: Home Assistant **2026.10** oder neuer. Anzeigename: **BVG Verbindungen**.

## Custom Repository im Marketplace (HA 2026.11+)

1. *Einstellungen → Marketplace* öffnen.
2. Oben rechts **Aus Link hinzufügen** (*Add from link*) wählen.
3. Repository `https://github.com/MaxDeavy/ha-bvg-connections` (oder `MaxDeavy/ha-bvg-connections`) eintragen → *Hinzufügen*. Falls nötig GitHub verbinden und den Typ **Integration** bestätigen.
4. Das Repository öffnen → **Installieren**.
5. Home Assistant **neu starten**, falls Home Assistant danach fragt.

Danach wie in der README: Integration hinzufügen (falls nicht schon geöffnet), Verbindungen/Abfahrtstafeln anlegen, Karte zum Dashboard hinzufügen.

## Custom Repository in HACS (HA 2026.10)

Auf Home Assistant **2026.10** gibt es den Marketplace noch nicht; nutze HACS:

1. HACS öffnen → Drei-Punkte-Menü oben rechts → **Benutzerdefinierte Repositories**.
2. Repository `https://github.com/MaxDeavy/ha-bvg-connections` eintragen, Typ **Integration**, *Hinzufügen*.
3. In HACS nach **BVG Verbindungen** suchen → **Herunterladen**.
4. Home Assistant **neu starten** (*Einstellungen → System → Neu starten*).

Danach wie in der README: Integration hinzufügen, Verbindungen/Abfahrtstafeln anlegen, Karte zum Dashboard hinzufügen.

Ab **2026.11** ersetzt der Marketplace die eigenständige HACS-Integration. Custom Repositories und bereits heruntergeladene Inhalte werden übernommen; neue Custom Repos legst du dann über *Marketplace → Aus Link hinzufügen* an.

## Manuell (ohne Marketplace/HACS)

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

**Integration erscheint nicht in der Suche:** Liegt der Ordner unter `<config>/custom_components/bvg_connections/` (nicht `ha-bvg-connections`, nicht doppelt verschachtelt)? Danach neu starten.

## Entwickler: Klonen und Frontend-Build

Lokales Entwickeln (Tests, Karten-Rebuild, Dev-Instanz) steht in [CONTRIBUTING.md](../CONTRIBUTING.md). Kurz:

```bash
git clone https://github.com/MaxDeavy/ha-bvg-connections.git
# Python-Tests
pip install -r requirements_test.txt
ruff check . && ruff format --check . && pytest
# Karte neu bauen (schreibt nach custom_components/bvg_connections/frontend/)
cd frontend && npm ci && npm run build
```

Das gebaute Karten-Bundle wird mitcommitted. Nach Änderungen unter `frontend/src/` Bundle neu bauen und mitcommitten. Zum lokalen Testen: `./scripts/dev_ha.sh` (Details in CONTRIBUTING).

---

## English

For the normal install via the Marketplace catalog (HA 2026.11+) or the HACS default catalog (HA 2026.10), follow the [README](../README.md#1-integration-installieren). This page is for installing a version **before** it appears in the default catalog, installing **without Marketplace/HACS**, or working on the repo locally (see also [CONTRIBUTING.md](../CONTRIBUTING.md)).

Requires Home Assistant **2026.10** or newer. Display name: **BVG Verbindungen**.

### Custom repository in the Marketplace (HA 2026.11+)

1. *Settings → Marketplace*.
2. Upper right → **Add from link**.
3. Enter `https://github.com/MaxDeavy/ha-bvg-connections` (or `MaxDeavy/ha-bvg-connections`) → *Add*. Connect GitHub if asked and confirm type **Integration** if needed.
4. Open the repository → **Install**.
5. Restart Home Assistant if prompted.

Then continue with the README: add the integration (if setup did not open already), create connections/boards, add the card.

### Custom repository in HACS (HA 2026.10)

On Home Assistant **2026.10** there is no Marketplace yet; use HACS:

1. HACS → three-dot menu → **Custom repositories**.
2. Add `https://github.com/MaxDeavy/ha-bvg-connections`, type **Integration**.
3. Search **BVG Verbindungen** → **Download**.
4. Restart Home Assistant.

From **2026.11** the Marketplace replaces the standalone HACS integration. Custom repositories and existing downloads carry over; add new custom repos via *Marketplace → Add from link*.

### Manual (without Marketplace/HACS)

1. Download the [latest release](https://github.com/MaxDeavy/ha-bvg-connections/releases/latest) (*Source code (zip)*) and unpack it.
2. Copy `custom_components/bvg_connections` to `<config>/custom_components/`. The folder name must be exactly `bvg_connections` (not `ha-bvg-connections`, not nested twice).
3. Restart Home Assistant.

### Developers: clone and frontend rebuild

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full setup. Rebuild the card with `cd frontend && npm ci && npm run build` after changes under `frontend/src/` and commit the updated bundle. Local HA: `./scripts/dev_ha.sh`.
