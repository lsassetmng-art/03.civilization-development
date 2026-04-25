#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/RETENTION_CLEANUP_REPLAY_POLICY.md" \
  "$APP_ROOT/020.backend/lib/aiod_notification_replay_candidates.js" \
  "$APP_ROOT/020.backend/lib/aiod_retention_review_psql.js" \
  "$APP_ROOT/070.jobs/aiod_replay_jobs_stub.js" \
  "$APP_ROOT/090.scripts/370_query_aioperationdesk_retention_review_state.sh" \
  "$APP_ROOT/090.scripts/371_run_aioperationdesk_notification_replay_review.sh" \
  "$APP_ROOT/090.scripts/372_run_aioperationdesk_retention_precheck.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
