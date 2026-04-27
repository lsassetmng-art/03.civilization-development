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
echo "AICompanyManager Phase GW-GZ-PUSH readonly API final gate push verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/9000_PHASE_GW_GZ_READONLY_API_FINAL_GATE_ROADMAP.md"
check_file "$DESIGN_APP/9010_READONLY_API_CONNECT_FINAL_GO_STOP.md"
check_file "$DESIGN_APP/9020_BACKEND_DB_CONNECT_PERMISSION_GATE.md"
check_file "$DESIGN_APP/9030_BROWSER_FETCH_PERMISSION_GATE.md"
check_file "$DESIGN_APP/9040_LIVE_AIWORKEROS_CALL_SEPARATION_GATE.md"
check_file "$DESIGN_APP/9050_NEXT_PHASE_READONLY_API_CONNECT_START_POINT.md"
check_file "$DESIGN_APP/9060_READONLY_API_FINAL_GATE_NO_CONNECT.md"
check_file "$DESIGN_APP/9090_PHASE_GW_GZ_READONLY_API_FINAL_GATE_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/9100_PHASE_GW_GZ_PUSH_READONLY_API_FINAL_GATE_ROADMAP.md"
check_file "$DESIGN_APP/9110_READONLY_API_FINAL_GATE_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/9120_READONLY_API_FINAL_GATE_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/9130_READONLY_API_FINAL_GATE_PUSH_NO_CONNECT.md"
check_file "$DESIGN_APP/9190_PHASE_GW_GZ_PUSH_READONLY_API_FINAL_GATE_COMPLETION_REPORT.md"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"
check_file "$RUNTIME_JS"
check_file "$ADAPTER_JS"
check_file "$SQL_MAPPING_JS"
check_optional_file "$BOOTSTRAP_API_JS"
check_optional_file "$READONLY_WIRING_JS"

echo "------------------------------------------------------------"
echo "[2] Final gates"
check_grep "current_decision: STOP" "$DESIGN_APP/9010_READONLY_API_CONNECT_FINAL_GO_STOP.md" "readonly api final stop"
check_grep "implementation OK" "$DESIGN_APP/9010_READONLY_API_CONNECT_FINAL_GO_STOP.md" "implementation ok phrase"
check_grep "API接続 OK" "$DESIGN_APP/9010_READONLY_API_CONNECT_FINAL_GO_STOP.md" "api connect ok phrase"
check_grep "readonly API OK" "$DESIGN_APP/9010_READONLY_API_CONNECT_FINAL_GO_STOP.md" "readonly api ok phrase"
check_grep "backend DB connect:" "$DESIGN_APP/9020_BACKEND_DB_CONNECT_PERMISSION_GATE.md" "backend db gate"
check_grep "browser fetch:" "$DESIGN_APP/9030_BROWSER_FETCH_PERMISSION_GATE.md" "browser fetch gate"
check_grep "live AIWorkerOS call:" "$DESIGN_APP/9040_LIVE_AIWORKEROS_CALL_SEPARATION_GATE.md" "live aiworker gate"

echo "------------------------------------------------------------"
echo "[3] Next phase reservation"
check_grep "Phase HA-HD Readonly API Connect" "$DESIGN_APP/9050_NEXT_PHASE_READONLY_API_CONNECT_START_POINT.md" "ha-hd readonly api connect reserved"
check_grep "GET /api/aicm/v1/bootstrap" "$DESIGN_APP/9050_NEXT_PHASE_READONLY_API_CONNECT_START_POINT.md" "bootstrap start target"
check_grep "LocalRepository fallback" "$DESIGN_APP/9050_NEXT_PHASE_READONLY_API_CONNECT_START_POINT.md" "fallback start target"

echo "------------------------------------------------------------"
echo "[4] Candidate safety remains"
if grep -Eq '\bfetch[[:space:]]*\(' "$RUNTIME_JS" "$ADAPTER_JS" "$SQL_MAPPING_JS"; then
  ng "backend candidates do not call fetch"
else
  ok "backend candidates do not call fetch"
fi

if grep -Eq 'createClient|supabase\.|service_role|SERVICE_ROLE|process\.env|PERSONA_DATABASE_URL|DATABASE_URL' "$RUNTIME_JS" "$ADAPTER_JS" "$SQL_MAPPING_JS"; then
  ng "backend candidates do not load DB client or secrets"
else
  ok "backend candidates do not load DB client or secrets"
fi

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub disabled"

echo "------------------------------------------------------------"
echo "[5] No-connect push gate"
check_grep "REAL API CONNECT:" "$DESIGN_APP/9130_READONLY_API_FINAL_GATE_PUSH_NO_CONNECT.md" "real api not executed"
check_grep "BROWSER FETCH:" "$DESIGN_APP/9130_READONLY_API_FINAL_GATE_PUSH_NO_CONNECT.md" "browser fetch not executed"
check_grep "BACKEND DB CONNECT:" "$DESIGN_APP/9130_READONLY_API_FINAL_GATE_PUSH_NO_CONNECT.md" "backend db not executed"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/9130_READONLY_API_FINAL_GATE_PUSH_NO_CONNECT.md" "live aiworker not executed"
check_grep "STOP" "$DESIGN_APP/9130_READONLY_API_FINAL_GATE_PUSH_NO_CONNECT.md" "stop marker"

echo "------------------------------------------------------------"
echo "[6] Large file check"
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
  echo "RESULT: PHASE_GW_GZ_PUSH_READONLY_API_FINAL_GATE_VERIFY_PASS"
else
  echo "RESULT: PHASE_GW_GZ_PUSH_READONLY_API_FINAL_GATE_VERIFY_FAIL"
  exit 1
fi
