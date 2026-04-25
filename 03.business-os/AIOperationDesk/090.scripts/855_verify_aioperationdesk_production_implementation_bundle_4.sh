#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_4.md" \
  "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_4_RUNBOOK.md" \
  "$APP_ROOT/000.docs/PRODUCTION_LIVE_PROOF_POLICY.md" \
  "$APP_ROOT/090.scripts/850_run_aioperationdesk_strict_hardened_live_stack.sh" \
  "$APP_ROOT/090.scripts/851_stop_aioperationdesk_strict_hardened_live_stack.sh" \
  "$APP_ROOT/090.scripts/852_run_aioperationdesk_provider_live_readiness_probe.sh" \
  "$APP_ROOT/090.scripts/853_test_aioperationdesk_strict_auth_provider_live_proof.sh" \
  "$APP_ROOT/090.scripts/854_run_aioperationdesk_production_implementation_precheck_4.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
