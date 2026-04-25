#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/followup_evidence_review_$STAMP"
SUMMARY_MD="$OUT_DIR/000_FOLLOWUP_EVIDENCE_REVIEW_SUMMARY.md"
RESULT_TXT="$OUT_DIR/000_FOLLOWUP_EVIDENCE_REVIEW_RESULT.txt"

mkdir -p "$OUT_DIR"

latest_file() {
  PATTERN="$1"
  find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name "$PATTERN" | sort | tail -n 1 || true
}

FOLLOWUP_PASS_RESULT="$(latest_file '000_CONTROLLED_LIVE_HARDENING_PASS_RESULT.txt')"
FOLLOWUP_PASS_REPORT="$(latest_file '000_CONTROLLED_LIVE_HARDENING_PASS_REPORT.md')"
LINE_B_REVIEW_RESULT="$(latest_file '000_LINE_B_REVIEW_RESULT.txt')"
REPLAY_LIVE_PROBE_TXT="$(find "$APP_ROOT/900.meta" -maxdepth 1 -type f -name 'replay_live_probe_*.txt' | sort | tail -n 1 || true)"

extract_kv() {
  FILE_PATH="$1"
  KEY="$2"
  if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
    sed -n "s/^${KEY}=//p" "$FILE_PATH" | tail -n 1
  else
    printf '%s' ''
  fi
}

FOLLOWUP_FINAL_RESULT="$(extract_kv "$FOLLOWUP_PASS_RESULT" 'FINAL_RESULT')"
FOLLOWUP_PASS_COUNT="$(extract_kv "$FOLLOWUP_PASS_RESULT" 'PASS_COUNT')"
FOLLOWUP_FAIL_COUNT="$(extract_kv "$FOLLOWUP_PASS_RESULT" 'FAIL_COUNT')"

NEXT_CLASS="followup_hardening_edit"
NEXT_ACTION="use controlled live evidence to tighten provider/auth/replay implementation paths"
if [ "${FOLLOWUP_FINAL_RESULT:-}" != "PASS" ]; then
  NEXT_CLASS="followup_fix"
  NEXT_ACTION="inspect latest controlled live hardening pass logs and repair the first failing step"
fi

cat > "$SUMMARY_MD" <<EOF_FOLLOWUP2_SUMMARY
# ============================================================
# AI OPERATION DESK FOLLOWUP EVIDENCE REVIEW SUMMARY
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: $STAMP

latest_inputs:
- followup_pass_result: ${FOLLOWUP_PASS_RESULT:-NOT_FOUND}
- followup_pass_report: ${FOLLOWUP_PASS_REPORT:-NOT_FOUND}
- line_b_review_result: ${LINE_B_REVIEW_RESULT:-NOT_FOUND}
- replay_live_probe_txt: ${REPLAY_LIVE_PROBE_TXT:-NOT_FOUND}

parsed_state:
- followup_final_result: ${FOLLOWUP_FINAL_RESULT:-UNKNOWN}
- followup_pass_count: ${FOLLOWUP_PASS_COUNT:-UNKNOWN}
- followup_fail_count: ${FOLLOWUP_FAIL_COUNT:-UNKNOWN}
- next_class: $NEXT_CLASS
- next_action: $NEXT_ACTION
EOF_FOLLOWUP2_SUMMARY

cat > "$RESULT_TXT" <<EOF_FOLLOWUP2_REVIEW_RESULT
FOLLOWUP_FINAL_RESULT=${FOLLOWUP_FINAL_RESULT:-UNKNOWN}
FOLLOWUP_PASS_COUNT=${FOLLOWUP_PASS_COUNT:-UNKNOWN}
FOLLOWUP_FAIL_COUNT=${FOLLOWUP_FAIL_COUNT:-UNKNOWN}
NEXT_CLASS=$NEXT_CLASS
NEXT_ACTION=$NEXT_ACTION
SUMMARY_MD=$SUMMARY_MD
OUT_DIR=$OUT_DIR
EOF_FOLLOWUP2_REVIEW_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FOLLOWUP EVIDENCE REVIEW DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "SUMMARY_MD=$SUMMARY_MD"
printf '%s\n' '============================================================'
sed -n '1,180p' "$SUMMARY_MD"
