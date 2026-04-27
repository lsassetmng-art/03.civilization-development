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
SERVER_JS="${BACKEND_DIR}/company-persistent-write-smoke-server.js"
SMOKE_MARKER_JS="${ASSETS_JS_DIR}/aicm-company-persistent-write-smoke-executed.js"

JIJL_REPORT="${DESIGN_APP}/10890_PHASE_JI_JL_COMPANY_PERSISTENT_WRITE_SMOKE_COMPLETION_REPORT.md"
NO_EXTRA_GATE="${DESIGN_APP}/10850_COMPANY_PERSISTENT_WRITE_NO_EXTRA_SCOPE_GATE.md"
BOSS_OK="${DESIGN_APP}/10810_PERSISTENT_WRITE_BOSS_OK_RECORD.md"

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
echo "AICompanyManager Phase JM-JP company persistent write result push verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/10800_PHASE_JI_JL_COMPANY_PERSISTENT_WRITE_SMOKE_ROADMAP.md"
check_file "$DESIGN_APP/10810_PERSISTENT_WRITE_BOSS_OK_RECORD.md"
check_file "$DESIGN_APP/10820_COMPANY_PERSISTENT_WRITE_SCOPE_CANON.md"
check_file "$DESIGN_APP/10830_COMPANY_PERSISTENT_WRITE_EXECUTION_CANON.md"
check_file "$DESIGN_APP/10840_PERSISTENT_WRITE_NEXT_SCOPE_SEPARATION_GATE.md"
check_file "$DESIGN_APP/10850_COMPANY_PERSISTENT_WRITE_NO_EXTRA_SCOPE_GATE.md"
check_file "$DESIGN_APP/10890_PHASE_JI_JL_COMPANY_PERSISTENT_WRITE_SMOKE_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/10900_PHASE_JM_JP_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_ROADMAP.md"
check_file "$DESIGN_APP/10910_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/10920_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/10930_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md"
check_file "$DESIGN_APP/10990_PHASE_JM_JP_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_COMPLETION_REPORT.md"
check_file "$SERVER_JS"
check_file "$SMOKE_MARKER_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"

echo "------------------------------------------------------------"
echo "[2] JI-JL result"
check_grep "result: PASS" "$JIJL_REPORT" "ji-jl result pass"
check_grep "company-persistent-write-smoke-completed" "$JIJL_REPORT" "ji-jl completed"
check_grep "company_id:" "$JIJL_REPORT" "company id recorded"
check_grep "db_write: true" "$JIJL_REPORT" "db write recorded"
check_grep "persistent_db_write: true" "$JIJL_REPORT" "persistent db write recorded"
check_grep "company_persistent_write: true" "$JIJL_REPORT" "company persistent write true"
check_grep "department_persistent_write: false" "$JIJL_REPORT" "department persistent false"
check_grep "organization_persistent_write: false" "$JIJL_REPORT" "organization persistent false"
check_grep "ledger_persistent_write: false" "$JIJL_REPORT" "ledger persistent false"
check_grep "live_aiworkeros_call: false" "$JIJL_REPORT" "live aiworker false"

echo "------------------------------------------------------------"
echo "[3] Boss OK and server"
check_grep "persistent write OK:" "$BOSS_OK" "persistent write ok recorded"
check_grep "INSERT INTO business.aicm_company" "$SERVER_JS" "company insert"
check_grep "persistedRowExists" "$SERVER_JS" "persisted exists validation"
check_grep "/api/aicm/v1/companies/persistent-write-smoke" "$SERVER_JS" "persistent endpoint"
check_grep "persistentDbWrite', true" "$SERVER_JS" "persistent true marker"
check_grep "liveAiworkerosCall', false" "$SERVER_JS" "live aiworker false marker"
check_grep "AicmCompanyPersistentWriteSmokeExecuted" "$SMOKE_MARKER_JS" "persistent marker class"

echo "------------------------------------------------------------"
echo "[4] No extra scope gate"
check_grep "DEPARTMENT PERSISTENT WRITE:" "$NO_EXTRA_GATE" "department marker"
check_grep "ORGANIZATION PERSISTENT WRITE:" "$NO_EXTRA_GATE" "organization marker"
check_grep "LEDGER PERSISTENT WRITE:" "$NO_EXTRA_GATE" "ledger marker"
check_grep "REVIEW ACTION:" "$NO_EXTRA_GATE" "review marker"
check_grep "CSV IMPORT:" "$NO_EXTRA_GATE" "csv marker"
check_grep "WORKFLOW START:" "$NO_EXTRA_GATE" "workflow marker"
check_grep "LIVE AIWORKEROS CALL:" "$NO_EXTRA_GATE" "live aiworker marker"

echo "------------------------------------------------------------"
echo "[5] This phase no-write gate"
check_grep "DB WRITE:" "$DESIGN_APP/10930_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "db write marker"
check_grep "PERSISTENT DB WRITE:" "$DESIGN_APP/10930_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "persistent marker"
check_grep "NOT EXECUTED" "$DESIGN_APP/10930_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "not executed marker"
check_grep "DEPARTMENT PERSISTENT WRITE:" "$DESIGN_APP/10930_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "department not executed marker"
check_grep "ORGANIZATION PERSISTENT WRITE:" "$DESIGN_APP/10930_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "organization not executed marker"
check_grep "LEDGER PERSISTENT WRITE:" "$DESIGN_APP/10930_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "ledger not executed marker"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/10930_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "live aiworker not executed marker"
check_grep "STOP" "$DESIGN_APP/10930_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_NO_WRITE_GATE.md" "stop marker"

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
  echo "RESULT: PHASE_JM_JP_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_VERIFY_PASS"
else
  echo "RESULT: PHASE_JM_JP_COMPANY_PERSISTENT_WRITE_RESULT_PUSH_VERIFY_FAIL"
  exit 1
fi
