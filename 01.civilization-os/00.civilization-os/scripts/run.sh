#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="/data/data/com.termux/files/home/03.civilization-development/01.civilization-os/00.civilization-os"
PID_FILE="$ROOT/run/civilization-os.pid"
LOG_FILE="$ROOT/logs/server.log"
APP_FILE="$ROOT/app/server.py"
PORT="${CIVILIZATION_OS_PORT:-18080}"
HOST="${CIVILIZATION_OS_HOST:-127.0.0.1}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is not installed in Termux."
  echo "Install with: pkg install python"
  exit 1
fi

if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" || true)"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    echo "ALREADY RUNNING: PID=$OLD_PID URL=http://$HOST:$PORT"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

nohup python3 "$APP_FILE" > "$LOG_FILE" 2>&1 &
PID="$!"
echo "$PID" > "$PID_FILE"

sleep 1

if kill -0 "$PID" 2>/dev/null; then
  echo "RUNNING: PID=$PID"
  echo "URL: http://$HOST:$PORT"
  echo "LOG: $LOG_FILE"
else
  echo "ERROR: failed to start server"
  exit 1
fi
