#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_REL="07.applications/03.business-app/${APP_NAME}"
IMPL_REL="03.business-os/${APP_NAME}"

DESIGN_APP="${DESIGN_REPO}/${DESIGN_REL}"
IMPL_APP="${IMPL_REPO}/${IMPL_REL}"
BACKEND_DIR="${IMPL_APP}/backend-api/aicm/v1"
ASSETS_JS_DIR="${IMPL_APP}/assets/js"

INDEX="${IMPL_APP}/index.html"
FINAL_BUNDLE_JS="${ASSETS_JS_DIR}/phase-de-dh-workflow-final-local-ui.js"
SERVER_JS="${BACKEND_DIR}/ledger-write-rollback-smoke-server.js"
SMOKE_MARKER_JS="${ASSETS_JS_DIR}/aicm-ledger-write-rollback-smoke-executed.js"

TEST_RESTORE_REPORT="${DESIGN_APP}/10496_PHASE_IS_IV_LEDGER_TEST_RESTORE_NO_PYTHON_COMPLETION_REPORT.md"
NO_PERSIST_GATE="${DESIGN_APP}/10440_LEDGER_WRITE_API_NO_PERSIST_GATE.md"
FINALIZED_REPORT="${DESIGN_APP}/10530_LEDGER_WRITE_ROLLBACK_REPAIRED_RESULT_FINALIZED_REPORT.md"

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

verify_repo_sync() {
  local label="$1"
  local repo="$2"

  echo "------------------------------------------------------------"
  echo "[$label] repo sync verify"

  if [ ! -d "$repo/.git" ]; then
    ng "$label .git exists"
    return
  fi
  ok "$label .git exists"

  local branch
  branch="$(git -C "$repo" rev-parse --abbrev-ref HEAD)"
  echo "BRANCH=$branch"

  if git -C "$repo" remote get-url origin >/dev/null 2>&1; then
    ok "$label origin remote exists"
  else
    ng "$label origin remote exists"
    return
  fi

  if git -C "$repo" rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
    ok "$label upstream exists"
  else
    ng "$label upstream exists"
    return
  fi

  git -C "$repo" fetch origin "$branch" >/dev/null 2>&1 || true

  local local_head
  local upstream_head
  local ahead_behind

  local_head="$(git -C "$repo" rev-parse --short HEAD)"
  upstream_head="$(git -C "$repo" rev-parse --short '@{u}')"
  ahead_behind="$(git -C "$repo" rev-list --left-right --count HEAD...'@{u}')"

  echo "LOCAL_HEAD=$local_head"
  echo "UPSTREAM_HEAD=$upstream_head"
  echo "AHEAD_BEHIND=$ahead_behind"

  if [ "$ahead_behind" = "0	0" ] || [ "$ahead_behind" = "0 0" ]; then
    ok "$label push synced"
  else
    ng "$label push synced"
  fi
}

echo "============================================================"
echo "AICompanyManager Phase IW-IZ ledger write rollback result push verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/10400_PHASE_IS_IV_LEDGER_WRITE_ROLLBACK_SMOKE_ROADMAP.md"
check_file "$DESIGN_APP/10410_LEDGER_WRITE_API_ROLLBACK_SCOPE_CANON.md"
check_file "$DESIGN_APP/10420_LEDGER_WRITE_API_ROLLBACK_EXECUTION_CANON.md"
check_file "$DESIGN_APP/10430_LEDGER_WRITE_NEXT_SCOPE_SEPARATION_GATE.md"
check_file "$DESIGN_APP/10440_LEDGER_WRITE_API_NO_PERSIST_GATE.md"
check_file "$DESIGN_APP/10458_PHASE_IS_IV_LEDGER_TEST_RESTORE_NO_PYTHON_ROADMAP.md"
check_file "$DESIGN_APP/10496_PHASE_IS_IV_LEDGER_TEST_RESTORE_NO_PYTHON_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/10500_PHASE_IW_IZ_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_ROADMAP.md"
check_file "$DESIGN_APP/10510_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/10520_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/10530_LEDGER_WRITE_ROLLBACK_REPAIRED_RESULT_FINALIZED_REPORT.md"
check_file "$DESIGN_APP/10540_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md"
check_file "$DESIGN_APP/10590_PHASE_IW_IZ_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_COMPLETION_REPORT.md"
check_file "$SERVER_JS"
check_file "$SMOKE_MARKER_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"

check_optional_file "$DESIGN_APP/10452_PHASE_IS_IV_LEDGER_PRIORITY_AUTO_REPAIR_NO_PYTHON_ROADMAP.md"
check_optional_file "$DESIGN_APP/10454_PHASE_IS_IV_LEDGER_RESPONSIBLE_ROLE_AUTO_REPAIR_NO_PYTHON_ROADMAP.md"
check_optional_file "$DESIGN_APP/10456_PHASE_IS_IV_LEDGER_ALL_CHECK_AUTO_REPAIR_NO_PYTHON_ROADMAP.md"
check_optional_file "$DESIGN_APP/10457_LEDGER_ALL_CHECK_CONSTRAINT_DISCOVERY_REPORT.md"

echo "------------------------------------------------------------"
echo "[2] Ledger restored result"
check_grep "result: PASS" "$TEST_RESTORE_REPORT" "test restore result pass"
check_grep "ledger-test-restore-no-python-completed" "$TEST_RESTORE_REPORT" "test restore completed"
check_grep "NOT EXECUTED IN THIS REPAIR" "$TEST_RESTORE_REPORT" "no db in test restore"
check_grep "ledger-write-rollback-repaired-result-finalized" "$FINALIZED_REPORT" "finalized report status"
check_grep "result: PASS" "$FINALIZED_REPORT" "finalized result pass"

echo "------------------------------------------------------------"
echo "[3] Ledger server repaired static state"
check_grep "INSERT INTO business.aicm_department_task_ledger" "$SERVER_JS" "ledger insert smoke"
check_grep "INSERT INTO business.aicm_department" "$SERVER_JS" "department support insert smoke"
check_grep "INSERT INTO business.aicm_company" "$SERVER_JS" "company support insert smoke"
check_grep "ROLLBACK" "$SERVER_JS" "rollback transaction"
check_grep "/api/aicm/v1/ledger/write-rollback-smoke" "$SERVER_JS" "ledger write rollback endpoint"
check_grep "persistentDbWrite: false" "$SERVER_JS" "persistent false marker"
check_grep "liveAiworkerosCall: false" "$SERVER_JS" "live aiworker false marker"
check_grep "ledgerWrite: true" "$SERVER_JS" "ledger write true marker"

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
echo "[4] No-persist gate"
check_grep "PERSISTENT DB WRITE:" "$NO_PERSIST_GATE" "persistent marker"
check_grep "NOT EXECUTED" "$NO_PERSIST_GATE" "not executed marker"
check_grep "REVIEW ACTION:" "$NO_PERSIST_GATE" "review marker"
check_grep "CSV IMPORT:" "$NO_PERSIST_GATE" "csv marker"
check_grep "WORKFLOW START:" "$NO_PERSIST_GATE" "workflow marker"
check_grep "LIVE AIWORKEROS CALL:" "$NO_PERSIST_GATE" "live aiworker marker"

echo "------------------------------------------------------------"
echo "[5] This phase no-write gate"
check_grep "DB WRITE:" "$DESIGN_APP/10540_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md" "db write not executed in push phase"
check_grep "PERSISTENT DB WRITE:" "$DESIGN_APP/10540_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md" "persistent not executed in push phase"
check_grep "WRITE API CONNECT:" "$DESIGN_APP/10540_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md" "write api not executed in push phase"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/10540_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md" "live aiworker not executed in push phase"
check_grep "STOP" "$DESIGN_APP/10540_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md" "stop marker"

echo "------------------------------------------------------------"
echo "[6] Final UI remains local"
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

verify_repo_sync "01 design" "$DESIGN_REPO"
verify_repo_sync "03 implementation" "$IMPL_REPO"

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "WARN_COUNT: $WARN"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_IW_IZ_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_VERIFY_PASS"
else
  echo "RESULT: PHASE_IW_IZ_LEDGER_WRITE_ROLLBACK_RESULT_PUSH_VERIFY_FAIL"
  exit 1
fi
