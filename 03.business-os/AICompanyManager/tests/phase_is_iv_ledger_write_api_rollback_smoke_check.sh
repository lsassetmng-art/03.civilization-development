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
SERVER_JS="${BACKEND_DIR}/ledger-write-rollback-smoke-server.js"
SMOKE_MARKER_JS="${ASSETS_JS_DIR}/aicm-ledger-write-rollback-smoke-executed.js"

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
echo "AICompanyManager Phase IS-IV ledger write API rollback smoke check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/10400_PHASE_IS_IV_LEDGER_WRITE_ROLLBACK_SMOKE_ROADMAP.md"
check_file "$DESIGN_APP/10410_LEDGER_WRITE_API_ROLLBACK_SCOPE_CANON.md"
check_file "$DESIGN_APP/10420_LEDGER_WRITE_API_ROLLBACK_EXECUTION_CANON.md"
check_file "$DESIGN_APP/10430_LEDGER_WRITE_NEXT_SCOPE_SEPARATION_GATE.md"
check_file "$DESIGN_APP/10440_LEDGER_WRITE_API_NO_PERSIST_GATE.md"
check_optional_file "$DESIGN_APP/10452_PHASE_IS_IV_LEDGER_PRIORITY_AUTO_REPAIR_NO_PYTHON_ROADMAP.md"
check_optional_file "$DESIGN_APP/10454_PHASE_IS_IV_LEDGER_RESPONSIBLE_ROLE_AUTO_REPAIR_NO_PYTHON_ROADMAP.md"
check_optional_file "$DESIGN_APP/10456_PHASE_IS_IV_LEDGER_ALL_CHECK_AUTO_REPAIR_NO_PYTHON_ROADMAP.md"
check_file "$SERVER_JS"
check_file "$SMOKE_MARKER_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"

echo "------------------------------------------------------------"
echo "[2] Scope"
check_grep "business.aicm_department_task_ledger" "$DESIGN_APP/10410_LEDGER_WRITE_API_ROLLBACK_SCOPE_CANON.md" "ledger target"
check_grep "business.aicm_company" "$DESIGN_APP/10410_LEDGER_WRITE_API_ROLLBACK_SCOPE_CANON.md" "company support target"
check_grep "business.aicm_department" "$DESIGN_APP/10410_LEDGER_WRITE_API_ROLLBACK_SCOPE_CANON.md" "department support target"
check_grep "ROLLBACK" "$DESIGN_APP/10410_LEDGER_WRITE_API_ROLLBACK_SCOPE_CANON.md" "rollback scope"

echo "------------------------------------------------------------"
echo "[3] Server write rollback implementation"
check_grep "INSERT INTO business.aicm_department_task_ledger" "$SERVER_JS" "ledger insert smoke"
check_grep "INSERT INTO business.aicm_department" "$SERVER_JS" "department support insert smoke"
check_grep "INSERT INTO business.aicm_company" "$SERVER_JS" "company support insert smoke"
check_grep "ROLLBACK" "$SERVER_JS" "rollback transaction"
check_grep "/api/aicm/v1/ledger/write-rollback-smoke" "$SERVER_JS" "ledger write rollback endpoint"
check_grep "persistentDbWrite: false" "$SERVER_JS" "persistent false marker"
check_grep "liveAiworkerosCall: false" "$SERVER_JS" "live aiworker false marker"
check_grep "ledgerWrite: true" "$SERVER_JS" "ledger write true marker"

echo "------------------------------------------------------------"
echo "[4] Auto-repaired check values"
if grep -q "quote_literal('normal')" "$SERVER_JS"; then
  ng "priority normal is not used"
else
  ok "priority normal is not used"
fi

if grep -q "quote_literal('medium')" "$SERVER_JS"; then
  ng "priority medium is not used"
else
  ok "priority medium is not used"
fi

if grep -q "quote_literal('manager')" "$SERVER_JS"; then
  ng "responsible_role manager is not used"
else
  ok "responsible_role manager is not used"
fi

if grep -q "quote_literal('draft')" "$SERVER_JS"; then
  ng "task_status draft is not used"
else
  ok "task_status draft is not used"
fi

echo "------------------------------------------------------------"
echo "[5] No persist gate"
check_grep "PERSISTENT DB WRITE:" "$DESIGN_APP/10440_LEDGER_WRITE_API_NO_PERSIST_GATE.md" "persistent marker"
check_grep "NOT EXECUTED" "$DESIGN_APP/10440_LEDGER_WRITE_API_NO_PERSIST_GATE.md" "not executed marker"
check_grep "REVIEW ACTION:" "$DESIGN_APP/10440_LEDGER_WRITE_API_NO_PERSIST_GATE.md" "review marker"
check_grep "CSV IMPORT:" "$DESIGN_APP/10440_LEDGER_WRITE_API_NO_PERSIST_GATE.md" "csv marker"
check_grep "WORKFLOW START:" "$DESIGN_APP/10440_LEDGER_WRITE_API_NO_PERSIST_GATE.md" "workflow marker"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/10440_LEDGER_WRITE_API_NO_PERSIST_GATE.md" "live aiworker marker"

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
echo "WARN_COUNT: $WARN"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_IS_IV_LEDGER_WRITE_API_ROLLBACK_SMOKE_CHECK_RESTORED_PASS"
else
  echo "RESULT: PHASE_IS_IV_LEDGER_WRITE_API_ROLLBACK_SMOKE_CHECK_RESTORED_FAIL"
  exit 1
fi
