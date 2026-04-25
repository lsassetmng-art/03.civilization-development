#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/ONE_COMMAND_FINAL_RUNBOOK.md" \
  "$APP_ROOT/00_AIOPERATIONDESK_ONE_COMMAND_CLOSEOUT_INTEGRATED.md" \
  "$APP_ROOT/090.scripts/710_run_aioperationdesk_one_command_final.sh" \
  "$APP_ROOT/090.scripts/720_show_aioperationdesk_latest_master_summary.sh" \
  "$APP_ROOT/090.scripts/730_generate_aioperationdesk_ultimate_handoff_bundle.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
