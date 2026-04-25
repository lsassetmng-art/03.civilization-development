#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/post_line_b_next_action_$STAMP"
SUMMARY_MD="$OUT_DIR/000_POST_LINE_B_NEXT_ACTION_SUMMARY.md"
RESULT_TXT="$OUT_DIR/000_POST_LINE_B_NEXT_ACTION_RESULT.txt"
MANIFEST="$OUT_DIR/000_MANIFEST.md"

mkdir -p "$OUT_DIR"

latest_file() {
  PATTERN="$1"
  find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name "$PATTERN" | sort | tail -n 1 || true
}

LINE_B_ACTUAL_RESULT="$(latest_file '000_LINE_B_ACTUAL_EXECUTE_RESULT.txt')"
LINE_B_ACTUAL_REPORT="$(latest_file '000_LINE_B_ACTUAL_EXECUTE_REPORT.md')"
LINE_B_REVIEW_RESULT="$(latest_file '000_LINE_B_REVIEW_RESULT.txt')"
LINE_B_REVIEW_SUMMARY="$(latest_file '000_LINE_B_REVIEW_SUMMARY.md')"

extract_kv() {
  FILE_PATH="$1"
  KEY="$2"
  if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
    sed -n "s/^${KEY}=//p" "$FILE_PATH" | tail -n 1
  else
    printf '%s' ''
  fi
}

LINE_B_FINAL_RESULT="$(extract_kv "$LINE_B_ACTUAL_RESULT" 'FINAL_RESULT')"
LINE_B_PASS_COUNT="$(extract_kv "$LINE_B_ACTUAL_RESULT" 'PASS_COUNT')"
LINE_B_FAIL_COUNT="$(extract_kv "$LINE_B_ACTUAL_RESULT" 'FAIL_COUNT')"

NEXT_CLASS="line_b_pass_followup"
NEXT_ACTION="start evidence-based production hardening follow-up from lane 4 outputs"
if [ "${LINE_B_FINAL_RESULT:-}" != "PASS" ]; then
  NEXT_CLASS="line_b_fail_fix"
  NEXT_ACTION="inspect latest line B logs and repair the first failing live-proof step"
fi

cat > "$SUMMARY_MD" <<EOF_POST_LINE_B_SUMMARY
# ============================================================
# AI OPERATION DESK POST LINE B NEXT ACTION SUMMARY
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

latest_inputs:
- line_b_actual_result: ${LINE_B_ACTUAL_RESULT:-NOT_FOUND}
- line_b_actual_report: ${LINE_B_ACTUAL_REPORT:-NOT_FOUND}
- line_b_review_result: ${LINE_B_REVIEW_RESULT:-NOT_FOUND}
- line_b_review_summary: ${LINE_B_REVIEW_SUMMARY:-NOT_FOUND}

parsed_state:
- line_b_final_result: ${LINE_B_FINAL_RESULT:-UNKNOWN}
- line_b_pass_count: ${LINE_B_PASS_COUNT:-UNKNOWN}
- line_b_fail_count: ${LINE_B_FAIL_COUNT:-UNKNOWN}
- next_class: $NEXT_CLASS
- next_action: $NEXT_ACTION
EOF_POST_LINE_B_SUMMARY

cat > "$RESULT_TXT" <<EOF_POST_LINE_B_RESULT
LINE_B_FINAL_RESULT=${LINE_B_FINAL_RESULT:-UNKNOWN}
LINE_B_PASS_COUNT=${LINE_B_PASS_COUNT:-UNKNOWN}
LINE_B_FAIL_COUNT=${LINE_B_FAIL_COUNT:-UNKNOWN}
NEXT_CLASS=$NEXT_CLASS
NEXT_ACTION=$NEXT_ACTION
SUMMARY_MD=$SUMMARY_MD
OUT_DIR=$OUT_DIR
EOF_POST_LINE_B_RESULT

copy_if_exists() {
  SRC="$1"
  if [ -f "$SRC" ]; then
    cp "$SRC" "$OUT_DIR/"
  fi
}

copy_if_exists "$APP_ROOT/000.docs/POST_LINE_B_NEXT_ACTION_POLICY.md"
copy_if_exists "$APP_ROOT/00_AIOPERATIONDESK_POST_LINE_B_INTEGRATED.md"
copy_if_exists "$SUMMARY_MD"
copy_if_exists "$RESULT_TXT"
copy_if_exists "$LINE_B_ACTUAL_REPORT"
copy_if_exists "$LINE_B_REVIEW_SUMMARY"
copy_if_exists "$APP_ROOT/900.meta/900440_AIOPERATIONDESK_LINE_B_FINAL_MANIFEST.md"

cat > "$MANIFEST" <<EOF_POST_LINE_B_MANIFEST
# ============================================================
# AI OPERATION DESK POST LINE B NEXT ACTION BUNDLE MANIFEST
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

bundle_dir:
- $OUT_DIR

included_files:
EOF_POST_LINE_B_MANIFEST

find "$OUT_DIR" -maxdepth 1 -type f | sort | while read -r FILE; do
  BASENAME="$(basename "$FILE")"
  printf -- '- %s\n' "$BASENAME" >> "$MANIFEST"
done

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK POST LINE B NEXT ACTION BUNDLE DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "MANIFEST=$MANIFEST"
printf '%s\n' '============================================================'
sed -n '1,220p' "$SUMMARY_MD"
