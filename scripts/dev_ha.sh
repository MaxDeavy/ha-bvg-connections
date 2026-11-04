#!/usr/bin/env bash
# Start a local Home Assistant dev instance in .dev/config with this integration.
# Requires homeassistant and home-assistant-frontend in the active environment.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG="$ROOT/.dev/config"
mkdir -p "$CONFIG/custom_components"
ln -sfn "$ROOT/custom_components/bvg_connections" "$CONFIG/custom_components/bvg_connections"

if [ ! -f "$CONFIG/configuration.yaml" ]; then
  cat > "$CONFIG/configuration.yaml" <<'YAML'
homeassistant:
  name: BVG Dev
  latitude: 52.5208
  longitude: 13.4094
  elevation: 34
  unit_system: metric
  time_zone: Europe/Berlin
  country: DE
  language: de
  currency: EUR

frontend:
config:
history:
logbook:

logger:
  default: warning
  logs:
    custom_components.bvg_connections: debug
YAML
fi

exec hass -c "$CONFIG" "$@"
