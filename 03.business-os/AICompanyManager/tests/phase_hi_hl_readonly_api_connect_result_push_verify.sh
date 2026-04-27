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
SERVER_JS="${BACKEND_DIR}/bootstrap-readonly-live-smoke-server.js"
FETCH_SMOKE_JS="${IMPL_APP}/assets/js/aicm-readonly-fetch-smoke-executed.js"

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
echo "AICompanyManager Phase HI-HL readonly API connect result push verify"
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
check_file "$DESIGN_APP/9490_PHASE_HE_HH_READONLY_API_CONNECT_EXECUTION_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/9500_PHASE_HI_HL_READONLY_API_CONNECT_RESULT_PUSH_ROADMAP.md"
check_file "$DESIGN_APP/9510_READONLY_API_CONNECT_RESULT_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/9520_READONLY_API_CONNECT_RESULT_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/9530_READONLY_API_CONNECT_RESULT_PUSH_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/9590_PHASE_HI_HL_READONLY_API_CONNECT_RESULT_PUSH_COMPLETION_REPORT.md"
check_file "$SERVER_JS"
check_file "$FETCH_SMOKE_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"

echo "------------------------------------------------------------"
echo "[2] HE-HH result"
check_grep "result: PASS" "$DESIGN_APP/9490_PHASE_HE_HH_READONLY_API_CONNECT_EXECUTION_COMPLETION_REPORT.md" "he-hh result pass"
check_grep "readonly-api-connect-execution-completed" "$DESIGN_APP/9490_PHASE_HE_HH_READONLY_API_CONNECT_EXECUTION_COMPLETION_REPORT.md" "he-hh completed"
check_grep "psql_readonly: true" "$DESIGN_APP/9490_PHASE_HE_HH_READONLY_API_CONNECT_EXECUTION_COMPLETION_REPORT.md" "psql readonly"
check_grep "backend_db_connect: true" "$DESIGN_APP/9490_PHASE_HE_HH_READONLY_API_CONNECT_EXECUTION_COMPLETION_REPORT.md" "backend db readonly connect recorded"
check_grep "live_aiworkeros_call: false" "$DESIGN_APP/9490_PHASE_HE_HH_READONLY_API_CONNECT_EXECUTION_COMPLETION_REPORT.md" "live aiworker false"

echo "------------------------------------------------------------"
echo "[3] No-write gate"
check_grep "DB WRITE:" "$DESIGN_APP/9460_READONLY_API_CONNECT_NO_WRITE_GATE.md" "db write marker"
check_grep "NOT EXECUTED" "$DESIGN_APP/9460_READONLY_API_CONNECT_NO_WRITE_GATE.md" "not executed marker"
check_grep "WRITE API:" "$DESIGN_APP/9460_READONLY_API_CONNECT_NO_WRITE_GATE.md" "write api marker"
check_grep "WORKFLOW START:" "$DESIGN_APP/9460_READONLY_API_CONNECT_NO_WRITE_GATE.md" "workflow start marker"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/9460_READONLY_API_CONNECT_NO_WRITE_GATE.md" "live aiworker marker"

echo "------------------------------------------------------------"
echo "[4] Smoke implementation files"
check_grep "BEGIN READ ONLY" "$SERVER_JS" "read only transaction"
check_grep "/api/aicm/v1/bootstrap" "$SERVER_JS" "bootstrap endpoint"
check_grep "business.aicm_company" "$SERVER_JS" "company read target"
check_grep "business.aicm_review_item" "$SERVER_JS" "review read target"
check_grep "AicmReadonlyFetchSmokeExecuted" "$FETCH_SMOKE_JS" "fetch smoke marker"

echo "------------------------------------------------------------"
echo "[5] Final UI remains local"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub marker"
check_grep "LocalRepository" "$DESIGN_APP/9450_LOCAL_REPOSITORY_FALLBACK_VERIFY_RESULT.md" "local repository fallback"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

echo "------------------------------------------------------------"
echo "[6] This phase no-connect gate"
check_grep "REAL API CONNECT:" "$DESIGN_APP/9530_READONLY_API_CONNECT_RESULT_PUSH_NO_CONNECT_GATE.md" "real api not executed in push phase"
check_grep "BROWSER FETCH:" "$DESIGN_APP/9530_READONLY_API_CONNECT_RESULT_PUSH_NO_CONNECT_GATE.md" "browser fetch not executed in push phase"
check_grep "BACKEND DB CONNECT:" "$DESIGN_APP/9530_READONLY_API_CONNECT_RESULT_PUSH_NO_CONNECT_GATE.md" "backend db not executed in push phase"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/9530_READONLY_API_CONNECT_RESULT_PUSH_NO_CONNECT_GATE.md" "live aiworker not executed in push phase"
check_grep "STOP" "$DESIGN_APP/9530_READONLY_API_CONNECT_RESULT_PUSH_NO_CONNECT_GATE.md" "stop marker"

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
  echo "RESULT: PHASE_HI_HL_READONLY_API_CONNECT_RESULT_PUSH_VERIFY_PASS"
else
  echo "RESULT: PHASE_HI_HL_READONLY_API_CONNECT_RESULT_PUSH_VERIFY_FAIL"
  exit 1
fi
