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
WRITE_ADAPTER_JS="${BACKEND_DIR}/write-api-adapter-disabled.js"
BROWSER_WRITE_JS="${IMPL_APP}/assets/js/aicm-browser-write-api-disabled.js"
READONLY_RESULT_REPORT="${DESIGN_APP}/9490_PHASE_HE_HH_READONLY_API_CONNECT_EXECUTION_COMPLETION_REPORT.md"
HMHP_REPORT="${DESIGN_APP}/9690_PHASE_HM_HP_WRITE_API_PREPARATION_GATE_COMPLETION_REPORT.md"

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
echo "AICompanyManager Phase HQ-HT write API preparation push verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/9600_PHASE_HM_HP_WRITE_API_PREPARATION_GATE_ROADMAP.md"
check_file "$DESIGN_APP/9610_WRITE_API_SCOPE_CANON.md"
check_file "$DESIGN_APP/9620_WRITE_API_PAYLOAD_CONTRACT_CANON.md"
check_file "$DESIGN_APP/9630_WRITE_API_IDEMPOTENCY_ROLLBACK_AUDIT_CANON.md"
check_file "$DESIGN_APP/9640_REVIEW_CSV_WORKFLOW_SEPARATION_GATE.md"
check_file "$DESIGN_APP/9650_WRITE_API_BOSS_OK_REQUIRED_GATE.md"
check_file "$DESIGN_APP/9660_WRITE_API_PREPARATION_NO_WRITE_GATE.md"
check_file "$DESIGN_APP/9690_PHASE_HM_HP_WRITE_API_PREPARATION_GATE_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/9700_PHASE_HQ_HT_WRITE_API_PREPARATION_PUSH_ROADMAP.md"
check_file "$DESIGN_APP/9710_WRITE_API_PREPARATION_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/9720_WRITE_API_PREPARATION_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/9730_WRITE_API_PREPARATION_PUSH_NO_WRITE_GATE.md"
check_file "$DESIGN_APP/9790_PHASE_HQ_HT_WRITE_API_PREPARATION_PUSH_COMPLETION_REPORT.md"
check_file "$WRITE_ADAPTER_JS"
check_file "$BROWSER_WRITE_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"
check_optional_file "$READONLY_RESULT_REPORT"

echo "------------------------------------------------------------"
echo "[2] Readonly result and HM-HP result"
check_grep "result: PASS" "$READONLY_RESULT_REPORT" "readonly result pass"
check_grep "readonly-api-connect-execution-completed" "$READONLY_RESULT_REPORT" "readonly execution completed"
check_grep "result: PASS" "$HMHP_REPORT" "hm-hp result pass"
check_grep "write-api-preparation-gate-completed" "$HMHP_REPORT" "hm-hp completed"

echo "------------------------------------------------------------"
echo "[3] Write API design gates"
check_grep "company save" "$DESIGN_APP/9610_WRITE_API_SCOPE_CANON.md" "company save scope"
check_grep "department" "$DESIGN_APP/9610_WRITE_API_SCOPE_CANON.md" "department scope"
check_grep "organization" "$DESIGN_APP/9610_WRITE_API_SCOPE_CANON.md" "organization scope"
check_grep "ledger" "$DESIGN_APP/9610_WRITE_API_SCOPE_CANON.md" "ledger scope"
check_grep "idempotency_key" "$DESIGN_APP/9620_WRITE_API_PAYLOAD_CONTRACT_CANON.md" "idempotency payload"
check_grep "audit" "$DESIGN_APP/9630_WRITE_API_IDEMPOTENCY_ROLLBACK_AUDIT_CANON.md" "audit canon"

echo "------------------------------------------------------------"
echo "[4] Separation gates remain"
check_grep "review action" "$DESIGN_APP/9640_REVIEW_CSV_WORKFLOW_SEPARATION_GATE.md" "review separated"
check_grep "CSV import" "$DESIGN_APP/9640_REVIEW_CSV_WORKFLOW_SEPARATION_GATE.md" "csv separated"
check_grep "workflow start" "$DESIGN_APP/9640_REVIEW_CSV_WORKFLOW_SEPARATION_GATE.md" "workflow separated"
check_grep "live AIWorkerOS" "$DESIGN_APP/9640_REVIEW_CSV_WORKFLOW_SEPARATION_GATE.md" "live aiworker separated"
check_grep "current_decision: STOP" "$DESIGN_APP/9650_WRITE_API_BOSS_OK_REQUIRED_GATE.md" "write api stop"

echo "------------------------------------------------------------"
echo "[5] Disabled candidates"
check_grep "AICM_WRITE_API_DISABLED" "$WRITE_ADAPTER_JS" "backend write disabled"
check_grep "dbWrite: false" "$WRITE_ADAPTER_JS" "db write false"
check_grep "backendDbWrite: false" "$WRITE_ADAPTER_JS" "backend db write false"
check_grep "reviewAction: false" "$WRITE_ADAPTER_JS" "review action false"
check_grep "csvImport: false" "$WRITE_ADAPTER_JS" "csv import false"
check_grep "workflowStart: false" "$WRITE_ADAPTER_JS" "workflow start false"
check_grep "liveAiworkerosCall: false" "$WRITE_ADAPTER_JS" "live aiworker false"

check_grep "AicmBrowserWriteApiDisabled" "$BROWSER_WRITE_JS" "browser write disabled class"
check_grep "allowFetch: false" "$BROWSER_WRITE_JS" "browser allow fetch false"
check_grep "writeApiConnect: false" "$BROWSER_WRITE_JS" "browser write api false"
check_grep "rollbackToLocalDraft" "$BROWSER_WRITE_JS" "browser rollback local draft"

echo "------------------------------------------------------------"
echo "[6] No execution / no secrets"
if grep -Eq '\bfetch[[:space:]]*\(' "$WRITE_ADAPTER_JS" "$BROWSER_WRITE_JS"; then
  ng "write candidates do not call fetch"
else
  ok "write candidates do not call fetch"
fi

if grep -Eq 'XMLHttpRequest|navigator\.sendBeacon|WebSocket|http\.request|https\.request|axios' "$WRITE_ADAPTER_JS" "$BROWSER_WRITE_JS"; then
  ng "write candidates have no network primitive"
else
  ok "write candidates have no network primitive"
fi

if grep -Eq 'createClient|supabase\.|service_role|SERVICE_ROLE|process\.env|PERSONA_DATABASE_URL|DATABASE_URL' "$WRITE_ADAPTER_JS"; then
  ng "write adapter disabled does not load DB client or secrets"
else
  ok "write adapter disabled does not load DB client or secrets"
fi

echo "------------------------------------------------------------"
echo "[7] Final UI remains local"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub disabled"
check_grep "workflow_local_stub_wiring: true" "$FINAL_BUNDLE_JS" "workflow local stub retained"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

if grep -q "aicm-browser-write-api-disabled.js" "$INDEX"; then
  ng "index does not load browser write candidate"
else
  ok "index does not load browser write candidate"
fi

echo "------------------------------------------------------------"
echo "[8] Push no-write gate"
check_grep "DB WRITE:" "$DESIGN_APP/9730_WRITE_API_PREPARATION_PUSH_NO_WRITE_GATE.md" "db write marker"
check_grep "WRITE API CONNECT:" "$DESIGN_APP/9730_WRITE_API_PREPARATION_PUSH_NO_WRITE_GATE.md" "write api marker"
check_grep "REVIEW ACTION:" "$DESIGN_APP/9730_WRITE_API_PREPARATION_PUSH_NO_WRITE_GATE.md" "review action marker"
check_grep "CSV IMPORT:" "$DESIGN_APP/9730_WRITE_API_PREPARATION_PUSH_NO_WRITE_GATE.md" "csv import marker"
check_grep "WORKFLOW START:" "$DESIGN_APP/9730_WRITE_API_PREPARATION_PUSH_NO_WRITE_GATE.md" "workflow marker"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/9730_WRITE_API_PREPARATION_PUSH_NO_WRITE_GATE.md" "live aiworker marker"
check_grep "NOT EXECUTED" "$DESIGN_APP/9730_WRITE_API_PREPARATION_PUSH_NO_WRITE_GATE.md" "not executed marker"

echo "------------------------------------------------------------"
echo "[9] Large file check"
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
  echo "RESULT: PHASE_HQ_HT_WRITE_API_PREPARATION_PUSH_VERIFY_PASS"
else
  echo "RESULT: PHASE_HQ_HT_WRITE_API_PREPARATION_PUSH_VERIFY_FAIL"
  exit 1
fi
