#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/PROVIDER_HTTP_EXECUTION_POLICY.md" \
  "$APP_ROOT/000.docs/REPLAY_EXECUTOR_EXACT.md" \
  "$APP_ROOT/020.backend/lib/aiod_safe_log.js" \
  "$APP_ROOT/080.notifications/line_provider_http_adapter.js" \
  "$APP_ROOT/080.notifications/line_provider_contract.js" \
  "$APP_ROOT/070.jobs/aiod_replay_executor.js" \
  "$APP_ROOT/090.scripts/440_run_aioperationdesk_provider_http_precheck.sh" \
  "$APP_ROOT/090.scripts/450_run_aioperationdesk_replay_executor_dry_run.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
