#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/evidence_review_$STAMP"
SUMMARY_MD="$OUT_DIR/000_EVIDENCE_REVIEW_SUMMARY.md"
RESULT_TXT="$OUT_DIR/000_EVIDENCE_REVIEW_RESULT.txt"

mkdir -p "$OUT_DIR"

latest_file() {
  PATTERN="$1"
  find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name "$PATTERN" | sort | tail -n 1 || true
}

MASTER_CLOSEOUT_RESULT="$(latest_file '000_MASTER_CLOSEOUT_RESULT.txt')"
MASTER_CLOSEOUT_REPORT="$(latest_file '000_MASTER_CLOSEOUT_REPORT.md')"
MASTER_FULL_RESULT="$(latest_file '000_MASTER_FULL_EXECUTION_RESULT.txt')"
MASTER_FULL_REPORT="$(latest_file '000_MASTER_FULL_EXECUTION_REPORT.md')"
ONE_COMMAND_RESULT="$(latest_file '000_ONE_COMMAND_FINAL_RESULT.txt')"
ONE_COMMAND_REPORT="$(latest_file '000_ONE_COMMAND_FINAL_REPORT.md')"
PROOF_AUDIT_RESULT="$(latest_file '000_PRODUCTION_PROOF_AUDIT_RESULT.txt')"
PROOF_AUDIT_REPORT="$(latest_file '000_PRODUCTION_PROOF_AUDIT_REPORT.md')"

extract_kv() {
  FILE_PATH="$1"
  KEY="$2"
  if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
    sed -n "s/^${KEY}=//p" "$FILE_PATH" | tail -n 1
  else
    printf '%s' ''
  fi
}

MASTER_CLOSEOUT_FINAL_RESULT="$(extract_kv "$MASTER_CLOSEOUT_RESULT" 'FINAL_RESULT')"
MASTER_FULL_FINAL_RESULT="$(extract_kv "$MASTER_FULL_RESULT" 'FINAL_RESULT')"
ONE_COMMAND_FINAL_RESULT="$(extract_kv "$ONE_COMMAND_RESULT" 'FINAL_RESULT')"
PROOF_AUDIT_FINAL_RESULT="$(extract_kv "$PROOF_AUDIT_RESULT" 'FINAL_RESULT')"

find_latest_step_tsv() {
  PREFIX="$1"
  find "$APP_ROOT/900.meta" -maxdepth 2 -type f -path "*/${PREFIX}_*/000_STEPS.tsv" | sort | tail -n 1 || true
}

MASTER_VERIFY_TSV="$(find_latest_step_tsv 'master_verify')"
MASTER_LOCAL_TSV="$(find_latest_step_tsv 'master_local_pass')"
MASTER_HARDENING_TSV="$(find_latest_step_tsv 'master_hardening_pass')"
MASTER_PROD_TRACK_TSV="$(find_latest_step_tsv 'master_production_track_pass')"
MASTER_PROD_PROOF_TSV="$(find_latest_step_tsv 'master_production_proof_pass')"
MASTER_FULL_TSV="$(find_latest_step_tsv 'master_full_execution')"
PROOF_AUDIT_TSV="$(find_latest_step_tsv 'production_proof_audit')"

FAIL_LINES_FILE="$OUT_DIR/010_FAIL_LINES.txt"
SKIP_LINES_FILE="$OUT_DIR/020_SKIP_LINES.txt"
: > "$FAIL_LINES_FILE"
: > "$SKIP_LINES_FILE"

for TSV in \
  "$MASTER_VERIFY_TSV" \
  "$MASTER_LOCAL_TSV" \
  "$MASTER_HARDENING_TSV" \
  "$MASTER_PROD_TRACK_TSV" \
  "$MASTER_PROD_PROOF_TSV" \
  "$MASTER_FULL_TSV" \
  "$PROOF_AUDIT_TSV"
do
  if [ -n "$TSV" ] && [ -f "$TSV" ]; then
    grep '^FAIL' "$TSV" >> "$FAIL_LINES_FILE" || true
    grep '^SKIP' "$TSV" >> "$SKIP_LINES_FILE" || true
  fi
done

FAIL_COUNT="$(grep -c '^FAIL' "$FAIL_LINES_FILE" 2>/dev/null || printf '0')"
SKIP_COUNT="$(grep -c '^SKIP' "$SKIP_LINES_FILE" 2>/dev/null || printf '0')"

NEXT_CLASS="production_implementation"
NEXT_REASON="all visible top-level passes look healthy enough for real implementation hardening"

if [ "$FAIL_COUNT" -gt 0 ]; then
  NEXT_CLASS="fix_failures"
  NEXT_REASON="top-level evidence contains FAIL lines"
elif [ "$SKIP_COUNT" -gt 0 ]; then
  NEXT_CLASS="resolve_skips"
  NEXT_REASON="top-level evidence contains SKIP lines"
elif [ "${ONE_COMMAND_FINAL_RESULT:-}" != "" ] && [ "$ONE_COMMAND_FINAL_RESULT" != "PASS" ]; then
  NEXT_CLASS="fix_one_command"
  NEXT_REASON="one-command result is not PASS"
elif [ "${MASTER_FULL_FINAL_RESULT:-}" != "" ] && [ "$MASTER_FULL_FINAL_RESULT" != "PASS" ]; then
  NEXT_CLASS="fix_master_full"
  NEXT_REASON="master full execution result is not PASS"
elif [ "${PROOF_AUDIT_FINAL_RESULT:-}" != "" ] && [ "$PROOF_AUDIT_FINAL_RESULT" != "PASS" ]; then
  NEXT_CLASS="fix_proof"
  NEXT_REASON="production proof audit is not PASS"
fi

RECOMMENDED_COMMAND="sh \"$APP_ROOT/090.scripts/710_run_aioperationdesk_one_command_final.sh\""
if [ "$NEXT_CLASS" = "fix_failures" ]; then
  RECOMMENDED_COMMAND="grep -n '^FAIL' \"$FAIL_LINES_FILE\""
elif [ "$NEXT_CLASS" = "resolve_skips" ]; then
  RECOMMENDED_COMMAND="grep -n '^SKIP' \"$SKIP_LINES_FILE\""
elif [ "$NEXT_CLASS" = "production_implementation" ]; then
  RECOMMENDED_COMMAND="review latest handoff bundle and start real provider/auth hardening implementation"
fi

cat > "$SUMMARY_MD" <<EOF_SUMMARY
# ============================================================
# AI OPERATION DESK EVIDENCE REVIEW SUMMARY
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

latest_result_files:
- master_closeout_result: ${MASTER_CLOSEOUT_RESULT:-NOT_FOUND}
- master_full_result: ${MASTER_FULL_RESULT:-NOT_FOUND}
- one_command_result: ${ONE_COMMAND_RESULT:-NOT_FOUND}
- production_proof_audit_result: ${PROOF_AUDIT_RESULT:-NOT_FOUND}

latest_report_files:
- master_closeout_report: ${MASTER_CLOSEOUT_REPORT:-NOT_FOUND}
- master_full_report: ${MASTER_FULL_REPORT:-NOT_FOUND}
- one_command_report: ${ONE_COMMAND_REPORT:-NOT_FOUND}
- production_proof_audit_report: ${PROOF_AUDIT_REPORT:-NOT_FOUND}

parsed_results:
- master_closeout_final_result: ${MASTER_CLOSEOUT_FINAL_RESULT:-UNKNOWN}
- master_full_final_result: ${MASTER_FULL_FINAL_RESULT:-UNKNOWN}
- one_command_final_result: ${ONE_COMMAND_FINAL_RESULT:-UNKNOWN}
- production_proof_audit_final_result: ${PROOF_AUDIT_FINAL_RESULT:-UNKNOWN}

detected_counts:
- fail_count: $FAIL_COUNT
- skip_count: $SKIP_COUNT

decision:
- next_class: $NEXT_CLASS
- next_reason: $NEXT_REASON
- recommended_command: $RECOMMENDED_COMMAND
EOF_SUMMARY

cat > "$RESULT_TXT" <<EOF_RESULT
MASTER_CLOSEOUT_FINAL_RESULT=${MASTER_CLOSEOUT_FINAL_RESULT:-UNKNOWN}
MASTER_FULL_FINAL_RESULT=${MASTER_FULL_FINAL_RESULT:-UNKNOWN}
ONE_COMMAND_FINAL_RESULT=${ONE_COMMAND_FINAL_RESULT:-UNKNOWN}
PROOF_AUDIT_FINAL_RESULT=${PROOF_AUDIT_FINAL_RESULT:-UNKNOWN}
FAIL_COUNT=$FAIL_COUNT
SKIP_COUNT=$SKIP_COUNT
NEXT_CLASS=$NEXT_CLASS
NEXT_REASON=$NEXT_REASON
RECOMMENDED_COMMAND=$RECOMMENDED_COMMAND
SUMMARY_MD=$SUMMARY_MD
OUT_DIR=$OUT_DIR
EOF_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK EVIDENCE REVIEW DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "SUMMARY_MD=$SUMMARY_MD"
printf '%s\n' "RESULT_TXT=$RESULT_TXT"
printf '%s\n' '============================================================'
sed -n '1,160p' "$SUMMARY_MD"
