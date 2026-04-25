#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/${APP_NAME}"
VERIFY_DIR="${IMPL_ROOT}/docs/verification"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

OUT="${VERIFY_DIR}/${RUN_TS}_backend_transaction_preparation_verify_run.txt"
DETAIL="${VERIFY_DIR}/${RUN_TS}_backend_transaction_preparation_verify_detail.txt"

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

check_absent_runtime() {
  term="$1"
  target="$2"
  if grep -RIn "$term" "$target" >/dev/null 2>&1; then
    fail "forbidden runtime term found: $term"
  else
    pass "forbidden runtime term absent: $term"
  fi
}

check_file "${DESIGN_ROOT}/070.api/070050_CASUAL_CHAT_WORKER_WORKER_RENTAL_CONFIRM_TRANSACTION_EXACT.md"
check_file "${DESIGN_ROOT}/080.policy/080020_CASUAL_CHAT_WORKER_BACKEND_AUTH_SESSION_POLICY.md"
check_file "${DESIGN_ROOT}/090.db/090040_CASUAL_CHAT_WORKER_MONTHLY_FREE_TICKET_BACKEND_DESIGN.md"
check_file "${DESIGN_ROOT}/060.integration/060060_CASUAL_CHAT_WORKER_BACKEND_TRANSACTION_PREPARATION_APPEND.md"
check_file "${DESIGN_ROOT}/170.implementation-ready-freeze/170050_CASUAL_CHAT_WORKER_BACKEND_TRANSACTION_REAL_MODE_WAITING_GATE.md"

check_file "${IMPL_ROOT}/backend/worker-rental-api/policy/auth-session-policy.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/repositories/in-memory-worker-rental-repository.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/transactions/confirm-rental-transaction-service.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/routes/worker-rental-routes-v2.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/sql/worker-rental-confirm-transaction-template.sql"
check_file "${IMPL_ROOT}/tests/run-worker-rental-backend-transaction-tests.js"

check_term "confirmRental" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "issueMonthlyFreeTicketIfNeeded" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "monthly_shortest_contract_free_ticket" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "shortest_contract_duration" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "CasualChatWorker" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "casual_chat_worker" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "120" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "500" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "confirmed_price_jpy" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "User scope mismatch" "${IMPL_ROOT}/backend/worker-rental-api"

check_absent_runtime "DATABASE_URL=" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent_runtime "service_role" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent_runtime "supabase_key" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent_runtime "DROP TABLE" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent_runtime "TRUNCATE TABLE" "${IMPL_ROOT}/backend/worker-rental-api"

if command -v node >/dev/null 2>&1; then
  for js in \
    "${IMPL_ROOT}/backend/worker-rental-api/policy/auth-session-policy.js" \
    "${IMPL_ROOT}/backend/worker-rental-api/repositories/in-memory-worker-rental-repository.js" \
    "${IMPL_ROOT}/backend/worker-rental-api/transactions/confirm-rental-transaction-service.js" \
    "${IMPL_ROOT}/backend/worker-rental-api/routes/worker-rental-routes-v2.js" \
    "${IMPL_ROOT}/tests/run-worker-rental-backend-transaction-tests.js"
  do
    if node -c "$js" >/dev/null 2>&1; then
      pass "node syntax ok: $js"
    else
      fail "node syntax error: $js"
    fi
  done

  if node "${IMPL_ROOT}/tests/run-worker-rental-backend-transaction-tests.js" >> "$DETAIL" 2>&1; then
    pass "backend transaction node test passed"
  else
    fail "backend transaction node test failed"
  fi
else
  warn "node not installed; node tests skipped"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  STATUS="PASS"
else
  STATUS="FAIL"
fi

{
  echo '# WorkerRental Backend Transaction Preparation Verify'
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
  echo '- DB mutation was not executed.'
  echo '- SQL transaction file is template only.'
  echo '- In-memory transaction test validates quote/confirm/ticket flow.'
} > "$OUT"

cat "$OUT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
