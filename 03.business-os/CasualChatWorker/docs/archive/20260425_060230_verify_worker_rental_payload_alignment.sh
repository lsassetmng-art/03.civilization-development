#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
VERIFY_DIR="${IMPL_ROOT}/docs/verification"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

OUT="${VERIFY_DIR}/${RUN_TS}_worker_rental_payload_alignment_verify_run.txt"
DETAIL="${VERIFY_DIR}/${RUN_TS}_worker_rental_payload_alignment_verify_detail.txt"

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

check_file "${IMPL_ROOT}/domain/worker-rental-mapping.js"
check_file "${IMPL_ROOT}/api-client/worker-rental-payload-client.js"
check_file "${IMPL_ROOT}/api-client/fixtures/worker-rental-free-ticket-balance-response.json"
check_file "${IMPL_ROOT}/api-client/fixtures/worker-rental-quote-request-90-lover-two-tickets.json"
check_file "${IMPL_ROOT}/api-client/fixtures/worker-rental-quote-response-90-lover-two-tickets.json"
check_file "${IMPL_ROOT}/api-client/fixtures/worker-rental-confirm-request-90-lover-two-tickets.json"
check_file "${IMPL_ROOT}/api-client/fixtures/worker-rental-confirm-response-90-lover-two-tickets.json"
check_file "${IMPL_ROOT}/tests/run-worker-rental-payload-alignment-tests.js"

check_term "worker-rental-mapping.js" "${IMPL_ROOT}/app/index.html"
check_term "worker-rental-payload-client.js" "${IMPL_ROOT}/app/index.html"
check_term "appCode: \"CasualChatWorker\"" "${IMPL_ROOT}/domain/worker-rental-mapping.js"
check_term "serviceCode: \"casual_chat_worker\"" "${IMPL_ROOT}/domain/worker-rental-mapping.js"
check_term "rentalUnitCount: 120" "${IMPL_ROOT}/domain/worker-rental-mapping.js"
check_term "sourceRule: \"shortest_contract_duration\"" "${IMPL_ROOT}/domain/worker-rental-mapping.js"
check_term "entitlementUnitCount: 30" "${IMPL_ROOT}/domain/worker-rental-mapping.js"
check_term "app_code" "${IMPL_ROOT}/api-client/fixtures"
check_term "service_code" "${IMPL_ROOT}/api-client/fixtures"
check_term "rental_unit_kind" "${IMPL_ROOT}/api-client/fixtures"
check_term "rental_unit_count" "${IMPL_ROOT}/api-client/fixtures"
check_term "monthly_shortest_contract_free_ticket" "${IMPL_ROOT}/api-client/fixtures"
check_term "shortest_contract_duration" "${IMPL_ROOT}/api-client/fixtures"

check_absent "DATABASE_URL=" "$IMPL_ROOT"
check_absent "PERSONA_DATABASE_URL=" "$IMPL_ROOT"
check_absent "service_role" "$IMPL_ROOT"
check_absent "DROP TABLE" "$IMPL_ROOT"
check_absent "TRUNCATE TABLE" "$IMPL_ROOT"
check_absent "DELETE FROM" "$IMPL_ROOT"

if command -v node >/dev/null 2>&1; then
  if node "${IMPL_ROOT}/tests/run-worker-rental-payload-alignment-tests.js" >> "$DETAIL" 2>&1; then
    pass "worker rental payload alignment node test passed"
  else
    fail "worker rental payload alignment node test failed"
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
  echo '# CasualChatWorker WorkerRentalCore Payload Alignment Verify'
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
  echo '- Payloads now use generic worker_rental naming.'
  echo '- CasualChatWorker app max remains 120 minutes.'
  echo '- Monthly free ticket means app shortest contract duration.'
} > "$OUT"

cat "$OUT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
