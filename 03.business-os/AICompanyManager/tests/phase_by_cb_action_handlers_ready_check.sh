#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN_APP="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"

INDEX="$ROOT/index.html"
BUNDLE_JS="$ROOT/assets/js/phase-by-cb-action-handlers-ready-ui.js"
BUNDLE_CSS="$ROOT/assets/css/phase-by-cb-action-handlers-ready-ui.css"
PAYLOAD_JS="$ROOT/assets/js/aicm-action-payload-builders.js"
HANDLERS_JS="$ROOT/assets/js/aicm-action-handlers.js"
ROUTER_JS="$ROOT/assets/js/aicm-action-router.js"

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
echo "AICompanyManager Phase BY-CB action handlers ready check"
echo "============================================================"

check_file "$INDEX"
check_file "$BUNDLE_JS"
check_file "$BUNDLE_CSS"
check_file "$PAYLOAD_JS"
check_file "$HANDLERS_JS"
check_file "$ROUTER_JS"

check_file "$DESIGN_APP/5600_PHASE_BY_CB_ACTION_HANDLERS_READY_ROADMAP.md"
check_file "$DESIGN_APP/5610_ACTION_PAYLOAD_BUILDER_CANON.md"
check_file "$DESIGN_APP/5620_CATEGORY_ACTION_HANDLER_CANON.md"
check_file "$DESIGN_APP/5630_ACTION_ROUTER_CANON.md"
check_file "$DESIGN_APP/5640_ACTION_HANDLERS_NO_CONNECT_GATE.md"

check_grep "phase-by-cb-action-handlers-ready-ui.js" "$INDEX" "index loads BY-CB bundle"
check_grep "phase-by-cb-action-handlers-ready-ui.css" "$INDEX" "index loads BY-CB css"

SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then
  ok "index one-script policy"
else
  ng "index one-script policy"
fi

check_grep "AicmActionPayloadBuilders" "$BUNDLE_JS" "bundle includes payload builders"
check_grep "createActionHandlers" "$BUNDLE_JS" "bundle includes action handlers"
check_grep "createActionRouter" "$BUNDLE_JS" "bundle includes action router"
check_grep "buildCreateCompanyPayload" "$BUNDLE_JS" "company payload builder"
check_grep "buildCreateDepartmentPayload" "$BUNDLE_JS" "department payload builder"
check_grep "buildCreateOrganizationPayload" "$BUNDLE_JS" "organization payload builder"
check_grep "buildSaveLedgerRowPayload" "$BUNDLE_JS" "ledger payload builder"
check_grep "buildReviewActionPayload" "$BUNDLE_JS" "review payload builder"
check_grep "AICM_API_STUB_DISABLED" "$BUNDLE_JS" "api stub remains disabled"
check_grep "accepted_handleAction_replacement: false" "$BUNDLE_JS" "handleAction not replaced marker"

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
  echo "RESULT: PHASE_BY_CB_ACTION_HANDLERS_READY_PASS"
else
  echo "RESULT: PHASE_BY_CB_ACTION_HANDLERS_READY_FAIL"
  exit 1
fi
