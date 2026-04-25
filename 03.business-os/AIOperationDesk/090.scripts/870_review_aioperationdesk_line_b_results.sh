#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/line_b_review_$STAMP"
SUMMARY_MD="$OUT_DIR/000_LINE_B_REVIEW_SUMMARY.md"
RESULT_TXT="$OUT_DIR/000_LINE_B_REVIEW_RESULT.txt"

mkdir -p "$OUT_DIR"

latest_file() {
  PATTERN="$1"
  find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name "$PATTERN" | sort | tail -n 1 || true
}

LINE_B_RESULT="$(latest_file '000_LINE_B_LIVE_PROOF_RESULT.txt')"
LINE_B_REPORT="$(latest_file '000_LINE_B_LIVE_PROOF_REPORT.md')"
PROVIDER_LIVE_PROBE="$(latest_file '000_provider_live_readiness.txt')"

extract_kv() {
  FILE_PATH="$1"
  KEY="$2"
  if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
    sed -n "s/^${KEY}=//p" "$FILE_PATH" | tail -n 1
  else
    printf '%s' ''
  fi
}

LINE_B_FINAL_RESULT="$(extract_kv "$LINE_B_RESULT" 'FINAL_RESULT')"
LINE_B_PASS_COUNT="$(extract_kv "$LINE_B_RESULT" 'PASS_COUNT')"
LINE_B_FAIL_COUNT="$(extract_kv "$LINE_B_RESULT" 'FAIL_COUNT')"

NEXT_CLASS="line_b_done"
NEXT_ACTION="refresh final handoff and move to evidence-based production hardening"
if [ "${LINE_B_FINAL_RESULT:-}" != "PASS" ]; then
  NEXT_CLASS="line_b_fix"
  NEXT_ACTION="inspect latest line B logs and repair failing live-proof step first"
fi

cat > "$SUMMARY_MD" <<EOF_LINE_B_SUMMARY
# ============================================================
# AI OPERATION DESK LINE B REVIEW SUMMARY
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

latest_inputs:
- line_b_result: ${LINE_B_RESULT:-NOT_FOUND}
- line_b_report: ${LINE_B_REPORT:-NOT_FOUND}
- provider_live_probe: ${PROVIDER_LIVE_PROBE:-NOT_FOUND}

parsed_state:
- line_b_final_result: ${LINE_B_FINAL_RESULT:-UNKNOWN}
- line_b_pass_count: ${LINE_B_PASS_COUNT:-UNKNOWN}
- line_b_fail_count: ${LINE_B_FAIL_COUNT:-UNKNOWN}
- next_class: $NEXT_CLASS
- next_action: $NEXT_ACTION
EOF_LINE_B_SUMMARY

cat > "$RESULT_TXT" <<EOF_LINE_B_REVIEW_RESULT
LINE_B_FINAL_RESULT=${LINE_B_FINAL_RESULT:-UNKNOWN}
LINE_B_PASS_COUNT=${LINE_B_PASS_COUNT:-UNKNOWN}
LINE_B_FAIL_COUNT=${LINE_B_FAIL_COUNT:-UNKNOWN}
NEXT_CLASS=$NEXT_CLASS
NEXT_ACTION=$NEXT_ACTION
SUMMARY_MD=$SUMMARY_MD
OUT_DIR=$OUT_DIR
EOF_LINE_B_REVIEW_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK LINE B REVIEW DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "SUMMARY_MD=$SUMMARY_MD"
printf '%s\n' '============================================================'
sed -n '1,160p' "$SUMMARY_MD"
