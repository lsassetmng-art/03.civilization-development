#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/${APP_NAME}"
VERIFY_DIR="${IMPL_ROOT}/docs/verification"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

OUT="${VERIFY_DIR}/${RUN_TS}_aiworker_series_style_ui_alignment_verify_run.txt"
DETAIL="${VERIFY_DIR}/${RUN_TS}_aiworker_series_style_ui_alignment_verify_detail.txt"

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

check_file "${DESIGN_ROOT}/040.screen/040030_CASUAL_CHAT_WORKER_AIWORKER_SERIES_STYLE_UI_ALIGNMENT.md"
check_file "${DESIGN_ROOT}/130.commonos/130020_CASUAL_CHAT_WORKER_COMMONOS_AIWORKER_CARD_VARIANT.md"
check_file "${DESIGN_ROOT}/060.integration/060030_CASUAL_CHAT_WORKER_AIWORKER_SERIES_STYLE_UI_INTEGRATED_APPEND.md"

check_file "${IMPL_ROOT}/components/ui-renderers.js"
check_file "${IMPL_ROOT}/app/assets/js/app.modular.js"
check_file "${IMPL_ROOT}/app/assets/css/app.css"
check_file "${IMPL_ROOT}/app/index.html"
check_file "${IMPL_ROOT}/tests/run-aiworker-series-style-ui-alignment-tests.js"

check_term "series-mini-panel" "${IMPL_ROOT}/components/ui-renderers.js"
check_term "lovers-style-panel" "${IMPL_ROOT}/components/ui-renderers.js"
check_term "strong-notice" "${IMPL_ROOT}/components/ui-renderers.js"
check_term "requires_strong_safety_notice_flag" "${IMPL_ROOT}"
check_term "ビジネスヤンデレ" "${IMPL_ROOT}"
check_term "強安全注意" "${IMPL_ROOT}"
check_term "HDシリーズ" "${IMPL_ROOT}"
check_term "LoVerSシリーズ" "${IMPL_ROOT}"
check_term "積極性" "${IMPL_ROOT}"
check_term "影響度" "${IMPL_ROOT}"
check_term "制限" "${IMPL_ROOT}"
check_term "監視" "${IMPL_ROOT}"
check_term "脅し" "${IMPL_ROOT}"
check_term "依存誘導" "${IMPL_ROOT}"
check_term "性的サービス化" "${IMPL_ROOT}"

if command -v node >/dev/null 2>&1; then
  if node "${IMPL_ROOT}/tests/run-aiworker-series-style-ui-alignment-tests.js" >> "$DETAIL" 2>&1; then
    pass "ui alignment node test passed"
  else
    fail "ui alignment node test failed"
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
  echo '# CasualChatWorker AIWorker Series Style UI Alignment Verify'
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
  echo '- AIWorkerOS data remains read-only.'
  echo '- UI now displays series tendency and LoVerS style features.'
} > "$OUT"

cat "$OUT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
