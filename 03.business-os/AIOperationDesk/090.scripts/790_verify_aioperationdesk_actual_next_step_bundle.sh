#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/ACTUAL_IMPLEMENTATION_START_POLICY.md" \
  "$APP_ROOT/00_AIOPERATIONDESK_ACTUAL_IMPLEMENTATION_START_INTEGRATED.md" \
  "$APP_ROOT/090.scripts/780_run_aioperationdesk_actual_next_step.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
