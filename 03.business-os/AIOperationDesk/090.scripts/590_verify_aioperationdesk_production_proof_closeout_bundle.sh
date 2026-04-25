#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/00_AIOPERATIONDESK_PRODUCTION_PROOF_CLOSEOUT_INTEGRATED.md" \
  "$APP_ROOT/000.docs/PRODUCTION_PROOF_CLOSEOUT_RUNBOOK.md" \
  "$APP_ROOT/000.docs/PRODUCTION_PROOF_HANDOFF_CHECKLIST.md" \
  "$APP_ROOT/090.scripts/570_run_aioperationdesk_production_proof_audit.sh" \
  "$APP_ROOT/090.scripts/575_collect_aioperationdesk_production_proof_artifacts.sh" \
  "$APP_ROOT/090.scripts/580_generate_aioperationdesk_production_proof_handoff_bundle.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
