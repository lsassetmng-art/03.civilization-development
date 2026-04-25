#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/HARDENED_DB_POST_WRITE_FLOW.md" \
  "$APP_ROOT/020.backend/lib/aiod_post_write_persistence_psql.js" \
  "$APP_ROOT/020.backend/lib/aiod_hardening_post_write_db.js" \
  "$APP_ROOT/020.backend/lib/aiod_hardening_post_write.js" \
  "$APP_ROOT/090.scripts/302_run_aioperationdesk_hardened_db_stack.sh" \
  "$APP_ROOT/090.scripts/303_stop_aioperationdesk_hardened_db_stack.sh" \
  "$APP_ROOT/090.scripts/321_test_aioperationdesk_hardened_db_post_write_flow.sh" \
  "$APP_ROOT/090.scripts/322_query_aioperationdesk_hardened_follow_on_state.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
