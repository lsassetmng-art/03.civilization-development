#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/020.backend/edge/routes/health_route.js" \
  "$APP_ROOT/020.backend/edge/routes/read_routes.js" \
  "$APP_ROOT/020.backend/edge/routes/write_routes.js" \
  "$APP_ROOT/020.backend/edge/routes/route_dispatch.js" \
  "$APP_ROOT/020.backend/edge/index.ts" \
  "$APP_ROOT/020.backend/edge/README_RUNTIME.md" \
  "$APP_ROOT/020.backend/lib/aiod_sql_catalog.js" \
  "$APP_ROOT/020.backend/lib/aiod_db_gateway_stub.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_render.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_api_client.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_console_live.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_resident_live.js" \
  "$APP_ROOT/030.frontend/web/console/dashboard_live.js" \
  "$APP_ROOT/030.frontend/web/console/queue_board_live.js" \
  "$APP_ROOT/030.frontend/web/console/review_inbox_live.js" \
  "$APP_ROOT/030.frontend/web/console/approval_inbox_live.js" \
  "$APP_ROOT/030.frontend/web/console/failure_retry_center_live.js" \
  "$APP_ROOT/030.frontend/web/console/summary_center_live.js" \
  "$APP_ROOT/030.frontend/web/resident/erp_resident_live.js" \
  "$APP_ROOT/030.frontend/web/resident/builder_resident_live.js" \
  "$APP_ROOT/030.frontend/web/dev_server.ts" \
  "$APP_ROOT/090.scripts/080_run_aioperationdesk_web_preview.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
