#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

latest_file() {
  PATTERN="$1"
  find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name "$PATTERN" | sort | tail -n 1 || true
}

MASTER_REPORT="$(latest_file '000_MASTER_CLOSEOUT_REPORT.md')"
MASTER_RESULT="$(latest_file '000_MASTER_CLOSEOUT_RESULT.txt')"
ONE_COMMAND_REPORT="$(latest_file '000_ONE_COMMAND_FINAL_REPORT.md')"
ONE_COMMAND_RESULT="$(latest_file '000_ONE_COMMAND_FINAL_RESULT.txt')"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK LATEST MASTER SUMMARY'
printf '%s\n' '============================================================'

if [ -n "$MASTER_REPORT" ]; then
  printf '%s\n' "--- MASTER CLOSEOUT REPORT: $MASTER_REPORT ---"
  sed -n '1,80p' "$MASTER_REPORT"
else
  printf '%s\n' 'MASTER CLOSEOUT REPORT: not found'
fi

if [ -n "$MASTER_RESULT" ]; then
  printf '%s\n' "--- MASTER CLOSEOUT RESULT: $MASTER_RESULT ---"
  sed -n '1,40p' "$MASTER_RESULT"
else
  printf '%s\n' 'MASTER CLOSEOUT RESULT: not found'
fi

if [ -n "$ONE_COMMAND_REPORT" ]; then
  printf '%s\n' "--- ONE COMMAND REPORT: $ONE_COMMAND_REPORT ---"
  sed -n '1,80p' "$ONE_COMMAND_REPORT"
else
  printf '%s\n' 'ONE COMMAND REPORT: not found'
fi

if [ -n "$ONE_COMMAND_RESULT" ]; then
  printf '%s\n' "--- ONE COMMAND RESULT: $ONE_COMMAND_RESULT ---"
  sed -n '1,40p' "$ONE_COMMAND_RESULT"
else
  printf '%s\n' 'ONE COMMAND RESULT: not found'
fi
