#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/PRODUCTION_TRACK_ROADMAP.md" \
  "$APP_ROOT/000.docs/PRODUCTION_SECRET_ENV_POLICY.md" \
  "$APP_ROOT/000.docs/PRODUCTION_TRACK_RUNBOOK.md" \
  "$APP_ROOT/020.backend/lib/aiod_secret_contract.js" \
  "$APP_ROOT/020.backend/lib/aiod_header_auth_adapter.js" \
  "$APP_ROOT/080.notifications/line_provider_http_skeleton.js" \
  "$APP_ROOT/070.jobs/aiod_cleanup_executor_stub.js" \
  "$APP_ROOT/090.scripts/420_run_aioperationdesk_production_track_precheck.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
