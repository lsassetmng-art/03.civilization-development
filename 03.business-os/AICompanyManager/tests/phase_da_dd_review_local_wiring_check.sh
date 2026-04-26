#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN_APP="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"

INDEX="$ROOT/index.html"
BUNDLE_JS="$ROOT/assets/js/phase-da-dd-review-local-wiring-ui.js"
BUNDLE_CSS="$ROOT/assets/css/phase-da-dd-review-local-wiring-ui.css"
REVIEW_WIRING_JS="$ROOT/assets/js/aicm-review-local-action-wiring.js"

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
echo "AICompanyManager Phase DA-DD review local wiring check"
echo "============================================================"

check_file "$INDEX"
check_file "$BUNDLE_JS"
check_file "$BUNDLE_CSS"
check_file "$REVIEW_WIRING_JS"

check_file "$DESIGN_APP/6300_PHASE_DA_DD_REVIEW_LOCAL_WIRING_ROADMAP.md"
check_file "$DESIGN_APP/6310_REVIEW_ACTION_LOCAL_WIRING_CANON.md"
check_file "$DESIGN_APP/6320_REVIEW_LOCAL_WIRING_REGRESSION_CANON.md"
check_file "$DESIGN_APP/6330_REVIEW_LOCAL_WIRING_NO_CONNECT_GATE.md"

check_grep "phase-da-dd-review-local-wiring-ui.js" "$INDEX" "index loads DA-DD bundle"
check_grep "phase-da-dd-review-local-wiring-ui.css" "$INDEX" "index loads DA-DD css"

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
check_grep "reviewLocalActionWiring" "$BUNDLE_JS" "bundle includes review wiring"
check_grep "review_actions_only: true" "$BUNDLE_JS" "review only marker"
check_grep "workflow_wiring: false" "$BUNDLE_JS" "workflow not wired marker"
check_grep "approve-review" "$REVIEW_WIRING_JS" "approve review wired"
check_grep "reject-review" "$REVIEW_WIRING_JS" "reject review wired"
check_grep "request-review-revision" "$REVIEW_WIRING_JS" "request revision wired"
check_grep "承認済み" "$REVIEW_WIRING_JS" "approve status"
check_grep "差し戻し" "$REVIEW_WIRING_JS" "reject status"
check_grep "修正待ち" "$REVIEW_WIRING_JS" "revision status"
check_grep "AicmLocalRepository" "$BUNDLE_JS" "local repository retained"
check_grep "AICM_API_STUB_DISABLED" "$BUNDLE_JS" "api stub remains disabled"

check_grep "AI企業ダッシュボード" "$BUNDLE_JS" "accepted dashboard retained"
check_grep "部門別タスク台帳" "$BUNDLE_JS" "accepted task ledger retained"
check_grep "レビュー・承認待ち一覧" "$BUNDLE_JS" "accepted review retained"
check_grep "data-screen=\"settings\">AI企業設定" "$BUNDLE_JS" "settings route retained"
check_grep "data-screen=\"company-add\">AI企業新規追加" "$BUNDLE_JS" "company add route retained"
check_grep "data-screen=\"department-detail\">部門詳細" "$BUNDLE_JS" "department detail route retained"
check_grep "data-screen=\"organization-detail\">組織詳細" "$BUNDLE_JS" "organization detail route retained"

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
  echo "RESULT: PHASE_DA_DD_REVIEW_LOCAL_WIRING_PASS"
else
  echo "RESULT: PHASE_DA_DD_REVIEW_LOCAL_WIRING_FAIL"
  exit 1
fi
