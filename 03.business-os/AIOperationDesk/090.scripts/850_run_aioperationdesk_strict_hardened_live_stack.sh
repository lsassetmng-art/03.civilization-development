#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
RUN_DIR="$APP_ROOT/900.meta/local_run"
EDGE_PID_FILE="$RUN_DIR/edge_strict_hardened_live.pid"
WEB_PID_FILE="$RUN_DIR/web_strict_hardened_live.pid"
EDGE_LOG="$RUN_DIR/edge_strict_hardened_live.log"
WEB_LOG="$RUN_DIR/web_strict_hardened_live.log"
MODE_TXT="$RUN_DIR/strict_hardened_live_mode.txt"

mkdir -p "$RUN_DIR"

if ! command -v deno >/dev/null 2>&1; then
  printf '%s\n' 'deno is not installed or not in PATH.' >&2
  exit 1
fi

AIOD_PORT="${AIOD_PORT:-8787}"
AIOD_WEB_PORT="${AIOD_WEB_PORT:-8087}"
AIOD_DATA_MODE="${AIOD_DATA_MODE:-mock}"
AIOD_HARDENING_MODE="enforced"
AIOD_AUTH_MODE="${AIOD_AUTH_MODE:-header_trusted_strict}"
AIOD_PERMISSION_MODE="${AIOD_PERMISSION_MODE:-policy_check}"
AIOD_LINE_PROVIDER_MODE="line_http"
AIOD_WEB_ROOT="${AIOD_WEB_ROOT:-$APP_ROOT/030.frontend/web}"

HAS_ENDPOINT="false"
HAS_ACCESS_TOKEN="false"

if [ -n "${AIOD_LINE_PUSH_ENDPOINT:-}" ]; then
  HAS_ENDPOINT="true"
fi

if [ -n "${AIOD_LINE_CHANNEL_ACCESS_TOKEN:-}" ]; then
  HAS_ACCESS_TOKEN="true"
fi

AIOD_LINE_HTTP_EXECUTION_MODE="dry_run"
STACK_MODE="strict_dry_run"

if [ "$HAS_ENDPOINT" = "true" ] && [ "$HAS_ACCESS_TOKEN" = "true" ]; then
  AIOD_LINE_HTTP_EXECUTION_MODE="live"
  STACK_MODE="strict_live"
fi

export AIOD_PORT
export AIOD_WEB_PORT
export AIOD_DATA_MODE
export AIOD_HARDENING_MODE
export AIOD_AUTH_MODE
export AIOD_PERMISSION_MODE
export AIOD_LINE_PROVIDER_MODE
export AIOD_LINE_HTTP_EXECUTION_MODE
export AIOD_WEB_ROOT

nohup sh "$APP_ROOT/090.scripts/270_run_aioperationdesk_edge_hardened_local.sh" >"$EDGE_LOG" 2>&1 &
EDGE_PID=$!
printf '%s\n' "$EDGE_PID" > "$EDGE_PID_FILE"

nohup sh "$APP_ROOT/090.scripts/080_run_aioperationdesk_web_preview.sh" >"$WEB_LOG" 2>&1 &
WEB_PID=$!
printf '%s\n' "$WEB_PID" > "$WEB_PID_FILE"

cat > "$MODE_TXT" <<EOF_MODE
STACK_MODE=$STACK_MODE
AIOD_AUTH_MODE=$AIOD_AUTH_MODE
AIOD_LINE_PROVIDER_MODE=$AIOD_LINE_PROVIDER_MODE
AIOD_LINE_HTTP_EXECUTION_MODE=$AIOD_LINE_HTTP_EXECUTION_MODE
AIOD_LINE_PUSH_ENDPOINT_PRESENT=$HAS_ENDPOINT
AIOD_LINE_CHANNEL_ACCESS_TOKEN_PRESENT=$HAS_ACCESS_TOKEN
EDGE_PID=$EDGE_PID
WEB_PID=$WEB_PID
EDGE_LOG=$EDGE_LOG
WEB_LOG=$WEB_LOG
EOF_MODE

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK STRICT HARDENED STACK STARTED'
printf '%s\n' "STACK_MODE=$STACK_MODE"
printf '%s\n' "EDGE_PID=$EDGE_PID"
printf '%s\n' "WEB_PID=$WEB_PID"
printf '%s\n' "EDGE_LOG=$EDGE_LOG"
printf '%s\n' "WEB_LOG=$WEB_LOG"
printf '%s\n' "AIOD_AUTH_MODE=$AIOD_AUTH_MODE"
printf '%s\n' "AIOD_LINE_PROVIDER_MODE=$AIOD_LINE_PROVIDER_MODE"
printf '%s\n' "AIOD_LINE_HTTP_EXECUTION_MODE=$AIOD_LINE_HTTP_EXECUTION_MODE"
printf '%s\n' '============================================================'
