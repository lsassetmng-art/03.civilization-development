#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_2.md" \
  "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_2_RUNBOOK.md" \
  "$APP_ROOT/090.scripts/990_run_aioperationdesk_controlled_live_hardening_with_runtime_evidence.sh" \
  "$APP_ROOT/090.scripts/991_review_aioperationdesk_runtime_evidence.sh" \
  "$APP_ROOT/090.scripts/992_generate_aioperationdesk_runtime_evidence_handoff_bundle.sh" \
  "$APP_ROOT/090.scripts/994_run_aioperationdesk_actual_hardening_edit_lane_2_precheck.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
