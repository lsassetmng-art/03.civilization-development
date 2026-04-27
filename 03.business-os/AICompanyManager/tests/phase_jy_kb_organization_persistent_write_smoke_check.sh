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
SERVER_JS="${BACKEND_DIR}/organization-persistent-write-smoke-server.js"
SMOKE_MARKER_JS="${ASSETS_JS_DIR}/aicm-organization-persistent-write-smoke-executed.js"

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

check_fixed() {
  if grep -Fq "$1" "$2" 2>/dev/null; then ok "$3"; else ng "$3"; fi
}

echo "============================================================"
echo "AICompanyManager Phase JY-KB organization persistent write smoke check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/11200_PHASE_JY_KB_ORGANIZATION_PERSISTENT_WRITE_SMOKE_ROADMAP.md"
check_file "$DESIGN_APP/11210_ORGANIZATION_PERSISTENT_WRITE_BOSS_OK_RECORD.md"
check_file "$DESIGN_APP/11220_ORGANIZATION_PERSISTENT_WRITE_SCOPE_CANON.md"
check_file "$DESIGN_APP/11230_ORGANIZATION_PERSISTENT_WRITE_EXECUTION_CANON.md"
check_file "$DESIGN_APP/11240_ORGANIZATION_PERSISTENT_WRITE_NEXT_SCOPE_SEPARATION_GATE.md"
check_file "$DESIGN_APP/11250_ORGANIZATION_PERSISTENT_WRITE_NO_EXTRA_SCOPE_GATE.md"
check_file "$DESIGN_APP/11290_PHASE_JY_KB_ORGANIZATION_PERSISTENT_WRITE_SMOKE_COMPLETION_REPORT.md"
check_file "$SERVER_JS"
check_file "$SMOKE_MARKER_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"

echo "------------------------------------------------------------"
echo "[2] Boss OK and scope"
check_grep "organization persistent write OK:" "$DESIGN_APP/11210_ORGANIZATION_PERSISTENT_WRITE_BOSS_OK_RECORD.md" "organization persistent write ok recorded"
check_grep "business.aicm_organization" "$DESIGN_APP/11220_ORGANIZATION_PERSISTENT_WRITE_SCOPE_CANON.md" "organization target"
check_grep "business.aicm_company" "$DESIGN_APP/11220_ORGANIZATION_PERSISTENT_WRITE_SCOPE_CANON.md" "parent company target"
check_grep "business.aicm_department" "$DESIGN_APP/11220_ORGANIZATION_PERSISTENT_WRITE_SCOPE_CANON.md" "parent department target"
check_grep "persistent insert" "$DESIGN_APP/11220_ORGANIZATION_PERSISTENT_WRITE_SCOPE_CANON.md" "persistent insert scope"

echo "------------------------------------------------------------"
echo "[3] Server persistent implementation"
check_grep "INSERT INTO business.aicm_organization" "$SERVER_JS" "organization insert"
check_grep "business.aicm_company" "$SERVER_JS" "parent company validation"
check_grep "business.aicm_department" "$SERVER_JS" "parent department validation"
check_grep "persistedRowExists" "$SERVER_JS" "persisted exists validation"
check_grep "/api/aicm/v1/organizations/persistent-write-smoke" "$SERVER_JS" "persistent endpoint"
check_grep "organizationPersistentWrite', true" "$SERVER_JS" "organization persistent true marker"
check_grep "liveAiworkerosCall', false" "$SERVER_JS" "live aiworker false marker"
check_fixed "v_company_id_text text := '\${parentCompanyId}';" "$SERVER_JS" "parent company SQL single quote fixed"
check_fixed "v_department_id_text text := '\${parentDepartmentId}';" "$SERVER_JS" "parent department SQL single quote fixed"

echo "------------------------------------------------------------"
echo "[4] Completion result"
check_grep "status: organization-persistent-write-smoke-completed" "$DESIGN_APP/11290_PHASE_JY_KB_ORGANIZATION_PERSISTENT_WRITE_SMOKE_COMPLETION_REPORT.md" "completion status"
check_grep "result: PASS" "$DESIGN_APP/11290_PHASE_JY_KB_ORGANIZATION_PERSISTENT_WRITE_SMOKE_COMPLETION_REPORT.md" "completion result pass"
check_grep "organization_id:" "$DESIGN_APP/11290_PHASE_JY_KB_ORGANIZATION_PERSISTENT_WRITE_SMOKE_COMPLETION_REPORT.md" "organization id recorded"
check_grep "persistent_db_write: true" "$DESIGN_APP/11290_PHASE_JY_KB_ORGANIZATION_PERSISTENT_WRITE_SMOKE_COMPLETION_REPORT.md" "persistent db write recorded"

echo "------------------------------------------------------------"
echo "[5] No extra scope gate"
check_grep "LEDGER PERSISTENT WRITE:" "$DESIGN_APP/11250_ORGANIZATION_PERSISTENT_WRITE_NO_EXTRA_SCOPE_GATE.md" "ledger marker"
check_grep "REVIEW ACTION:" "$DESIGN_APP/11250_ORGANIZATION_PERSISTENT_WRITE_NO_EXTRA_SCOPE_GATE.md" "review marker"
check_grep "CSV IMPORT:" "$DESIGN_APP/11250_ORGANIZATION_PERSISTENT_WRITE_NO_EXTRA_SCOPE_GATE.md" "csv marker"
check_grep "WORKFLOW START:" "$DESIGN_APP/11250_ORGANIZATION_PERSISTENT_WRITE_NO_EXTRA_SCOPE_GATE.md" "workflow marker"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/11250_ORGANIZATION_PERSISTENT_WRITE_NO_EXTRA_SCOPE_GATE.md" "live aiworker marker"

echo "------------------------------------------------------------"
echo "[6] Final UI unchanged"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub marker"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

echo "------------------------------------------------------------"
echo "[7] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_JY_KB_ORGANIZATION_PERSISTENT_WRITE_SMOKE_PASS"
else
  echo "RESULT: PHASE_JY_KB_ORGANIZATION_PERSISTENT_WRITE_SMOKE_FAIL"
  exit 1
fi
