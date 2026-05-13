#!/bin/bash
# Genera src/config.js desde variables de entorno
# Uso: API_BASE_URL=http://localhost:3000 ./scripts/generate-config.sh

API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
INSPECTOR_MODE="${INSPECTOR_MODE:-false}"

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cat > "$SCRIPT_DIR/src/config.js" << EOF
const CONFIG = {
  API_BASE_URL: '$API_BASE_URL',
  INSPECTOR_MODE: $INSPECTOR_MODE
};
export default CONFIG;
EOF

echo "config.js generated: API_BASE_URL=$API_BASE_URL, INSPECTOR_MODE=$INSPECTOR_MODE"
