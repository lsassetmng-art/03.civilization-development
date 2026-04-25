#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
APP_DISPLAY_NAME="雑談ワーカー"

IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/${APP_NAME}"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

VERIFY_DIR="${IMPL_ROOT}/docs/verification"
TMP_ROOT="/data/data/com.termux/files/home/.tmp"

mkdir -p "$VERIFY_DIR" "$TMP_ROOT"

OUT="${VERIFY_DIR}/${RUN_TS}_implementation_verify_run.txt"
MISSING="${VERIFY_DIR}/${RUN_TS}_implementation_missing_files.txt"
TERM_HITS="${VERIFY_DIR}/${RUN_TS}_implementation_term_hits.txt"
WARNINGS="${VERIFY_DIR}/${RUN_TS}_implementation_warnings.txt"
FAILURES="${VERIFY_DIR}/${RUN_TS}_implementation_failures.txt"

: > "$OUT"
: > "$MISSING"
: > "$TERM_HITS"
: > "$WARNINGS"
: > "$FAILURES"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  echo "PASS: $1" >> "$OUT"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "FAIL: $1" >> "$OUT"
  echo "$1" >> "$FAILURES"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  echo "WARN: $1" >> "$OUT"
  echo "$1" >> "$WARNINGS"
}

check_file() {
  file="$1"
  if [ -f "$file" ]; then
    pass "file exists: $file"
  else
    fail "file missing: $file"
    echo "$file" >> "$MISSING"
  fi
}

check_dir() {
  dir="$1"
  if [ -d "$dir" ]; then
    pass "dir exists: $dir"
  else
    fail "dir missing: $dir"
  fi
}

check_term() {
  term="$1"
  target="$2"
  tmp_hit="${TMP_ROOT}/ccw_verify_term_hit.tmp"

  if grep -RIn "$term" "$target" > "$tmp_hit" 2>/dev/null; then
    pass "term found: $term"
    {
      echo '============================================================'
      echo "TERM: $term"
      sed -n '1,20p' "$tmp_hit"
    } >> "$TERM_HITS"
  else
    warn "term not found: $term"
    {
      echo '============================================================'
      echo "TERM NOT FOUND: $term"
    } >> "$TERM_HITS"
  fi
}

check_absent_term() {
  term="$1"
  target="$2"
  tmp_hit="${TMP_ROOT}/ccw_verify_absent_hit.tmp"

  if grep -RIn "$term" "$target" > "$tmp_hit" 2>/dev/null; then
    fail "forbidden term found: $term"
    {
      echo '============================================================'
      echo "FORBIDDEN TERM: $term"
      sed -n '1,40p' "$tmp_hit"
    } >> "$TERM_HITS"
  else
    pass "forbidden term absent: $term"
  fi
}

check_file "${IMPL_ROOT}/app/index.html"
check_file "${IMPL_ROOT}/app/assets/css/app.css"
check_file "${IMPL_ROOT}/app/assets/js/domain.js"
check_file "${IMPL_ROOT}/app/assets/js/mock-api.js"
check_file "${IMPL_ROOT}/app/assets/js/app.js"
check_file "${IMPL_ROOT}/commonos/commonos-adapter.js"
check_file "${IMPL_ROOT}/tests/smoke-test.js"
check_file "${IMPL_ROOT}/README.md"

check_dir "${IMPL_ROOT}/app"
check_dir "${IMPL_ROOT}/components"
check_dir "${IMPL_ROOT}/screens"
check_dir "${IMPL_ROOT}/state"
check_dir "${IMPL_ROOT}/api-client"
check_dir "${IMPL_ROOT}/domain"
check_dir "${IMPL_ROOT}/pricing"
check_dir "${IMPL_ROOT}/ticket"
check_dir "${IMPL_ROOT}/safety"
check_dir "${IMPL_ROOT}/aiworker-reference"
check_dir "${IMPL_ROOT}/cx-reference"
check_dir "${IMPL_ROOT}/commonos"
check_dir "${IMPL_ROOT}/tests"
check_dir "${IMPL_ROOT}/docs"

check_term "CasualChatWorker" "$IMPL_ROOT"
check_term "雑談ワーカー" "$IMPL_ROOT"
check_term "Friend" "$IMPL_ROOT"
check_term "Lover" "$IMPL_ROOT"
check_term "無料チケット" "$IMPL_ROOT"
check_term "30 minutes" "$IMPL_ROOT"
check_term "500" "$IMPL_ROOT"
check_term "2" "$IMPL_ROOT"
check_term "business" "$IMPL_ROOT"
check_term "aiworker" "$IMPL_ROOT"
check_term "cx22073jw" "$IMPL_ROOT"
check_term "CommonOS" "$IMPL_ROOT"
check_term "擬似恋人" "$IMPL_ROOT"
check_term "レンタル彼氏" "$IMPL_ROOT"
check_term "現実の交際関係ではありません" "$IMPL_ROOT"

check_absent_term "psql" "$IMPL_ROOT"
check_absent_term "DATABASE_URL=" "$IMPL_ROOT"
check_absent_term "PERSONA_DATABASE_URL=" "$IMPL_ROOT"
check_absent_term "service_role" "$IMPL_ROOT"
check_absent_term "supabase_key" "$IMPL_ROOT"
check_absent_term "DROP TABLE" "$IMPL_ROOT"
check_absent_term "TRUNCATE TABLE" "$IMPL_ROOT"
check_absent_term "DELETE FROM" "$IMPL_ROOT"

if grep -n "calculateQuote" "${IMPL_ROOT}/app/assets/js/domain.js" >/dev/null 2>&1; then
  pass "calculateQuote exists"
else
  fail "calculateQuote missing"
fi

if grep -n "durationMinutes / 30 \* 500" "${IMPL_ROOT}/app/assets/js/domain.js" >/dev/null 2>&1; then
  pass "base price formula exists"
else
  warn "base price formula literal not found"
fi

if grep -n "Math.min(remainingTickets, maxTicketsByDuration, 2)" "${IMPL_ROOT}/app/assets/js/domain.js" >/dev/null 2>&1; then
  pass "max ticket application rule exists"
else
  fail "max ticket application rule missing"
fi

if grep -n "unsafeKeywords" "${IMPL_ROOT}/app/assets/js/domain.js" >/dev/null 2>&1; then
  pass "unsafe keyword list exists"
else
  fail "unsafe keyword list missing"
fi

if grep -n "localStorage" "${IMPL_ROOT}/app/assets/js/mock-api.js" >/dev/null 2>&1; then
  pass "localStorage mock persistence exists"
else
  warn "localStorage mock persistence not found"
fi

if grep -n "fetch(" "${IMPL_ROOT}/app/assets/js"/*.js >/dev/null 2>&1; then
  warn "fetch call found in prototype JS"
else
  pass "no fetch call in prototype JS"
fi

if command -v node >/dev/null 2>&1; then
  node -c "${IMPL_ROOT}/app/assets/js/domain.js" >/dev/null 2>&1 && pass "node syntax ok: domain.js" || fail "node syntax error: domain.js"
  node -c "${IMPL_ROOT}/app/assets/js/mock-api.js" >/dev/null 2>&1 && pass "node syntax ok: mock-api.js" || fail "node syntax error: mock-api.js"
  node -c "${IMPL_ROOT}/app/assets/js/app.js" >/dev/null 2>&1 && pass "node syntax ok: app.js" || fail "node syntax error: app.js"
  node -c "${IMPL_ROOT}/commonos/commonos-adapter.js" >/dev/null 2>&1 && pass "node syntax ok: commonos-adapter.js" || fail "node syntax error: commonos-adapter.js"
else
  warn "node not installed; JS syntax check skipped"
fi

if [ -f "${DESIGN_ROOT}/060.integration/060000_CASUAL_CHAT_WORKER_INTEGRATED_CANONICAL.md" ]; then
  pass "design integrated canonical exists"
else
  warn "design integrated canonical not found"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  FINAL_STATUS="PASS"
else
  FINAL_STATUS="FAIL"
fi

{
  echo '# CasualChatWorker Implementation Verify Run'
  echo
  echo "status: ${FINAL_STATUS}"
  echo "generated_at: ${RUN_TS}"
  echo
  echo 'counts:'
  echo "- PASS_COUNT: ${PASS_COUNT}"
  echo "- FAIL_COUNT: ${FAIL_COUNT}"
  echo "- WARN_COUNT: ${WARN_COUNT}"
  echo
  echo 'outputs:'
  echo "- missing_files: ${MISSING}"
  echo "- term_hits: ${TERM_HITS}"
  echo "- warnings: ${WARNINGS}"
  echo "- failures: ${FAILURES}"
  echo
  echo 'notes:'
  echo '- No DB apply was executed.'
  echo '- No ERP direct linkage was executed.'
  echo '- Prototype uses localStorage only.'
  echo '- Lover remains pseudo-romantic rental boyfriend/girlfriend style AI worker.'
  echo '- Monthly free ticket remains 2 tickets, 30 minutes each.'
} > "${OUT}.summary"

cat "${OUT}.summary"
echo '============================================================'
echo "DETAIL_OUT=${OUT}"
echo "SUMMARY=${OUT}.summary"
echo "MISSING=${MISSING}"
echo "WARNINGS=${WARNINGS}"
echo "FAILURES=${FAILURES}"
echo '============================================================'

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
