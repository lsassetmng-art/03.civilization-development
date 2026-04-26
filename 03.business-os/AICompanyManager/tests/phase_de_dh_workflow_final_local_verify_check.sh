#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN_APP="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"

INDEX="$ROOT/index.html"
BUNDLE_JS="$ROOT/assets/js/phase-de-dh-workflow-final-local-ui.js"
BUNDLE_CSS="$ROOT/assets/css/phase-de-dh-workflow-final-local-ui.css"
WORKFLOW_WIRING_JS="$ROOT/assets/js/aicm-workflow-local-stub-wiring.js"

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
echo "AICompanyManager Phase DE-DH workflow final local verify check"
echo "============================================================"

check_file "$INDEX"
check_file "$BUNDLE_JS"
check_file "$BUNDLE_CSS"
check_file "$WORKFLOW_WIRING_JS"

check_file "$DESIGN_APP/6400_PHASE_DE_DH_WORKFLOW_FINAL_LOCAL_VERIFY_ROADMAP.md"
check_file "$DESIGN_APP/6410_WORKFLOW_LOCAL_STUB_WIRING_CANON.md"
check_file "$DESIGN_APP/6420_FULL_LOCAL_WIRING_REGRESSION_CANON.md"
check_file "$DESIGN_APP/6430_LOCAL_WIRING_PRE_PUSH_CHECKLIST.md"
check_file "$DESIGN_APP/6440_WORKFLOW_FINAL_LOCAL_NO_CONNECT_GATE.md"

check_grep "phase-de-dh-workflow-final-local-ui.js" "$INDEX" "index loads DE-DH bundle"
check_grep "phase-de-dh-workflow-final-local-ui.css" "$INDEX" "index loads DE-DH css"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then
  ok "index one-script policy"
else
  ng "index one-script policy"
fi

check_grep "company_wiring: true" "$BUNDLE_JS" "company wiring retained marker"
check_grep "department_wiring: true" "$BUNDLE_JS" "department wiring retained marker"
check_grep "organization_wiring: true" "$BUNDLE_JS" "organization wiring retained marker"
check_grep "ledger_wiring: true" "$BUNDLE_JS" "ledger wiring retained marker"
check_grep "csv_wiring: true" "$BUNDLE_JS" "csv wiring retained marker"
check_grep "review_wiring: true" "$BUNDLE_JS" "review wiring retained marker"
check_grep "workflowLocalStubWiring" "$BUNDLE_JS" "bundle includes workflow wiring"
check_grep "workflow_local_stub_wiring: true" "$BUNDLE_JS" "workflow marker"
check_grep "workflowLocalStubOnly: true" "$WORKFLOW_WIRING_JS" "workflow local stub only"
check_grep "start-workflow" "$WORKFLOW_WIRING_JS" "start workflow wired"
check_grep "start-ai-workflow" "$WORKFLOW_WIRING_JS" "start ai workflow wired"
check_grep "run-workflow" "$WORKFLOW_WIRING_JS" "run workflow wired"
check_grep "liveAiworkerosCall: false" "$WORKFLOW_WIRING_JS" "live aiworkeros false"
check_grep "AicmLocalRepository" "$BUNDLE_JS" "local repository retained"
check_grep "AICM_API_STUB_DISABLED" "$BUNDLE_JS" "api stub remains disabled"

check_grep "AI企業ダッシュボード" "$BUNDLE_JS" "accepted dashboard retained"
check_grep "部門別タスク台帳" "$BUNDLE_JS" "accepted task ledger retained"
check_grep "レビュー・承認待ち一覧" "$BUNDLE_JS" "accepted review retained"
check_grep "data-screen=\"settings\">AI企業設定" "$BUNDLE_JS" "settings route retained"
check_grep "data-screen=\"company-add\">AI企業新規追加" "$BUNDLE_JS" "company add route retained"
check_grep "data-screen=\"department-detail\">部門詳細" "$BUNDLE_JS" "department detail route retained"
check_grep "data-screen=\"organization-detail\">組織詳細" "$BUNDLE_JS" "organization detail route retained"
check_grep "ロボット配置" "$BUNDLE_JS" "robot placement retained"

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

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_DE_DH_WORKFLOW_FINAL_LOCAL_VERIFY_PASS"
else
  echo "RESULT: PHASE_DE_DH_WORKFLOW_FINAL_LOCAL_VERIFY_FAIL"
  exit 1
fi
