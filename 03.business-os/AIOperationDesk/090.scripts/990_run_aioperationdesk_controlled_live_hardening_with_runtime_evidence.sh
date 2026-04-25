#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/actual_hardening_edit_lane_2_run_$STAMP"
REPORT="$OUT_DIR/000_ACTUAL_HARDENING_EDIT_LANE_2_REPORT.md"
RESULT="$OUT_DIR/000_ACTUAL_HARDENING_EDIT_LANE_2_RESULT.txt"

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

AIOD_WRITE_RUNTIME_EVIDENCE="true"
export AIOD_WRITE_RUNTIME_EVIDENCE

run_step verify_lane4 "$APP_ROOT/090.scripts/855_verify_aioperationdesk_production_implementation_bundle_4.sh"
run_step verify_actual_hardening_lane1 "$APP_ROOT/090.scripts/985_verify_aioperationdesk_actual_hardening_edit_lane_1.sh"
run_step provider_live_readiness "$APP_ROOT/090.scripts/852_run_aioperationdesk_provider_live_readiness_probe.sh"
run_step strict_live_stack_start "$APP_ROOT/090.scripts/850_run_aioperationdesk_strict_hardened_live_stack.sh"
run_step strict_live_proof "$APP_ROOT/090.scripts/853_test_aioperationdesk_strict_auth_provider_live_proof.sh"
run_step controlled_replay_live_probe "$APP_ROOT/090.scripts/941_run_aioperationdesk_controlled_replay_live_probe.sh"
run_step strict_live_stack_stop "$APP_ROOT/090.scripts/851_stop_aioperationdesk_strict_hardened_live_stack.sh"

RUNTIME_EVIDENCE_DIR="$APP_ROOT/900.meta/runtime_evidence"
RUNTIME_EVIDENCE_COUNT="0"
if [ -d "$RUNTIME_EVIDENCE_DIR" ]; then
  RUNTIME_EVIDENCE_COUNT="$(find "$RUNTIME_EVIDENCE_DIR" -maxdepth 1 -type f -name '*.json' | wc -l | tr -d ' ')"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  FINAL_RESULT="PASS"
else
  FINAL_RESULT="FAIL"
fi

cat > "$REPORT" <<EOF_AHEL2_REPORT
# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 2 REPORT
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
- runtime_evidence_dir: $RUNTIME_EVIDENCE_DIR
- runtime_evidence_count: $RUNTIME_EVIDENCE_COUNT

scope:
- provider live readiness
- strict hardened live stack
- strict auth + provider live proof
- controlled replay live probe
- runtime evidence generation
EOF_AHEL2_REPORT

cat > "$RESULT" <<EOF_AHEL2_RESULT
PASS_COUNT=$PASS_COUNT
FAIL_COUNT=$FAIL_COUNT
FINAL_RESULT=$FINAL_RESULT
RUNTIME_EVIDENCE_DIR=$RUNTIME_EVIDENCE_DIR
RUNTIME_EVIDENCE_COUNT=$RUNTIME_EVIDENCE_COUNT
REPORT=$REPORT
OUT_DIR=$OUT_DIR
EOF_AHEL2_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK ACTUAL HARDENING EDIT LANE 2 DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "REPORT=$REPORT"
printf '%s\n' "RESULT=$RESULT"
printf '%s\n' '============================================================'
sed -n '1,140p' "$REPORT"
