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
SERVER_JS="${BACKEND_DIR}/department-persistent-write-smoke-server.js"
SMOKE_MARKER_JS="${ASSETS_JS_DIR}/aicm-department-persistent-write-smoke-executed.js"

JQJT_REPORT="${DESIGN_APP}/11090_PHASE_JQ_JT_DEPARTMENT_PERSISTENT_WRITE_SMOKE_COMPLETION_REPORT.md"
JQJT_REPAIR_REPORT="${DESIGN_APP}/11091_PHASE_JQ_JT_DEPARTMENT_PARENT_COMPANY_QUOTE_REPAIR_NO_PYTHON_COMPLETION_REPORT.md"
NO_EXTRA_GATE="${DESIGN_APP}/11050_DEPARTMENT_PERSISTENT_WRITE_NO_EXTRA_SCOPE_GATE.md"
BOSS_OK="${DESIGN_APP}/11010_DEPARTMENT_PERSISTENT_WRITE_BOSS_OK_RECORD.md"

PASS=0
FAIL=0
WARN=0

ok() { echo "PASS: $1"; PASS=$((PASS + 1)); }
ng() { echo "FAIL: $1"; FAIL=$((FAIL + 1)); }
warn() { echo "WARN: $1"; WARN=$((WARN + 1)); }

check_file() {
  if [ -f "$1" ]; then ok "$1"; else ng "$1"; fi
}

check_grep() {
  if grep -q "$1" "$2" 2>/dev/null; then ok "$3"; else ng "$3"; fi
}

check_fixed() {
  if grep -Fq "$1" "$2" 2>/dev/null; then ok "$3"; else ng "$3"; fi
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
echo "AICompanyManager Phase JU-JX department persistent write result push verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/11000_PHASE_JQ_JT_DEPARTMENT_PERSISTENT_WRITE_SMOKE_ROADMAP.md"
check_file "$DESIGN_APP/11010_DEPARTMENT_PERSISTENT_WRITE_BOSS_OK_RECORD.md"
check_file "$DESIGN_APP/11020_DEPARTMENT_PERSISTENT_WRITE_SCOPE_CANON.md"
check_file "$DESIGN_APP/11030_DEPARTMENT_PERSISTENT_WRITE_EXECUTION_CANON.md"
check_file "$DESIGN_APP/11040_DEPARTMENT_PERSISTENT_WRITE_NEXT_SCOPE_SEPARATION_GATE.md"
check_file "$DESIGN_APP/11050_DEPARTMENT_PERSISTENT_WRITE_NO_EXTRA_SCOPE_GATE.md"
check_file "$DESIGN_APP/11060_PHASE_JQ_JT_DEPARTMENT_PARENT_COMPANY_QUOTE_REPAIR_NO_PYTHON_ROADMAP.md"
check_file "$DESIGN_APP/11090_PHASE_JQ_JT_DEPARTMENT_PERSISTENT_WRITE_SMOKE_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/11091_PHASE_JQ_JT_DEPARTMENT_PARENT_COMPANY_QUOTE_REPAIR_NO_PYTHON_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/11100_PHASE_JU_JX_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_ROADMAP.md"
check_file "$DESIGN_APP/11110_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/11120_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/11130_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md"
check_file "$DESIGN_APP/11190_PHASE_JU_JX_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_COMPLETION_REPORT.md"
check_file "$SERVER_JS"
check_file "$SMOKE_MARKER_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"

echo "------------------------------------------------------------"
echo "[2] JQ-JT result"
check_grep "result: PASS" "$JQJT_REPORT" "jq-jt result pass"
check_grep "department-persistent-write-smoke-completed" "$JQJT_REPORT" "jq-jt completed"
check_grep "company_id:" "$JQJT_REPORT" "company id recorded"
check_grep "department_id:" "$JQJT_REPORT" "department id recorded"
check_grep "db_write: true" "$JQJT_REPORT" "db write recorded"
check_grep "persistent_db_write: true" "$JQJT_REPORT" "persistent db write recorded"
check_grep "department_persistent_write: true" "$JQJT_REPORT" "department persistent write true"
check_grep "organization_persistent_write: false" "$JQJT_REPORT" "organization persistent false"
check_grep "ledger_persistent_write: false" "$JQJT_REPORT" "ledger persistent false"
check_grep "live_aiworkeros_call: false" "$JQJT_REPORT" "live aiworker false"

echo "------------------------------------------------------------"
echo "[3] Repair result and server"
check_grep "result: PASS" "$JQJT_REPAIR_REPORT" "repair result pass"
check_grep "department-parent-company-quote-repair-no-python-completed" "$JQJT_REPAIR_REPORT" "repair completed"
check_grep "department persistent write OK:" "$BOSS_OK" "department persistent write ok recorded"
check_grep "INSERT INTO business.aicm_department" "$SERVER_JS" "department insert"
check_grep "business.aicm_company" "$SERVER_JS" "parent company validation"
check_grep "persistedRowExists" "$SERVER_JS" "persisted exists validation"
check_grep "/api/aicm/v1/departments/persistent-write-smoke" "$SERVER_JS" "persistent endpoint"
check_grep "departmentPersistentWrite', true" "$SERVER_JS" "department persistent true marker"
check_grep "liveAiworkerosCall', false" "$SERVER_JS" "live aiworker false marker"
check_grep "AicmDepartmentPersistentWriteSmokeExecuted" "$SMOKE_MARKER_JS" "persistent marker class"
check_fixed "v_company_id_text text := '\${parentCompanyId}';" "$SERVER_JS" "parent company SQL single quote fixed"

if grep -Fq 'v_company_id_text text := ${JSON.stringify(parentCompanyId)};' "$SERVER_JS"; then
  ng "JSON.stringify parent company assignment removed"
else
  ok "JSON.stringify parent company assignment removed"
fi

echo "------------------------------------------------------------"
echo "[4] No extra scope gate"
check_grep "ORGANIZATION PERSISTENT WRITE:" "$NO_EXTRA_GATE" "organization marker"
check_grep "LEDGER PERSISTENT WRITE:" "$NO_EXTRA_GATE" "ledger marker"
check_grep "REVIEW ACTION:" "$NO_EXTRA_GATE" "review marker"
check_grep "CSV IMPORT:" "$NO_EXTRA_GATE" "csv marker"
check_grep "WORKFLOW START:" "$NO_EXTRA_GATE" "workflow marker"
check_grep "LIVE AIWORKEROS CALL:" "$NO_EXTRA_GATE" "live aiworker marker"

echo "------------------------------------------------------------"
echo "[5] This phase no-write gate"
check_grep "DB WRITE:" "$DESIGN_APP/11130_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "db write marker"
check_grep "PERSISTENT DB WRITE:" "$DESIGN_APP/11130_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "persistent marker"
check_grep "NOT EXECUTED" "$DESIGN_APP/11130_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "not executed marker"
check_grep "ORGANIZATION PERSISTENT WRITE:" "$DESIGN_APP/11130_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "organization not executed marker"
check_grep "LEDGER PERSISTENT WRITE:" "$DESIGN_APP/11130_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "ledger not executed marker"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/11130_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "live aiworker not executed marker"
check_grep "STOP" "$DESIGN_APP/11130_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "stop marker"

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
  echo "RESULT: PHASE_JU_JX_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_VERIFY_PASS"
else
  echo "RESULT: PHASE_JU_JX_DEPARTMENT_PERSISTENT_WRITE_RESULT_PUSH_VERIFY_FAIL"
  exit 1
fi
