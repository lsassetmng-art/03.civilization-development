#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_2.md" \
  "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_2_RUNBOOK.md" \
  "$APP_ROOT/020.backend/lib/aiod_request_context.js" \
  "$APP_ROOT/020.backend/edge/routes/write_routes_hardened.js" \
  "$APP_ROOT/080.notifications/line_provider_contract.js" \
  "$APP_ROOT/070.jobs/aiod_replay_executor.js" \
  "$APP_ROOT/090.scripts/820_run_aioperationdesk_production_implementation_precheck_2.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
