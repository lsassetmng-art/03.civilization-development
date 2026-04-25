#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/controlled_live_hardening_pass_$STAMP"
REPORT="$OUT_DIR/000_CONTROLLED_LIVE_HARDENING_PASS_REPORT.md"
RESULT="$OUT_DIR/000_CONTROLLED_LIVE_HARDENING_PASS_RESULT.txt"
MODE_CAPTURE_SRC="$APP_ROOT/900.meta/local_run/strict_hardened_live_mode.txt"
MODE_CAPTURE_DST="$OUT_DIR/000_stack_mode_capture.txt"

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

run_step verify_followup_bundle "$APP_ROOT/090.scripts/930_verify_aioperationdesk_line_b_pass_followup_bundle.sh"
run_step verify_lane4_bundle "$APP_ROOT/090.scripts/855_verify_aioperationdesk_production_implementation_bundle_4.sh"
run_step provider_live_readiness "$APP_ROOT/090.scripts/852_run_aioperationdesk_provider_live_readiness_probe.sh"
run_step strict_live_stack_start "$APP_ROOT/090.scripts/850_run_aioperationdesk_strict_hardened_live_stack.sh"
run_step wait_api_ready "$APP_ROOT/090.scripts/845_wait_aioperationdesk_api_ready.sh"

if [ -f "$MODE_CAPTURE_SRC" ]; then
  cp "$MODE_CAPTURE_SRC" "$MODE_CAPTURE_DST"
fi

run_step strict_live_proof "$APP_ROOT/090.scripts/853_test_aioperationdesk_strict_auth_provider_live_proof.sh"
run_step controlled_replay_live_probe "$APP_ROOT/090.scripts/941_run_aioperationdesk_controlled_replay_live_probe.sh"
run_step strict_live_stack_stop "$APP_ROOT/090.scripts/851_stop_aioperationdesk_strict_hardened_live_stack.sh"

STACK_MODE="UNKNOWN"
EXECUTION_MODE="UNKNOWN"
if [ -f "$MODE_CAPTURE_DST" ]; then
  STACK_MODE="$(sed -n 's/^STACK_MODE=//p' "$MODE_CAPTURE_DST" | tail -n 1)"
  EXECUTION_MODE="$(sed -n 's/^AIOD_LINE_HTTP_EXECUTION_MODE=//p' "$MODE_CAPTURE_DST" | tail -n 1)"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  FINAL_RESULT="PASS"
else
  FINAL_RESULT="FAIL"
fi

cat > "$REPORT" <<EOF_CONTROLLED_REPORT
# ============================================================
# AI OPERATION DESK CONTROLLED LIVE HARDENING PASS REPORT
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
- stack_mode: $STACK_MODE
- provider_execution_mode: $EXECUTION_MODE

scope:
- followup bundle verify
- lane 4 verify
- provider live readiness probe
- strict hardened stack start
- api readiness wait
- strict auth + provider proof
- controlled replay probe
- strict hardened stack stop
EOF_CONTROLLED_REPORT

cat > "$RESULT" <<EOF_CONTROLLED_RESULT
PASS_COUNT=$PASS_COUNT
FAIL_COUNT=$FAIL_COUNT
FINAL_RESULT=$FINAL_RESULT
STACK_MODE=$STACK_MODE
PROVIDER_EXECUTION_MODE=$EXECUTION_MODE
REPORT=$REPORT
OUT_DIR=$OUT_DIR
EOF_CONTROLLED_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK CONTROLLED HARDENING PASS DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "REPORT=$REPORT"
printf '%s\n' "RESULT=$RESULT"
printf '%s\n' '============================================================'
sed -n '1,160p' "$REPORT"
