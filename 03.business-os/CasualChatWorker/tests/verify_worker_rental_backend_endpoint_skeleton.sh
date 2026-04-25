#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/${APP_NAME}"
VERIFY_DIR="${IMPL_ROOT}/docs/verification"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

OUT="${VERIFY_DIR}/${RUN_TS}_backend_endpoint_skeleton_verify_run.txt"
DETAIL="${VERIFY_DIR}/${RUN_TS}_backend_endpoint_skeleton_verify_detail.txt"

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

check_file "${DESIGN_ROOT}/070.api/070040_CASUAL_CHAT_WORKER_WORKER_RENTAL_BACKEND_ENDPOINT_EXACT.md"
check_file "${DESIGN_ROOT}/060.integration/060050_CASUAL_CHAT_WORKER_BACKEND_ENDPOINT_INTEGRATED_APPEND.md"
check_file "${DESIGN_ROOT}/170.implementation-ready-freeze/170040_CASUAL_CHAT_WORKER_BACKEND_REAL_MODE_WAITING_GATE.md"

check_file "${IMPL_ROOT}/backend/worker-rental-api/README.md"
check_file "${IMPL_ROOT}/backend/worker-rental-api/worker-rental-backend-service.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/routes/worker-rental-routes.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/sql/worker-rental-backend-sql-templates.sql"
check_file "${IMPL_ROOT}/tests/run-worker-rental-backend-skeleton-tests.js"

check_term "CasualChatWorker" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "casual_chat_worker" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "shortest_contract_duration" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "120" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "500" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "postQuote" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "postConfirm" "${IMPL_ROOT}/backend/worker-rental-api"
check_term "v_worker_rental_service_catalog_active" "${IMPL_ROOT}/backend/worker-rental-api"

check_absent "DROP TABLE" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent "TRUNCATE TABLE" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent "DELETE FROM" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent "DATABASE_URL=" "${IMPL_ROOT}/backend/worker-rental-api"
check_absent "service_role" "${IMPL_ROOT}/backend/worker-rental-api"

if command -v node >/dev/null 2>&1; then
  for js in \
    "${IMPL_ROOT}/backend/worker-rental-api/worker-rental-backend-service.js" \
    "${IMPL_ROOT}/backend/worker-rental-api/routes/worker-rental-routes.js" \
    "${IMPL_ROOT}/tests/run-worker-rental-backend-skeleton-tests.js"
  do
    if node -c "$js" >/dev/null 2>&1; then
      pass "node syntax ok: $js"
    else
      fail "node syntax error: $js"
    fi
  done

  if node "${IMPL_ROOT}/tests/run-worker-rental-backend-skeleton-tests.js" >> "$DETAIL" 2>&1; then
    pass "backend skeleton node test passed"
  else
    fail "backend skeleton node test failed"
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
  echo '# WorkerRental Backend Endpoint Skeleton Verify'
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
  echo '- Backend skeleton is dependency-injected and not wired to production server yet.'
  echo '- Frontend real mode remains gated.'
} > "$OUT"

cat "$OUT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
