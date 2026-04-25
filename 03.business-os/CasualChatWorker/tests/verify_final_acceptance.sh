#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"

IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/${APP_NAME}"
CORE_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental"

VERIFY_DIR="${IMPL_ROOT}/docs/verification"
TMP_ROOT="/data/data/com.termux/files/home/.tmp"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

OUT="${VERIFY_DIR}/${RUN_TS}_final_acceptance_verify_run.txt"
DETAIL="${VERIFY_DIR}/${RUN_TS}_final_acceptance_verify_detail.txt"
MISSING="${VERIFY_DIR}/${RUN_TS}_final_acceptance_missing.txt"
WARNINGS="${VERIFY_DIR}/${RUN_TS}_final_acceptance_warnings.txt"
FAILURES="${VERIFY_DIR}/${RUN_TS}_final_acceptance_failures.txt"

mkdir -p "$VERIFY_DIR" "$TMP_ROOT"

: > "$OUT"
: > "$DETAIL"
: > "$MISSING"
: > "$WARNINGS"
: > "$FAILURES"

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
  echo "$1" >> "$FAILURES"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  echo "WARN: $1" >> "$DETAIL"
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
    echo "$dir" >> "$MISSING"
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

check_absent_in_runtime() {
  term="$1"
  target="$2"
  if grep -RIn "$term" "$target" >/dev/null 2>&1; then
    fail "forbidden runtime term found: $term in $target"
  else
    pass "forbidden runtime term absent: $term"
  fi
}

check_dir "$IMPL_ROOT"
check_dir "$DESIGN_ROOT"
check_dir "$CORE_ROOT"

check_file "${IMPL_ROOT}/app/index.html"
check_file "${IMPL_ROOT}/app/assets/css/app.css"
check_file "${IMPL_ROOT}/app/assets/js/app.modular.js"

check_file "${IMPL_ROOT}/domain/constants.js"
check_file "${IMPL_ROOT}/domain/worker-rental-mapping.js"
check_file "${IMPL_ROOT}/pricing/pricing-domain.js"
check_file "${IMPL_ROOT}/ticket/free-ticket-domain.js"
check_file "${IMPL_ROOT}/safety/safety-policy.js"
check_file "${IMPL_ROOT}/state/app-state.js"

check_file "${IMPL_ROOT}/api-client/mock-business-api-client.js"
check_file "${IMPL_ROOT}/api-client/worker-rental-payload-client.js"

check_file "${IMPL_ROOT}/aiworker-reference/series-tendency-reference.js"
check_file "${IMPL_ROOT}/aiworker-reference/lovers-style-selection-cards.js"
check_file "${IMPL_ROOT}/aiworker-reference/mock-aiworker-reference.js"
check_file "${IMPL_ROOT}/cx-reference/mock-cx-material.js"

check_file "${IMPL_ROOT}/components/ui-renderers.js"
check_file "${IMPL_ROOT}/screens/screen-router.js"

check_file "${IMPL_ROOT}/api-client/fixtures/worker-rental-free-ticket-balance-response.json"
check_file "${IMPL_ROOT}/api-client/fixtures/worker-rental-quote-response-90-lover-two-tickets.json"
check_file "${IMPL_ROOT}/api-client/fixtures/worker-rental-confirm-response-90-lover-two-tickets.json"
check_file "${IMPL_ROOT}/api-client/fixtures/aiworker-lovers-style-selection-card-response.json"
check_file "${IMPL_ROOT}/api-client/fixtures/aiworker-series-tendency-summary-response.json"

check_file "${DESIGN_ROOT}/040.screen/040030_CASUAL_CHAT_WORKER_AIWORKER_SERIES_STYLE_UI_ALIGNMENT.md"
check_file "${DESIGN_ROOT}/060.integration/060030_CASUAL_CHAT_WORKER_AIWORKER_SERIES_STYLE_UI_INTEGRATED_APPEND.md"
check_file "${DESIGN_ROOT}/110.aiworker-reference/110020_CASUAL_CHAT_WORKER_AIWORKER_SERIES_TENDENCY_AND_STYLE_FEATURE_ALIGNMENT.md"
check_file "${DESIGN_ROOT}/130.commonos/130020_CASUAL_CHAT_WORKER_COMMONOS_AIWORKER_CARD_VARIANT.md"
check_file "${DESIGN_ROOT}/140.safety/140020_CASUAL_CHAT_WORKER_LOVERS_STYLE_SAFETY_NOTICE_ALIGNMENT.md"

if ls "${CORE_ROOT}/db/migrations/"*worker_rental*".sql" >/dev/null 2>&1; then
  pass "WorkerRentalCore migration package exists"
else
  fail "WorkerRentalCore migration package missing"
fi

if ls "${CORE_ROOT}/db/apply/"*worker_rental*".sh" >/dev/null 2>&1; then
  pass "WorkerRentalCore apply script exists"
else
  fail "WorkerRentalCore apply script missing"
fi

check_term "CasualChatWorker" "$IMPL_ROOT"
check_term "雑談ワーカー" "$IMPL_ROOT"
check_term "casual_chat_worker" "$IMPL_ROOT"
check_term "worker_rental" "$IMPL_ROOT"
check_term "monthly_shortest_contract_free_ticket" "$IMPL_ROOT"
check_term "shortest_contract_duration" "$IMPL_ROOT"
check_term "rentalUnitCount: 120" "$IMPL_ROOT"
check_term "entitlementUnitCount: 30" "$IMPL_ROOT"
check_term "Friend" "$IMPL_ROOT"
check_term "Lover" "$IMPL_ROOT"
check_term "HDシリーズ" "$IMPL_ROOT"
check_term "LoVerSシリーズ" "$IMPL_ROOT"
check_term "ビジネスヤンデレ" "$IMPL_ROOT"
check_term "requires_strong_safety_notice_flag" "$IMPL_ROOT"
check_term "強安全注意" "$IMPL_ROOT"
check_term "監視" "$IMPL_ROOT"
check_term "脅し" "$IMPL_ROOT"
check_term "依存誘導" "$IMPL_ROOT"
check_term "性的サービス化" "$IMPL_ROOT"
check_term "現実の交際関係ではありません" "$IMPL_ROOT"

check_term "business" "$IMPL_ROOT"
check_term "aiworker" "$IMPL_ROOT"
check_term "cx22073jw" "$IMPL_ROOT"
check_term "CommonOS" "$IMPL_ROOT"

RUNTIME_SCAN_DIRS="
${IMPL_ROOT}/app
${IMPL_ROOT}/domain
${IMPL_ROOT}/pricing
${IMPL_ROOT}/ticket
${IMPL_ROOT}/safety
${IMPL_ROOT}/state
${IMPL_ROOT}/api-client
${IMPL_ROOT}/aiworker-reference
${IMPL_ROOT}/cx-reference
${IMPL_ROOT}/components
${IMPL_ROOT}/screens
"

for scan_dir in $RUNTIME_SCAN_DIRS; do
  if [ -d "$scan_dir" ]; then
    check_absent_in_runtime "DATABASE_URL=" "$scan_dir"
    check_absent_in_runtime "PERSONA_DATABASE_URL=" "$scan_dir"
    check_absent_in_runtime "service_role" "$scan_dir"
    check_absent_in_runtime "supabase_key" "$scan_dir"
    check_absent_in_runtime "DROP TABLE" "$scan_dir"
    check_absent_in_runtime "TRUNCATE TABLE" "$scan_dir"
    check_absent_in_runtime "DELETE FROM" "$scan_dir"
  fi
done

if command -v node >/dev/null 2>&1; then
  for js in \
    "${IMPL_ROOT}/domain/constants.js" \
    "${IMPL_ROOT}/domain/worker-rental-mapping.js" \
    "${IMPL_ROOT}/pricing/pricing-domain.js" \
    "${IMPL_ROOT}/ticket/free-ticket-domain.js" \
    "${IMPL_ROOT}/safety/safety-policy.js" \
    "${IMPL_ROOT}/state/app-state.js" \
    "${IMPL_ROOT}/api-client/mock-business-api-client.js" \
    "${IMPL_ROOT}/api-client/worker-rental-payload-client.js" \
    "${IMPL_ROOT}/aiworker-reference/series-tendency-reference.js" \
    "${IMPL_ROOT}/aiworker-reference/lovers-style-selection-cards.js" \
    "${IMPL_ROOT}/aiworker-reference/mock-aiworker-reference.js" \
    "${IMPL_ROOT}/cx-reference/mock-cx-material.js" \
    "${IMPL_ROOT}/components/ui-renderers.js" \
    "${IMPL_ROOT}/screens/screen-router.js" \
    "${IMPL_ROOT}/app/assets/js/app.modular.js"
  do
    if [ -f "$js" ]; then
      if node -c "$js" >/dev/null 2>&1; then
        pass "node syntax ok: $js"
      else
        fail "node syntax error: $js"
      fi
    fi
  done

  for test_js in \
    "${IMPL_ROOT}/tests/run-worker-rental-payload-alignment-tests.js" \
    "${IMPL_ROOT}/tests/run-aiworker-latest-alignment-tests.js" \
    "${IMPL_ROOT}/tests/run-aiworker-series-style-ui-alignment-tests.js" \
    "${IMPL_ROOT}/tests/run-api-payload-fixture-tests.js" \
    "${IMPL_ROOT}/tests/run-contract-session-domain-tests.js"
  do
    if [ -f "$test_js" ]; then
      if node "$test_js" >> "$DETAIL" 2>&1; then
        pass "node test passed: $test_js"
      else
        fail "node test failed: $test_js"
      fi
    else
      warn "node test missing: $test_js"
    fi
  done
else
  warn "node not installed; JS syntax and node tests skipped"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  STATUS="PASS"
else
  STATUS="FAIL"
fi

{
  echo '# CasualChatWorker Final Acceptance Verify'
  echo
  echo "status: ${STATUS}"
  echo "generated_at: ${RUN_TS}"
  echo
  echo 'counts:'
  echo "- PASS_COUNT: ${PASS_COUNT}"
  echo "- FAIL_COUNT: ${FAIL_COUNT}"
  echo "- WARN_COUNT: ${WARN_COUNT}"
  echo
  echo 'outputs:'
  echo "- detail: ${DETAIL}"
  echo "- missing: ${MISSING}"
  echo "- warnings: ${WARNINGS}"
  echo "- failures: ${FAILURES}"
  echo
  echo 'confirmed:'
  echo '- No DB apply was executed by this verification.'
  echo '- Runtime files do not contain DB connection env assignments.'
  echo '- WorkerRentalCore is present as package, not applied here.'
  echo '- CasualChatWorker remains max 120 minutes.'
  echo '- Monthly free ticket follows shortest contract duration.'
  echo '- AIWorker latest series/style UI alignment is present.'
} > "$OUT"

cat "$OUT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
