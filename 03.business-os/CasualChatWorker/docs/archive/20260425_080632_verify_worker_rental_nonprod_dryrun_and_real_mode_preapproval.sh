#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/${APP_NAME}"
VERIFY_DIR="${IMPL_ROOT}/docs/verification"
RUN_TS="$(date +%Y%m%d_%H%M%S)"

OUT="${VERIFY_DIR}/${RUN_TS}_nonprod_dryrun_real_mode_preapproval_verify_run.txt"
DETAIL="${VERIFY_DIR}/${RUN_TS}_nonprod_dryrun_real_mode_preapproval_verify_detail.txt"

mkdir -p "$VERIFY_DIR"
: > "$OUT"
: > "$DETAIL"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() { PASS_COUNT=$((PASS_COUNT + 1)); echo "PASS: $1" >> "$DETAIL"; }
fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); echo "FAIL: $1" >> "$DETAIL"; }
warn() { WARN_COUNT=$((WARN_COUNT + 1)); echo "WARN: $1" >> "$DETAIL"; }

check_file() {
  file="$1"
  if [ -f "$file" ]; then pass "file exists: $file"; else fail "file missing: $file"; fi
}

check_term() {
  term="$1"
  target="$2"
  if grep -RIn "$term" "$target" >/dev/null 2>&1; then pass "term found: $term"; else warn "term missing: $term"; fi
}

check_file "${DESIGN_ROOT}/090.db/090070_CASUAL_CHAT_WORKER_NONPROD_ROLLBACK_DRY_RUN_EXECUTION_GATE.md"
check_file "${DESIGN_ROOT}/070.api/070090_CASUAL_CHAT_WORKER_LIVE_PAYLOAD_GAP_CHECK_EXACT.md"
check_file "${DESIGN_ROOT}/170.implementation-ready-freeze/170080_CASUAL_CHAT_WORKER_REAL_MODE_PREAPPROVAL_GATE.md"
check_file "${DESIGN_ROOT}/080.policy/080040_CASUAL_CHAT_WORKER_REAL_MODE_SECURITY_POLICY_APPEND.md"
check_file "${DESIGN_ROOT}/060.integration/060090_CASUAL_CHAT_WORKER_NONPROD_DRYRUN_REAL_MODE_PREAPPROVAL_APPEND.md"

check_file "${IMPL_ROOT}/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh"
check_file "${IMPL_ROOT}/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js"
check_file "${IMPL_ROOT}/backend/worker-rental-api/runtime/real-mode-preflight-check.js"

check_term "CCW_APPROVE_NONPROD_DB_DRY_RUN" "${IMPL_ROOT}/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh"
check_term "ROLLBACK DONE" "${IMPL_ROOT}/backend/worker-rental-api/integration/run-nonprod-db-dry-run-gated.sh"
check_term "CCW_APPROVE_LIVE_PAYLOAD_GAP_CHECK" "${IMPL_ROOT}/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js"
check_term "CCW_ALLOW_LIVE_CONFIRM_TEST" "${IMPL_ROOT}/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js"
check_term "150 minute quote must be rejected" "${IMPL_ROOT}/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js"
check_term "REAL MODE PREFLIGHT PASS" "${IMPL_ROOT}/backend/worker-rental-api/runtime/real-mode-preflight-check.js"

if command -v node >/dev/null 2>&1; then
  for js in \
    "${IMPL_ROOT}/backend/worker-rental-api/payload-gap/live-payload-gap-checker-runner.js" \
    "${IMPL_ROOT}/backend/worker-rental-api/runtime/real-mode-preflight-check.js"
  do
    if node -c "$js" >/dev/null 2>&1; then
      pass "node syntax ok: $js"
    else
      fail "node syntax error: $js"
    fi
  done

  if node "${IMPL_ROOT}/backend/worker-rental-api/runtime/real-mode-preflight-check.js" >> "$DETAIL" 2>&1; then
    pass "real mode preflight passed"
  else
    fail "real mode preflight failed"
  fi

  if [ -f "${IMPL_ROOT}/tests/run-worker-rental-local-endpoint-integration-tests.js" ]; then
    if node "${IMPL_ROOT}/tests/run-worker-rental-local-endpoint-integration-tests.js" >> "$DETAIL" 2>&1; then
      pass "local endpoint integration passed"
    else
      fail "local endpoint integration failed"
    fi
  else
    warn "local endpoint integration test missing"
  fi
else
  warn "node not installed; node checks skipped"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then STATUS="PASS"; else STATUS="FAIL"; fi

{
  echo '# WorkerRental NonProd DryRun and Real Mode PreApproval Verify'
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
  echo '- Non-production DB dry-run wrapper was generated only.'
  echo '- Live payload gap runner was generated only.'
  echo '- Frontend real mode remains disabled.'
} > "$OUT"

cat "$OUT"

if [ "$FAIL_COUNT" -eq 0 ]; then exit 0; else exit 1; fi
