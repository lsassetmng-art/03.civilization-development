#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/line_b_live_proof_$STAMP"
REPORT="$OUT_DIR/000_LINE_B_LIVE_PROOF_REPORT.md"
RESULT="$OUT_DIR/000_LINE_B_LIVE_PROOF_RESULT.txt"

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

run_step verify_lane4_bundle "$APP_ROOT/090.scripts/855_verify_aioperationdesk_production_implementation_bundle_4.sh"
run_step lane4_precheck "$APP_ROOT/090.scripts/854_run_aioperationdesk_production_implementation_precheck_4.sh"
run_step provider_live_readiness "$APP_ROOT/090.scripts/852_run_aioperationdesk_provider_live_readiness_probe.sh"
run_step strict_live_stack_start "$APP_ROOT/090.scripts/850_run_aioperationdesk_strict_hardened_live_stack.sh"
run_step strict_live_proof "$APP_ROOT/090.scripts/853_test_aioperationdesk_strict_auth_provider_live_proof.sh"
run_step strict_live_stack_stop "$APP_ROOT/090.scripts/851_stop_aioperationdesk_strict_hardened_live_stack.sh"

if [ "$FAIL_COUNT" -eq 0 ]; then
  FINAL_RESULT="PASS"
else
  FINAL_RESULT="FAIL"
fi

cat > "$REPORT" <<EOF_LINE_B_REPORT
# ============================================================
# AI OPERATION DESK LINE B LIVE PROOF REPORT
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
- lane 4 verify
- lane 4 precheck
- provider live readiness probe
- strict hardened live stack start
- strict auth + provider live proof
- strict hardened live stack stop

conclusion:
This report captures the practical Line B finish attempt for the current pass.
EOF_LINE_B_REPORT

cat > "$RESULT" <<EOF_LINE_B_RESULT
PASS_COUNT=$PASS_COUNT
FAIL_COUNT=$FAIL_COUNT
FINAL_RESULT=$FINAL_RESULT
REPORT=$REPORT
OUT_DIR=$OUT_DIR
EOF_LINE_B_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK LINE B LIVE PROOF DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "REPORT=$REPORT"
printf '%s\n' "RESULT=$RESULT"
printf '%s\n' '============================================================'
sed -n '1,120p' "$REPORT"
