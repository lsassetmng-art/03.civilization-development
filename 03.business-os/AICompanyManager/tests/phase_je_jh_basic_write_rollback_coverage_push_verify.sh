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

COMPANY_SERVER="${BACKEND_DIR}/company-write-rollback-smoke-server.js"
DEPARTMENT_SERVER="${BACKEND_DIR}/department-write-rollback-smoke-server.js"
ORGANIZATION_SERVER="${BACKEND_DIR}/organization-write-rollback-smoke-server.js"
LEDGER_SERVER="${BACKEND_DIR}/ledger-write-rollback-smoke-server.js"

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
echo "AICompanyManager Phase JE-JH basic write rollback coverage push verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required docs"
check_file "$DESIGN_APP/10600_PHASE_JA_JD_BASIC_WRITE_ROLLBACK_COVERAGE_SUMMARY_ROADMAP.md"
check_file "$DESIGN_APP/10610_BASIC_WRITE_ROLLBACK_COVERAGE_CANON.md"
check_file "$DESIGN_APP/10620_PERSISTENT_WRITE_BOSS_OK_REQUIRED_GATE.md"
check_file "$DESIGN_APP/10630_REVIEW_CSV_WORKFLOW_LIVE_AIWORKEROS_SEPARATION_GATE.md"
check_file "$DESIGN_APP/10640_BASIC_WRITE_COVERAGE_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/10690_PHASE_JA_JD_BASIC_WRITE_ROLLBACK_COVERAGE_SUMMARY_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/10691_PHASE_JA_JD_MISSING_REPORT_REPAIR_ROADMAP.md"
check_file "$DESIGN_APP/10692_PHASE_JA_JD_MISSING_REPORT_REPAIR_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/10700_PHASE_JE_JH_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_ROADMAP.md"
check_file "$DESIGN_APP/10710_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/10720_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/10730_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/10790_PHASE_JE_JH_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_COMPLETION_REPORT.md"

echo "------------------------------------------------------------"
echo "[2] Required implementation"
check_file "$COMPANY_SERVER"
check_file "$DEPARTMENT_SERVER"
check_file "$ORGANIZATION_SERVER"
check_file "$LEDGER_SERVER"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"

echo "------------------------------------------------------------"
echo "[3] Rollback coverage"
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
echo "[4] Completion and gates"
check_grep "basic-write-rollback-coverage-summary-completed" "$DESIGN_APP/10690_PHASE_JA_JD_BASIC_WRITE_ROLLBACK_COVERAGE_SUMMARY_COMPLETION_REPORT.md" "ja-jd completed"
check_grep "missing-report-repair-completed" "$DESIGN_APP/10692_PHASE_JA_JD_MISSING_REPORT_REPAIR_COMPLETION_REPORT.md" "missing report repair completed"
check_grep "persistent write:" "$DESIGN_APP/10620_PERSISTENT_WRITE_BOSS_OK_REQUIRED_GATE.md" "persistent gate"
check_grep "STOP" "$DESIGN_APP/10620_PERSISTENT_WRITE_BOSS_OK_REQUIRED_GATE.md" "persistent stop"
check_grep "review action" "$DESIGN_APP/10630_REVIEW_CSV_WORKFLOW_LIVE_AIWORKEROS_SEPARATION_GATE.md" "review separated"
check_grep "CSV import" "$DESIGN_APP/10630_REVIEW_CSV_WORKFLOW_LIVE_AIWORKEROS_SEPARATION_GATE.md" "csv separated"
check_grep "workflow start" "$DESIGN_APP/10630_REVIEW_CSV_WORKFLOW_LIVE_AIWORKEROS_SEPARATION_GATE.md" "workflow separated"
check_grep "live AIWorkerOS" "$DESIGN_APP/10630_REVIEW_CSV_WORKFLOW_LIVE_AIWORKEROS_SEPARATION_GATE.md" "live aiworker separated"

echo "------------------------------------------------------------"
echo "[5] This phase no-connect gate"
check_grep "DB WRITE:" "$DESIGN_APP/10730_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_NO_CONNECT_GATE.md" "db write not executed"
check_grep "PERSISTENT DB WRITE:" "$DESIGN_APP/10730_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_NO_CONNECT_GATE.md" "persistent not executed"
check_grep "psql:" "$DESIGN_APP/10730_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_NO_CONNECT_GATE.md" "psql not executed"
check_grep "WRITE API CONNECT:" "$DESIGN_APP/10730_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_NO_CONNECT_GATE.md" "write api not executed"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/10730_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_NO_CONNECT_GATE.md" "live aiworker not executed"
check_grep "NOT EXECUTED" "$DESIGN_APP/10730_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_NO_CONNECT_GATE.md" "not executed marker"

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
  echo "RESULT: PHASE_JE_JH_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_VERIFY_PASS"
else
  echo "RESULT: PHASE_JE_JH_BASIC_WRITE_ROLLBACK_COVERAGE_PUSH_VERIFY_FAIL"
  exit 1
fi
