#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/PRODUCTION_PROOF_RUNBOOK.md" \
  "$APP_ROOT/000.docs/PRODUCTION_PROOF_POLICY.md" \
  "$APP_ROOT/00_AIOPERATIONDESK_PRODUCTION_PROOF_INTEGRATED.md" \
  "$APP_ROOT/090.scripts/510_run_aioperationdesk_provider_env_probe.sh" \
  "$APP_ROOT/090.scripts/520_run_aioperationdesk_header_auth_proof.sh" \
  "$APP_ROOT/090.scripts/530_run_aioperationdesk_replay_executor_guarded_probe.sh" \
  "$APP_ROOT/090.scripts/540_run_aioperationdesk_cleanup_executor_guarded_probe.sh" \
  "$APP_ROOT/090.scripts/560_run_aioperationdesk_production_proof_precheck.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
