#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_APP="${DESIGN_REPO}/07.applications/03.business-app/${APP_NAME}"
IMPL_APP="${IMPL_REPO}/03.business-os/${APP_NAME}"

INDEX="${IMPL_APP}/index.html"
FINAL_BUNDLE_JS="${IMPL_APP}/assets/js/phase-de-dh-workflow-final-local-ui.js"
FINAL_BUNDLE_CSS="${IMPL_APP}/assets/css/phase-de-dh-workflow-final-local-ui.css"
API_REPO_JS="${IMPL_APP}/assets/js/aicm-api-repository-candidate.js"
MODE_RESOLVER_JS="${IMPL_APP}/assets/js/aicm-repository-mode-resolver-candidate.js"

PASS=0
FAIL=0
WARN=0

ok() { echo "PASS: $1"; PASS=$((PASS + 1)); }
ng() { echo "FAIL: $1"; FAIL=$((FAIL + 1)); }
warn() { echo "WARN: $1"; WARN=$((WARN + 1)); }

check_file() {
  if [ -f "$1" ]; then ok "$1"; else ng "$1"; fi
}

check_optional_file() {
  if [ -f "$1" ]; then ok "$1"; else warn "$1 not found"; fi
}

check_grep() {
  if grep -q "$1" "$2" 2>/dev/null; then ok "$3"; else ng "$3"; fi
}

echo "============================================================"
echo "AICompanyManager Phase FU-FX API readonly connect ready check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/8300_PHASE_FU_FX_API_READONLY_CONNECT_READY_ROADMAP.md"
check_file "$DESIGN_APP/8310_API_READONLY_CONNECT_READY_CANON.md"
check_file "$DESIGN_APP/8320_READONLY_BOOTSTRAP_ENDPOINT_EXACT_DESIGN.md"
check_file "$DESIGN_APP/8330_LOCAL_REPOSITORY_ROLLBACK_PLAN.md"
check_file "$DESIGN_APP/8340_BOSS_IMPLEMENTATION_OK_REQUIRED_GATE.md"
check_file "$DESIGN_APP/8350_API_READONLY_CONNECT_READY_NO_CONNECT_GATE.md"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"
check_file "$FINAL_BUNDLE_CSS"
check_file "$API_REPO_JS"
check_file "$MODE_RESOLVER_JS"
check_optional_file "$DESIGN_APP/8290_PHASE_FQ_FT_API_PREP_FINAL_HANDOFF_PUSH_COMPLETION_REPORT.md"
check_optional_file "$IMPL_APP/tests/phase_fq_ft_api_prep_final_handoff_push_verify.sh"

echo "------------------------------------------------------------"
echo "[2] Active local state"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub disabled"
check_grep "workflow_local_stub_wiring: true" "$FINAL_BUNDLE_JS" "workflow local stub retained"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

if grep -q "aicm-api-repository-candidate.js" "$INDEX"; then
  ng "index does not load api repository candidate"
else
  ok "index does not load api repository candidate"
fi

if grep -q "aicm-repository-mode-resolver-candidate.js" "$INDEX"; then
  ng "index does not load mode resolver candidate"
else
  ok "index does not load mode resolver candidate"
fi

echo "------------------------------------------------------------"
echo "[3] Candidate safety"
check_grep "AicmApiRepositoryCandidate" "$API_REPO_JS" "api repository candidate"
check_grep "AICM_API_REPOSITORY_CANDIDATE_DISABLED" "$API_REPO_JS" "api repository disabled"
check_grep "AicmRepositoryModeResolverCandidate" "$MODE_RESOLVER_JS" "mode resolver candidate"
check_grep "BOSS_IMPLEMENTATION_OK_REQUIRED" "$MODE_RESOLVER_JS" "boss implementation ok gate"

if grep -Eq '\bfetch[[:space:]]*\(' "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
  ng "candidate does not call browser fetch"
else
  ok "candidate does not call browser fetch"
fi

if grep -Eq 'XMLHttpRequest|navigator\.sendBeacon|WebSocket' "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
  ng "candidate has no browser network primitive"
else
  ok "candidate has no browser network primitive"
fi

if grep -q "allowNetwork: true" "$FINAL_BUNDLE_JS" "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
  ng "real API network not enabled"
else
  ok "real API network not enabled"
fi

if grep -q "realApiConnect: true\|real_api_connect: true" "$FINAL_BUNDLE_JS" "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
  ng "real API connect not enabled"
else
  ok "real API connect not enabled"
fi

if grep -q "liveAiworkerosCall: true\|live_aiworkeros_call: true" "$FINAL_BUNDLE_JS" "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
  ng "live AIWorkerOS call not enabled"
else
  ok "live AIWorkerOS call not enabled"
fi

echo "------------------------------------------------------------"
echo "[4] Readonly exact and rollback"
check_grep "GET" "$DESIGN_APP/8320_READONLY_BOOTSTRAP_ENDPOINT_EXACT_DESIGN.md" "bootstrap method"
check_grep "/api/aicm/v1/bootstrap" "$DESIGN_APP/8320_READONLY_BOOTSTRAP_ENDPOINT_EXACT_DESIGN.md" "bootstrap path"
check_grep "companies" "$DESIGN_APP/8320_READONLY_BOOTSTRAP_ENDPOINT_EXACT_DESIGN.md" "bootstrap companies"
check_grep "task_ledger" "$DESIGN_APP/8320_READONLY_BOOTSTRAP_ENDPOINT_EXACT_DESIGN.md" "bootstrap ledger"
check_grep "review_items" "$DESIGN_APP/8320_READONLY_BOOTSTRAP_ENDPOINT_EXACT_DESIGN.md" "bootstrap reviews"
check_grep "LocalRepository" "$DESIGN_APP/8330_LOCAL_REPOSITORY_ROLLBACK_PLAN.md" "rollback local repository"
check_grep "do not erase localStorage" "$DESIGN_APP/8330_LOCAL_REPOSITORY_ROLLBACK_PLAN.md" "rollback keeps localStorage"

echo "------------------------------------------------------------"
echo "[5] Boss gate and no connect"
check_grep "WAITING" "$DESIGN_APP/8340_BOSS_IMPLEMENTATION_OK_REQUIRED_GATE.md" "boss waiting"
check_grep "implementation OK" "$DESIGN_APP/8340_BOSS_IMPLEMENTATION_OK_REQUIRED_GATE.md" "implementation ok phrase"
check_grep "readonly API OK" "$DESIGN_APP/8340_BOSS_IMPLEMENTATION_OK_REQUIRED_GATE.md" "readonly api ok phrase"
check_grep "REAL API CONNECT:" "$DESIGN_APP/8350_API_READONLY_CONNECT_READY_NO_CONNECT_GATE.md" "real api not executed marker"
check_grep "BROWSER FETCH:" "$DESIGN_APP/8350_API_READONLY_CONNECT_READY_NO_CONNECT_GATE.md" "browser fetch not executed marker"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/8350_API_READONLY_CONNECT_READY_NO_CONNECT_GATE.md" "live aiworker not executed marker"
check_grep "STOP" "$DESIGN_APP/8350_API_READONLY_CONNECT_READY_NO_CONNECT_GATE.md" "stop marker"

echo "------------------------------------------------------------"
echo "[6] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "WARN_COUNT: $WARN"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_FU_FX_API_READONLY_CONNECT_READY_PASS"
else
  echo "RESULT: PHASE_FU_FX_API_READONLY_CONNECT_READY_FAIL"
  exit 1
fi
