#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
ENTRY="$APP_ROOT/030.frontend/web/dev_server.ts"

if ! command -v deno >/dev/null 2>&1; then
  printf '%s\n' 'deno is not installed or not in PATH.' >&2
  exit 1
fi

AIOD_WEB_PORT="${AIOD_WEB_PORT:-8087}"
AIOD_WEB_ROOT="${AIOD_WEB_ROOT:-$APP_ROOT/030.frontend/web}"

export AIOD_WEB_PORT
export AIOD_WEB_ROOT

cd "$APP_ROOT"
deno run --allow-net --allow-env --allow-read "$ENTRY"
