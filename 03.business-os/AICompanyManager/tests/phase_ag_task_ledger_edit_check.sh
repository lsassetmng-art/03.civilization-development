#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"

PASS_COUNT=0
FAIL_COUNT=0

pass() { printf 'PASS: %s\n' "$1"; PASS_COUNT=$((PASS_COUNT + 1)); }
fail() { printf 'FAIL: %s\n' "$1"; FAIL_COUNT=$((FAIL_COUNT + 1)); }

check_file() {
  if [ -f "$1" ]; then pass "$1"; else fail "$1"; fi
}

check_grep() {
  if grep -q "$1" "$2" 2>/dev/null; then pass "$3"; else fail "$3"; fi
}

printf '%s\n' '============================================================'
printf '%s\n' 'AICompanyManager Phase AG task ledger edit check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/3100_PHASE_AG_TASK_LEDGER_EDIT_ROADMAP.md"
check_file "${DESIGN_ROOT}/3110_DEPARTMENT_TASK_LEDGER_EDIT_CANON.md"
check_file "${ROOT}/index.html"
check_file "${ROOT}/assets/css/phase-ag-ui.css"
check_file "${ROOT}/assets/js/phase-ag-stable-ui.js"

check_grep 'phase-ag-stable-ui.js' "${ROOT}/index.html" 'index loads Phase AG stable UI'
check_grep '台帳行の変更' "${ROOT}/assets/js/phase-ag-stable-ui.js" 'ledger edit panel'
check_grep '変更する台帳行' "${ROOT}/assets/js/phase-ag-stable-ui.js" 'select ledger row'
check_grep '選択行を読み込む' "${ROOT}/assets/js/phase-ag-stable-ui.js" 'load selected row'
check_grep '変更を保存' "${ROOT}/assets/js/phase-ag-stable-ui.js" 'save row'
check_grep '選択行を削除' "${ROOT}/assets/js/phase-ag-stable-ui.js" 'delete row'
check_grep 'ledger_row_id は維持' "${ROOT}/assets/js/phase-ag-stable-ui.js" 'stable row id UI'
check_grep 'handleLoadLedgerRow' "${ROOT}/assets/js/phase-ag-stable-ui.js" 'load handler'
check_grep 'handleSaveLedgerRow' "${ROOT}/assets/js/phase-ag-stable-ui.js" 'save handler'
check_grep 'handleDeleteLedgerRow' "${ROOT}/assets/js/phase-ag-stable-ui.js" 'delete handler'
check_grep 'ledger_row_id must not change' "${DESIGN_ROOT}/3110_DEPARTMENT_TASK_LEDGER_EDIT_CANON.md" 'stable row id design'
check_grep 'existing rows' "${DESIGN_ROOT}/3110_DEPARTMENT_TASK_LEDGER_EDIT_CANON.md" 'edit existing rows design'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_AG_TASK_LEDGER_EDIT_PASS'
else
  printf '%s\n' 'RESULT: PHASE_AG_TASK_LEDGER_EDIT_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
