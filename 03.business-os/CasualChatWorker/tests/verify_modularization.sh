#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
VERIFY_DIR="${IMPL_ROOT}/docs/verification"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
OUT="${VERIFY_DIR}/${RUN_TS}_modular_verify_run.txt"

mkdir -p "$VERIFY_DIR"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  echo "PASS: $1" >> "$OUT"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "FAIL: $1" >> "$OUT"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  echo "WARN: $1" >> "$OUT"
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

: > "$OUT"

check_file "${IMPL_ROOT}/domain/constants.js"
check_file "${IMPL_ROOT}/pricing/pricing-domain.js"
check_file "${IMPL_ROOT}/ticket/free-ticket-domain.js"
check_file "${IMPL_ROOT}/safety/safety-policy.js"
check_file "${IMPL_ROOT}/aiworker-reference/mock-aiworker-reference.js"
check_file "${IMPL_ROOT}/cx-reference/mock-cx-material.js"
check_file "${IMPL_ROOT}/api-client/mock-business-api-client.js"
check_file "${IMPL_ROOT}/state/app-state.js"
check_file "${IMPL_ROOT}/components/ui-renderers.js"
check_file "${IMPL_ROOT}/screens/screen-router.js"
check_file "${IMPL_ROOT}/app/assets/js/app.modular.js"
check_file "${IMPL_ROOT}/app/index.html"

check_term "app.modular.js" "${IMPL_ROOT}/app/index.html"
check_term "../domain/constants.js" "${IMPL_ROOT}/app/index.html"
check_term "../api-client/mock-business-api-client.js" "${IMPL_ROOT}/app/index.html"
check_term "monthlyFreeTicket" "${IMPL_ROOT}"
check_term "grantedTicketCount: 2" "${IMPL_ROOT}"
check_term "minutesPerTicket: 30" "${IMPL_ROOT}"
check_term "Friend" "${IMPL_ROOT}"
check_term "Lover" "${IMPL_ROOT}"
check_term "擬似恋人" "${IMPL_ROOT}"
check_term "レンタル彼氏" "${IMPL_ROOT}"
check_term "現実の交際関係ではありません" "${IMPL_ROOT}"
check_term "business" "${IMPL_ROOT}"
check_term "aiworker" "${IMPL_ROOT}"
check_term "cx22073jw" "${IMPL_ROOT}"

if command -v node >/dev/null 2>&1; then
  for js in \
    "${IMPL_ROOT}/domain/constants.js" \
    "${IMPL_ROOT}/pricing/pricing-domain.js" \
    "${IMPL_ROOT}/ticket/free-ticket-domain.js" \
    "${IMPL_ROOT}/safety/safety-policy.js" \
    "${IMPL_ROOT}/aiworker-reference/mock-aiworker-reference.js" \
    "${IMPL_ROOT}/cx-reference/mock-cx-material.js" \
    "${IMPL_ROOT}/api-client/mock-business-api-client.js" \
    "${IMPL_ROOT}/state/app-state.js" \
    "${IMPL_ROOT}/components/ui-renderers.js" \
    "${IMPL_ROOT}/screens/screen-router.js" \
    "${IMPL_ROOT}/app/assets/js/app.modular.js"
  do
    if node -c "$js" >/dev/null 2>&1; then
      pass "node syntax ok: $js"
    else
      fail "node syntax error: $js"
    fi
  done
else
  warn "node not installed; syntax check skipped"
fi

if grep -RIn "psql" "$IMPL_ROOT" >/dev/null 2>&1; then
  fail "forbidden psql found"
else
  pass "forbidden psql absent"
fi

if grep -RIn "service_role" "$IMPL_ROOT" >/dev/null 2>&1; then
  fail "forbidden service_role found"
else
  pass "forbidden service_role absent"
fi

if [ "$FAIL_COUNT" -eq 0 ]; then
  STATUS="PASS"
else
  STATUS="FAIL"
fi

{
  echo '# CasualChatWorker Modularization Verify'
  echo
  echo "status: ${STATUS}"
  echo "generated_at: ${RUN_TS}"
  echo
  echo 'counts:'
  echo "- PASS_COUNT: ${PASS_COUNT}"
  echo "- FAIL_COUNT: ${FAIL_COUNT}"
  echo "- WARN_COUNT: ${WARN_COUNT}"
  echo
  echo "detail: ${OUT}"
} > "${OUT}.summary"

cat "${OUT}.summary"

if [ "$FAIL_COUNT" -eq 0 ]; then
  exit 0
else
  exit 1
fi
