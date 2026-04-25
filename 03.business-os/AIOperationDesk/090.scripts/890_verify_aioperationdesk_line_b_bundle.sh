#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LINE_B_CLOSEOUT.md" \
  "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LINE_B_RUNBOOK.md" \
  "$APP_ROOT/090.scripts/860_run_aioperationdesk_line_b_live_proof.sh" \
  "$APP_ROOT/090.scripts/870_review_aioperationdesk_line_b_results.sh" \
  "$APP_ROOT/090.scripts/880_generate_aioperationdesk_line_b_handoff_bundle.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
