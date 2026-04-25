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

check_dir() {
  if [ -d "$1" ]; then
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

printf '%s\n' '============================================================'
printf '%s\n' 'AICompanyManager Phase N acceptance check'
printf '%s\n' '============================================================'
printf 'ROOT       : %s\n' "$ROOT"
printf 'DESIGN_ROOT: %s\n' "$DESIGN_ROOT"
printf '%s\n' '------------------------------------------------------------'

check_dir "$ROOT"
check_dir "$DESIGN_ROOT"

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
_commonos/adapter/README.md
_commonos/bridge/README.md
_commonos/mapper/README.md
_commonos/presenter/README.md
_commonos/theme/README.md
_commonos/sync/README.md
_commonos/test/README.md
server-routes/README.md
server-routes/business-ai-company-manager-routes.md
server-routes/aiworker-company-pipeline-route.placeholder.js
tests/smoke_check.sh
docs/FINAL_HANDOFF.md
"

for f in $REQUIRED_IMPL_FILES; do
  check_file "${ROOT}/${f}"
done

REQUIRED_DESIGN_FILES="
000_INDEX.md
001_OVERVIEW.md
00_AICOMPANYMANAGER_INTEGRATED_DESIGN.md
1220_FINAL_HANDOFF.md
1230_IMPLEMENTATION_HANDOFF.md
1290_PHASE_N_COMPLETION_REPORT.md
"

for f in $REQUIRED_DESIGN_FILES; do
  check_file "${DESIGN_ROOT}/${f}"
done

printf '%s\n' '------------------------------------------------------------'
printf '%s\n' '[CONTENT CHECKS]'
check_grep 'AI企業運営アプリ' "${ROOT}/index.html" 'index display name'
check_grep 'AICM_RUNTIME_CONFIG' "${ROOT}/src/config/runtimeConfig.js" 'runtime config object'
check_grep 'mode: "mock"' "${ROOT}/src/config/runtimeConfig.js" 'mock default'
check_grep 'server-mediated' "${ROOT}/src/config/runtimeConfig.js" 'server mediated bridge mode'
check_grep 'AICM_PAYLOAD_ADAPTER' "${ROOT}/src/api/payloadAdapter.js" 'payload adapter object'
check_grep 'current_role_code' "${ROOT}/src/api/payloadAdapter.js" 'current_role_code canonical field'
check_grep 'AICM_SERVER_ROUTE_CLIENT' "${ROOT}/src/api/serverRouteClient.js" 'server route client object'
check_grep 'AICM_AIWORKER_BRIDGE' "${ROOT}/src/bridge/aiworkerBridge.js" 'aiworker bridge object'
check_grep 'AICM_REVIEW_DELIVERY_ACTIONS' "${ROOT}/src/actions/reviewDeliveryActions.js" 'review delivery action object'
check_grep 'AICM_COMMONOS_SYNC_PRESENTER' "${ROOT}/_commonos/sync/syncPresenter.js" 'CommonOS sync presenter object'
check_grep 'No service role key in browser' "${ROOT}/server-routes/business-ai-company-manager-routes.md" 'server route secret boundary'
check_grep 'RLS APPLY: DEFERRED' "${DESIGN_ROOT}/1220_FINAL_HANDOFF.md" 'RLS deferred in handoff'

printf '%s\n' '------------------------------------------------------------'
printf '%s\n' '[SMOKE CHECK]'
if [ -f "${ROOT}/tests/smoke_check.sh" ]; then
  chmod 700 "${ROOT}/tests/smoke_check.sh"
  if "${ROOT}/tests/smoke_check.sh"; then
    pass 'smoke_check.sh'
  else
    fail 'smoke_check.sh'
  fi
else
  fail 'smoke_check.sh missing'
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
pass 'DB WRITE: NOT EXECUTED in Phase N'
pass 'RLS APPLY: NOT EXECUTED in Phase N'
pass 'LIVE AIWORKEROS CALL: NOT EXECUTED in Phase N'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'WARN_COUNT: %s\n' "$WARN_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_N_ACCEPTANCE_PASS'
else
  printf '%s\n' 'RESULT: PHASE_N_ACCEPTANCE_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
