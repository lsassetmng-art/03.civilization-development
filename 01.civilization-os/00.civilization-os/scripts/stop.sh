#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="/data/data/com.termux/files/home/03.civilization-development/01.civilization-os/00.civilization-os"
PID_FILE="$ROOT/run/civilization-os.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "NOT RUNNING: no pid file"
  exit 0
fi

PID="$(cat "$PID_FILE" || true)"

if [ -z "$PID" ]; then
  rm -f "$PID_FILE"
  echo "NOT RUNNING: empty pid file removed"
  exit 0
fi

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  rm -f "$PID_FILE"
  echo "STOPPED: PID=$PID"
else
  rm -f "$PID_FILE"
  echo "NOT RUNNING: stale pid file removed"
fi
