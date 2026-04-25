#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/final_closeout_review_$STAMP"
SUMMARY_MD="$OUT_DIR/000_FINAL_CLOSEOUT_REVIEW_SUMMARY.md"
RESULT_TXT="$OUT_DIR/000_FINAL_CLOSEOUT_REVIEW_RESULT.txt"

mkdir -p "$OUT_DIR"

latest_file() {
  PATTERN="$1"
  find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name "$PATTERN" | sort | tail -n 1 || true
}

FINAL_END_RESULT="$(latest_file '000_FINAL_CLOSEOUT_TO_END_RESULT.txt')"
FINAL_END_REPORT="$(latest_file '000_FINAL_CLOSEOUT_TO_END_REPORT.md')"
FOLLOWUP_REVIEW_RESULT="$(latest_file '000_FOLLOWUP_EVIDENCE_REVIEW_RESULT.txt')"
FOLLOWUP_REVIEW_SUMMARY="$(latest_file '000_FOLLOWUP_EVIDENCE_REVIEW_SUMMARY.md')"

extract_kv() {
  FILE_PATH="$1"
  KEY="$2"
  if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
    sed -n "s/^${KEY}=//p" "$FILE_PATH" | tail -n 1
  else
    printf '%s' ''
  fi
}

FINAL_RESULT="$(extract_kv "$FINAL_END_RESULT" 'FINAL_RESULT')"
PASS_COUNT="$(extract_kv "$FINAL_END_RESULT" 'PASS_COUNT')"
FAIL_COUNT="$(extract_kv "$FINAL_END_RESULT" 'FAIL_COUNT')"

NEXT_CLASS="terminal_done"
NEXT_ACTION="use latest handoff bundle and begin evidence-based implementation edits only"
if [ "${FINAL_RESULT:-}" != "PASS" ]; then
  NEXT_CLASS="terminal_fix"
  NEXT_ACTION="inspect latest final closeout logs and repair the first failing controlled pass"
fi

cat > "$SUMMARY_MD" <<EOF_FINAL_REVIEW_SUMMARY
# ============================================================
# AI OPERATION DESK FINAL CLOSEOUT REVIEW SUMMARY
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

latest_inputs:
- final_closeout_result: ${FINAL_END_RESULT:-NOT_FOUND}
- final_closeout_report: ${FINAL_END_REPORT:-NOT_FOUND}
- followup_review_result: ${FOLLOWUP_REVIEW_RESULT:-NOT_FOUND}
- followup_review_summary: ${FOLLOWUP_REVIEW_SUMMARY:-NOT_FOUND}

parsed_state:
- final_result: ${FINAL_RESULT:-UNKNOWN}
- pass_count: ${PASS_COUNT:-UNKNOWN}
- fail_count: ${FAIL_COUNT:-UNKNOWN}
- next_class: $NEXT_CLASS
- next_action: $NEXT_ACTION
EOF_FINAL_REVIEW_SUMMARY

cat > "$RESULT_TXT" <<EOF_FINAL_REVIEW_RESULT
FINAL_RESULT=${FINAL_RESULT:-UNKNOWN}
PASS_COUNT=${PASS_COUNT:-UNKNOWN}
FAIL_COUNT=${FAIL_COUNT:-UNKNOWN}
NEXT_CLASS=$NEXT_CLASS
NEXT_ACTION=$NEXT_ACTION
SUMMARY_MD=$SUMMARY_MD
OUT_DIR=$OUT_DIR
EOF_FINAL_REVIEW_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FINAL CLOSEOUT REVIEW DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "SUMMARY_MD=$SUMMARY_MD"
printf '%s\n' '============================================================'
sed -n '1,180p' "$SUMMARY_MD"
