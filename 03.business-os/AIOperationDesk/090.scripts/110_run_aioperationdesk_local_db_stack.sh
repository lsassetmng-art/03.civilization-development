#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
RUN_DIR="$APP_ROOT/900.meta/local_run"
EDGE_PID_FILE="$RUN_DIR/edge_db.pid"
WEB_PID_FILE="$RUN_DIR/web_db.pid"
EDGE_LOG="$RUN_DIR/edge_db.log"
WEB_LOG="$RUN_DIR/web_db.log"

mkdir -p "$RUN_DIR"

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
AIOD_WEB_PORT="${AIOD_WEB_PORT:-8087}"
AIOD_DATA_MODE="db_psql"
AIOD_WEB_ROOT="${AIOD_WEB_ROOT:-$APP_ROOT/030.frontend/web}"

export AIOD_PORT
export AIOD_WEB_PORT
export AIOD_DATA_MODE
export AIOD_WEB_ROOT

if [ -f "$EDGE_PID_FILE" ]; then
  OLD_PID="$(cat "$EDGE_PID_FILE" || true)"
  if [ -n "${OLD_PID:-}" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    printf '%s\n' "edge db already running: pid=$OLD_PID"
    exit 1
  fi
fi

if [ -f "$WEB_PID_FILE" ]; then
  OLD_PID="$(cat "$WEB_PID_FILE" || true)"
  if [ -n "${OLD_PID:-}" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    printf '%s\n' "web db already running: pid=$OLD_PID"
    exit 1
  fi
fi

nohup sh "$APP_ROOT/090.scripts/055_run_aioperationdesk_edge_db_mode.sh" >"$EDGE_LOG" 2>&1 &
EDGE_PID=$!
printf '%s\n' "$EDGE_PID" > "$EDGE_PID_FILE"

nohup sh "$APP_ROOT/090.scripts/080_run_aioperationdesk_web_preview.sh" >"$WEB_LOG" 2>&1 &
WEB_PID=$!
printf '%s\n' "$WEB_PID" > "$WEB_PID_FILE"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK LOCAL DB STACK STARTED'
printf '%s\n' "EDGE_PID=$EDGE_PID"
printf '%s\n' "WEB_PID=$WEB_PID"
printf '%s\n' "EDGE_LOG=$EDGE_LOG"
printf '%s\n' "WEB_LOG=$WEB_LOG"
printf '%s\n' "EDGE_URL=http://127.0.0.1:$AIOD_PORT/api/ai-operation-desk/health"
printf '%s\n' "WEB_URL=http://127.0.0.1:$AIOD_WEB_PORT/"
printf '%s\n' '============================================================'
