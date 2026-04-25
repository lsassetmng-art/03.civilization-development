#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() { PASS_COUNT=$((PASS_COUNT + 1)); echo "PASS: $1"; }
fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); echo "FAIL: $1"; }
warn() { WARN_COUNT=$((WARN_COUNT + 1)); echo "WARN: $1"; }

check_file() {
  f="$1"
  label="$2"
  if [ -f "$f" ]; then pass "$label exists: $f"; else fail "$label missing: $f"; fi
}

check_file "${IMPL_ROOT}/domain/runtime-config.js" "frontend runtime config"
check_file "${IMPL_ROOT}/api-client/real-worker-rental-api-adapter.js" "real API adapter"
check_file "${IMPL_ROOT}/repository/worker-rental-repository.js" "worker rental repository"
check_file "${IMPL_ROOT}/backend/worker-rental-api/runtime/real-mode-preflight-check.js" "real mode preflight"
check_file "${IMPL_ROOT}/backend/worker-rental-api/payload-gap/payload-gap-checker.js" "payload gap checker"

SECRET_FOUND=0
for d in "${IMPL_ROOT}/app" "${IMPL_ROOT}/domain" "${IMPL_ROOT}/api-client" "${IMPL_ROOT}/components" "${IMPL_ROOT}/screens"; do
  if [ -d "$d" ]; then
    if grep -RInE 'DATABASE_URL=|PERSONA_DATABASE_URL=|service_role|supabase_key|psql ' "$d" >/dev/null 2>&1; then
      fail "frontend forbidden secret/DB term found in $d"
      SECRET_FOUND=1
    else
      pass "frontend secret scan clear: $d"
    fi
  fi
done

if command -v node >/dev/null 2>&1; then
  if node "${IMPL_ROOT}/backend/worker-rental-api/runtime/real-mode-preflight-check.js"; then
    pass "real mode preflight passed"
  else
    fail "real mode preflight failed"
  fi

  if [ -f "${IMPL_ROOT}/tests/run-worker-rental-local-endpoint-integration-tests.js" ]; then
    if node "${IMPL_ROOT}/tests/run-worker-rental-local-endpoint-integration-tests.js"; then
      pass "local endpoint integration passed"
    else
      fail "local endpoint integration failed"
    fi
  else
    warn "local endpoint integration test missing"
  fi
else
  warn "node not installed; node tests skipped"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  STATUS="PASS"
else
  STATUS="FAIL"
fi

echo '============================================================'
echo "PHASE_O_READINESS_STATUS=$STATUS"
echo "PASS_COUNT=$PASS_COUNT"
echo "FAIL_COUNT=$FAIL_COUNT"
echo "WARN_COUNT=$WARN_COUNT"
echo '============================================================'

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
