#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

REQUIRED_FILES="
index.html
assets/css/app.css
assets/js/app.js
src/config/runtimeConfig.js
src/api/payloadAdapter.js
src/api/serverRouteClient.js
src/api/client.js
src/bridge/aiworkerBridge.js
src/actions/reviewDeliveryActions.js
src/mock/mockData.js
src/events/aicmEvents.js
src/state/aicmState.js
src/queue/localQueue.js
_commonos/sync/syncPresenter.js
server-routes/README.md
server-routes/business-ai-company-manager-routes.md
server-routes/aiworker-company-pipeline-route.placeholder.js
_commonos/adapter/README.md
_commonos/bridge/README.md
_commonos/mapper/README.md
_commonos/presenter/README.md
_commonos/theme/README.md
_commonos/sync/README.md
_commonos/test/README.md
"

PASS_COUNT=0
FAIL_COUNT=0

printf '%s\n' '============================================================'
printf '%s\n' 'AICompanyManager Phase L smoke check repaired'
printf '%s\n' '============================================================'
printf 'ROOT: %s\n' "$ROOT"

for f in $REQUIRED_FILES; do
  if [ -f "${ROOT}/${f}" ]; then
    printf 'PASS: %s\n' "$f"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    printf 'FAIL: %s\n' "$f"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -ne 0 ]; then
  printf '%s\n' 'RESULT: FAIL'
  exit 1
fi

CONTENT_CHECKS=0

grep -q 'AICM_RUNTIME_CONFIG' "${ROOT}/src/config/runtimeConfig.js" && CONTENT_CHECKS=$((CONTENT_CHECKS + 1))
grep -q 'AICM_PAYLOAD_ADAPTER' "${ROOT}/src/api/payloadAdapter.js" && CONTENT_CHECKS=$((CONTENT_CHECKS + 1))
grep -q 'current_role_code' "${ROOT}/src/api/payloadAdapter.js" && CONTENT_CHECKS=$((CONTENT_CHECKS + 1))
grep -q 'AICM_SERVER_ROUTE_CLIENT' "${ROOT}/src/api/serverRouteClient.js" && CONTENT_CHECKS=$((CONTENT_CHECKS + 1))
grep -q 'server-mediated' "${ROOT}/src/config/runtimeConfig.js" && CONTENT_CHECKS=$((CONTENT_CHECKS + 1))
grep -q 'No service role key in browser' "${ROOT}/server-routes/business-ai-company-manager-routes.md" && CONTENT_CHECKS=$((CONTENT_CHECKS + 1))
grep -q 'placeholder only' "${ROOT}/server-routes/README.md" && CONTENT_CHECKS=$((CONTENT_CHECKS + 1))
grep -q 'startCompanyPipelinePlaceholder' "${ROOT}/server-routes/aiworker-company-pipeline-route.placeholder.js" && CONTENT_CHECKS=$((CONTENT_CHECKS + 1))
grep -q './src/config/runtimeConfig.js' "${ROOT}/index.html" && CONTENT_CHECKS=$((CONTENT_CHECKS + 1))
grep -q './src/api/payloadAdapter.js' "${ROOT}/index.html" && CONTENT_CHECKS=$((CONTENT_CHECKS + 1))
grep -q './src/api/serverRouteClient.js' "${ROOT}/index.html" && CONTENT_CHECKS=$((CONTENT_CHECKS + 1))

if [ "$CONTENT_CHECKS" -eq 11 ]; then
  printf '%s\n' 'CONTENT_CHECK: PASS'
else
  printf 'CONTENT_CHECK: FAIL count=%s\n' "$CONTENT_CHECKS"
  printf '%s\n' '---- diagnostic ----'
  grep -n 'runtimeConfig.js\|payloadAdapter.js\|serverRouteClient.js' "${ROOT}/index.html" || true
  grep -n 'placeholder only' "${ROOT}/server-routes/README.md" || true
  grep -n 'No service role key in browser' "${ROOT}/server-routes/business-ai-company-manager-routes.md" || true
  exit 1
fi

if grep -R "SERVICE_ROLE\\|DATABASE_URL\\|secret_key\\|service_role" "${ROOT}/src" "${ROOT}/assets" "${ROOT}/index.html" >/dev/null 2>&1; then
  printf '%s\n' 'SECRET_CHECK: FAIL'
  grep -R -n "SERVICE_ROLE\\|DATABASE_URL\\|secret_key\\|service_role" "${ROOT}/src" "${ROOT}/assets" "${ROOT}/index.html" || true
  exit 1
else
  printf '%s\n' 'SECRET_CHECK: PASS'
fi

printf '%s\n' 'RESULT: PASS'
printf '%s\n' '============================================================'
