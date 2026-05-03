#!/data/data/com.termux/files/usr/bin/bash
set +e
set +u

# ============================================================
# DRAFT ONLY: AICompanyManager rollback from clean production
# ============================================================
# Replace BACKUP_DIR with the actual SWITCH_RUN_DIR printed by switch phase.
# ============================================================

APP_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager"
BACKUP_DIR="<SWITCH_RUN_DIR>"

INDEX_HTML="$APP_ROOT/index.html"
CURRENT_SERVER="$APP_ROOT/server/aicm-local-ui-api-server.mjs"

cp "$BACKUP_DIR/index.before_clean_switch.html" "$INDEX_HTML"
cp "$BACKUP_DIR/aicm-local-ui-api-server.before_clean_switch.mjs" "$CURRENT_SERVER"

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
nohup node "$CURRENT_SERVER" > "$BACKUP_DIR/rollback_server.log" 2>&1 &

echo "ROLLBACK_DONE"
echo "OPEN_URL=http://127.0.0.1:8794/?v=rollback"
