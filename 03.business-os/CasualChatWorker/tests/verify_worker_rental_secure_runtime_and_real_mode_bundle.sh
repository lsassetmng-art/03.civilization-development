#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/${APP_NAME}"
VERIFY_DIR="${IMPL_ROOT}/docs/verification"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

OUT="${VERIFY_DIR}/${RUN_TS}_secure_runtime_and_real_mode_bundle_verify_run.txt"
DETAIL="${VERIFY_DIR}/${RUN_TS}_secure_runtime_and_real_mode_bundle_verify_detail.txt"

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

check_file "${DESIGN_ROOT}/080.policy/080030_CASUAL_CHAT_WORKER_SECURE_BACKEND_RUNTIME_CONFIG.md"
check_file "${DESIGN_ROOT}/070.api/070080_CASUAL_CHAT_WORKER_ENDPOINT_INTEGRATION_TEST_PLAN.md"
check_file "${DESIGN_ROOT}/090.db/090060_CASUAL_CHAT_WORKER_NONPROD_DB_DRY_RUN_DESIGN.md"
check_file "${DESIGN_ROOT}/170.implementation-ready-freeze/170070_CASUAL_CHAT_WORKER_REAL_MODE_SWITCH_BUNDLE.md"
check_file "${DESIGN_ROOT}/060.integration/060080_CASUAL_CHAT_WORKER_SECURE_RUNTIME_REAL_MODE_APPEND.md"

check_file "${IMPL_ROOT}/backend/worker-rental-api/runtime/backend-runtime-config.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/server/local-in-memory-worker-rental-server.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/integration/nonprod-db-dry-run-rollback-test.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/docs/real-mode-switch-bundle.md"
check_file "${IMPL_ROOT}/tests/run-worker-rental-backend-runtime-config-tests.js"
check_file "${IMPL_ROOT}/tests/run-worker-rental-local-endpoint-integration-tests.js"

check_term "local_in_memory" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "nonprod_db_dry_run" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "ROLLBACK" "${IMPL_ROOT}/backend/worker-rental-api/integration/nonprod-db-dry-run-rollback-test.js"
check_term "CCW_ENABLE_NONPROD_DB_DRY_RUN" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "CCW_CONFIRM_ROLLBACK_TEST" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "createLocalInMemoryServer" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "runPayloadGapCheck" "${IMPL_ROOT}/tests/run-worker-rental-local-endpoint-integration-tests.js"
check_term "150" "${IMPL_ROOT}/tests/run-worker-rental-local-endpoint-integration-tests.js"
check_term "final_price_jpy" "${IMPL_ROOT}/tests/run-worker-rental-local-endpoint-integration-tests.js"

check_absent "DROP TABLE" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent "TRUNCATE TABLE" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent "DELETE FROM" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent "service_role" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent "supabase_key" "${IMPL_ROOT}/backend/worker-rental-api"

if command -v node >/dev/null 2>&1; then
  for js in \
    "${IMPL_ROOT}/backend/worker-rental-api/runtime/backend-runtime-config.js" \
    "${IMPL_ROOT}/backend/worker-rental-api/server/local-in-memory-worker-rental-server.js" \
    "${IMPL_ROOT}/backend/worker-rental-api/integration/nonprod-db-dry-run-rollback-test.js" \
    "${IMPL_ROOT}/tests/run-worker-rental-backend-runtime-config-tests.js" \
    "${IMPL_ROOT}/tests/run-worker-rental-local-endpoint-integration-tests.js"
  do
    if node -c "$js" >/dev/null 2>&1; then
      pass "node syntax ok: $js"
    else
      fail "node syntax error: $js"
    fi
  done

  for test_js in \
    "${IMPL_ROOT}/tests/run-worker-rental-backend-runtime-config-tests.js" \
    "${IMPL_ROOT}/tests/run-worker-rental-local-endpoint-integration-tests.js"
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
  echo '# WorkerRental Secure Runtime and Real Mode Bundle Verify'
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
  echo '- DB was not executed by this verify.'
  echo '- Local endpoint integration uses in-memory repository.'
  echo '- Non-production DB dry-run runner is generated but blocked by flags.'
  echo '- Real mode remains disabled.'
} > "$OUT"

cat "$OUT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
