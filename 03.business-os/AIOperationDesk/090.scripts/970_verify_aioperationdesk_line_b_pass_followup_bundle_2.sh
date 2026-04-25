#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_LANE_2.md" \
  "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_LANE_2_RUNBOOK.md" \
  "$APP_ROOT/090.scripts/940_run_aioperationdesk_controlled_live_hardening_pass.sh" \
  "$APP_ROOT/090.scripts/941_run_aioperationdesk_controlled_replay_live_probe.sh" \
  "$APP_ROOT/090.scripts/950_review_aioperationdesk_followup_evidence.sh" \
  "$APP_ROOT/090.scripts/955_generate_aioperationdesk_followup_handoff_bundle.sh" \
  "$APP_ROOT/090.scripts/960_run_aioperationdesk_line_b_pass_followup_precheck_2.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
