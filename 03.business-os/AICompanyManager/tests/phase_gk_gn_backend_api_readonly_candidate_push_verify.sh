#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_REL="07.applications/03.business-app/${APP_NAME}"
IMPL_REL="03.business-os/${APP_NAME}"

DESIGN_APP="${DESIGN_REPO}/${DESIGN_REL}"
IMPL_APP="${IMPL_REPO}/${IMPL_REL}"

INDEX="${IMPL_APP}/index.html"
FINAL_BUNDLE_JS="${IMPL_APP}/assets/js/phase-de-dh-workflow-final-local-ui.js"
FINAL_BUNDLE_CSS="${IMPL_APP}/assets/css/phase-de-dh-workflow-final-local-ui.css"
API_REPO_JS="${IMPL_APP}/assets/js/aicm-api-repository-candidate.js"
MODE_RESOLVER_JS="${IMPL_APP}/assets/js/aicm-repository-mode-resolver-candidate.js"
BOOTSTRAP_API_JS="${IMPL_APP}/backend-api/aicm/v1/bootstrap-readonly-candidate.js"
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
echo "AICompanyManager Phase GK-GN backend API readonly candidate push verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/8600_PHASE_GG_GJ_BACKEND_API_READONLY_CANDIDATE_ROADMAP.md"
check_file "$DESIGN_APP/8610_BACKEND_API_IMPLEMENTATION_LOCATION_CANON.md"
check_file "$DESIGN_APP/8620_READONLY_BOOTSTRAP_BACKEND_CANDIDATE_CANON.md"
check_file "$DESIGN_APP/8630_API_READONLY_WIRING_CANDIDATE_CANON.md"
check_file "$DESIGN_APP/8640_LOCAL_REPOSITORY_FALLBACK_MAINTAIN_CANON.md"
check_file "$DESIGN_APP/8650_BACKEND_API_READONLY_CANDIDATE_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/8690_PHASE_GG_GJ_BACKEND_API_READONLY_CANDIDATE_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/8700_PHASE_GK_GN_BACKEND_API_READONLY_CANDIDATE_PUSH_ROADMAP.md"
check_file "$DESIGN_APP/8710_BACKEND_API_READONLY_CANDIDATE_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/8720_BACKEND_API_READONLY_CANDIDATE_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/8730_BACKEND_API_READONLY_CANDIDATE_PUSH_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/8790_PHASE_GK_GN_BACKEND_API_READONLY_CANDIDATE_PUSH_COMPLETION_REPORT.md"
check_file "$BOOTSTRAP_API_JS"
check_file "$READONLY_WIRING_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"
check_file "$FINAL_BUNDLE_CSS"
check_optional_file "$API_REPO_JS"
check_optional_file "$MODE_RESOLVER_JS"

echo "------------------------------------------------------------"
echo "[2] Backend readonly candidate"
check_grep "handleReadonlyBootstrapCandidate" "$BOOTSTRAP_API_JS" "backend handler candidate"
check_grep "AICM_BACKEND_BOOTSTRAP_CANDIDATE_DISABLED" "$BOOTSTRAP_API_JS" "backend disabled marker"
check_grep "dbConnect: false" "$BOOTSTRAP_API_JS" "backend db connect false"
check_grep "serviceRole: false" "$BOOTSTRAP_API_JS" "backend service role false"
check_grep "realApiConnect: false" "$BOOTSTRAP_API_JS" "backend real api false"
check_grep "liveAiworkerosCall: false" "$BOOTSTRAP_API_JS" "backend live aiworker false"
check_grep "/api/aicm/v1/bootstrap" "$BOOTSTRAP_API_JS" "backend bootstrap endpoint"

echo "------------------------------------------------------------"
echo "[3] Readonly wiring candidate"
check_grep "AicmApiReadonlyWiringCandidate" "$READONLY_WIRING_JS" "readonly wiring candidate"
check_grep "allowFetch: false" "$READONLY_WIRING_JS" "allow fetch false"
check_grep "realApiConnect: false" "$READONLY_WIRING_JS" "real api false"
check_grep "liveAiworkerosCall: false" "$READONLY_WIRING_JS" "live aiworker false"
check_grep "rollbackToLocalRepository" "$READONLY_WIRING_JS" "rollback function"
check_grep "mapBootstrapResponseToState" "$READONLY_WIRING_JS" "mapping function"

echo "------------------------------------------------------------"
echo "[4] No network / no DB connect"
if grep -Eq '\bfetch[[:space:]]*\(' "$READONLY_WIRING_JS" "$BOOTSTRAP_API_JS"; then
  ng "readonly candidate does not call browser fetch"
else
  ok "readonly candidate does not call browser fetch"
fi

if grep -Eq 'XMLHttpRequest|navigator\.sendBeacon|WebSocket' "$READONLY_WIRING_JS" "$BOOTSTRAP_API_JS"; then
  ng "readonly candidate has no browser network primitive"
else
  ok "readonly candidate has no browser network primitive"
fi

if grep -Eq 'createClient|supabase\.|service_role|SERVICE_ROLE|PERSONA_DATABASE_URL|DATABASE_URL' "$BOOTSTRAP_API_JS"; then
  ng "backend candidate does not connect DB or use secrets"
else
  ok "backend candidate does not connect DB or use secrets"
fi

echo "------------------------------------------------------------"
echo "[5] Final UI remains local"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub disabled"
check_grep "workflow_local_stub_wiring: true" "$FINAL_BUNDLE_JS" "workflow local stub retained"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

if grep -q "aicm-api-readonly-wiring-candidate.js" "$INDEX"; then
  ng "index does not load readonly wiring candidate"
else
  ok "index does not load readonly wiring candidate"
fi

echo "------------------------------------------------------------"
echo "[6] No-connect gate"
check_grep "REAL API CONNECT:" "$DESIGN_APP/8730_BACKEND_API_READONLY_CANDIDATE_PUSH_NO_CONNECT_GATE.md" "real api not executed"
check_grep "BROWSER FETCH:" "$DESIGN_APP/8730_BACKEND_API_READONLY_CANDIDATE_PUSH_NO_CONNECT_GATE.md" "browser fetch not executed"
check_grep "BACKEND DB CONNECT:" "$DESIGN_APP/8730_BACKEND_API_READONLY_CANDIDATE_PUSH_NO_CONNECT_GATE.md" "backend db not executed"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/8730_BACKEND_API_READONLY_CANDIDATE_PUSH_NO_CONNECT_GATE.md" "live aiworker not executed"
check_grep "STOP" "$DESIGN_APP/8730_BACKEND_API_READONLY_CANDIDATE_PUSH_NO_CONNECT_GATE.md" "stop marker"

echo "------------------------------------------------------------"
echo "[7] Existing candidate safety if present"
if [ -f "$API_REPO_JS" ] && [ -f "$MODE_RESOLVER_JS" ]; then
  if grep -Eq '\bfetch[[:space:]]*\(' "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
    ng "existing candidates do not call browser fetch"
  else
    ok "existing candidates do not call browser fetch"
  fi

  if grep -q "realApiConnect: true\|real_api_connect: true" "$API_REPO_JS" "$MODE_RESOLVER_JS" "$FINAL_BUNDLE_JS"; then
    ng "real API connect not enabled"
  else
    ok "real API connect not enabled"
  fi

  if grep -q "liveAiworkerosCall: true\|live_aiworkeros_call: true" "$API_REPO_JS" "$MODE_RESOLVER_JS" "$FINAL_BUNDLE_JS"; then
    ng "live AIWorkerOS call not enabled"
  else
    ok "live AIWorkerOS call not enabled"
  fi
else
  warn "existing candidate JS safety skipped because candidate file missing"
fi

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
  echo "RESULT: PHASE_GK_GN_BACKEND_API_READONLY_CANDIDATE_PUSH_VERIFY_PASS"
else
  echo "RESULT: PHASE_GK_GN_BACKEND_API_READONLY_CANDIDATE_PUSH_VERIFY_FAIL"
  exit 1
fi
