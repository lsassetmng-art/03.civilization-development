#!/data/data/com.termux/files/usr/bin/bash
set +e
set +u

APP_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager"
INDEX_HTML="$APP_ROOT/index.html"
CURRENT_SERVER="$APP_ROOT/server/aicm-local-ui-api-server.mjs"

BACKUP_INDEX="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/switch_to_clean_production_20260430_112432/index.before_clean_switch.html"
BACKUP_SERVER="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/switch_to_clean_production_20260430_112432/aicm-local-ui-api-server.before_clean_switch.mjs"
ROLLBACK_LOG="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/switch_to_clean_production_20260430_112432/rollback_server.log"

cp "$BACKUP_INDEX" "$INDEX_HTML"
cp "$BACKUP_SERVER" "$CURRENT_SERVER"

if command -v pgrep >/dev/null 2>&1; then
  PIDS="$(pgrep -f "aicm-local-ui-api-server.mjs" 2>/dev/null)"
  if [ -n "$PIDS" ]; then
    echo "$PIDS" | while IFS= read -r pid; do
      [ -n "$pid" ] && kill -9 "$pid" 2>/dev/null
    done
    sleep 1
  fi
fi

cd "$APP_ROOT" || exit 1
nohup node "$CURRENT_SERVER" > "$ROLLBACK_LOG" 2>&1 &

echo "ROLLBACK_DONE"
echo "OPEN_URL=http://127.0.0.1:8794/?v=rollback_20260430_112432"
