#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/020.backend/lib/aiod_request_gateway_psql.js" \
  "$APP_ROOT/020.backend/lib/aiod_request_gateway.js" \
  "$APP_ROOT/020.backend/edge/routes/write_routes.js" \
  "$APP_ROOT/090.scripts/077_test_aioperationdesk_edge_db_write_routes_remaining.sh" \
  "$APP_ROOT/090.scripts/078_query_aioperationdesk_db_recent_request_state.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
