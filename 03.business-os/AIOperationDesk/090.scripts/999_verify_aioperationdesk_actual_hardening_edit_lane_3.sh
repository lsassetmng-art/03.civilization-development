#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_3.md" \
  "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_3_RUNBOOK.md" \
  "$APP_ROOT/020.backend/lib/aiod_request_context.js" \
  "$APP_ROOT/020.backend/lib/aiod_hardening_post_write.js" \
  "$APP_ROOT/090.scripts/996_run_aioperationdesk_runtime_evidence_digest.sh" \
  "$APP_ROOT/090.scripts/997_generate_aioperationdesk_actual_hardening_terminal_handoff.sh" \
  "$APP_ROOT/090.scripts/998_run_aioperationdesk_actual_hardening_edit_lane_3_precheck.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
