#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_APP="${DESIGN_REPO}/07.applications/03.business-app/${APP_NAME}"
IMPL_APP="${IMPL_REPO}/03.business-os/${APP_NAME}"
BACKEND_DIR="${IMPL_APP}/backend-api/aicm/v1"
ASSETS_JS_DIR="${IMPL_APP}/assets/js"

INDEX="${IMPL_APP}/index.html"
FINAL_BUNDLE_JS="${ASSETS_JS_DIR}/phase-de-dh-workflow-final-local-ui.js"

COMPANY_SERVER="${BACKEND_DIR}/company-write-rollback-smoke-server.js"
DEPARTMENT_SERVER="${BACKEND_DIR}/department-write-rollback-smoke-server.js"
ORGANIZATION_SERVER="${BACKEND_DIR}/organization-write-rollback-smoke-server.js"
LEDGER_SERVER="${BACKEND_DIR}/ledger-write-rollback-smoke-server.js"

COMPANY_MARKER="${ASSETS_JS_DIR}/aicm-company-write-rollback-smoke-executed.js"
DEPARTMENT_MARKER="${ASSETS_JS_DIR}/aicm-department-write-rollback-smoke-executed.js"
ORGANIZATION_MARKER="${ASSETS_JS_DIR}/aicm-organization-write-rollback-smoke-executed.js"
LEDGER_MARKER="${ASSETS_JS_DIR}/aicm-ledger-write-rollback-smoke-executed.js"

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
echo "AICompanyManager Phase JA-JD basic write rollback coverage summary check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required docs"
check_file "$DESIGN_APP/10600_PHASE_JA_JD_BASIC_WRITE_ROLLBACK_COVERAGE_SUMMARY_ROADMAP.md"
check_file "$DESIGN_APP/10610_BASIC_WRITE_ROLLBACK_COVERAGE_CANON.md"
check_file "$DESIGN_APP/10620_PERSISTENT_WRITE_BOSS_OK_REQUIRED_GATE.md"
check_file "$DESIGN_APP/10630_REVIEW_CSV_WORKFLOW_LIVE_AIWORKEROS_SEPARATION_GATE.md"
check_file "$DESIGN_APP/10640_BASIC_WRITE_COVERAGE_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/10690_PHASE_JA_JD_BASIC_WRITE_ROLLBACK_COVERAGE_SUMMARY_COMPLETION_REPORT.md"

echo "------------------------------------------------------------"
echo "[2] Rollback smoke implementation files"
check_file "$COMPANY_SERVER"
check_file "$DEPARTMENT_SERVER"
check_file "$ORGANIZATION_SERVER"
check_file "$LEDGER_SERVER"
check_file "$COMPANY_MARKER"
check_file "$DEPARTMENT_MARKER"
check_file "$ORGANIZATION_MARKER"
check_file "$LEDGER_MARKER"

echo "------------------------------------------------------------"
echo "[3] Coverage markers"
check_grep "business.aicm_company" "$COMPANY_SERVER" "company target"
check_grep "ROLLBACK" "$COMPANY_SERVER" "company rollback"
check_grep "persistentDbWrite: false" "$COMPANY_SERVER" "company persistent false"

check_grep "business.aicm_department" "$DEPARTMENT_SERVER" "department target"
check_grep "ROLLBACK" "$DEPARTMENT_SERVER" "department rollback"
check_grep "persistentDbWrite: false" "$DEPARTMENT_SERVER" "department persistent false"

check_grep "business.aicm_organization" "$ORGANIZATION_SERVER" "organization target"
check_grep "ROLLBACK" "$ORGANIZATION_SERVER" "organization rollback"
check_grep "persistentDbWrite: false" "$ORGANIZATION_SERVER" "organization persistent false"

check_grep "business.aicm_department_task_ledger" "$LEDGER_SERVER" "ledger target"
check_grep "ROLLBACK" "$LEDGER_SERVER" "ledger rollback"
check_grep "persistentDbWrite: false" "$LEDGER_SERVER" "ledger persistent false"
check_grep "ledgerWrite: true" "$LEDGER_SERVER" "ledger write marker"

echo "------------------------------------------------------------"
echo "[4] Persistent and separation gates"
check_grep "current_decision: STOP" "$DESIGN_APP/10620_PERSISTENT_WRITE_BOSS_OK_REQUIRED_GATE.md" "persistent write stop"
check_grep "persistent write OK" "$DESIGN_APP/10620_PERSISTENT_WRITE_BOSS_OK_REQUIRED_GATE.md" "persistent ok phrase"
check_grep "永続書き込み OK" "$DESIGN_APP/10620_PERSISTENT_WRITE_BOSS_OK_REQUIRED_GATE.md" "japanese persistent ok phrase"

check_grep "review action" "$DESIGN_APP/10630_REVIEW_CSV_WORKFLOW_LIVE_AIWORKEROS_SEPARATION_GATE.md" "review separated"
check_grep "CSV import" "$DESIGN_APP/10630_REVIEW_CSV_WORKFLOW_LIVE_AIWORKEROS_SEPARATION_GATE.md" "csv separated"
check_grep "workflow start" "$DESIGN_APP/10630_REVIEW_CSV_WORKFLOW_LIVE_AIWORKEROS_SEPARATION_GATE.md" "workflow separated"
check_grep "live AIWorkerOS" "$DESIGN_APP/10630_REVIEW_CSV_WORKFLOW_LIVE_AIWORKEROS_SEPARATION_GATE.md" "live aiworker separated"

echo "------------------------------------------------------------"
echo "[5] No connect gate"
check_grep "DB WRITE:" "$DESIGN_APP/10640_BASIC_WRITE_COVERAGE_NO_CONNECT_GATE.md" "db write marker"
check_grep "PERSISTENT DB WRITE:" "$DESIGN_APP/10640_BASIC_WRITE_COVERAGE_NO_CONNECT_GATE.md" "persistent marker"
check_grep "WRITE API CONNECT:" "$DESIGN_APP/10640_BASIC_WRITE_COVERAGE_NO_CONNECT_GATE.md" "write api marker"
check_grep "REVIEW ACTION:" "$DESIGN_APP/10640_BASIC_WRITE_COVERAGE_NO_CONNECT_GATE.md" "review marker"
check_grep "CSV IMPORT:" "$DESIGN_APP/10640_BASIC_WRITE_COVERAGE_NO_CONNECT_GATE.md" "csv marker"
check_grep "WORKFLOW START:" "$DESIGN_APP/10640_BASIC_WRITE_COVERAGE_NO_CONNECT_GATE.md" "workflow marker"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/10640_BASIC_WRITE_COVERAGE_NO_CONNECT_GATE.md" "live aiworker marker"
check_grep "NOT EXECUTED" "$DESIGN_APP/10640_BASIC_WRITE_COVERAGE_NO_CONNECT_GATE.md" "not executed marker"

echo "------------------------------------------------------------"
echo "[6] Final UI remains local"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub marker"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

echo "------------------------------------------------------------"
echo "[7] Large file check"
LARGE_FILE_LIST="$(find "$DESIGN_APP" "$IMPL_APP" -type f -size +100M 2>/dev/null || true)"
if [ -z "$LARGE_FILE_LIST" ]; then
  ok "no files over 100MB in AICompanyManager scope"
else
  echo "$LARGE_FILE_LIST"
  ng "no files over 100MB in AICompanyManager scope"
fi

echo "------------------------------------------------------------"
echo "[8] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "WARN_COUNT: $WARN"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_JA_JD_BASIC_WRITE_ROLLBACK_COVERAGE_SUMMARY_PASS"
else
  echo "RESULT: PHASE_JA_JD_BASIC_WRITE_ROLLBACK_COVERAGE_SUMMARY_FAIL"
  exit 1
fi
