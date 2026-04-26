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
FINAL_PUSH_VERIFY="${IMPL_APP}/tests/phase_du_dx_final_handoff_push_verify.sh"

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
echo "AICompanyManager Phase DY-EB DB/RLS pre-apply review check"
echo "============================================================"

echo "------------------------------------------------------------"
echo "[1] Required review files"
check_file "$DESIGN_APP/7100_PHASE_DY_EB_DB_RLS_PREAPPLY_REVIEW_ROADMAP.md"
check_file "$DESIGN_APP/7110_DB_RLS_API_PREAPPLY_REVIEW_LEDGER.md"
check_file "$DESIGN_APP/7120_SATO_DB_REVIEW_CHECKLIST.md"
check_file "$DESIGN_APP/7130_PERSONA_DATABASE_URL_PREAPPLY_GATE.md"
check_file "$DESIGN_APP/7140_DB_APPLY_GO_STOP_DECISION_SHEET.md"
check_file "$DESIGN_APP/7150_DB_RLS_PREAPPLY_NO_APPLY_GATE.md"

echo "------------------------------------------------------------"
echo "[2] Final local implementation files"
check_file "$INDEX"
check_file "$BUNDLE_JS"
check_file "$BUNDLE_CSS"

echo "------------------------------------------------------------"
echo "[3] Final local markers"
check_grep "company_wiring: true" "$BUNDLE_JS" "company wiring marker"
check_grep "department_wiring: true" "$BUNDLE_JS" "department wiring marker"
check_grep "organization_wiring: true" "$BUNDLE_JS" "organization wiring marker"
check_grep "ledger_wiring: true" "$BUNDLE_JS" "ledger wiring marker"
check_grep "csv_wiring: true" "$BUNDLE_JS" "csv wiring marker"
check_grep "review_wiring: true" "$BUNDLE_JS" "review wiring marker"
check_grep "workflow_local_stub_wiring: true" "$BUNDLE_JS" "workflow local stub marker"
check_grep "AICM_API_STUB_DISABLED" "$BUNDLE_JS" "api stub disabled marker"

echo "------------------------------------------------------------"
echo "[4] Pre-apply gate markers"
check_grep "PERSONA_DATABASE_URL" "$DESIGN_APP/7130_PERSONA_DATABASE_URL_PREAPPLY_GATE.md" "persona database url gate"
check_grep "DATABASE_URL" "$DESIGN_APP/7130_PERSONA_DATABASE_URL_PREAPPLY_GATE.md" "database url warning exists"
check_grep "佐藤" "$DESIGN_APP/7120_SATO_DB_REVIEW_CHECKLIST.md" "sato review checklist"
check_grep "current_decision:" "$DESIGN_APP/7140_DB_APPLY_GO_STOP_DECISION_SHEET.md" "go stop decision exists"
check_grep "STOP" "$DESIGN_APP/7140_DB_APPLY_GO_STOP_DECISION_SHEET.md" "current decision stop"
check_grep "DB WRITE:" "$DESIGN_APP/7150_DB_RLS_PREAPPLY_NO_APPLY_GATE.md" "db write no apply marker"
check_grep "psql:" "$DESIGN_APP/7150_DB_RLS_PREAPPLY_NO_APPLY_GATE.md" "psql no apply marker"

echo "------------------------------------------------------------"
echo "[5] Safety"
SCRIPT_COUNT="$(grep -c '<script ' "$INDEX" || true)"
echo "SCRIPT_COUNT: $SCRIPT_COUNT"
if [ "$SCRIPT_COUNT" -eq 1 ]; then ok "index script count is 1"; else ng "index script count is 1"; fi

if grep -q "MutationObserver" "$BUNDLE_JS"; then ng "MutationObserver not used"; else ok "MutationObserver not used"; fi
if grep -q "allowNetwork: true" "$BUNDLE_JS"; then ng "real API network not enabled"; else ok "real API network not enabled"; fi
if grep -q "real_api_connect: true" "$BUNDLE_JS"; then ng "real API connect not enabled"; else ok "real API connect not enabled"; fi
if grep -q "live_aiworkeros_call: true" "$BUNDLE_JS"; then ng "live AIWorkerOS call not enabled"; else ok "live AIWorkerOS call not enabled"; fi

echo "------------------------------------------------------------"
echo "[6] Large file check"
LARGE_FILE_LIST="$(find "$DESIGN_APP" "$IMPL_APP" -type f -size +100M 2>/dev/null || true)"
if [ -z "$LARGE_FILE_LIST" ]; then
  ok "no files over 100MB in AICompanyManager scope"
else
  echo "$LARGE_FILE_LIST"
  ng "no files over 100MB in AICompanyManager scope"
fi

echo "------------------------------------------------------------"
echo "[7] Git status readable"
if git -C "$DESIGN_REPO" status --short -- "$DESIGN_APP" >/dev/null 2>&1; then ok "01 design git status readable"; else ng "01 design git status readable"; fi
if git -C "$IMPL_REPO" status --short -- "$IMPL_APP" >/dev/null 2>&1; then ok "03 implementation git status readable"; else ng "03 implementation git status readable"; fi

echo "------------------------------------------------------------"
echo "PASS_COUNT: $PASS"
echo "FAIL_COUNT: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo "RESULT: PHASE_DY_EB_DB_RLS_PREAPPLY_REVIEW_PASS"
else
  echo "RESULT: PHASE_DY_EB_DB_RLS_PREAPPLY_REVIEW_FAIL"
  exit 1
fi
