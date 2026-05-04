#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_ROOT="/data/data/com.termux/files/home/03.civilization-development/11.aiworker-os/runtime-execution-http-api"
PID_FILE="$APP_ROOT/runtime/server.pid"

if [ -f "$PID_FILE" ]; then
  SERVER_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    echo "STOPPED=$SERVER_PID"
  else
    echo "NO_RUNNING_SERVER"
  fi
else
  echo "PID_FILE_NOT_FOUND"
fi
