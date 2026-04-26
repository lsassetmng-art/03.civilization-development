#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN_APP="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"

INDEX="$ROOT/index.html"
BUNDLE_JS="$ROOT/assets/js/phase-bq-bt-repository-ready-ui.js"
BUNDLE_CSS="$ROOT/assets/css/phase-bq-bt-repository-ready-ui.css"

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
echo "AICompanyManager Phase BQ-BT repository-ready bundle check"
echo "============================================================"

check_file "$INDEX"
check_file "$BUNDLE_JS"
check_file "$BUNDLE_CSS"

check_file "$DESIGN_APP/5400_PHASE_BQ_BT_REPOSITORY_READY_BUNDLE_ROADMAP.md"
check_file "$DESIGN_APP/5410_REPOSITORY_INTEGRATION_PLAN.md"
check_file "$DESIGN_APP/5420_HANDLE_ACTION_SEPARATION_PLAN.md"
check_file "$DESIGN_APP/5430_ONE_SCRIPT_REPOSITORY_READY_BUNDLE_CANON.md"
check_file "$DESIGN_APP/5440_REPOSITORY_READY_NO_CONNECT_GATE.md"

check_grep "phase-bq-bt-repository-ready-ui.js" "$INDEX" "index loads repository-ready bundle"
check_grep "phase-bq-bt-repository-ready-ui.css" "$INDEX" "index loads repository-ready css"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then
  ok "index one-script policy"
else
  ng "index one-script policy"
fi

check_grep "AicmApiClient" "$BUNDLE_JS" "bundle includes api client"
check_grep "AicmStateAdapter" "$BUNDLE_JS" "bundle includes state adapter"
check_grep "AicmRepository" "$BUNDLE_JS" "bundle includes repository interface"
check_grep "AicmLocalRepository" "$BUNDLE_JS" "bundle includes local repository"
check_grep "AicmApiRepositoryStub" "$BUNDLE_JS" "bundle includes api repository stub"
check_grep "AICM_API_STUB_DISABLED" "$BUNDLE_JS" "api stub disabled guard"

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
  echo "RESULT: PHASE_BQ_BT_REPOSITORY_READY_BUNDLE_PASS"
else
  echo "RESULT: PHASE_BQ_BT_REPOSITORY_READY_BUNDLE_FAIL"
  exit 1
fi
