#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/${APP_NAME}"
VERIFY_DIR="${IMPL_ROOT}/docs/verification"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

OUT="${VERIFY_DIR}/${RUN_TS}_aiworker_latest_alignment_verify_run.txt"
DETAIL="${VERIFY_DIR}/${RUN_TS}_aiworker_latest_alignment_verify_detail.txt"

mkdir -p "$VERIFY_DIR"
: > "$OUT"
: > "$DETAIL"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  echo "PASS: $1" >> "$DETAIL"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "FAIL: $1" >> "$DETAIL"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  echo "WARN: $1" >> "$DETAIL"
}

check_file() {
  file="$1"
  if [ -f "$file" ]; then
    pass "file exists: $file"
  else
    fail "file missing: $file"
  fi
}

check_term() {
  term="$1"
  target="$2"
  if grep -RIn "$term" "$target" >/dev/null 2>&1; then
    pass "term found: $term"
  else
    warn "term missing: $term"
  fi
}

check_absent() {
  term="$1"
  target="$2"
  if grep -RIn "$term" "$target" >/dev/null 2>&1; then
    fail "forbidden term found: $term"
  else
    pass "forbidden term absent: $term"
  fi
}

check_file "${DESIGN_ROOT}/110.aiworker-reference/110020_CASUAL_CHAT_WORKER_AIWORKER_SERIES_TENDENCY_AND_STYLE_FEATURE_ALIGNMENT.md"
check_file "${DESIGN_ROOT}/140.safety/140020_CASUAL_CHAT_WORKER_LOVERS_STYLE_SAFETY_NOTICE_ALIGNMENT.md"
check_file "${DESIGN_ROOT}/060.integration/060020_CASUAL_CHAT_WORKER_AIWORKER_LATEST_ALIGNMENT_APPEND.md"

check_file "${IMPL_ROOT}/aiworker-reference/series-tendency-reference.js"
check_file "${IMPL_ROOT}/aiworker-reference/lovers-style-selection-cards.js"
check_file "${IMPL_ROOT}/aiworker-reference/mock-aiworker-reference.js"
check_file "${IMPL_ROOT}/api-client/fixtures/aiworker-lovers-style-selection-card-response.json"
check_file "${IMPL_ROOT}/api-client/fixtures/aiworker-series-tendency-summary-response.json"
check_file "${IMPL_ROOT}/tests/run-aiworker-latest-alignment-tests.js"

check_term "initiative" "$IMPL_ROOT"
check_term "userInfluence" "$IMPL_ROOT"
check_term "actionRestriction" "$IMPL_ROOT"
check_term "per_model" "$IMPL_ROOT"
check_term "soft" "$IMPL_ROOT"
check_term "strict_policy" "$IMPL_ROOT"
check_term "ビジネスヤンデレ" "$IMPL_ROOT"
check_term "requires_strong_safety_notice_flag" "$IMPL_ROOT"
check_term "vw_app_lovers_style_selection_card_v1" "$IMPL_ROOT"
check_term "vw_series_tendency_summary_v1" "$IMPL_ROOT"
check_term "監視" "$IMPL_ROOT"
check_term "脅し" "$IMPL_ROOT"
check_term "依存誘導" "$IMPL_ROOT"

check_absent "DATABASE_URL=" "$IMPL_ROOT"
check_absent "PERSONA_DATABASE_URL=" "$IMPL_ROOT"
check_absent "service_role" "$IMPL_ROOT"
check_absent "DROP TABLE" "$IMPL_ROOT"
check_absent "TRUNCATE TABLE" "$IMPL_ROOT"
check_absent "DELETE FROM" "$IMPL_ROOT"

if command -v node >/dev/null 2>&1; then
  if node "${IMPL_ROOT}/tests/run-aiworker-latest-alignment-tests.js" >> "$DETAIL" 2>&1; then
    pass "aiworker latest alignment node test passed"
  else
    fail "aiworker latest alignment node test failed"
  fi
else
  warn "node not installed; node test skipped"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  STATUS="PASS"
else
  STATUS="FAIL"
fi

{
  echo '# CasualChatWorker AIWorker Latest Alignment Verify'
  echo
  echo "status: ${STATUS}"
  echo "generated_at: ${RUN_TS}"
  echo
  echo 'counts:'
  echo "- PASS_COUNT: ${PASS_COUNT}"
  echo "- FAIL_COUNT: ${FAIL_COUNT}"
  echo "- WARN_COUNT: ${WARN_COUNT}"
  echo
  echo "detail: ${DETAIL}"
  echo
  echo 'notes:'
  echo '- No DB apply was executed.'
  echo '- AIWorkerOS surfaces are treated as read-only.'
  echo '- CasualChatWorker now reflects series tendency and LoVerS style feature cards.'
} > "$OUT"

cat "$OUT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
