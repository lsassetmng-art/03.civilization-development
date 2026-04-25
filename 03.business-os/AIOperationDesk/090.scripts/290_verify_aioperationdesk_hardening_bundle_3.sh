#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/020.backend/lib/aiod_request_context.js" \
  "$APP_ROOT/020.backend/lib/aiod_hardening_policy.js" \
  "$APP_ROOT/020.backend/edge/routes/write_routes_hardened.js" \
  "$APP_ROOT/020.backend/edge/routes/route_dispatch_hardened.js" \
  "$APP_ROOT/020.backend/edge/index_hardened.ts" \
  "$APP_ROOT/000.docs/HARDENED_RUNTIME_ENTRY.md" \
  "$APP_ROOT/090.scripts/270_run_aioperationdesk_edge_hardened_local.sh" \
  "$APP_ROOT/090.scripts/280_test_aioperationdesk_hardened_write_guard.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
