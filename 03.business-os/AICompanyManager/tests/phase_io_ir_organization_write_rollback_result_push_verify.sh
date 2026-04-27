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

INDEX="${IMPL_APP}/index.html"
FINAL_BUNDLE_JS="${IMPL_APP}/assets/js/phase-de-dh-workflow-final-local-ui.js"
SERVER_JS="${BACKEND_DIR}/organization-write-rollback-smoke-server.js"
SMOKE_MARKER_JS="${IMPL_APP}/assets/js/aicm-organization-write-rollback-smoke-executed.js"

IKIN_REPORT="${DESIGN_APP}/10290_PHASE_IK_IN_ORGANIZATION_WRITE_API_ROLLBACK_SMOKE_COMPLETION_REPORT.md"
NO_PERSIST_GATE="${DESIGN_APP}/10240_ORGANIZATION_WRITE_API_NO_PERSIST_GATE.md"

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
echo "AICompanyManager Phase IO-IR organization write rollback result push verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/10200_PHASE_IK_IN_ORGANIZATION_WRITE_ROLLBACK_SMOKE_ROADMAP.md"
check_file "$DESIGN_APP/10210_ORGANIZATION_WRITE_API_ROLLBACK_SCOPE_CANON.md"
check_file "$DESIGN_APP/10220_ORGANIZATION_WRITE_API_ROLLBACK_EXECUTION_CANON.md"
check_file "$DESIGN_APP/10230_ORGANIZATION_WRITE_NEXT_SCOPE_SEPARATION_GATE.md"
check_file "$DESIGN_APP/10240_ORGANIZATION_WRITE_API_NO_PERSIST_GATE.md"
check_file "$DESIGN_APP/10290_PHASE_IK_IN_ORGANIZATION_WRITE_API_ROLLBACK_SMOKE_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/10300_PHASE_IO_IR_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_ROADMAP.md"
check_file "$DESIGN_APP/10310_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/10320_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/10330_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md"
check_file "$DESIGN_APP/10390_PHASE_IO_IR_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_COMPLETION_REPORT.md"
check_file "$SERVER_JS"
check_file "$SMOKE_MARKER_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"

echo "------------------------------------------------------------"
echo "[2] IK-IN result"
check_grep "result: PASS" "$IKIN_REPORT" "ik-in result pass"
check_grep "organization-write-api-rollback-smoke-completed" "$IKIN_REPORT" "ik-in completed"
check_grep "db_write: true" "$IKIN_REPORT" "rollback db write recorded"
check_grep "db_write_persisted: false" "$IKIN_REPORT" "persistent db write false"
check_grep "transaction: rollback" "$IKIN_REPORT" "transaction rollback"
check_grep "organization_write: true" "$IKIN_REPORT" "organization write recorded"
check_grep "ledger_write: false" "$IKIN_REPORT" "ledger write false"
check_grep "live_aiworkeros_call: false" "$IKIN_REPORT" "live aiworker false"

echo "------------------------------------------------------------"
echo "[3] No-persist gate"
check_grep "DB WRITE:" "$NO_PERSIST_GATE" "db write marker"
check_grep "EXECUTED INSIDE ROLLBACK TRANSACTION" "$NO_PERSIST_GATE" "rollback execution marker"
check_grep "PERSISTENT DB WRITE:" "$NO_PERSIST_GATE" "persistent marker"
check_grep "NOT EXECUTED" "$NO_PERSIST_GATE" "not executed marker"
check_grep "LEDGER WRITE:" "$NO_PERSIST_GATE" "ledger marker"
check_grep "REVIEW ACTION:" "$NO_PERSIST_GATE" "review marker"
check_grep "CSV IMPORT:" "$NO_PERSIST_GATE" "csv marker"
check_grep "WORKFLOW START:" "$NO_PERSIST_GATE" "workflow marker"
check_grep "LIVE AIWORKEROS CALL:" "$NO_PERSIST_GATE" "live aiworker marker"

echo "------------------------------------------------------------"
echo "[4] Smoke implementation files"
check_grep "INSERT INTO business.aicm_organization" "$SERVER_JS" "organization insert smoke"
check_grep "INSERT INTO business.aicm_department" "$SERVER_JS" "department support insert smoke"
check_grep "INSERT INTO business.aicm_company" "$SERVER_JS" "company support insert smoke"
check_grep "ROLLBACK" "$SERVER_JS" "rollback transaction"
check_grep "/api/aicm/v1/organizations/write-rollback-smoke" "$SERVER_JS" "organization write rollback endpoint"
check_grep "persistentDbWrite: false" "$SERVER_JS" "persistent false marker"
check_grep "liveAiworkerosCall: false" "$SERVER_JS" "live aiworker false marker"
check_grep "AicmOrganizationWriteRollbackSmokeExecuted" "$SMOKE_MARKER_JS" "smoke marker class"

echo "------------------------------------------------------------"
echo "[5] Final UI remains local"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub marker"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

echo "------------------------------------------------------------"
echo "[6] This phase no-write gate"
check_grep "DB WRITE:" "$DESIGN_APP/10330_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md" "db write not executed in push phase"
check_grep "PERSISTENT DB WRITE:" "$DESIGN_APP/10330_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md" "persistent not executed in push phase"
check_grep "WRITE API CONNECT:" "$DESIGN_APP/10330_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md" "write api not executed in push phase"
check_grep "LEDGER WRITE:" "$DESIGN_APP/10330_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md" "ledger not executed in push phase"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/10330_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md" "live aiworker not executed in push phase"
check_grep "STOP" "$DESIGN_APP/10330_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_NO_WRITE_GATE.md" "stop marker"

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
  echo "RESULT: PHASE_IO_IR_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_VERIFY_PASS"
else
  echo "RESULT: PHASE_IO_IR_ORGANIZATION_WRITE_ROLLBACK_RESULT_PUSH_VERIFY_FAIL"
  exit 1
fi
