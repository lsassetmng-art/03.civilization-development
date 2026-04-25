#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/final_behavior_proof_$STAMP"
REPORT="$OUT_DIR/000_FINAL_BEHAVIOR_PROOF_REPORT.md"
RESULT="$OUT_DIR/000_FINAL_BEHAVIOR_PROOF_RESULT.txt"

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
AIOD_WRITE_DB_EVIDENCE="${AIOD_WRITE_DB_EVIDENCE:-false}"
AIOD_AUTH_MODE="header_trusted_keyed"

export AIOD_WRITE_RUNTIME_EVIDENCE
export AIOD_WRITE_DB_EVIDENCE
export AIOD_AUTH_MODE

run_step verify_final_impl "$APP_ROOT/090.scripts/1010_verify_aioperationdesk_final_implementation_tightening.sh"
run_step final_impl_precheck "$APP_ROOT/090.scripts/1000_run_aioperationdesk_final_implementation_tightening_precheck.sh"
run_step keyed_auth_live_proof "$APP_ROOT/090.scripts/1020_test_aioperationdesk_keyed_auth_live_proof.sh"
run_step controlled_live_with_runtime_evidence "$APP_ROOT/090.scripts/990_run_aioperationdesk_controlled_live_hardening_with_runtime_evidence.sh"
run_step runtime_evidence_review "$APP_ROOT/090.scripts/991_review_aioperationdesk_runtime_evidence.sh"
run_step final_impl_digest "$APP_ROOT/090.scripts/1030_run_aioperationdesk_final_implementation_digest.sh"
run_step final_impl_handoff "$APP_ROOT/090.scripts/1040_generate_aioperationdesk_final_implementation_handoff.sh"

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

cat > "$REPORT" <<EOF_TERM_REPORT
# ============================================================
# AI OPERATION DESK FINAL BEHAVIOR PROOF REPORT
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
- final implementation verify
- keyed auth live proof
- controlled live hardening with runtime evidence
- runtime evidence review
- final implementation digest
- final implementation handoff
EOF_TERM_REPORT

cat > "$RESULT" <<EOF_TERM_RESULT
PASS_COUNT=$PASS_COUNT
FAIL_COUNT=$FAIL_COUNT
FINAL_RESULT=$FINAL_RESULT
RUNTIME_EVIDENCE_DIR=$RUNTIME_EVIDENCE_DIR
RUNTIME_EVIDENCE_COUNT=$RUNTIME_EVIDENCE_COUNT
REPORT=$REPORT
OUT_DIR=$OUT_DIR
EOF_TERM_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FINAL BEHAVIOR PROOF DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "REPORT=$REPORT"
printf '%s\n' "RESULT=$RESULT"
printf '%s\n' '============================================================'
sed -n '1,160p' "$REPORT"
