#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/final_closeout_to_end_$STAMP"
REPORT="$OUT_DIR/000_FINAL_CLOSEOUT_TO_END_REPORT.md"
RESULT="$OUT_DIR/000_FINAL_CLOSEOUT_TO_END_RESULT.txt"

mkdir -p "$OUT_DIR"

PASS_COUNT=0
FAIL_COUNT=0

run_step() {
  NAME="$1"
  SCRIPT_PATH="$2"
  LOG="$OUT_DIR/$NAME.log"

  if [ -f "$SCRIPT_PATH" ]; then
    if sh "$SCRIPT_PATH" >"$LOG" 2>&1; then
      printf 'PASS\t%s\t%s\n' "$NAME" "$LOG" >> "$OUT_DIR/000_STEPS.tsv"
      PASS_COUNT=$((PASS_COUNT + 1))
    else
      printf 'FAIL\t%s\t%s\n' "$NAME" "$LOG" >> "$OUT_DIR/000_STEPS.tsv"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  else
    printf 'SKIP\t%s\tmissing:%s\n' "$NAME" "$SCRIPT_PATH" >> "$OUT_DIR/000_STEPS.tsv"
  fi
}

: > "$OUT_DIR/000_STEPS.tsv"

run_step verify_followup_lane2 "$APP_ROOT/090.scripts/970_verify_aioperationdesk_line_b_pass_followup_bundle_2.sh"
run_step followup_lane2_precheck "$APP_ROOT/090.scripts/960_run_aioperationdesk_line_b_pass_followup_precheck_2.sh"
run_step controlled_live_hardening_pass "$APP_ROOT/090.scripts/940_run_aioperationdesk_controlled_live_hardening_pass.sh"
run_step followup_evidence_review "$APP_ROOT/090.scripts/950_review_aioperationdesk_followup_evidence.sh"
run_step followup_handoff_bundle "$APP_ROOT/090.scripts/955_generate_aioperationdesk_followup_handoff_bundle.sh"
run_step post_line_b_bundle "$APP_ROOT/090.scripts/897_generate_aioperationdesk_post_line_b_next_action_bundle.sh"

if [ "$FAIL_COUNT" -eq 0 ]; then
  FINAL_RESULT="PASS"
else
  FINAL_RESULT="FAIL"
fi

cat > "$REPORT" <<EOF_FINAL_END_REPORT
# ============================================================
# AI OPERATION DESK FINAL CLOSEOUT TO END REPORT
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

summary:
- pass_count: $PASS_COUNT
- fail_count: $FAIL_COUNT
- final_result: $FINAL_RESULT

scope:
- verify followup lane 2 bundle
- followup lane 2 precheck
- controlled live hardening pass
- followup evidence review
- followup handoff bundle
- post-line-b next action bundle

conclusion:
This report closes the current project pass to the practical end point.
EOF_FINAL_END_REPORT

cat > "$RESULT" <<EOF_FINAL_END_RESULT
PASS_COUNT=$PASS_COUNT
FAIL_COUNT=$FAIL_COUNT
FINAL_RESULT=$FINAL_RESULT
REPORT=$REPORT
OUT_DIR=$OUT_DIR
EOF_FINAL_END_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FINAL CLOSEOUT TO END DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "REPORT=$REPORT"
printf '%s\n' "RESULT=$RESULT"
printf '%s\n' '============================================================'
sed -n '1,120p' "$REPORT"
