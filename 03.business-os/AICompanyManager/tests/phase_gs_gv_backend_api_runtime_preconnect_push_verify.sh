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
FINAL_BUNDLE_CSS="${IMPL_APP}/assets/css/phase-de-dh-workflow-final-local-ui.css"

RUNTIME_JS="${BACKEND_DIR}/runtime-contract-candidate.js"
ADAPTER_JS="${BACKEND_DIR}/supabase-readonly-adapter-candidate.js"
SQL_MAPPING_JS="${BACKEND_DIR}/bootstrap-sql-mapping-candidate.js"
BOOTSTRAP_API_JS="${BACKEND_DIR}/bootstrap-readonly-candidate.js"
READONLY_WIRING_JS="${IMPL_APP}/assets/js/aicm-api-readonly-wiring-candidate.js"

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
echo "AICompanyManager Phase GS-GV backend API runtime preconnect push verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/8800_PHASE_GO_GR_BACKEND_API_RUNTIME_PRECONNECT_ROADMAP.md"
check_file "$DESIGN_APP/8810_BACKEND_API_RUNTIME_CONTRACT_CANON.md"
check_file "$DESIGN_APP/8820_SUPABASE_READONLY_ADAPTER_CANDIDATE_CANON.md"
check_file "$DESIGN_APP/8830_BOOTSTRAP_READONLY_SQL_MAPPING_CANON.md"
check_file "$DESIGN_APP/8840_API_READONLY_CONNECT_EXECUTION_GATE.md"
check_file "$DESIGN_APP/8850_BACKEND_API_RUNTIME_PRECONNECT_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/8890_PHASE_GO_GR_BACKEND_API_RUNTIME_PRECONNECT_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/8900_PHASE_GS_GV_BACKEND_API_RUNTIME_PRECONNECT_PUSH_ROADMAP.md"
check_file "$DESIGN_APP/8910_BACKEND_API_RUNTIME_PRECONNECT_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/8920_BACKEND_API_RUNTIME_PRECONNECT_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/8930_BACKEND_API_RUNTIME_PRECONNECT_PUSH_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/8990_PHASE_GS_GV_BACKEND_API_RUNTIME_PRECONNECT_PUSH_COMPLETION_REPORT.md"
check_file "$RUNTIME_JS"
check_file "$ADAPTER_JS"
check_file "$SQL_MAPPING_JS"
check_optional_file "$BOOTSTRAP_API_JS"
check_optional_file "$READONLY_WIRING_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"
check_file "$FINAL_BUNDLE_CSS"

echo "------------------------------------------------------------"
echo "[2] Runtime candidate"
check_grep "createRuntimeContextCandidate" "$RUNTIME_JS" "runtime context function"
check_grep "assertReadonlyMethodCandidate" "$RUNTIME_JS" "readonly method assertion"
check_grep "realApiConnect: false" "$RUNTIME_JS" "runtime real api false"
check_grep "backendDbConnect: false" "$RUNTIME_JS" "runtime backend db false"
check_grep "liveAiworkerosCall: false" "$RUNTIME_JS" "runtime live aiworker false"

echo "------------------------------------------------------------"
echo "[3] Readonly adapter candidate"
check_grep "readBootstrapCandidate" "$ADAPTER_JS" "adapter read bootstrap candidate"
check_grep "AICM_READONLY_ADAPTER_CANDIDATE_DISABLED" "$ADAPTER_JS" "adapter disabled marker"
check_grep "backendDbConnect: false" "$ADAPTER_JS" "adapter backend db false"
check_grep "serviceRole: false" "$ADAPTER_JS" "adapter service role false"
check_grep "business.aicm_company" "$ADAPTER_JS" "adapter company target"

echo "------------------------------------------------------------"
echo "[4] SQL mapping candidate"
check_grep "BOOTSTRAP_READ_TARGETS" "$SQL_MAPPING_JS" "mapping targets"
check_grep "business.aicm_department_task_ledger" "$SQL_MAPPING_JS" "mapping ledger target"
check_grep "business.aicm_review_item" "$SQL_MAPPING_JS" "mapping review target"
check_grep "buildBootstrapEmptyStateCandidate" "$SQL_MAPPING_JS" "mapping empty state"
check_grep "getBootstrapReadTargetsCandidate" "$SQL_MAPPING_JS" "mapping targets function"

echo "------------------------------------------------------------"
echo "[5] No execution / no secrets"
if grep -Eq '\bfetch[[:space:]]*\(' "$RUNTIME_JS" "$ADAPTER_JS" "$SQL_MAPPING_JS"; then
  ng "backend candidates do not call fetch"
else
  ok "backend candidates do not call fetch"
fi

if grep -Eq 'XMLHttpRequest|navigator\.sendBeacon|WebSocket|http\.request|https\.request|axios' "$RUNTIME_JS" "$ADAPTER_JS" "$SQL_MAPPING_JS"; then
  ng "backend candidates have no network primitive"
else
  ok "backend candidates have no network primitive"
fi

if grep -Eq 'createClient|supabase\.|service_role|SERVICE_ROLE|process\.env|PERSONA_DATABASE_URL|DATABASE_URL' "$RUNTIME_JS" "$ADAPTER_JS" "$SQL_MAPPING_JS"; then
  ng "backend candidates do not load DB client or secrets"
else
  ok "backend candidates do not load DB client or secrets"
fi

echo "------------------------------------------------------------"
echo "[6] Final UI remains local"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub disabled"
check_grep "workflow_local_stub_wiring: true" "$FINAL_BUNDLE_JS" "workflow local stub retained"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

if grep -q "runtime-contract-candidate.js\|supabase-readonly-adapter-candidate.js\|bootstrap-sql-mapping-candidate.js" "$INDEX"; then
  ng "index does not load backend runtime candidates"
else
  ok "index does not load backend runtime candidates"
fi

echo "------------------------------------------------------------"
echo "[7] No-connect gate"
check_grep "REAL API CONNECT:" "$DESIGN_APP/8930_BACKEND_API_RUNTIME_PRECONNECT_PUSH_NO_CONNECT_GATE.md" "real api not executed"
check_grep "BROWSER FETCH:" "$DESIGN_APP/8930_BACKEND_API_RUNTIME_PRECONNECT_PUSH_NO_CONNECT_GATE.md" "browser fetch not executed"
check_grep "BACKEND DB CONNECT:" "$DESIGN_APP/8930_BACKEND_API_RUNTIME_PRECONNECT_PUSH_NO_CONNECT_GATE.md" "backend db not executed"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/8930_BACKEND_API_RUNTIME_PRECONNECT_PUSH_NO_CONNECT_GATE.md" "live aiworker not executed"
check_grep "STOP" "$DESIGN_APP/8930_BACKEND_API_RUNTIME_PRECONNECT_PUSH_NO_CONNECT_GATE.md" "stop marker"

echo "------------------------------------------------------------"
echo "[8] Large file check"
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
  echo "RESULT: PHASE_GS_GV_BACKEND_API_RUNTIME_PRECONNECT_PUSH_VERIFY_PASS"
else
  echo "RESULT: PHASE_GS_GV_BACKEND_API_RUNTIME_PRECONNECT_PUSH_VERIFY_FAIL"
  exit 1
fi
