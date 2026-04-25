#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_1.md" \
  "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_1_RUNBOOK.md" \
  "$APP_ROOT/020.backend/lib/aiod_file_evidence_writer.js" \
  "$APP_ROOT/080.notifications/line_provider_http_impl.js" \
  "$APP_ROOT/070.jobs/aiod_replay_executor.js" \
  "$APP_ROOT/090.scripts/270_run_aioperationdesk_edge_hardened_local.sh" \
  "$APP_ROOT/090.scripts/941_run_aioperationdesk_controlled_replay_live_probe.sh" \
  "$APP_ROOT/090.scripts/984_run_aioperationdesk_actual_hardening_edit_lane_1_precheck.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
