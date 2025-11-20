#!/usr/bin/env bash
# Helper script to start the WorldSnap dev server (if not running) and open the app URL
# Place this script in the project `scripts/` folder and make it executable:
# chmod +x scripts/start-on-login.sh

set -euo pipefail

# Resolve project root (one level up from scripts)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/.."
cd "$PROJECT_ROOT"

# Port the dev server listens on
PORT=3000
URL="http://localhost:${PORT}"

# If port is not listening, start dev server in background
if ! lsof -i :${PORT} >/dev/null 2>&1; then
  echo "Starting dev server... (logs -> /tmp/worldsnap-dev.log)"
  nohup npm run dev > /tmp/worldsnap-dev.log 2>&1 &
  # give the server a couple seconds to initialize
  sleep 2
else
  echo "Dev server already running on port ${PORT}"
fi

# Open the default browser (Chrome if available)
if open -Ra "Google Chrome" >/dev/null 2>&1; then
  open -a "Google Chrome" "$URL"
else
  # Fallback to default browser
  open "$URL"
fi

exit 0
