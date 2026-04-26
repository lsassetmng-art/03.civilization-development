#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN_APP="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"

INDEX="$ROOT/index.html"
BUNDLE_JS="$ROOT/assets/js/phase-bu-bx-action-adapter-ready-ui.js"
BUNDLE_CSS="$ROOT/assets/css/phase-bu-bx-action-adapter-ready-ui.css"
ACTION_JS="$ROOT/assets/js/aicm-action-adapter.js"
RUNTIME_JS="$ROOT/assets/js/aicm-repository-runtime.js"

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
echo "AICompanyManager Phase BU-BX action adapter runtime check"
echo "============================================================"

check_file "$INDEX"
check_file "$BUNDLE_JS"
check_file "$BUNDLE_CSS"
check_file "$ACTION_JS"
check_file "$RUNTIME_JS"

check_file "$DESIGN_APP/5500_PHASE_BU_BX_ACTION_ADAPTER_RUNTIME_ROADMAP.md"
check_file "$DESIGN_APP/5510_ACTION_ADAPTER_CANON.md"
check_file "$DESIGN_APP/5520_REPOSITORY_RUNTIME_WIRING_CANON.md"
check_file "$DESIGN_APP/5530_ACCEPTED_UI_REGRESSION_CHECKLIST.md"
check_file "$DESIGN_APP/5540_ACTION_ADAPTER_NO_CONNECT_GATE.md"

check_grep "phase-bu-bx-action-adapter-ready-ui.js" "$INDEX" "index loads BU-BX bundle"
check_grep "phase-bu-bx-action-adapter-ready-ui.css" "$INDEX" "index loads BU-BX css"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then
  ok "index one-script policy"
else
  ng "index one-script policy"
fi

check_grep "AicmActionAdapter" "$BUNDLE_JS" "bundle includes action adapter"
check_grep "createRuntime" "$BUNDLE_JS" "bundle includes runtime"
check_grep "AicmLocalRepository" "$BUNDLE_JS" "bundle includes local repository"
check_grep "AicmApiRepositoryStub" "$BUNDLE_JS" "bundle includes api stub"
check_grep "AICM_API_STUB_DISABLED" "$BUNDLE_JS" "api stub remains disabled"
check_grep "realApiConnect: false" "$BUNDLE_JS" "real API connect false"

check_grep "AI企業ダッシュボード" "$BUNDLE_JS" "accepted dashboard retained"
check_grep "部門別タスク台帳" "$BUNDLE_JS" "accepted task ledger retained"
check_grep "レビュー・承認待ち一覧" "$BUNDLE_JS" "accepted review retained"
check_grep "data-screen=\"settings\">AI企業設定" "$BUNDLE_JS" "settings route retained"
check_grep "data-screen=\"company-add\">AI企業新規追加" "$BUNDLE_JS" "company add route retained"
check_grep "data-screen=\"department-detail\">部門詳細" "$BUNDLE_JS" "department detail route retained"
check_grep "data-screen=\"organization-detail\">組織詳細" "$BUNDLE_JS" "organization detail route retained"
check_grep "data-screen=\"department-add\">新規追加" "$BUNDLE_JS" "department add route retained"
check_grep "data-screen=\"organization-add\">新規追加" "$BUNDLE_JS" "organization add route retained"

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

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_BU_BX_ACTION_ADAPTER_RUNTIME_PASS"
else
  echo "RESULT: PHASE_BU_BX_ACTION_ADAPTER_RUNTIME_FAIL"
  exit 1
fi
