#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/020.backend/lib/aiod_db_gateway_psql.js" \
  "$APP_ROOT/020.backend/lib/aiod_db_gateway.js" \
  "$APP_ROOT/020.backend/edge/routes/health_route.js" \
  "$APP_ROOT/020.backend/edge/routes/read_routes.js" \
  "$APP_ROOT/020.backend/edge/README_RUNTIME.md" \
  "$APP_ROOT/090.scripts/055_run_aioperationdesk_edge_db_mode.sh" \
  "$APP_ROOT/090.scripts/065_test_aioperationdesk_edge_db_read_routes.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
