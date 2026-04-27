#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_APP="${DESIGN_REPO}/07.applications/03.business-app/${APP_NAME}"
IMPL_APP="${IMPL_REPO}/03.business-os/${APP_NAME}"
BACKEND_DIR="${IMPL_APP}/backend-api/aicm/v1"

INDEX="${IMPL_APP}/index.html"
FINAL_BUNDLE_JS="${IMPL_APP}/assets/js/phase-de-dh-workflow-final-local-ui.js"
SERVER_JS="${BACKEND_DIR}/bootstrap-readonly-live-smoke-server.js"
FETCH_SMOKE_JS="${IMPL_APP}/assets/js/aicm-readonly-fetch-smoke-executed.js"

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
echo "AICompanyManager Phase HE-HH readonly API connect execution check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/9400_PHASE_HE_HH_READONLY_API_CONNECT_EXECUTION_ROADMAP.md"
check_file "$DESIGN_APP/9410_READONLY_API_CONNECT_BOSS_OK_RECORD.md"
check_file "$DESIGN_APP/9420_READONLY_API_CONNECT_ENV_GATE.md"
check_file "$DESIGN_APP/9430_BACKEND_READONLY_BOOTSTRAP_EXECUTION_CANON.md"
check_file "$DESIGN_APP/9440_READONLY_FETCH_SMOKE_EXECUTION_CANON.md"
check_file "$DESIGN_APP/9450_LOCAL_REPOSITORY_FALLBACK_VERIFY_RESULT.md"
check_file "$DESIGN_APP/9460_READONLY_API_CONNECT_NO_WRITE_GATE.md"
check_file "$SERVER_JS"
check_file "$FETCH_SMOKE_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"

echo "------------------------------------------------------------"
echo "[2] Boss OK record"
check_grep "implementation OK:" "$DESIGN_APP/9410_READONLY_API_CONNECT_BOSS_OK_RECORD.md" "implementation ok recorded"
check_grep "API接続 OK:" "$DESIGN_APP/9410_READONLY_API_CONNECT_BOSS_OK_RECORD.md" "api connect ok recorded"
check_grep "readonly API OK:" "$DESIGN_APP/9410_READONLY_API_CONNECT_BOSS_OK_RECORD.md" "readonly api ok recorded"

echo "------------------------------------------------------------"
echo "[3] Backend readonly smoke server"
check_grep "BEGIN READ ONLY" "$SERVER_JS" "read only transaction"
check_grep "/api/aicm/v1/bootstrap" "$SERVER_JS" "bootstrap endpoint"
check_grep "business.aicm_company" "$SERVER_JS" "company read target"
check_grep "business.aicm_department_task_ledger" "$SERVER_JS" "ledger read target"
check_grep "business.aicm_review_item" "$SERVER_JS" "review read target"

echo "------------------------------------------------------------"
echo "[4] No write markers"
check_grep "DB WRITE:" "$DESIGN_APP/9460_READONLY_API_CONNECT_NO_WRITE_GATE.md" "db write marker"
check_grep "NOT EXECUTED" "$DESIGN_APP/9460_READONLY_API_CONNECT_NO_WRITE_GATE.md" "not executed marker"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/9460_READONLY_API_CONNECT_NO_WRITE_GATE.md" "live aiworker marker"

if grep -Eiq '\b(insert|update|delete|truncate|alter|drop|create|grant|revoke)\b' "$SERVER_JS"; then
  ng "server js contains no write/schema SQL keywords"
else
  ok "server js contains no write/schema SQL keywords"
fi

echo "------------------------------------------------------------"
echo "[5] Final UI fallback"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub marker"
check_grep "LocalRepository" "$DESIGN_APP/9450_LOCAL_REPOSITORY_FALLBACK_VERIFY_RESULT.md" "local repository fallback"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

echo "------------------------------------------------------------"
echo "[6] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_HE_HH_READONLY_API_CONNECT_EXECUTION_PASS"
else
  echo "RESULT: PHASE_HE_HH_READONLY_API_CONNECT_EXECUTION_FAIL"
  exit 1
fi
