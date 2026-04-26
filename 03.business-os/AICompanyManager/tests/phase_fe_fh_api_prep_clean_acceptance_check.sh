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
EW_EZ_REPORT="${DESIGN_APP}/7790_PHASE_EW_EZ_API_REPOSITORY_CANDIDATE_COMPLETION_REPORT.md"
CLEAN_ACCEPTANCE="${DESIGN_APP}/7910_FA_FD_REPAIRED_CLEAN_ACCEPTANCE_CANON.md"
NO_CONNECT="${DESIGN_APP}/7920_API_PREP_CLEAN_ACCEPTANCE_NO_CONNECT_GATE.md"
REPORT="${DESIGN_APP}/7990_PHASE_FE_FH_API_PREP_CLEAN_ACCEPTANCE_COMPLETION_REPORT.md"

PASS=0
FAIL=0

ok() { echo "PASS: $1"; PASS=$((PASS + 1)); }
ng() { echo "FAIL: $1"; FAIL=$((FAIL + 1)); }

check_file() {
  if [ -f "$1" ]; then ok "$1"; else ng "$1"; fi
}

check_grep() {
  if grep -q "$1" "$2" 2>/dev/null; then ok "$3"; else ng "$3"; fi
}

echo "============================================================"
echo "AICompanyManager Phase FE-FH API prep clean acceptance check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/7900_PHASE_FE_FH_API_PREP_CLEAN_ACCEPTANCE_ROADMAP.md"
check_file "$EW_EZ_REPORT"
check_file "$CLEAN_ACCEPTANCE"
check_file "$NO_CONNECT"
check_file "$API_REPO_JS"
check_file "$MODE_RESOLVER_JS"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"

echo "------------------------------------------------------------"
echo "[2] Restored EW-EZ report"
check_grep "result: PASS" "$EW_EZ_REPORT" "ew-ez report pass"
check_grep "ApiRepository candidate" "$EW_EZ_REPORT" "ew-ez api repo mention"
check_grep "REAL API CONNECT:" "$EW_EZ_REPORT" "ew-ez real api marker"
check_grep "NOT EXECUTED" "$EW_EZ_REPORT" "ew-ez not executed marker"

echo "------------------------------------------------------------"
echo "[3] Candidate JS files"
check_grep "AicmApiRepositoryCandidate" "$API_REPO_JS" "api repository candidate"
check_grep "AICM_API_REPOSITORY_CANDIDATE_DISABLED" "$API_REPO_JS" "api repository disabled marker"
check_grep "realApiConnect: false" "$API_REPO_JS" "api repo real api false"
check_grep "allowNetwork: false" "$API_REPO_JS" "api repo allow network false"
check_grep "AicmRepositoryModeResolverCandidate" "$MODE_RESOLVER_JS" "mode resolver candidate"
check_grep "BOSS_IMPLEMENTATION_OK_REQUIRED" "$MODE_RESOLVER_JS" "boss implementation gate"

echo "------------------------------------------------------------"
echo "[4] No network primitives"
if grep -Eq '\bfetch[[:space:]]*\(' "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
  ng "candidate does not call fetch"
else
  ok "candidate does not call fetch"
fi

if grep -Eq 'XMLHttpRequest|navigator\.sendBeacon|WebSocket' "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
  ng "candidate has no browser network primitive"
else
  ok "candidate has no browser network primitive"
fi

echo "------------------------------------------------------------"
echo "[5] Final UI remains local"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$FINAL_BUNDLE_JS" "final bundle api stub disabled"
check_grep "workflow_local_stub_wiring: true" "$FINAL_BUNDLE_JS" "workflow local stub retained"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

if grep -q "aicm-api-repository-candidate.js" "$INDEX"; then
  ng "index does not load api repository candidate"
else
  ok "index does not load api repository candidate"
fi

if grep -q "aicm-repository-mode-resolver-candidate.js" "$INDEX"; then
  ng "index does not load mode resolver candidate"
else
  ok "index does not load mode resolver candidate"
fi

echo "------------------------------------------------------------"
echo "[6] No connect gate"
check_grep "REAL API CONNECT:" "$NO_CONNECT" "real api not executed"
check_grep "FETCH:" "$NO_CONNECT" "fetch not executed"
check_grep "LIVE AIWORKEROS CALL:" "$NO_CONNECT" "live aiworker not executed"
check_grep "STOP" "$NO_CONNECT" "stop marker"

echo "------------------------------------------------------------"
echo "[7] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_FE_FH_API_PREP_CLEAN_ACCEPTANCE_PASS"
else
  echo "RESULT: PHASE_FE_FH_API_PREP_CLEAN_ACCEPTANCE_FAIL"
  exit 1
fi
