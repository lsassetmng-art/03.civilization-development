#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/line_b_actual_execute_$STAMP"
REPORT="$OUT_DIR/000_LINE_B_ACTUAL_EXECUTE_REPORT.md"
RESULT="$OUT_DIR/000_LINE_B_ACTUAL_EXECUTE_RESULT.txt"

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

run_step verify_line_b_bundle "$APP_ROOT/090.scripts/890_verify_aioperationdesk_line_b_bundle.sh"
run_step run_line_b_live_proof "$APP_ROOT/090.scripts/860_run_aioperationdesk_line_b_live_proof.sh"
run_step review_line_b_results "$APP_ROOT/090.scripts/870_review_aioperationdesk_line_b_results.sh"
run_step generate_line_b_handoff "$APP_ROOT/090.scripts/880_generate_aioperationdesk_line_b_handoff_bundle.sh"

if [ "$FAIL_COUNT" -eq 0 ]; then
  FINAL_RESULT="PASS"
else
  FINAL_RESULT="FAIL"
fi

cat > "$REPORT" <<EOF_LINE_B_ACTUAL_REPORT
# ============================================================
# AI OPERATION DESK LINE B ACTUAL EXECUTE REPORT
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
- verify line B bundle
- run line B live proof
- review line B results
- generate line B handoff bundle
EOF_LINE_B_ACTUAL_REPORT

cat > "$RESULT" <<EOF_LINE_B_ACTUAL_RESULT
PASS_COUNT=$PASS_COUNT
FAIL_COUNT=$FAIL_COUNT
FINAL_RESULT=$FINAL_RESULT
REPORT=$REPORT
OUT_DIR=$OUT_DIR
EOF_LINE_B_ACTUAL_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK LINE B ACTUAL EXECUTE DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "REPORT=$REPORT"
printf '%s\n' "RESULT=$RESULT"
printf '%s\n' '============================================================'
sed -n '1,120p' "$REPORT"
