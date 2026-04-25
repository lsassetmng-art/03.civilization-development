#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/production_proof_audit_$STAMP"
REPORT="$OUT_DIR/000_PRODUCTION_PROOF_AUDIT_REPORT.md"
RESULT="$OUT_DIR/000_PRODUCTION_PROOF_AUDIT_RESULT.txt"

mkdir -p "$OUT_DIR"

PASS_COUNT=0
FAIL_COUNT=0

run_step() {
  NAME="$1"
  shift
  LOG_FILE="$OUT_DIR/$NAME.log"

  if "$@" >"$LOG_FILE" 2>&1; then
    printf 'PASS\t%s\t%s\n' "$NAME" "$LOG_FILE" >> "$OUT_DIR/000_STEPS.tsv"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    printf 'FAIL\t%s\t%s\n' "$NAME" "$LOG_FILE" >> "$OUT_DIR/000_STEPS.tsv"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

: > "$OUT_DIR/000_STEPS.tsv"

run_step 010_verify_proof_bundle sh "$APP_ROOT/090.scripts/550_verify_aioperationdesk_production_proof_bundle_1.sh"
run_step 020_proof_precheck sh "$APP_ROOT/090.scripts/560_run_aioperationdesk_production_proof_precheck.sh"
run_step 030_provider_env_probe sh "$APP_ROOT/090.scripts/510_run_aioperationdesk_provider_env_probe.sh"
run_step 040_replay_guarded_probe sh "$APP_ROOT/090.scripts/530_run_aioperationdesk_replay_executor_guarded_probe.sh"
run_step 050_cleanup_guarded_probe sh "$APP_ROOT/090.scripts/540_run_aioperationdesk_cleanup_executor_guarded_probe.sh"

if [ "$FAIL_COUNT" -eq 0 ]; then
  FINAL_RESULT="PASS"
else
  FINAL_RESULT="FAIL"
fi

cat > "$REPORT" <<EOF_PROOF_AUDIT_REPORT
# ============================================================
# AI OPERATION DESK PRODUCTION PROOF AUDIT REPORT
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
- proof bundle verify
- proof precheck
- provider env probe
- replay guarded probe
- cleanup guarded probe

notes:
- this audit is proof-phase oriented
- this audit does not itself authorize release
EOF_PROOF_AUDIT_REPORT

cat > "$RESULT" <<EOF_PROOF_AUDIT_RESULT
PASS_COUNT=$PASS_COUNT
FAIL_COUNT=$FAIL_COUNT
FINAL_RESULT=$FINAL_RESULT
REPORT=$REPORT
OUT_DIR=$OUT_DIR
EOF_PROOF_AUDIT_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PRODUCTION PROOF AUDIT DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "REPORT=$REPORT"
printf '%s\n' "RESULT=$RESULT"
printf '%s\n' '============================================================'
sed -n '1,120p' "$REPORT"
