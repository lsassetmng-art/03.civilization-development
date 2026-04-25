#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
RUN_DIR="$APP_ROOT/900.meta/local_run"

stop_pid_file() {
  PID_FILE="$1"
  if [ ! -f "$PID_FILE" ]; then
    return 0
  fi

  PID_VALUE="$(cat "$PID_FILE" || true)"
  if [ -n "${PID_VALUE:-}" ] && kill -0 "$PID_VALUE" 2>/dev/null; then
    kill "$PID_VALUE" 2>/dev/null || true
  fi
  rm -f "$PID_FILE"
}

stop_pid_file "$RUN_DIR/edge_mock.pid"
stop_pid_file "$RUN_DIR/web_mock.pid"
stop_pid_file "$RUN_DIR/edge_db.pid"
stop_pid_file "$RUN_DIR/web_db.pid"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK LOCAL STACK STOP DONE'
printf '%s\n' "RUN_DIR=$RUN_DIR"
printf '%s\n' '============================================================'
