#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/one_command_final_$STAMP"
REPORT="$OUT_DIR/000_ONE_COMMAND_FINAL_REPORT.md"
RESULT="$OUT_DIR/000_ONE_COMMAND_FINAL_RESULT.txt"

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

run_step verify_one_command_bundle "$APP_ROOT/090.scripts/740_verify_aioperationdesk_one_command_bundle.sh"
run_step master_execution_bundle "$APP_ROOT/090.scripts/700_verify_aioperationdesk_master_execution_bundle.sh"
run_step master_full_execution "$APP_ROOT/090.scripts/670_run_aioperationdesk_master_full_execution.sh"
run_step master_evidence_collection "$APP_ROOT/090.scripts/680_collect_aioperationdesk_master_evidence_bundle.sh"
run_step master_handoff_bundle "$APP_ROOT/090.scripts/690_generate_aioperationdesk_master_handoff_bundle.sh"

if [ "$FAIL_COUNT" -eq 0 ]; then
  FINAL_RESULT="PASS"
else
  FINAL_RESULT="FAIL"
fi

cat > "$REPORT" <<EOF_ONE_COMMAND_REPORT
# ============================================================
# AI OPERATION DESK ONE COMMAND FINAL REPORT
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
- verify one-command bundle
- verify master execution bundle
- run master full execution
- collect master evidence
- generate master handoff bundle

conclusion:
This report captures the final one-command wrapper pass over the current
AI Operation Desk project scaffolding.
EOF_ONE_COMMAND_REPORT

cat > "$RESULT" <<EOF_ONE_COMMAND_RESULT
PASS_COUNT=$PASS_COUNT
FAIL_COUNT=$FAIL_COUNT
FINAL_RESULT=$FINAL_RESULT
REPORT=$REPORT
OUT_DIR=$OUT_DIR
EOF_ONE_COMMAND_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK ONE COMMAND FINAL DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "REPORT=$REPORT"
printf '%s\n' "RESULT=$RESULT"
printf '%s\n' '============================================================'
sed -n '1,120p' "$REPORT"
