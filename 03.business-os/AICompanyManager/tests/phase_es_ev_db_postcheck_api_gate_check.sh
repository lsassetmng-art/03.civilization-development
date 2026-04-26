#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_APP="${DESIGN_REPO}/07.applications/03.business-app/${APP_NAME}"
IMPL_APP="${IMPL_REPO}/03.business-os/${APP_NAME}"

INDEX="${IMPL_APP}/index.html"
BUNDLE_JS="${IMPL_APP}/assets/js/phase-de-dh-workflow-final-local-ui.js"
APPLY_REPORT="${DESIGN_APP}/7590_PHASE_EO_ER_DB_RLS_APPLY_COMPLETION_REPORT.md"
POSTCHECK_REPORT="${DESIGN_APP}/7610_DB_RLS_POST_APPLY_READONLY_CHECK_REPORT.md"
API_PAYLOAD_CANON="${DESIGN_APP}/7620_API_RPC_PAYLOAD_FINALIZATION_CANON.md"
API_ADAPTER_CANON="${DESIGN_APP}/7630_API_REPOSITORY_ADAPTER_DESIGN_CANON.md"
REAL_API_GATE="${DESIGN_APP}/7640_REAL_API_CONNECT_PREP_GATE.md"
NO_CONNECT="${DESIGN_APP}/7650_DB_POSTCHECK_NO_CONNECT_GATE.md"
REPORT="${DESIGN_APP}/7690_PHASE_ES_EV_DB_POSTCHECK_API_GATE_COMPLETION_REPORT.md"

PASS=0
FAIL=0

ok() { echo "PASS: $1"; PASS=$((PASS + 1)); }
ng() { echo "FAIL: $1"; FAIL=$((FAIL + 1)); }

check_file() {
  if [ -f "$1" ]; then ok "$1"; else ng "$1"; fi
}

check_grep() {
  if grep -q "$1" "$2" 2>/dev/null; then ok "$3"; else ng "$3"; fi
}

echo "============================================================"
echo "AICompanyManager Phase ES-EV DB postcheck / API gate check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/7600_PHASE_ES_EV_DB_POSTCHECK_API_GATE_ROADMAP.md"
check_file "$POSTCHECK_REPORT"
check_file "$API_PAYLOAD_CANON"
check_file "$API_ADAPTER_CANON"
check_file "$REAL_API_GATE"
check_file "$NO_CONNECT"
check_file "$APPLY_REPORT"
check_file "$INDEX"
check_file "$BUNDLE_JS"

echo "------------------------------------------------------------"
echo "[2] DB apply and postcheck markers"
check_grep "result: PASS" "$APPLY_REPORT" "previous db apply pass"
check_grep "db_apply: true" "$APPLY_REPORT" "db apply true marker"
check_grep "rls_apply: true" "$APPLY_REPORT" "rls apply true marker"
check_grep "result: PASS" "$POSTCHECK_REPORT" "postcheck pass"
check_grep "psql_readonly: true" "$POSTCHECK_REPORT" "postcheck readonly marker"

echo "------------------------------------------------------------"
echo "[3] API gate markers"
check_grep "real API connect" "$API_PAYLOAD_CANON" "api payload real api marker"
check_grep "applyReviewAction" "$API_ADAPTER_CANON" "adapter review method"
check_grep "startWorkflow" "$API_ADAPTER_CANON" "adapter workflow method"
check_grep "real API connect:" "$REAL_API_GATE" "real api gate decision"
check_grep "STOP" "$REAL_API_GATE" "real api gate stop"
check_grep "live AIWorkerOS call" "$REAL_API_GATE" "live aiworker remains separated"

echo "------------------------------------------------------------"
echo "[4] Final local UI still safe"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$BUNDLE_JS" "api stub disabled"
check_grep "workflow_local_stub_wiring: true" "$BUNDLE_JS" "workflow local stub marker"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

echo "------------------------------------------------------------"
echo "[5] No connect gate"
check_grep "DB WRITE:" "$NO_CONNECT" "db write marker"
check_grep "NOT EXECUTED" "$NO_CONNECT" "not executed marker"
check_grep "REAL API CONNECT:" "$NO_CONNECT" "real api not executed marker"
check_grep "LIVE AIWORKEROS CALL:" "$NO_CONNECT" "live aiworker not executed marker"

echo "------------------------------------------------------------"
echo "[6] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_ES_EV_DB_POSTCHECK_API_GATE_PASS"
else
  echo "RESULT: PHASE_ES_EV_DB_POSTCHECK_API_GATE_FAIL"
  exit 1
fi
