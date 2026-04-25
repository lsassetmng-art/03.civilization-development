#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/master_full_execution_$STAMP"
REPORT="$OUT_DIR/000_MASTER_FULL_EXECUTION_REPORT.md"
RESULT="$OUT_DIR/000_MASTER_FULL_EXECUTION_RESULT.txt"

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

run_step verify_master_bundle "$APP_ROOT/090.scripts/660_verify_aioperationdesk_master_bundle.sh"
run_step master_verify "$APP_ROOT/090.scripts/600_run_aioperationdesk_master_verify.sh"
run_step master_local_pass "$APP_ROOT/090.scripts/610_run_aioperationdesk_master_local_pass.sh"
run_step master_hardening_pass "$APP_ROOT/090.scripts/620_run_aioperationdesk_master_hardening_pass.sh"
run_step master_production_track_pass "$APP_ROOT/090.scripts/630_run_aioperationdesk_master_production_track_pass.sh"
run_step master_production_proof_pass "$APP_ROOT/090.scripts/640_run_aioperationdesk_master_production_proof_pass.sh"
run_step master_closeout "$APP_ROOT/090.scripts/650_run_aioperationdesk_master_closeout.sh"

if [ "$FAIL_COUNT" -eq 0 ]; then
  FINAL_RESULT="PASS"
else
  FINAL_RESULT="FAIL"
fi

cat > "$REPORT" <<EOF_MASTER_FULL_REPORT
# ============================================================
# AI OPERATION DESK MASTER FULL EXECUTION REPORT
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
- master bundle verify
- master verify
- local pass
- hardening pass
- production-track pass
- production-proof pass
- master closeout

conclusion:
This report captures the top-level execution pass over all currently generated
orchestration layers.
EOF_MASTER_FULL_REPORT

cat > "$RESULT" <<EOF_MASTER_FULL_RESULT
PASS_COUNT=$PASS_COUNT
FAIL_COUNT=$FAIL_COUNT
FINAL_RESULT=$FINAL_RESULT
REPORT=$REPORT
OUT_DIR=$OUT_DIR
EOF_MASTER_FULL_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK MASTER FULL EXECUTION DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "REPORT=$REPORT"
printf '%s\n' "RESULT=$RESULT"
printf '%s\n' '============================================================'
sed -n '1,120p' "$REPORT"
