#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$APP_ROOT/900.meta/final_behavior_review_$STAMP"
SUMMARY_MD="$OUT_DIR/000_FINAL_BEHAVIOR_REVIEW_SUMMARY.md"
RESULT_TXT="$OUT_DIR/000_FINAL_BEHAVIOR_REVIEW_RESULT.txt"

mkdir -p "$OUT_DIR"

latest_file() {
  PATTERN="$1"
  find "$APP_ROOT/900.meta" -maxdepth 2 -type f -name "$PATTERN" | sort | tail -n 1 || true
}

FINAL_BEHAVIOR_RESULT="$(latest_file '000_FINAL_BEHAVIOR_PROOF_RESULT.txt')"
FINAL_BEHAVIOR_REPORT="$(latest_file '000_FINAL_BEHAVIOR_PROOF_REPORT.md')"
FINAL_IMPL_DIGEST="$(latest_file '000_FINAL_IMPLEMENTATION_DIGEST.md')"
RUNTIME_REVIEW_RESULT="$(latest_file '000_RUNTIME_EVIDENCE_REVIEW_RESULT.txt')"
RUNTIME_REVIEW_SUMMARY="$(latest_file '000_RUNTIME_EVIDENCE_REVIEW_SUMMARY.md')"

extract_kv() {
  FILE_PATH="$1"
  KEY="$2"
  if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
    sed -n "s/^${KEY}=//p" "$FILE_PATH" | tail -n 1
  else
    printf '%s' ''
  fi
}

FINAL_RESULT="$(extract_kv "$FINAL_BEHAVIOR_RESULT" 'FINAL_RESULT')"
PASS_COUNT="$(extract_kv "$FINAL_BEHAVIOR_RESULT" 'PASS_COUNT')"
FAIL_COUNT="$(extract_kv "$FINAL_BEHAVIOR_RESULT" 'FAIL_COUNT')"
RUNTIME_EVIDENCE_COUNT="$(extract_kv "$FINAL_BEHAVIOR_RESULT" 'RUNTIME_EVIDENCE_COUNT')"

NEXT_CLASS="direct_behavior_fix"
NEXT_ACTION="review latest runtime/db evidence and tighten provider/auth/replay behavior directly"

if [ "${FINAL_RESULT:-}" = "PASS" ]; then
  NEXT_CLASS="evidence_based_behavior_tightening"
  NEXT_ACTION="use final evidence set to tighten edge behaviors, normalize errors, and remove remaining weak points"
fi

cat > "$SUMMARY_MD" <<EOF_TERM_REVIEW_SUMMARY
# ============================================================
# AI OPERATION DESK FINAL BEHAVIOR REVIEW SUMMARY
# ============================================================

status: generated
app: AIOPERATIONDESK
owner: Boss
prepared_by: Zero
generated_at: $STAMP

latest_inputs:
- final_behavior_result: ${FINAL_BEHAVIOR_RESULT:-NOT_FOUND}
- final_behavior_report: ${FINAL_BEHAVIOR_REPORT:-NOT_FOUND}
- final_implementation_digest: ${FINAL_IMPL_DIGEST:-NOT_FOUND}
- runtime_review_result: ${RUNTIME_REVIEW_RESULT:-NOT_FOUND}
- runtime_review_summary: ${RUNTIME_REVIEW_SUMMARY:-NOT_FOUND}

parsed_state:
- final_result: ${FINAL_RESULT:-UNKNOWN}
- pass_count: ${PASS_COUNT:-UNKNOWN}
- fail_count: ${FAIL_COUNT:-UNKNOWN}
- runtime_evidence_count: ${RUNTIME_EVIDENCE_COUNT:-UNKNOWN}
- next_class: $NEXT_CLASS
- next_action: $NEXT_ACTION
EOF_TERM_REVIEW_SUMMARY

cat > "$RESULT_TXT" <<EOF_TERM_REVIEW_RESULT
FINAL_RESULT=${FINAL_RESULT:-UNKNOWN}
PASS_COUNT=${PASS_COUNT:-UNKNOWN}
FAIL_COUNT=${FAIL_COUNT:-UNKNOWN}
RUNTIME_EVIDENCE_COUNT=${RUNTIME_EVIDENCE_COUNT:-UNKNOWN}
NEXT_CLASS=$NEXT_CLASS
NEXT_ACTION=$NEXT_ACTION
SUMMARY_MD=$SUMMARY_MD
OUT_DIR=$OUT_DIR
EOF_TERM_REVIEW_RESULT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FINAL BEHAVIOR REVIEW DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "SUMMARY_MD=$SUMMARY_MD"
printf '%s\n' '============================================================'
sed -n '1,180p' "$SUMMARY_MD"
