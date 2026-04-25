#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_IMPLEMENTATION.md" \
  "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_RUNBOOK.md" \
  "$APP_ROOT/020.backend/lib/aiod_auth_mode_policy.js" \
  "$APP_ROOT/080.notifications/line_provider_live_evidence.js" \
  "$APP_ROOT/070.jobs/aiod_replay_live_evidence.js" \
  "$APP_ROOT/080.notifications/line_provider_http_impl.js" \
  "$APP_ROOT/070.jobs/aiod_replay_executor.js" \
  "$APP_ROOT/090.scripts/920_run_aioperationdesk_line_b_pass_followup_precheck.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
