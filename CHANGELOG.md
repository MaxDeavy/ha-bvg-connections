# Changelog

Alle nennenswerten Änderungen an dieser Integration · All notable changes to this integration.

Format: [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionierung / versioning: [Semantic Versioning](https://semver.org/lang/de/). Neue Abschnitte erzeugt `scripts/release.py` aus den Commit-Nachrichten ([Conventional Commits](https://www.conventionalcommits.org/de/v1.0.0/)), siehe [CONTRIBUTING.md](CONTRIBUTING.md).

<!-- next-release -->

## [0.1.4](https://github.com/MaxDeavy/ha-bvg-connections/compare/v0.1.3...v0.1.4) – 2026-11-04

### Neu / Added

- **card:** Format journey duration as hours and minutes (`49 min`, `1 Stunde` / `1 hour`, `2 Std. 15 min` / `2 h 15 min`)

### Geändert / Changed

- **card:** Tighter journey columns and slightly larger countdown, arrival and meta type
- **card:** Leave hint as walk icon + `in X min` (or `Jetzt!` / `Now!`)

### Dokumentation / Docs

- Refresh README card screenshots for 0.1.3 layout (#13)
- Abfahrtstafel-Screenshots in der README (#14)

## [0.1.3](https://github.com/MaxDeavy/ha-bvg-connections/compare/v0.1.2...v0.1.3) – 2026-11-04

### Neu / Added

- **card:** Leave hints left, big arrival right, small departure in meta

### Behoben / Fixed

- **card:** Fixed leave column width and larger arrival time

### Dokumentation / Docs

- Lead install with HACS search (#11)

## [0.1.2](https://github.com/MaxDeavy/ha-bvg-connections/compare/v0.1.1...v0.1.2) – 2026-11-04

### Neu / Added

- **card:** Choose individual connections and boards per card

### Behoben / Fixed

- **card:** Show the visual editor form again

### Dokumentation / Docs

- Fix a sentence in the 0.1.1 changelog

## [0.1.1](https://github.com/MaxDeavy/ha-bvg-connections/compare/v0.1.0...v0.1.1) – 2026-11-04

### Neu / Added

- Own icon and logo (“Abfahrtsuhr”) in the integration's `brand/` folder; Home Assistant shows them without an entry in the brands repository.
- **card:** tile-style symbols (MDI icons in tinted circles), coloured by product and status (walk, transfer, delay, cancellation, on time).
- **docs:** step-by-step setup guide in the README (where to add connections and boards, walking time, card, troubleshooting), this changelog with a release script, and a contributing guide (`CONTRIBUTING.md`) for development, commit format and releases.

### Geändert / Changed

- Walking time to the stop is prefilled with 5 min when adding a connection or departure board, still editable per entry.
- Minimum Home Assistant version is now 2026.10.
- Manifest declares the `vehicles_transport.public_transport` category; HACS validation runs without ignored checks.

### Behoben / Fixed

- **card:** disruption notices showed raw HTML such as `<a href="…">[MEHR/MORE]</a>`. http(s) links are now real links labelled “Mehr”/“More”; all other tags are removed and HTML entities decoded, without using `innerHTML`.
- **card:** occasional “Configuration error” / “Custom element doesn't exist” when the card registered before the Home Assistant frontend had finished loading.

## [0.1.0](https://github.com/MaxDeavy/ha-bvg-connections/releases/tag/v0.1.0) – 2026-11-04

### Neu / Added

- Journeys with transfers between stops, addresses and places, configured as config subentries.
- Departure boards with product, line and direction filters.
- Per-entry walking time that hides journeys you can no longer catch and drives “Los in X min” hints.
- Realtime delays, cancellations, at-risk connections, platform changes, occupancy and disruption notices.
- Sensors and a problem binary sensor per connection and board.
- Request budget with token bucket, backoff, stale-data handling and a repair issue on longer outages.
- Bundled Lovelace card with BVG-coloured line badges, transfer chains, countdowns, urgency bars, expandable trip details and a visual editor.
