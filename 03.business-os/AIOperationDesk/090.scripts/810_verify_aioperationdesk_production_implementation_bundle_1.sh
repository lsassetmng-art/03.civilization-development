#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_1.md" \
  "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_1_RUNBOOK.md" \
  "$APP_ROOT/020.backend/lib/aiod_header_auth_strict.js" \
  "$APP_ROOT/080.notifications/line_provider_http_payload_builder.js" \
  "$APP_ROOT/080.notifications/line_provider_http_response_normalizer.js" \
  "$APP_ROOT/080.notifications/line_provider_http_impl.js" \
  "$APP_ROOT/070.jobs/aiod_replay_live_guard.js" \
  "$APP_ROOT/090.scripts/800_run_aioperationdesk_production_implementation_precheck.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
