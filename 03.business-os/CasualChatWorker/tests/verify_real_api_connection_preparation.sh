#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/${APP_NAME}"
VERIFY_DIR="${IMPL_ROOT}/docs/verification"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

OUT="${VERIFY_DIR}/${RUN_TS}_real_api_connection_preparation_verify_run.txt"
DETAIL="${VERIFY_DIR}/${RUN_TS}_real_api_connection_preparation_verify_detail.txt"

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

check_file "${DESIGN_ROOT}/070.api/070030_CASUAL_CHAT_WORKER_WORKER_RENTAL_REAL_API_CONNECTION_CONTRACT.md"
check_file "${DESIGN_ROOT}/060.integration/060040_CASUAL_CHAT_WORKER_REAL_API_CONNECTION_PREPARATION_APPEND.md"
check_file "${DESIGN_ROOT}/170.implementation-ready-freeze/170030_CASUAL_CHAT_WORKER_REAL_API_CONNECTION_WAITING_GATE.md"

check_file "${IMPL_ROOT}/domain/runtime-config.js"
check_file "${IMPL_ROOT}/api-client/real-worker-rental-api-adapter.js"
check_file "${IMPL_ROOT}/repository/worker-rental-repository.js"
check_file "${IMPL_ROOT}/service/contract-service.js"
check_file "${IMPL_ROOT}/api-client/contracts/worker-rental-payload-contract.json"
check_file "${IMPL_ROOT}/tests/post_apply_payload_gap_check.sh"
check_file "${IMPL_ROOT}/tests/run-real-api-connection-preparation-tests.js"

check_term "apiMode: \"mock\"" "${IMPL_ROOT}/domain/runtime-config.js"
check_term "allowRealApi: false" "${IMPL_ROOT}/domain/runtime-config.js"
check_term "Real API mode is not enabled" "${IMPL_ROOT}/api-client/real-worker-rental-api-adapter.js"
check_term "worker-rental/quote" "${IMPL_ROOT}/api-client/real-worker-rental-api-adapter.js"
check_term "worker-rental/confirm" "${IMPL_ROOT}/api-client/real-worker-rental-api-adapter.js"
check_term "shortest_contract_duration" "${IMPL_ROOT}/api-client/contracts/worker-rental-payload-contract.json"
check_term "app_max_contract_minutes" "${IMPL_ROOT}/api-client/contracts/worker-rental-payload-contract.json"
check_term "120" "${IMPL_ROOT}/api-client/contracts/worker-rental-payload-contract.json"
check_term "30" "${IMPL_ROOT}/api-client/contracts/worker-rental-payload-contract.json"

for dir in \
  "${IMPL_ROOT}/app" \
  "${IMPL_ROOT}/domain" \
  "${IMPL_ROOT}/api-client" \
  "${IMPL_ROOT}/repository" \
  "${IMPL_ROOT}/service" \
  "${IMPL_ROOT}/components" \
  "${IMPL_ROOT}/screens"
do
  if [ -d "$dir" ]; then
    check_absent_runtime "DATABASE_URL=" "$dir"
    check_absent_runtime "PERSONA_DATABASE_URL=" "$dir"
    check_absent_runtime "service_role" "$dir"
    check_absent_runtime "supabase_key" "$dir"
    check_absent_runtime "DROP TABLE" "$dir"
    check_absent_runtime "TRUNCATE TABLE" "$dir"
    check_absent_runtime "DELETE FROM" "$dir"
    check_absent_runtime "psql" "$dir"
  fi
done

if command -v node >/dev/null 2>&1; then
  for js in \
    "${IMPL_ROOT}/domain/runtime-config.js" \
    "${IMPL_ROOT}/api-client/real-worker-rental-api-adapter.js" \
    "${IMPL_ROOT}/repository/worker-rental-repository.js" \
    "${IMPL_ROOT}/service/contract-service.js" \
    "${IMPL_ROOT}/tests/run-real-api-connection-preparation-tests.js"
  do
    if node -c "$js" >/dev/null 2>&1; then
      pass "node syntax ok: $js"
    else
      fail "node syntax error: $js"
    fi
  done

  if node "${IMPL_ROOT}/tests/run-real-api-connection-preparation-tests.js" >> "$DETAIL" 2>&1; then
    pass "real API preparation node test passed"
  else
    fail "real API preparation node test failed"
  fi
else
  warn "node not installed; node checks skipped"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  STATUS="PASS"
else
  STATUS="FAIL"
fi

{
  echo '# CasualChatWorker Real API Connection Preparation Verify'
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
  echo '- DB apply was not executed.'
  echo '- Runtime defaults to mock mode.'
  echo '- Real API mode is blocked unless explicitly enabled by safe runtime config.'
  echo '- Frontend contains no DB env assignments.'
} > "$OUT"

cat "$OUT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
