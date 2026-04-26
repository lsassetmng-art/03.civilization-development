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
FI_FL_REPORT="${DESIGN_APP}/8090_PHASE_FI_FL_API_PREP_PUSH_SYNC_COMPLETION_REPORT.md"
FI_FL_VERIFY="${IMPL_APP}/tests/phase_fi_fl_api_prep_push_sync_verify.sh"

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
echo "AICompanyManager Phase FM-FP API prep final handoff check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/8100_PHASE_FM_FP_API_PREP_FINAL_HANDOFF_ROADMAP.md"
check_file "$DESIGN_APP/8110_API_PREP_CURRENT_STATE_CANON.md"
check_file "$DESIGN_APP/8120_BOSS_IMPLEMENTATION_OK_FINAL_WAIT_GATE.md"
check_file "$DESIGN_APP/8130_API_READONLY_CONNECT_START_CONDITIONS.md"
check_file "$DESIGN_APP/8140_API_PREP_NEXT_CHAT_HANDOFF_ONE_BLOCK.md"
check_file "$DESIGN_APP/8150_API_PREP_FINAL_NO_CONNECT_GATE.md"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"
check_file "$FINAL_BUNDLE_CSS"
check_file "$API_REPO_JS"
check_file "$MODE_RESOLVER_JS"
check_optional_file "$FI_FL_REPORT"
check_optional_file "$FI_FL_VERIFY"

echo "------------------------------------------------------------"
echo "[2] Active UI and candidate state"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub disabled"
check_grep "workflow_local_stub_wiring: true" "$FINAL_BUNDLE_JS" "workflow local stub retained"
check_grep "AicmApiRepositoryCandidate" "$API_REPO_JS" "api repository candidate exists"
check_grep "AicmRepositoryModeResolverCandidate" "$MODE_RESOLVER_JS" "mode resolver candidate exists"

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
echo "[3] No network / no live AIWorkerOS"
if grep -Eq '\bfetch[[:space:]]*\(' "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
  ng "candidate does not call fetch"
else
  ok "candidate does not call fetch"
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
echo "[4] Boss gate and start conditions"
check_grep "WAITING" "$DESIGN_APP/8120_BOSS_IMPLEMENTATION_OK_FINAL_WAIT_GATE.md" "boss implementation ok waiting"
check_grep "API readonly connect" "$DESIGN_APP/8130_API_READONLY_CONNECT_START_CONDITIONS.md" "readonly start conditions"
check_grep "GET /api/aicm/v1/bootstrap" "$DESIGN_APP/8130_API_READONLY_CONNECT_START_CONDITIONS.md" "bootstrap endpoint"
check_grep "LocalRepository fallback" "$DESIGN_APP/8130_API_READONLY_CONNECT_START_CONDITIONS.md" "fallback plan"
check_grep "BEGIN_HANDOFF_BLOCK" "$DESIGN_APP/8140_API_PREP_NEXT_CHAT_HANDOFF_ONE_BLOCK.md" "handoff block begin"
check_grep "END_HANDOFF_BLOCK" "$DESIGN_APP/8140_API_PREP_NEXT_CHAT_HANDOFF_ONE_BLOCK.md" "handoff block end"

echo "------------------------------------------------------------"
echo "[5] No connect gate"
check_grep "DB WRITE:" "$DESIGN_APP/8150_API_PREP_FINAL_NO_CONNECT_GATE.md" "db write marker"
check_grep "REAL API CONNECT:" "$DESIGN_APP/8150_API_PREP_FINAL_NO_CONNECT_GATE.md" "real api marker"
check_grep "FETCH:" "$DESIGN_APP/8150_API_PREP_FINAL_NO_CONNECT_GATE.md" "fetch marker"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/8150_API_PREP_FINAL_NO_CONNECT_GATE.md" "live aiworker marker"
check_grep "STOP" "$DESIGN_APP/8150_API_PREP_FINAL_NO_CONNECT_GATE.md" "stop marker"

echo "------------------------------------------------------------"
echo "[6] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "WARN_COUNT: $WARN"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_FM_FP_API_PREP_FINAL_HANDOFF_PASS"
else
  echo "RESULT: PHASE_FM_FP_API_PREP_FINAL_HANDOFF_FAIL"
  exit 1
fi
