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
REAL_ADAPTER_JS="${BACKEND_DIR}/supabase-readonly-real-adapter-disabled.js"
BROWSER_FETCH_JS="${IMPL_APP}/assets/js/aicm-browser-readonly-fetch-disabled.js"
RUNTIME_JS="${BACKEND_DIR}/runtime-contract-candidate.js"
ADAPTER_JS="${BACKEND_DIR}/supabase-readonly-adapter-candidate.js"
SQL_MAPPING_JS="${BACKEND_DIR}/bootstrap-sql-mapping-candidate.js"

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
echo "AICompanyManager Phase HA-HD-PREP-PUSH readonly API connect package verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/9200_PHASE_HA_HD_PREP_READONLY_API_CONNECT_PACKAGE_ROADMAP.md"
check_file "$DESIGN_APP/9210_READONLY_API_CONNECT_BOSS_OK_REQUIRED_GATE.md"
check_file "$DESIGN_APP/9220_BACKEND_READONLY_REAL_ADAPTER_DISABLED_CANON.md"
check_file "$DESIGN_APP/9230_BROWSER_READONLY_FETCH_WIRING_DISABLED_CANON.md"
check_file "$DESIGN_APP/9240_READONLY_API_CONNECT_ROLLBACK_FALLBACK_CANON.md"
check_file "$DESIGN_APP/9250_READONLY_API_CONNECT_NEXT_COMMAND_START_CONDITIONS.md"
check_file "$DESIGN_APP/9260_HA_HD_PREP_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/9270_PHASE_HA_HD_PREP_SECRET_WORD_REPAIR_ROADMAP.md"
check_file "$DESIGN_APP/9291_PHASE_HA_HD_PREP_SECRET_WORD_REPAIR_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/9300_PHASE_HA_HD_PREP_PUSH_READONLY_API_CONNECT_PACKAGE_ROADMAP.md"
check_file "$DESIGN_APP/9310_HA_HD_PREP_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/9320_HA_HD_PREP_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/9330_HA_HD_PREP_PUSH_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/9390_PHASE_HA_HD_PREP_PUSH_COMPLETION_REPORT.md"
check_file "$REAL_ADAPTER_JS"
check_file "$BROWSER_FETCH_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"
check_optional_file "$RUNTIME_JS"
check_optional_file "$ADAPTER_JS"
check_optional_file "$SQL_MAPPING_JS"

echo "------------------------------------------------------------"
echo "[2] Boss OK gate remains STOP"
check_grep "current_decision: STOP" "$DESIGN_APP/9210_READONLY_API_CONNECT_BOSS_OK_REQUIRED_GATE.md" "readonly connect stop"
check_grep "implementation OK" "$DESIGN_APP/9210_READONLY_API_CONNECT_BOSS_OK_REQUIRED_GATE.md" "implementation ok phrase"
check_grep "API接続 OK" "$DESIGN_APP/9210_READONLY_API_CONNECT_BOSS_OK_REQUIRED_GATE.md" "api connect ok phrase"
check_grep "readonly API OK" "$DESIGN_APP/9210_READONLY_API_CONNECT_BOSS_OK_REQUIRED_GATE.md" "readonly api ok phrase"

echo "------------------------------------------------------------"
echo "[3] Backend real adapter disabled"
check_grep "getReadonlyRealAdapterDisabledStatus" "$REAL_ADAPTER_JS" "real adapter status"
check_grep "readBootstrapRealAdapterDisabled" "$REAL_ADAPTER_JS" "real adapter disabled read"
check_grep "AICM_BACKEND_READONLY_REAL_ADAPTER_DISABLED" "$REAL_ADAPTER_JS" "real adapter disabled marker"
check_grep "backendDbConnect: false" "$REAL_ADAPTER_JS" "backend db false"
check_grep "serviceRole: false" "$REAL_ADAPTER_JS" "service role false"
check_grep "liveAiworkerosCall: false" "$REAL_ADAPTER_JS" "live aiworker false"

echo "------------------------------------------------------------"
echo "[4] Browser fetch disabled"
check_grep "AicmBrowserReadonlyFetchDisabled" "$BROWSER_FETCH_JS" "browser fetch disabled class"
check_grep "allowFetch: false" "$BROWSER_FETCH_JS" "allow fetch false"
check_grep "realApiConnect: false" "$BROWSER_FETCH_JS" "real api false"
check_grep "liveAiworkerosCall: false" "$BROWSER_FETCH_JS" "live aiworker false"
check_grep "rollbackToLocalRepository" "$BROWSER_FETCH_JS" "rollback function"

echo "------------------------------------------------------------"
echo "[5] No execution / no secrets"
if grep -Eq '\bfetch[[:space:]]*\(' "$REAL_ADAPTER_JS" "$BROWSER_FETCH_JS"; then
  ng "new candidates do not call fetch"
else
  ok "new candidates do not call fetch"
fi

if grep -Eq 'XMLHttpRequest|navigator\.sendBeacon|WebSocket|http\.request|https\.request|axios' "$REAL_ADAPTER_JS" "$BROWSER_FETCH_JS"; then
  ng "new candidates have no network primitive"
else
  ok "new candidates have no network primitive"
fi

if grep -Eq 'createClient|supabase\.|service_role|SERVICE_ROLE|process\.env|PERSONA_DATABASE_URL|DATABASE_URL' "$REAL_ADAPTER_JS"; then
  ng "real adapter disabled does not load DB client or secrets"
else
  ok "real adapter disabled does not load DB client or secrets"
fi

echo "------------------------------------------------------------"
echo "[6] Final UI remains local"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub disabled"
check_grep "workflow_local_stub_wiring: true" "$FINAL_BUNDLE_JS" "workflow local stub retained"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

if grep -q "aicm-browser-readonly-fetch-disabled.js" "$INDEX"; then
  ng "index does not load browser fetch disabled candidate"
else
  ok "index does not load browser fetch disabled candidate"
fi

echo "------------------------------------------------------------"
echo "[7] No-connect push gate"
check_grep "REAL API CONNECT:" "$DESIGN_APP/9330_HA_HD_PREP_PUSH_NO_CONNECT_GATE.md" "real api not executed"
check_grep "BROWSER FETCH:" "$DESIGN_APP/9330_HA_HD_PREP_PUSH_NO_CONNECT_GATE.md" "browser fetch not executed"
check_grep "BACKEND DB CONNECT:" "$DESIGN_APP/9330_HA_HD_PREP_PUSH_NO_CONNECT_GATE.md" "backend db not executed"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/9330_HA_HD_PREP_PUSH_NO_CONNECT_GATE.md" "live aiworker not executed"
check_grep "STOP" "$DESIGN_APP/9330_HA_HD_PREP_PUSH_NO_CONNECT_GATE.md" "stop marker"

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
  echo "RESULT: PHASE_HA_HD_PREP_PUSH_READONLY_API_CONNECT_PACKAGE_VERIFY_PASS"
else
  echo "RESULT: PHASE_HA_HD_PREP_PUSH_READONLY_API_CONNECT_PACKAGE_VERIFY_FAIL"
  exit 1
fi
