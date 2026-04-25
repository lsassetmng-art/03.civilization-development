#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/020.backend/lib/aiod_sql_catalog.js" \
  "$APP_ROOT/020.backend/lib/aiod_db_gateway_stub.js" \
  "$APP_ROOT/020.backend/edge/aiod_http_response.js" \
  "$APP_ROOT/020.backend/edge/index.ts" \
  "$APP_ROOT/020.backend/edge/README_RUNTIME.md" \
  "$APP_ROOT/030.frontend/web/assets/aiod_api_client.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_console_live.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_resident_live.js" \
  "$APP_ROOT/030.frontend/web/console/main_console.html" \
  "$APP_ROOT/030.frontend/web/resident/erp_resident.html" \
  "$APP_ROOT/030.frontend/web/resident/builder_resident.html" \
  "$APP_ROOT/090.scripts/050_run_aioperationdesk_edge_stub_local.sh" \
  "$APP_ROOT/090.scripts/060_test_aioperationdesk_edge_stub_routes.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
