#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

APP_NAME="AICompanyManager"

DESIGN_REPO="/data/data/com.termux/files/home/01.civilization-system"
IMPL_REPO="/data/data/com.termux/files/home/03.civilization-development"

DESIGN_APP="${DESIGN_REPO}/07.applications/03.business-app/${APP_NAME}"
IMPL_APP="${IMPL_REPO}/03.business-os/${APP_NAME}"

INDEX="${IMPL_APP}/index.html"
BUNDLE_JS="${IMPL_APP}/assets/js/phase-de-dh-workflow-final-local-ui.js"
BUNDLE_CSS="${IMPL_APP}/assets/css/phase-de-dh-workflow-final-local-ui.css"

SAFE_TMP_DIR="${HOME}/.tmp/${APP_NAME}/phase_di_dl_final_local_prepush_check"
mkdir -p "$SAFE_TMP_DIR"
CHECK_LOG="${SAFE_TMP_DIR}/final_local_prepush_check.log"
: > "$CHECK_LOG"

PASS=0
FAIL=0

ok() {
  echo "PASS: $1" | tee -a "$CHECK_LOG"
  PASS=$((PASS + 1))
}

ng() {
  echo "FAIL: $1" | tee -a "$CHECK_LOG"
  FAIL=$((FAIL + 1))
}

check_file() {
  if [ -f "$1" ]; then
    ok "$1"
  else
    ng "$1"
  fi
}

check_grep() {
  if grep -q "$1" "$2" 2>/dev/null; then
    ok "$3"
  else
    ng "$3"
  fi
}

echo "============================================================" | tee -a "$CHECK_LOG"
echo "AICompanyManager Phase DI-DL final local pre-push check REPAIR2" | tee -a "$CHECK_LOG"
echo "============================================================" | tee -a "$CHECK_LOG"

echo "------------------------------------------------------------" | tee -a "$CHECK_LOG"
echo "[1] Required final files" | tee -a "$CHECK_LOG"
check_file "$INDEX"
check_file "$BUNDLE_JS"
check_file "$BUNDLE_CSS"
check_file "$DESIGN_APP/6500_PHASE_DI_DL_FINAL_LOCAL_PREPUSH_ROADMAP.md"
check_file "$DESIGN_APP/6510_LOCAL_WIRING_FINAL_ACCEPTANCE_CANON.md"
check_file "$DESIGN_APP/6520_PRE_PUSH_VALIDATION_CANON.md"
check_file "$DESIGN_APP/6540_FINAL_LOCAL_NO_APPLY_GATE.md"
check_file "$DESIGN_APP/6700_PHASE_DI_DL_PREPUSH_REPAIR2_ROADMAP.md"
check_file "$DESIGN_APP/6710_PREPUSH_REPAIR2_SAFE_TMP_CANON.md"

echo "------------------------------------------------------------" | tee -a "$CHECK_LOG"
echo "[2] index one-script final bundle" | tee -a "$CHECK_LOG"
check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index loads final local bundle"
check_grep "phase-de-dh-workflow-final-local-ui.css" "$INDEX" "index loads final local css"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT" | tee -a "$CHECK_LOG"
if [ "$SCRIPT_COUNT" -eq 1 ]; then
  ok "index script count is 1"
else
  ng "index script count is 1"
fi

echo "------------------------------------------------------------" | tee -a "$CHECK_LOG"
echo "[3] accepted UI strings" | tee -a "$CHECK_LOG"
check_grep "AI企業ダッシュボード" "$BUNDLE_JS" "accepted dashboard retained"
check_grep "部門別タスク台帳" "$BUNDLE_JS" "accepted task ledger retained"
check_grep "レビュー・承認待ち一覧" "$BUNDLE_JS" "accepted review retained"
check_grep "data-screen=\"settings\">AI企業設定" "$BUNDLE_JS" "settings route retained"
check_grep "data-screen=\"company-add\">AI企業新規追加" "$BUNDLE_JS" "company add route retained"
check_grep "data-screen=\"department-detail\">部門詳細" "$BUNDLE_JS" "department detail route retained"
check_grep "data-screen=\"department-add\">新規追加" "$BUNDLE_JS" "department add route retained"
check_grep "data-screen=\"organization-detail\">組織詳細" "$BUNDLE_JS" "organization detail route retained"
check_grep "data-screen=\"organization-add\">新規追加" "$BUNDLE_JS" "organization add route retained"
check_grep "ロボット配置" "$BUNDLE_JS" "robot placement retained"

echo "------------------------------------------------------------" | tee -a "$CHECK_LOG"
echo "[4] local wiring markers" | tee -a "$CHECK_LOG"
check_grep "company_wiring: true" "$BUNDLE_JS" "company wiring marker"
check_grep "department_wiring: true" "$BUNDLE_JS" "department wiring marker"
check_grep "organization_wiring: true" "$BUNDLE_JS" "organization wiring marker"
check_grep "ledger_wiring: true" "$BUNDLE_JS" "ledger wiring marker"
check_grep "csv_wiring: true" "$BUNDLE_JS" "csv wiring marker"
check_grep "review_wiring: true" "$BUNDLE_JS" "review wiring marker"
check_grep "workflow_local_stub_wiring: true" "$BUNDLE_JS" "workflow local stub marker"
check_grep "workflowLocalStubWiring" "$BUNDLE_JS" "workflow wiring object"
check_grep "workflowLocalStubOnly: true" "$BUNDLE_JS" "workflow local stub only"
check_grep "AICM_API_STUB_DISABLED" "$BUNDLE_JS" "api stub remains disabled"
check_grep "liveAiworkerosCall: false" "$BUNDLE_JS" "live AIWorkerOS call false marker"

echo "------------------------------------------------------------" | tee -a "$CHECK_LOG"
echo "[5] safety markers" | tee -a "$CHECK_LOG"
if grep -q "MutationObserver" "$BUNDLE_JS"; then
  ng "MutationObserver not used"
else
  ok "MutationObserver not used"
fi

if grep -q "allowNetwork: true" "$BUNDLE_JS"; then
  ng "real API network not enabled"
else
  ok "real API network not enabled"
fi

if grep -q "live_aiworkeros_call: true" "$BUNDLE_JS"; then
  ng "live AIWorkerOS call not enabled"
else
  ok "live AIWorkerOS call not enabled"
fi

if grep -q "real_api_connect: true" "$BUNDLE_JS"; then
  ng "real API connect not enabled"
else
  ok "real API connect not enabled"
fi

echo "------------------------------------------------------------" | tee -a "$CHECK_LOG"
echo "[6] safe tmp path" | tee -a "$CHECK_LOG"
case "$SAFE_TMP_DIR" in
  "$HOME"/.tmp/*)
    ok "safe tmp dir is under HOME .tmp"
    ;;
  *)
    ng "safe tmp dir is under HOME .tmp"
    ;;
esac

if [ -d "$SAFE_TMP_DIR" ]; then
  ok "safe tmp dir exists"
else
  ng "safe tmp dir exists"
fi

if [ -f "$CHECK_LOG" ]; then
  ok "safe tmp check log exists"
else
  ng "safe tmp check log exists"
fi

echo "------------------------------------------------------------" | tee -a "$CHECK_LOG"
echo "[7] large file check" | tee -a "$CHECK_LOG"
LARGE_FILE_LIST="$(find "$DESIGN_APP" "$IMPL_APP" -type f -size +100M 2>/dev/null || true)"
if [ -z "$LARGE_FILE_LIST" ]; then
  ok "no files over 100MB in AICompanyManager scope"
else
  echo "$LARGE_FILE_LIST" | tee -a "$CHECK_LOG"
  ng "no files over 100MB in AICompanyManager scope"
fi

echo "------------------------------------------------------------" | tee -a "$CHECK_LOG"
echo "[8] git status readable" | tee -a "$CHECK_LOG"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then
  ok "01 design git status readable"
else
  ng "01 design git status readable"
fi

if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then
  ok "03 implementation git status readable"
else
  ng "03 implementation git status readable"
fi

echo "------------------------------------------------------------" | tee -a "$CHECK_LOG"
echo "PASS_COUNT: $PASS" | tee -a "$CHECK_LOG"
echo "FAIL_COUNT: $FAIL" | tee -a "$CHECK_LOG"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_DI_DL_FINAL_LOCAL_PREPUSH_REPAIR2_PASS" | tee -a "$CHECK_LOG"
else
  echo "RESULT: PHASE_DI_DL_FINAL_LOCAL_PREPUSH_REPAIR2_FAIL" | tee -a "$CHECK_LOG"
  exit 1
fi
