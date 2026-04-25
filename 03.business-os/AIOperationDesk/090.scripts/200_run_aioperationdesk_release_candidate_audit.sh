#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/release_candidate_audit_$STAMP"
REPORT="$OUT_DIR/000_RELEASE_CANDIDATE_AUDIT_REPORT.md"
RESULT="$OUT_DIR/000_RELEASE_CANDIDATE_AUDIT_RESULT.txt"

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

run_step 010_design_verify sh "$APP_ROOT/090.scripts/020_run_aioperationdesk_design_verification_from_dev.sh"
run_step 020_impl_verify sh "$APP_ROOT/090.scripts/140_verify_aioperationdesk_impl_all.sh"
run_step 030_mock_walkthrough sh "$APP_ROOT/090.scripts/150_run_aioperationdesk_full_local_mock_walkthrough.sh"

if [ -n "${PERSONA_DATABASE_URL:-}" ] && command -v psql >/dev/null 2>&1 && command -v deno >/dev/null 2>&1; then
  run_step 040_db_bootstrap sh "$APP_ROOT/090.scripts/010_run_aioperationdesk_db_bootstrap.sh"
  run_step 050_db_walkthrough sh "$APP_ROOT/090.scripts/160_run_aioperationdesk_full_local_db_walkthrough.sh"
else
  printf 'SKIP\t040_db_bootstrap\tmissing env or tools\n' >> "$OUT_DIR/000_STEPS.tsv"
  printf 'SKIP\t050_db_walkthrough\tmissing env or tools\n' >> "$OUT_DIR/000_STEPS.tsv"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  FINAL_RESULT="PASS"
else
  FINAL_RESULT="FAIL"
fi

cat > "$REPORT" <<EOF
# ============================================================
# AI OPERATION DESK RELEASE CANDIDATE AUDIT REPORT
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
- design verification
- implementation verification
- mock walkthrough
- optional db bootstrap / db walkthrough when environment is available

notes:
- this audit is local-run oriented
- production readiness is not asserted by this report alone
EOF

cat > "$RESULT" <<EOF
PASS_COUNT=$PASS_COUNT
FAIL_COUNT=$FAIL_COUNT
FINAL_RESULT=$FINAL_RESULT
REPORT=$REPORT
OUT_DIR=$OUT_DIR
EOF

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK RELEASE CANDIDATE AUDIT DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "REPORT=$REPORT"
printf '%s\n' "RESULT=$RESULT"
printf '%s\n' '============================================================'
sed -n '1,120p' "$REPORT"
