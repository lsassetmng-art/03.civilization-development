#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/EXECUTION_DECISION_MATRIX.md" \
  "$APP_ROOT/00_AIOPERATIONDESK_MASTER_EXECUTION_CLOSEOUT_INTEGRATED.md" \
  "$APP_ROOT/000.docs/MASTER_EXECUTION_CLOSEOUT_RUNBOOK.md" \
  "$APP_ROOT/090.scripts/670_run_aioperationdesk_master_full_execution.sh" \
  "$APP_ROOT/090.scripts/680_collect_aioperationdesk_master_evidence_bundle.sh" \
  "$APP_ROOT/090.scripts/690_generate_aioperationdesk_master_handoff_bundle.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
