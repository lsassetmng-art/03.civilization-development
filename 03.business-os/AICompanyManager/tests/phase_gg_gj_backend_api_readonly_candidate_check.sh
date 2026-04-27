#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_APP="${DESIGN_REPO}/07.applications/03.business-app/${APP_NAME}"
IMPL_APP="${IMPL_REPO}/03.business-os/${APP_NAME}"

INDEX="${IMPL_APP}/index.html"
FINAL_BUNDLE_JS="${IMPL_APP}/assets/js/phase-de-dh-workflow-final-local-ui.js"
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

check_grep() {
  if grep -q "$1" "$2" 2>/dev/null; then ok "$3"; else ng "$3"; fi
}

echo "============================================================"
echo "AICompanyManager Phase GG-GJ backend API readonly candidate check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/8600_PHASE_GG_GJ_BACKEND_API_READONLY_CANDIDATE_ROADMAP.md"
check_file "$DESIGN_APP/8610_BACKEND_API_IMPLEMENTATION_LOCATION_CANON.md"
check_file "$DESIGN_APP/8620_READONLY_BOOTSTRAP_BACKEND_CANDIDATE_CANON.md"
check_file "$DESIGN_APP/8630_API_READONLY_WIRING_CANDIDATE_CANON.md"
check_file "$DESIGN_APP/8640_LOCAL_REPOSITORY_FALLBACK_MAINTAIN_CANON.md"
check_file "$DESIGN_APP/8650_BACKEND_API_READONLY_CANDIDATE_NO_CONNECT_GATE.md"
check_file "$BOOTSTRAP_API_JS"
check_file "$READONLY_WIRING_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"

echo "------------------------------------------------------------"
echo "[2] Backend candidate"
check_grep "handleReadonlyBootstrapCandidate" "$BOOTSTRAP_API_JS" "backend handler candidate"
check_grep "AICM_BACKEND_BOOTSTRAP_CANDIDATE_DISABLED" "$BOOTSTRAP_API_JS" "backend disabled marker"
check_grep "dbConnect: false" "$BOOTSTRAP_API_JS" "backend db connect false"
check_grep "serviceRole: false" "$BOOTSTRAP_API_JS" "backend service role false"
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
echo "[4] No network execution"
if grep -Eq '\bfetch[[:space:]]*\(' "$READONLY_WIRING_JS" "$BOOTSTRAP_API_JS"; then
  ng "candidate does not call browser fetch"
else
  ok "candidate does not call browser fetch"
fi

if grep -Eq 'XMLHttpRequest|navigator\.sendBeacon|WebSocket' "$READONLY_WIRING_JS" "$BOOTSTRAP_API_JS"; then
  ng "candidate has no browser network primitive"
else
  ok "candidate has no browser network primitive"
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
echo "[6] No connect gate"
check_grep "REAL API CONNECT:" "$DESIGN_APP/8650_BACKEND_API_READONLY_CANDIDATE_NO_CONNECT_GATE.md" "real api not executed"
check_grep "BROWSER FETCH:" "$DESIGN_APP/8650_BACKEND_API_READONLY_CANDIDATE_NO_CONNECT_GATE.md" "browser fetch not executed"
check_grep "BACKEND DB CONNECT:" "$DESIGN_APP/8650_BACKEND_API_READONLY_CANDIDATE_NO_CONNECT_GATE.md" "backend db not executed"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/8650_BACKEND_API_READONLY_CANDIDATE_NO_CONNECT_GATE.md" "live aiworker not executed"
check_grep "STOP" "$DESIGN_APP/8650_BACKEND_API_READONLY_CANDIDATE_NO_CONNECT_GATE.md" "stop marker"

echo "------------------------------------------------------------"
echo "[7] Existing candidate safety if present"
if [ -f "$API_REPO_JS" ] && [ -f "$MODE_RESOLVER_JS" ]; then
  if grep -Eq '\bfetch[[:space:]]*\(' "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
    ng "existing candidates do not call browser fetch"
  else
    ok "existing candidates do not call browser fetch"
  fi
else
  warn "existing candidate JS missing"
fi

echo "------------------------------------------------------------"
echo "[8] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "WARN_COUNT: $WARN"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_GG_GJ_BACKEND_API_READONLY_CANDIDATE_PASS"
else
  echo "RESULT: PHASE_GG_GJ_BACKEND_API_READONLY_CANDIDATE_FAIL"
  exit 1
fi
