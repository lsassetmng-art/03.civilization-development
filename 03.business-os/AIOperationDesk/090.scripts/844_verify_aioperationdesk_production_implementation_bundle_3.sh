#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_3.md" \
  "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_3_RUNBOOK.md" \
  "$APP_ROOT/080.notifications/line_provider_http_impl.js" \
  "$APP_ROOT/090.scripts/840_run_aioperationdesk_strict_hardened_mock_stack.sh" \
  "$APP_ROOT/090.scripts/841_stop_aioperationdesk_strict_hardened_mock_stack.sh" \
  "$APP_ROOT/090.scripts/842_test_aioperationdesk_strict_auth_provider_dry_run.sh" \
  "$APP_ROOT/090.scripts/843_run_aioperationdesk_production_implementation_precheck_3.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
