#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
ENTRY="$APP_ROOT/020.backend/edge/index.ts"

if ! command -v deno >/dev/null 2>&1; then
  printf '%s\n' 'deno is not installed or not in PATH.' >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  printf '%s\n' 'psql is not installed or not in PATH.' >&2
  exit 1
fi

if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  printf '%s\n' 'PERSONA_DATABASE_URL is not set.' >&2
  exit 1
fi

AIOD_PORT="${AIOD_PORT:-8787}"
AIOD_DATA_MODE="db_psql"

export AIOD_PORT
export AIOD_DATA_MODE

deno run --allow-net --allow-env --allow-read --allow-run "$ENTRY"
