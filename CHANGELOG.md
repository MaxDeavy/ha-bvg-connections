# Changelog

Alle nennenswerten Änderungen an dieser Integration. Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionierung [Semantic Versioning](https://semver.org/lang/de/).

## [0.1.1] – 2026-11-04

### Neu
- Eigenes Icon und Logo („Abfahrtsuhr“) im Ordner `brand/` der Integration. Home Assistant zeigt sie in der Integrationsliste an, ohne Eintrag im Brands-Repository.
- Karte: Symbole in farbigen Kreisen wie bei den HA-Kachelkarten, eingefärbt nach Verkehrsmittel und Status (Fußweg, Umstieg, Verspätung, Ausfall, pünktlich).
- README: Schritt-für-Schritt-Anleitung für Installation und Einrichtung, inklusive der Stelle, an der Verbindungen und Abfahrtstafeln angelegt werden, sowie Fehlerbehebung.

### Geändert
- Die Gehzeit zur Haltestelle ist beim Anlegen einer Verbindung oder Tafel mit 5 min vorbelegt und bleibt pro Eintrag änderbar.
- Mindestversion ist jetzt Home Assistant 2026.10.

### Behoben
- Störungshinweise zeigten rohes HTML wie `<a href="…">[MEHR/MORE]</a>`. Links mit http(s)-Ziel erscheinen jetzt als echte Links („Mehr“/„More“), alle anderen Tags werden entfernt und HTML-Entitäten dekodiert.
- Die Karte zeigte gelegentlich „Konfigurationsfehler“ („Custom element doesn't exist“), weil sie sich registrierte, bevor das Frontend von Home Assistant fertig geladen war.

## [0.1.0] – 2026-11-04

Erste Version: Verbindungen mit Umstiegen und Abfahrtstafeln für den Berliner ÖPNV als Config Subentries, Sensoren und Binärsensoren pro Eintrag, Echtzeitdaten mit Verspätungen und Ausfällen, Request-Budget und Backoff sowie eine mitgelieferte Lovelace-Karte mit grafischem Editor.

---

### English summary

- **0.1.1:** own icon and logo via the integration's `brand/` folder; tile-style symbols in the card; walking time prefilled with 5 min; minimum Home Assistant version 2026.10; fixed an occasional “Custom element doesn't exist” error on dashboard load; disruption notices render BVG “[MEHR/MORE]” HTML as proper links instead of raw markup; step-by-step setup guide in the README.
- **0.1.0:** initial release.

[0.1.1]: https://github.com/MaxDeavy/ha-bvg-connections/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MaxDeavy/ha-bvg-connections/releases/tag/v0.1.0
