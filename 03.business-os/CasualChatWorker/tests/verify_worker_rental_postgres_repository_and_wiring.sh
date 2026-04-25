#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/${APP_NAME}"
VERIFY_DIR="${IMPL_ROOT}/docs/verification"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

OUT="${VERIFY_DIR}/${RUN_TS}_postgres_repository_and_wiring_verify_run.txt"
DETAIL="${VERIFY_DIR}/${RUN_TS}_postgres_repository_and_wiring_verify_detail.txt"

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

check_file "${DESIGN_ROOT}/070.api/070060_CASUAL_CHAT_WORKER_WORKER_RENTAL_POSTGRES_REPOSITORY_EXACT.md"
check_file "${DESIGN_ROOT}/070.api/070070_CASUAL_CHAT_WORKER_WORKER_RENTAL_HTTP_WIRING_CANDIDATE.md"
check_file "${DESIGN_ROOT}/090.db/090050_CASUAL_CHAT_WORKER_WORKER_RENTAL_PAYLOAD_GAP_CHECKER_EXACT.md"
check_file "${DESIGN_ROOT}/060.integration/060070_CASUAL_CHAT_WORKER_POSTGRES_REPOSITORY_AND_WIRING_APPEND.md"
check_file "${DESIGN_ROOT}/170.implementation-ready-freeze/170060_CASUAL_CHAT_WORKER_REAL_MODE_FINAL_GATE.md"

check_file "${IMPL_ROOT}/backend/worker-rental-api/repositories/postgres-worker-rental-repository.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/server/worker-rental-http-router.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/payload-gap/payload-gap-checker.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/docs/endpoint-wiring-candidate.md"

check_file "${IMPL_ROOT}/tests/run-worker-rental-postgres-repository-skeleton-tests.js"
check_file "${IMPL_ROOT}/tests/run-worker-rental-http-router-tests.js"
check_file "${IMPL_ROOT}/tests/run-worker-rental-payload-gap-checker-tests.js"

check_term "createPostgresWorkerRentalRepository" "${IMPL_ROOT}/backend/worker-rental-api/repositories/postgres-worker-rental-repository.js"
check_term "createWorkerRentalHttpHandler" "${IMPL_ROOT}/backend/worker-rental-api/server/worker-rental-http-router.js"
check_term "runPayloadGapCheck" "${IMPL_ROOT}/backend/worker-rental-api/payload-gap/payload-gap-checker.js"
check_term "worker_rental_contract" "${IMPL_ROOT}/backend/worker-rental-api/repositories/postgres-worker-rental-repository.js"
check_term "worker_rental_entitlement_balance" "${IMPL_ROOT}/backend/worker-rental-api/repositories/postgres-worker-rental-repository.js"
check_term "shortest_contract_duration" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "CasualChatWorker" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "casual_chat_worker" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "rental_unit_count" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "final_price_jpy" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "remaining_entitlement_count" "${IMPL_ROOT}/backend/worker-rental-api"

check_absent_runtime "DROP TABLE" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent_runtime "TRUNCATE TABLE" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent_runtime "DELETE FROM" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent_runtime "DATABASE_URL=" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent_runtime "service_role" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent_runtime "supabase_key" "${IMPL_ROOT}/backend/worker-rental-api"

if command -v node >/dev/null 2>&1; then
  for js in \
    "${IMPL_ROOT}/backend/worker-rental-api/repositories/postgres-worker-rental-repository.js" \
    "${IMPL_ROOT}/backend/worker-rental-api/server/worker-rental-http-router.js" \
    "${IMPL_ROOT}/backend/worker-rental-api/payload-gap/payload-gap-checker.js" \
    "${IMPL_ROOT}/tests/run-worker-rental-postgres-repository-skeleton-tests.js" \
    "${IMPL_ROOT}/tests/run-worker-rental-http-router-tests.js" \
    "${IMPL_ROOT}/tests/run-worker-rental-payload-gap-checker-tests.js"
  do
    if node -c "$js" >/dev/null 2>&1; then
      pass "node syntax ok: $js"
    else
      fail "node syntax error: $js"
    fi
  done

  for test_js in \
    "${IMPL_ROOT}/tests/run-worker-rental-postgres-repository-skeleton-tests.js" \
    "${IMPL_ROOT}/tests/run-worker-rental-http-router-tests.js" \
    "${IMPL_ROOT}/tests/run-worker-rental-payload-gap-checker-tests.js"
  do
    if node "$test_js" >> "$DETAIL" 2>&1; then
      pass "node test passed: $test_js"
    else
      fail "node test failed: $test_js"
    fi
  done
else
  warn "node not installed; node tests skipped"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  STATUS="PASS"
else
  STATUS="FAIL"
fi

{
  echo '# WorkerRental PostgreSQL Repository and Wiring Verify'
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
  echo '- DB was not executed.'
  echo '- PostgreSQL repository was tested with mock pool only.'
  echo '- HTTP router was tested with in-memory repository only.'
  echo '- Real mode remains disabled.'
} > "$OUT"

cat "$OUT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
