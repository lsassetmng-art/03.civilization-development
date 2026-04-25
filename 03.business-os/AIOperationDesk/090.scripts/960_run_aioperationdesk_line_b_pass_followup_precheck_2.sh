#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/line_b_pass_followup_precheck_2_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

check_file() {
  FILE="$1"
  if [ -f "$FILE" ]; then
    printf 'OK\t%s\n' "$FILE" >> "$OUT_DIR/000_CHECKLIST.txt"
  else
    printf 'NG\t%s\n' "$FILE" >> "$OUT_DIR/000_CHECKLIST.txt"
  fi
}

: > "$OUT_DIR/000_CHECKLIST.txt"

check_file "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_LANE_2.md"
check_file "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_LANE_2_RUNBOOK.md"
check_file "$APP_ROOT/090.scripts/940_run_aioperationdesk_controlled_live_hardening_pass.sh"
check_file "$APP_ROOT/090.scripts/941_run_aioperationdesk_controlled_replay_live_probe.sh"
check_file "$APP_ROOT/090.scripts/950_review_aioperationdesk_followup_evidence.sh"
check_file "$APP_ROOT/090.scripts/955_generate_aioperationdesk_followup_handoff_bundle.sh"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_FOLLOWUP2_PRECHECK_REPORT
# ============================================================
# AI OPERATION DESK LINE B PASS FOLLOWUP LANE 2 PRECHECK
# ============================================================

status: generated
app: AIOPERATIONDESK
owner: Boss
prepared_by: Zero

scope:
- controlled live hardening pass
- controlled replay live probe
- followup evidence review
- followup handoff refresh
EOF_FOLLOWUP2_PRECHECK_REPORT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK LINE B PASS FOLLOWUP LANE 2 PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
