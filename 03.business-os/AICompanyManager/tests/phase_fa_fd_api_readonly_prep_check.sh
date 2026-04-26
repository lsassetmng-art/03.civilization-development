#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_APP="${DESIGN_REPO}/07.applications/03.business-app/${APP_NAME}"
IMPL_APP="${IMPL_REPO}/03.business-os/${APP_NAME}"

INDEX="${IMPL_APP}/index.html"
BUNDLE_JS="${IMPL_APP}/assets/js/phase-de-dh-workflow-final-local-ui.js"
API_REPO_JS="${IMPL_APP}/assets/js/aicm-api-repository-candidate.js"
MODE_RESOLVER_JS="${IMPL_APP}/assets/js/aicm-repository-mode-resolver-candidate.js"
PREV_REPORT="${DESIGN_APP}/7790_PHASE_EW_EZ_API_REPOSITORY_CANDIDATE_COMPLETION_REPORT.md"

SAFE_TMP_DIR="${HOME}/.tmp/${APP_NAME}/phase_fa_fd_api_readonly_prep_check"
mkdir -p "$SAFE_TMP_DIR"
FAILED_LINES="${SAFE_TMP_DIR}/failed_lines.txt"
: > "$FAILED_LINES"

PASS=0
FAIL=0
WARN=0

ok() {
  echo "PASS: $1"
  PASS=$((PASS + 1))
}

ng() {
  echo "FAIL: $1"
  echo "FAIL: $1" >> "$FAILED_LINES"
  FAIL=$((FAIL + 1))
}

warn() {
  echo "WARN: $1"
  WARN=$((WARN + 1))
}

check_file() {
  if [ -f "$1" ]; then ok "$1"; else ng "$1"; fi
}

check_optional_file() {
  if [ -f "$1" ]; then ok "$1"; else warn "$1 not found"; fi
}

check_grep() {
  if grep -q "$1" "$2" 2>/dev/null; then ok "$3"; else ng "$3"; fi
}

check_grep_any() {
  local file="$1"
  local label="$2"
  shift 2

  local pattern
  for pattern in "$@"; do
    if grep -q "$pattern" "$file" 2>/dev/null; then
      ok "$label"
      return
    fi
  done

  ng "$label"
}

echo "============================================================"
echo "AICompanyManager Phase FA-FD API readonly prep check REPAIRED"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/7800_PHASE_FA_FD_API_READONLY_PREP_ROADMAP.md"
check_file "$DESIGN_APP/7810_BOSS_IMPLEMENTATION_OK_WAIT_GATE.md"
check_file "$DESIGN_APP/7820_API_READONLY_MODE_CANDIDATE_CANON.md"
check_file "$DESIGN_APP/7830_API_READONLY_ENDPOINT_SMOKE_DESIGN.md"
check_file "$DESIGN_APP/7840_REPOSITORY_MODE_RESOLVER_CANDIDATE_CANON.md"
check_file "$DESIGN_APP/7850_API_READONLY_PREP_NO_CONNECT_GATE.md"
check_file "$API_REPO_JS"
check_file "$MODE_RESOLVER_JS"
check_file "$INDEX"
check_file "$BUNDLE_JS"
check_optional_file "$PREV_REPORT"

echo "------------------------------------------------------------"
echo "[2] Boss gate and readonly design"
check_grep_any "$DESIGN_APP/7810_BOSS_IMPLEMENTATION_OK_WAIT_GATE.md" "boss implementation ok gate" "Boss implementation OK" "implementation OK" "API接続 OK"
check_grep "WAITING" "$DESIGN_APP/7810_BOSS_IMPLEMENTATION_OK_WAIT_GATE.md" "boss ok waiting"
check_grep "api_readonly_candidate" "$DESIGN_APP/7820_API_READONLY_MODE_CANDIDATE_CANON.md" "readonly candidate mode"
check_grep_any "$DESIGN_APP/7830_API_READONLY_ENDPOINT_SMOKE_DESIGN.md" "bootstrap smoke endpoint" "GET /api/aicm/v1/bootstrap" "/api/aicm/v1/bootstrap"
check_grep "LocalRepository" "$DESIGN_APP/7840_REPOSITORY_MODE_RESOLVER_CANDIDATE_CANON.md" "mode resolver local repository"

echo "------------------------------------------------------------"
echo "[3] Mode resolver candidate JS"
check_grep "AicmRepositoryModeResolverCandidate" "$MODE_RESOLVER_JS" "mode resolver class"
check_grep_any "$MODE_RESOLVER_JS" "active mode local marker" 'ACTIVE_MODE = "local"' 'activeMode = "local"' 'activeMode: "local"' 'activeMode: ACTIVE_MODE'
check_grep "allowNetwork: false" "$MODE_RESOLVER_JS" "allow network false"
check_grep "realApiConnect: false" "$MODE_RESOLVER_JS" "real api false"
check_grep "liveAiworkerosCall: false" "$MODE_RESOLVER_JS" "live aiworker false"
check_grep_any "$MODE_RESOLVER_JS" "boss ok required marker" "BOSS_IMPLEMENTATION_OK_REQUIRED" "Boss implementation OK" "implementation OK"

echo "------------------------------------------------------------"
echo "[4] No network primitives"
if grep -Eq '\bfetch[[:space:]]*\(' "$MODE_RESOLVER_JS" "$API_REPO_JS"; then
  ng "candidate does not call fetch"
else
  ok "candidate does not call fetch"
fi

if grep -Eq 'XMLHttpRequest|navigator\.sendBeacon|WebSocket' "$MODE_RESOLVER_JS" "$API_REPO_JS"; then
  ng "candidate has no browser network primitive"
else
  ok "candidate has no browser network primitive"
fi

echo "------------------------------------------------------------"
echo "[5] Final UI remains local"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index final bundle"
check_grep "AICM_API_STUB_DISABLED" "$BUNDLE_JS" "final bundle api stub disabled"
check_grep "workflow_local_stub_wiring: true" "$BUNDLE_JS" "workflow local stub retained"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

if grep -q "aicm-repository-mode-resolver-candidate.js" "$INDEX"; then
  ng "index does not load mode resolver candidate"
else
  ok "index does not load mode resolver candidate"
fi

if grep -q "aicm-api-repository-candidate.js" "$INDEX"; then
  ng "index does not load api repository candidate"
else
  ok "index does not load api repository candidate"
fi

echo "------------------------------------------------------------"
echo "[6] No connect gate"
check_grep "REAL API CONNECT:" "$DESIGN_APP/7850_API_READONLY_PREP_NO_CONNECT_GATE.md" "real api not executed marker"
check_grep_any "$DESIGN_APP/7850_API_READONLY_PREP_NO_CONNECT_GATE.md" "fetch not executed marker" "FETCH:" "fetch"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/7850_API_READONLY_PREP_NO_CONNECT_GATE.md" "live aiworker not executed marker"
check_grep "STOP" "$DESIGN_APP/7850_API_READONLY_PREP_NO_CONNECT_GATE.md" "stop marker"

echo "------------------------------------------------------------"
echo "[7] Safety"
if grep -q "allowNetwork: true" "$BUNDLE_JS" "$API_REPO_JS" "$MODE_RESOLVER_JS"; then ng "real API network not enabled"; else ok "real API network not enabled"; fi
if grep -q "realApiConnect: true\|real_api_connect: true" "$BUNDLE_JS" "$API_REPO_JS" "$MODE_RESOLVER_JS"; then ng "real API connect not enabled"; else ok "real API connect not enabled"; fi
if grep -q "liveAiworkerosCall: true\|live_aiworkeros_call: true" "$BUNDLE_JS" "$API_REPO_JS" "$MODE_RESOLVER_JS"; then ng "live AIWorkerOS call not enabled"; else ok "live AIWorkerOS call not enabled"; fi

echo "------------------------------------------------------------"
echo "[8] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "WARN_COUNT: $WARN"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_FA_FD_API_READONLY_PREP_REPAIRED_PASS"
else
  echo "RESULT: PHASE_FA_FD_API_READONLY_PREP_REPAIRED_FAIL"
  echo "FAILED_LINES:"
  cat "$FAILED_LINES"
  exit 1
fi
