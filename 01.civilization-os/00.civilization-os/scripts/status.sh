#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="/data/data/com.termux/files/home/03.civilization-development/01.civilization-os/00.civilization-os"
PID_FILE="$ROOT/run/civilization-os.pid"
LOG_FILE="$ROOT/logs/server.log"
PORT="${CIVILIZATION_OS_PORT:-18080}"
HOST="${CIVILIZATION_OS_HOST:-127.0.0.1}"

if [ -f "$PID_FILE" ]; then
  PID="$(cat "$PID_FILE" || true)"
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    echo "RUNNING: PID=$PID URL=http://$HOST:$PORT"
    echo "LOG: $LOG_FILE"
    exit 0
  fi
fi

echo "STOPPED"
