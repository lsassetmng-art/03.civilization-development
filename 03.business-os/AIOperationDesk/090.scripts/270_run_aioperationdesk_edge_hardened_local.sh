#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
ENTRY="$APP_ROOT/020.backend/edge/index_hardened.ts"

if ! command -v deno >/dev/null 2>&1; then
  printf '%s\n' 'deno is not installed or not in PATH.' >&2
  exit 1
fi

AIOD_PORT="${AIOD_PORT:-8787}"
AIOD_DATA_MODE="${AIOD_DATA_MODE:-mock}"
AIOD_HARDENING_MODE="${AIOD_HARDENING_MODE:-enforced}"
AIOD_AUTH_MODE="${AIOD_AUTH_MODE:-header_trusted}"
AIOD_PERMISSION_MODE="${AIOD_PERMISSION_MODE:-policy_check}"

export AIOD_PORT
export AIOD_DATA_MODE
export AIOD_HARDENING_MODE
export AIOD_AUTH_MODE
export AIOD_PERMISSION_MODE

if [ "$AIOD_DATA_MODE" = "db_psql" ]; then
  if ! command -v psql >/dev/null 2>&1; then
    printf '%s\n' 'psql is not installed or not in PATH.' >&2
    exit 1
  fi
  if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
    printf '%s\n' 'PERSONA_DATABASE_URL is not set.' >&2
    exit 1
  fi
  deno run --allow-net --allow-env --allow-read --allow-run --allow-write "$ENTRY"
else
  deno run --allow-net --allow-env --allow-read --allow-write "$ENTRY"
fi
