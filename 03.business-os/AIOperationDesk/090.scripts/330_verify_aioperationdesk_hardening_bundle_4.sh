#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/HARDENED_POST_WRITE_FLOW.md" \
  "$APP_ROOT/020.backend/lib/aiod_runtime_audit_stub.js" \
  "$APP_ROOT/020.backend/lib/aiod_hardening_post_write.js" \
  "$APP_ROOT/020.backend/edge/routes/write_routes_hardened.js" \
  "$APP_ROOT/090.scripts/300_run_aioperationdesk_hardened_mock_stack.sh" \
  "$APP_ROOT/090.scripts/301_stop_aioperationdesk_hardened_mock_stack.sh" \
  "$APP_ROOT/090.scripts/320_test_aioperationdesk_hardened_post_write_flow.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
