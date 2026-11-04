# Manuelle Installation / Custom Repository

Für die normale Installation über den HACS-Standardkatalog reicht die Anleitung in der [README](../README.md#1-integration-installieren). Diese Seite ist für:

- eine Version **bevor** die Integration im Standardkatalog landet bzw. ein Update, das dort noch nicht sichtbar ist
- Installation **ohne HACS** (Zip kopieren)
- Entwickler, die lokal am Repo arbeiten (siehe auch [CONTRIBUTING.md](../CONTRIBUTING.md))

Voraussetzung: Home Assistant **2026.10** oder neuer. Anzeigename in HACS: **BVG Verbindungen**.

## Custom Repository in HACS

1. HACS öffnen → Drei-Punkte-Menü oben rechts → **Benutzerdefinierte Repositories**.
2. Repository `https://github.com/MaxDeavy/ha-bvg-connections` eintragen, Typ **Integration**, *Hinzufügen*.
3. In HACS nach **BVG Verbindungen** suchen → **Herunterladen**.
4. Home Assistant **neu starten** (*Einstellungen → System → Neu starten*).

Danach wie in der README: Integration hinzufügen, Verbindungen/Abfahrtstafeln anlegen, Karte zum Dashboard hinzufügen.

## Manuell (ohne HACS)

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

For the normal install via the HACS default catalog, follow the [README](../README.md#1-integration-installieren). This page is for installing a version **before** it appears in the default catalog, installing **without HACS**, or working on the repo locally (see also [CONTRIBUTING.md](../CONTRIBUTING.md)).

Requires Home Assistant **2026.10** or newer. Display name in HACS: **BVG Verbindungen**.

### Custom repository in HACS

1. HACS → three-dot menu → **Custom repositories**.
2. Add `https://github.com/MaxDeavy/ha-bvg-connections`, type **Integration**.
3. Search **BVG Verbindungen** → **Download**.
4. Restart Home Assistant.

Then continue with the README: add the integration, create connections/boards, add the card.

### Manual (without HACS)

1. Download the [latest release](https://github.com/MaxDeavy/ha-bvg-connections/releases/latest) (*Source code (zip)*) and unpack it.
2. Copy `custom_components/bvg_connections` to `<config>/custom_components/`. The folder name must be exactly `bvg_connections` (not `ha-bvg-connections`, not nested twice).
3. Restart Home Assistant.

### Developers: clone and frontend rebuild

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full setup. Rebuild the card with `cd frontend && npm ci && npm run build` after changes under `frontend/src/` and commit the updated bundle. Local HA: `./scripts/dev_ha.sh`.
