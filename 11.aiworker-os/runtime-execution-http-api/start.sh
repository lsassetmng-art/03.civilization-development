#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_ROOT="/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api"
RUNTIME_DIR="$APP_ROOT/runtime"
ENV_FILE="$APP_ROOT/.env.local"
PID_FILE="$RUNTIME_DIR/server.pid"
SERVER_LOG="$RUNTIME_DIR/server.log"
SERVER_FILE="$APP_ROOT/server.js"

mkdir -p "$RUNTIME_DIR"

if [ -f "$ENV_FILE" ]; then
  set -a
  . "$ENV_FILE"
  set +a
fi

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null || true
    sleep 1
  fi
fi

: > "$SERVER_LOG"

node "$SERVER_FILE" >> "$SERVER_LOG" 2>&1 &
SERVER_PID="$!"
echo "$SERVER_PID" > "$PID_FILE"

echo "SERVER_PID=$SERVER_PID"
echo "PID_FILE=$PID_FILE"
echo "SERVER_LOG=$SERVER_LOG"
echo "BASE_URL=${PERSONA_AIWORKEROS_BASE_URL:-http://127.0.0.1:${PERSONA_AIWORKEROS_PORT:-8787}}"
