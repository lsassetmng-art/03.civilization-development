#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/PROVIDER_DELIVERY_RESULT_FLOW.md" \
  "$APP_ROOT/020.backend/lib/aiod_notification_retry_policy.js" \
  "$APP_ROOT/020.backend/lib/aiod_provider_dispatch_journal_stub.js" \
  "$APP_ROOT/020.backend/lib/aiod_provider_result_backwrite_psql.js" \
  "$APP_ROOT/020.backend/lib/aiod_provider_result_follow_on.js" \
  "$APP_ROOT/020.backend/lib/aiod_hardening_post_write.js" \
  "$APP_ROOT/090.scripts/350_test_aioperationdesk_provider_result_follow_on.sh" \
  "$APP_ROOT/090.scripts/351_query_aioperationdesk_provider_follow_on_state.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
