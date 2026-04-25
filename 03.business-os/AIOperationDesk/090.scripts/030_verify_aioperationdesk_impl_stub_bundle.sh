#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/020.backend/lib/aiod_manifest.json" \
  "$APP_ROOT/020.backend/lib/aiod_constants.js" \
  "$APP_ROOT/020.backend/lib/aiod_response.js" \
  "$APP_ROOT/020.backend/edge/aiod_handlers_stub.js" \
  "$APP_ROOT/030.frontend/web/index.html" \
  "$APP_ROOT/030.frontend/web/assets/aiod.css" \
  "$APP_ROOT/030.frontend/web/assets/aiod.js" \
  "$APP_ROOT/030.frontend/web/console/main_console.html" \
  "$APP_ROOT/030.frontend/web/resident/erp_resident.html" \
  "$APP_ROOT/030.frontend/web/resident/builder_resident.html" \
  "$APP_ROOT/070.jobs/aiod_jobs_stub.js"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
