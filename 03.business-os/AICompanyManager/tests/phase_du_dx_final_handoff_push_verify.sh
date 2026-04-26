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
BUNDLE_JS="${IMPL_APP}/assets/js/phase-de-dh-workflow-final-local-ui.js"
BUNDLE_CSS="${IMPL_APP}/assets/css/phase-de-dh-workflow-final-local-ui.css"
HANDOFF_CHECK="${IMPL_APP}/tests/phase_dq_dt_final_local_handoff_check.sh"

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
echo "AICompanyManager Phase DU-DX final handoff push verify"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required files"
check_file "$INDEX"
check_file "$BUNDLE_JS"
check_file "$BUNDLE_CSS"
check_file "$HANDOFF_CHECK"
check_file "$DESIGN_APP/6900_PHASE_DQ_DT_FINAL_LOCAL_HANDOFF_ROADMAP.md"
check_file "$DESIGN_APP/6910_FINAL_LOCAL_IMPLEMENTATION_HANDOFF_BUNDLE.md"
check_file "$DESIGN_APP/6920_CURRENT_COMPLETION_STATE_CANON.md"
check_file "$DESIGN_APP/6930_NEXT_PHASE_START_CONDITIONS_CANON.md"
check_file "$DESIGN_APP/6940_NEXT_CHAT_HANDOFF_ONE_BLOCK.md"
check_file "$DESIGN_APP/6950_FINAL_HANDOFF_NO_CONNECT_GATE.md"
check_file "$DESIGN_APP/6960_PHASE_DQ_DT_HANDOFF_CHECK_REPAIR_ROADMAP.md"
check_file "$DESIGN_APP/6970_PUSH_REPORT_MARKER_TOLERANT_CHECK_CANON.md"
check_file "$DESIGN_APP/6991_PHASE_DQ_DT_HANDOFF_CHECK_REPAIR_COMPLETION_REPORT.md"
check_file "$DESIGN_APP/7000_PHASE_DU_DX_FINAL_HANDOFF_PUSH_ROADMAP.md"
check_file "$DESIGN_APP/7010_FINAL_HANDOFF_PUSH_SCOPE_CANON.md"
check_file "$DESIGN_APP/7020_FINAL_HANDOFF_PUSH_VERIFY_CANON.md"
check_file "$DESIGN_APP/7030_FINAL_HANDOFF_PUSH_NO_APPLY_GATE.md"
check_file "$DESIGN_APP/7090_PHASE_DU_DX_FINAL_HANDOFF_PUSH_COMPLETION_REPORT.md"

echo "------------------------------------------------------------"
echo "[2] Repaired handoff check"
if "$HANDOFF_CHECK"; then
  ok "DQ-DT repaired handoff check"
else
  ng "DQ-DT repaired handoff check"
fi

echo "------------------------------------------------------------"
echo "[3] Final local UI"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index loads final local bundle"
check_grep "phase-de-dh-workflow-final-local-ui.css" "$INDEX" "index loads final local css"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

echo "------------------------------------------------------------"
echo "[4] Local wiring markers"
check_grep "company_wiring: true" "$BUNDLE_JS" "company wiring marker"
check_grep "department_wiring: true" "$BUNDLE_JS" "department wiring marker"
check_grep "organization_wiring: true" "$BUNDLE_JS" "organization wiring marker"
check_grep "ledger_wiring: true" "$BUNDLE_JS" "ledger wiring marker"
check_grep "csv_wiring: true" "$BUNDLE_JS" "csv wiring marker"
check_grep "review_wiring: true" "$BUNDLE_JS" "review wiring marker"
check_grep "workflow_local_stub_wiring: true" "$BUNDLE_JS" "workflow local stub marker"
check_grep "AICM_API_STUB_DISABLED" "$BUNDLE_JS" "api stub disabled marker"

echo "------------------------------------------------------------"
echo "[5] Accepted UI"
check_grep "AI企業ダッシュボード" "$BUNDLE_JS" "accepted dashboard retained"
check_grep "部門別タスク台帳" "$BUNDLE_JS" "accepted task ledger retained"
check_grep "レビュー・承認待ち一覧" "$BUNDLE_JS" "accepted review retained"
check_grep "AI企業新規追加" "$BUNDLE_JS" "company add retained"
check_grep "部門詳細" "$BUNDLE_JS" "department detail retained"
check_grep "組織詳細" "$BUNDLE_JS" "organization detail retained"
check_grep "ロボット配置" "$BUNDLE_JS" "robot placement retained"

echo "------------------------------------------------------------"
echo "[6] Safety"
if grep -q "MutationObserver" "$BUNDLE_JS"; then ng "MutationObserver not used"; else ok "MutationObserver not used"; fi
if grep -q "allowNetwork: true" "$BUNDLE_JS"; then ng "real API network not enabled"; else ok "real API network not enabled"; fi
if grep -q "real_api_connect: true" "$BUNDLE_JS"; then ng "real API connect not enabled"; else ok "real API connect not enabled"; fi
if grep -q "live_aiworkeros_call: true" "$BUNDLE_JS"; then ng "live AIWorkerOS call not enabled"; else ok "live AIWorkerOS call not enabled"; fi

echo "------------------------------------------------------------"
echo "[7] Handoff block safety"
if grep -q '```' "$DESIGN_APP/6940_NEXT_CHAT_HANDOFF_ONE_BLOCK.md"; then
  ng "next chat handoff has no markdown code fence"
else
  ok "next chat handoff has no markdown code fence"
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
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_DU_DX_FINAL_HANDOFF_PUSH_VERIFY_PASS"
else
  echo "RESULT: PHASE_DU_DX_FINAL_HANDOFF_PUSH_VERIFY_FAIL"
  exit 1
fi
