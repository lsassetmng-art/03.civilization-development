#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/FINAL_CLOSEOUT_TO_END.md" \
  "$APP_ROOT/000.docs/FINAL_CLOSEOUT_TO_END_RUNBOOK.md" \
  "$APP_ROOT/090.scripts/980_run_aioperationdesk_final_closeout_to_end.sh" \
  "$APP_ROOT/090.scripts/981_review_aioperationdesk_final_closeout_to_end.sh" \
  "$APP_ROOT/090.scripts/982_generate_aioperationdesk_final_terminal_handoff_bundle.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
