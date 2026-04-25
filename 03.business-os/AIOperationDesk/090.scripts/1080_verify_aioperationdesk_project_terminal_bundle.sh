#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/PROJECT_TERMINAL_EXECUTION_AND_DECISION.md" \
  "$APP_ROOT/000.docs/PROJECT_TERMINAL_EXECUTION_AND_DECISION_RUNBOOK.md" \
  "$APP_ROOT/090.scripts/1050_run_aioperationdesk_final_behavior_proof.sh" \
  "$APP_ROOT/090.scripts/1060_review_aioperationdesk_final_behavior_proof.sh" \
  "$APP_ROOT/090.scripts/1070_generate_aioperationdesk_project_terminal_bundle.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
