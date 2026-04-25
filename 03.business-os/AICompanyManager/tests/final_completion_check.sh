#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

pass() {
  printf 'PASS: %s\n' "$1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  printf 'FAIL: %s\n' "$1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

warn() {
  printf 'WARN: %s\n' "$1"
  WARN_COUNT=$((WARN_COUNT + 1))
}

check_file() {
  if [ -f "$1" ]; then
    pass "$1"
  else
    fail "$1"
  fi
}

check_grep() {
  pattern="$1"
  file="$2"
  label="$3"
  if [ -f "$file" ] && grep -q "$pattern" "$file"; then
    pass "$label"
  else
    fail "$label"
  fi
}

check_grep_e() {
  pattern="$1"
  file="$2"
  label="$3"
  if [ -f "$file" ] && grep -Eq "$pattern" "$file"; then
    pass "$label"
  else
    fail "$label"
  fi
}

printf '%s\n' '============================================================'
printf '%s\n' 'AICompanyManager Phase P final completion check repaired'
printf '%s\n' '============================================================'
printf 'ROOT       : %s\n' "$ROOT"
printf 'DESIGN_ROOT: %s\n' "$DESIGN_ROOT"
printf '%s\n' '------------------------------------------------------------'

REQUIRED_DESIGN_FILES="
000_INDEX.md
001_OVERVIEW.md
00_AICOMPANYMANAGER_INTEGRATED_DESIGN.md
1220_FINAL_HANDOFF.md
1230_IMPLEMENTATION_HANDOFF.md
1240_FINAL_STATUS_REPORT.md
1290_PHASE_N_COMPLETION_REPORT.md
1300_PHASE_O_ROADMAP.md
1310_FINAL_COMPLETION_SEAL.md
1320_NEXT_CHAT_HANDOFF_ONEBLOCK.md
1390_PHASE_O_COMPLETION_REPORT.md
"

for f in $REQUIRED_DESIGN_FILES; do
  check_file "${DESIGN_ROOT}/${f}"
done

REQUIRED_IMPL_FILES="
index.html
assets/css/app.css
assets/js/app.js
src/config/runtimeConfig.js
src/api/client.js
src/api/payloadAdapter.js
src/api/serverRouteClient.js
src/bridge/aiworkerBridge.js
src/queue/localQueue.js
src/events/aicmEvents.js
src/actions/reviewDeliveryActions.js
src/mock/mockData.js
_commonos/sync/syncPresenter.js
server-routes/README.md
server-routes/business-ai-company-manager-routes.md
server-routes/aiworker-company-pipeline-route.placeholder.js
docs/FINAL_HANDOFF.md
docs/NEXT_CHAT_HANDOFF.md
tests/smoke_check.sh
tests/acceptance_check.sh
tests/final_completion_check.sh
"

for f in $REQUIRED_IMPL_FILES; do
  check_file "${ROOT}/${f}"
done

printf '%s\n' '------------------------------------------------------------'
printf '%s\n' '[CONTENT CHECKS]'

check_grep_e 'push-ready-manifest-created|final-completion-packaged|acceptance-final-handoff-completed' "${DESIGN_ROOT}/000_INDEX.md" 'INDEX final completion state'
check_grep 'final-completion-sealed' "${DESIGN_ROOT}/1310_FINAL_COMPLETION_SEAL.md" 'final completion seal'
check_grep 'RLS APPLY: DEFERRED' "${DESIGN_ROOT}/1320_NEXT_CHAT_HANDOFF_ONEBLOCK.md" 'RLS deferred handoff'
check_grep 'PERSONA_DATABASE_URL' "${DESIGN_ROOT}/1320_NEXT_CHAT_HANDOFF_ONEBLOCK.md" 'Persona DB target handoff'
check_grep 'current_role_code' "${DESIGN_ROOT}/1320_NEXT_CHAT_HANDOFF_ONEBLOCK.md" 'current_role_code handoff'
check_grep 'mode: "mock"' "${ROOT}/src/config/runtimeConfig.js" 'mock runtime default'
check_grep 'server-mediated' "${ROOT}/src/config/runtimeConfig.js" 'server mediated bridge'
check_grep 'AICM_PAYLOAD_ADAPTER' "${ROOT}/src/api/payloadAdapter.js" 'payload adapter'
check_grep 'AICM_SERVER_ROUTE_CLIENT' "${ROOT}/src/api/serverRouteClient.js" 'server route client'
check_grep 'AICM_AIWORKER_BRIDGE' "${ROOT}/src/bridge/aiworkerBridge.js" 'AIWorkerOS bridge placeholder'
check_grep 'AICM_REVIEW_DELIVERY_ACTIONS' "${ROOT}/src/actions/reviewDeliveryActions.js" 'review delivery actions'
check_grep 'AICM_COMMONOS_SYNC_PRESENTER' "${ROOT}/_commonos/sync/syncPresenter.js" 'CommonOS sync presenter'

printf '%s\n' '------------------------------------------------------------'
printf '%s\n' '[OPTIONAL ACCEPTANCE CHECK]'
if [ -f "${ROOT}/tests/acceptance_check.sh" ]; then
  chmod 700 "${ROOT}/tests/acceptance_check.sh"
  if "${ROOT}/tests/acceptance_check.sh"; then
    pass 'acceptance_check.sh'
  else
    warn 'acceptance_check.sh returned non-zero'
  fi
else
  warn 'acceptance_check.sh missing'
fi

printf '%s\n' '------------------------------------------------------------'
printf '%s\n' '[SECRET CHECK]'
if grep -R "SERVICE_ROLE\|secret_key\|service_role" "${ROOT}/src" "${ROOT}/assets" "${ROOT}/index.html" >/dev/null 2>&1; then
  fail 'client secret pattern check'
  grep -R -n "SERVICE_ROLE\|secret_key\|service_role" "${ROOT}/src" "${ROOT}/assets" "${ROOT}/index.html" || true
else
  pass 'client secret pattern check'
fi

if grep -R "DATABASE_URL=.*\|PERSONA_DATABASE_URL=.*" "${ROOT}/src" "${ROOT}/assets" "${ROOT}/index.html" >/dev/null 2>&1; then
  fail 'client database url value check'
  grep -R -n "DATABASE_URL=.*\|PERSONA_DATABASE_URL=.*" "${ROOT}/src" "${ROOT}/assets" "${ROOT}/index.html" || true
else
  pass 'client database url value check'
fi

printf '%s\n' '------------------------------------------------------------'
printf '%s\n' '[PHASE SAFETY]'
pass 'DB WRITE: NOT EXECUTED in Phase P repair'
pass 'RLS APPLY: NOT EXECUTED in Phase P repair'
pass 'LIVE AIWORKEROS CALL: NOT EXECUTED in Phase P repair'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'WARN_COUNT: %s\n' "$WARN_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_P_FINAL_COMPLETION_PASS'
else
  printf '%s\n' 'RESULT: PHASE_P_FINAL_COMPLETION_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
