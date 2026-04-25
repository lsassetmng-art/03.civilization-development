#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/020.backend/lib/aiod_mock_store.js" \
  "$APP_ROOT/020.backend/edge/aiod_router_stub.js" \
  "$APP_ROOT/020.backend/edge/README.md" \
  "$APP_ROOT/030.frontend/web/assets/aiod_console.js" \
  "$APP_ROOT/030.frontend/web/assets/aiod_resident.js" \
  "$APP_ROOT/030.frontend/web/console/queue_board.html" \
  "$APP_ROOT/030.frontend/web/console/review_inbox.html" \
  "$APP_ROOT/030.frontend/web/console/approval_inbox.html" \
  "$APP_ROOT/030.frontend/web/console/failure_retry_center.html" \
  "$APP_ROOT/030.frontend/web/console/summary_center.html" \
  "$APP_ROOT/030.frontend/web/console/registry_manager.html" \
  "$APP_ROOT/030.frontend/web/console/notification_settings.html" \
  "$APP_ROOT/030.frontend/web/console/resident_surface_monitor.html" \
  "$APP_ROOT/030.frontend/web/resident/erp_quick_panel.html" \
  "$APP_ROOT/030.frontend/web/resident/builder_quick_panel.html"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
