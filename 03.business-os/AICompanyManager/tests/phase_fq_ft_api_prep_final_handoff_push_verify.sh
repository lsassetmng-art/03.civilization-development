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
echo "AICompanyManager Phase FQ-FT API prep final handoff push verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$DESIGN_APP/8100_PHASE_FM_FP_API_PREP_FINAL_HANDOFF_ROADMAP.md"
check_file "$DESIGN_APP/8110_API_PREP_CURRENT_STATE_CANON.md"
check_file "$DESIGN_APP/8120_BOSS_IMPLEMENTATION_OK_FINAL_WAIT_GATE.md"
check_file "$DESIGN_APP/8130_API_READONLY_CONNECT_START_CONDITIONS.md"
check_file "$DESIGN_APP/8140_API_PREP_NEXT_CHAT_HANDOFF_ONE_BLOCK.md"
check_file "$DESIGN_APP/8150_API_PREP_FINAL_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/8190_PHASE_FM_FP_API_PREP_FINAL_HANDOFF_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/8200_PHASE_FQ_FT_API_PREP_FINAL_HANDOFF_PUSH_ROADMAP.md"
check_file "$DESIGN_APP/8210_API_PREP_FINAL_HANDOFF_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/8220_API_PREP_FINAL_HANDOFF_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/8230_API_PREP_FINAL_HANDOFF_PUSH_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/8290_PHASE_FQ_FT_API_PREP_FINAL_HANDOFF_PUSH_COMPLETION_REPORT.md"
check_file "$INDEX"
check_file "$FINAL_BUNDLE_JS"
check_file "$FINAL_BUNDLE_CSS"
check_file "$API_REPO_JS"
check_file "$MODE_RESOLVER_JS"
check_optional_file "$IMPL_APP/tests/phase_fm_fp_api_prep_final_handoff_check.sh"

echo "------------------------------------------------------------"
echo "[2] Final local UI remains active"
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
echo "[3] Candidate JS safety"
check_grep "AicmApiRepositoryCandidate" "$API_REPO_JS" "api repository candidate"
check_grep "AICM_API_REPOSITORY_CANDIDATE_DISABLED" "$API_REPO_JS" "api repository disabled"
check_grep "AicmRepositoryModeResolverCandidate" "$MODE_RESOLVER_JS" "mode resolver candidate"
check_grep "BOSS_IMPLEMENTATION_OK_REQUIRED" "$MODE_RESOLVER_JS" "boss implementation ok gate"

if grep -Eq '\bfetch[[:space:]]*\(' "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
  ng "candidate does not call browser fetch"
else
  ok "candidate does not call browser fetch"
fi

if grep -Eq 'XMLHttpRequest|navigator\.sendBeacon|WebSocket' "$API_REPO_JS" "$MODE_RESOLVER_JS"; then
  ng "candidate has no browser network primitive"
else
  ok "candidate has no browser network primitive"
fi

if grep -q "allowNetwork: true" "$API_REPO_JS" "$MODE_RESOLVER_JS" "$FINAL_BUNDLE_JS"; then
  ng "real API network not enabled"
else
  ok "real API network not enabled"
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

echo "------------------------------------------------------------"
echo "[4] Handoff and no-connect gates"
check_grep "BEGIN_HANDOFF_BLOCK" "$DESIGN_APP/8140_API_PREP_NEXT_CHAT_HANDOFF_ONE_BLOCK.md" "handoff block begin"
check_grep "END_HANDOFF_BLOCK" "$DESIGN_APP/8140_API_PREP_NEXT_CHAT_HANDOFF_ONE_BLOCK.md" "handoff block end"
check_grep "Boss implementation OK" "$DESIGN_APP/8120_BOSS_IMPLEMENTATION_OK_FINAL_WAIT_GATE.md" "boss implementation ok gate"
check_grep "WAITING" "$DESIGN_APP/8120_BOSS_IMPLEMENTATION_OK_FINAL_WAIT_GATE.md" "boss waiting"
check_grep "REAL API CONNECT:" "$DESIGN_APP/8230_API_PREP_FINAL_HANDOFF_PUSH_NO_CONNECT_GATE.md" "real api not executed"
check_grep "BROWSER FETCH:" "$DESIGN_APP/8230_API_PREP_FINAL_HANDOFF_PUSH_NO_CONNECT_GATE.md" "browser fetch not executed"
check_grep "LIVE AIWORKEROS CALL:" "$DESIGN_APP/8230_API_PREP_FINAL_HANDOFF_PUSH_NO_CONNECT_GATE.md" "live aiworker not executed"
check_grep "STOP" "$DESIGN_APP/8230_API_PREP_FINAL_HANDOFF_PUSH_NO_CONNECT_GATE.md" "stop marker"

echo "------------------------------------------------------------"
echo "[5] Large file check"
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
  echo "RESULT: PHASE_FQ_FT_API_PREP_FINAL_HANDOFF_PUSH_VERIFY_PASS"
else
  echo "RESULT: PHASE_FQ_FT_API_PREP_FINAL_HANDOFF_PUSH_VERIFY_FAIL"
  exit 1
fi
