#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
FIXTURE_DIR="${IMPL_ROOT}/api-client/fixtures"
VERIFY_DIR="${IMPL_ROOT}/docs/verification"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

OUT="${VERIFY_DIR}/${RUN_TS}_api_payload_fixture_verify_run.txt"
DETAIL="${VERIFY_DIR}/${RUN_TS}_api_payload_fixture_verify_detail.txt"

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

for file in \
  free-ticket-balance-response.json \
  contract-quote-request-30-friend-one-ticket.json \
  contract-quote-response-30-friend-one-ticket.json \
  contract-quote-request-60-lover-two-tickets.json \
  contract-quote-response-60-lover-two-tickets.json \
  contract-quote-request-90-lover-two-tickets.json \
  contract-quote-response-90-lover-two-tickets.json \
  contract-quote-request-120-friend-two-tickets.json \
  contract-quote-response-120-friend-two-tickets.json \
  contract-confirm-request-90-lover-two-tickets.json \
  contract-confirm-response-90-lover-two-tickets.json \
  session-message-request-safe.json \
  session-message-response-safe.json \
  session-message-request-unsafe.json \
  session-message-response-unsafe-redirect.json \
  usage-history-response.json
do
  check_file "${FIXTURE_DIR}/${file}"
done

check_file "${IMPL_ROOT}/tests/run-contract-session-domain-tests.js"
check_file "${IMPL_ROOT}/tests/run-api-payload-fixture-tests.js"

check_term "granted_ticket_count" "$FIXTURE_DIR"
check_term "remaining_ticket_count" "$FIXTURE_DIR"
check_term "minutes_per_ticket" "$FIXTURE_DIR"
check_term "duration_minutes" "$FIXTURE_DIR"
check_term "base_price_jpy" "$FIXTURE_DIR"
check_term "applied_free_ticket_count" "$FIXTURE_DIR"
check_term "final_price_jpy" "$FIXTURE_DIR"
check_term "safety_state" "$FIXTURE_DIR"
check_term "soft_redirect" "$FIXTURE_DIR"
check_term "Lover" "$FIXTURE_DIR"
check_term "Friend" "$FIXTURE_DIR"

check_absent "DATABASE_URL=" "$FIXTURE_DIR"
check_absent "PERSONA_DATABASE_URL=" "$FIXTURE_DIR"
check_absent "service_role" "$FIXTURE_DIR"
check_absent "DROP TABLE" "$FIXTURE_DIR"
check_absent "TRUNCATE TABLE" "$FIXTURE_DIR"
check_absent "DELETE FROM" "$FIXTURE_DIR"

if command -v node >/dev/null 2>&1; then
  if node "${IMPL_ROOT}/tests/run-api-payload-fixture-tests.js" >> "$DETAIL" 2>&1; then
    pass "api payload fixture node test passed"
  else
    fail "api payload fixture node test failed"
  fi

  if node "${IMPL_ROOT}/tests/run-contract-session-domain-tests.js" >> "$DETAIL" 2>&1; then
    pass "contract session domain node test passed"
  else
    fail "contract session domain node test failed"
  fi
else
  warn "node not installed; fixture/domain runtime tests skipped"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  STATUS="PASS"
else
  STATUS="FAIL"
fi

{
  echo '# CasualChatWorker API Payload Fixture Verify'
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
  echo '- No ERP direct linkage was executed.'
  echo '- Fixtures are local payload examples only.'
  echo '- Contract/session tests use mock localStorage only.'
} > "$OUT"

cat "$OUT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
