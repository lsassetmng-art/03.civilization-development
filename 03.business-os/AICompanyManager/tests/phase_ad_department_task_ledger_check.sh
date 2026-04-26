#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

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
printf '%s\n' 'AICompanyManager Phase AD department task ledger check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/2800_PHASE_AD_DEPARTMENT_TASK_LEDGER_ROADMAP.md"
check_file "${DESIGN_ROOT}/2810_DEPARTMENT_TASK_LEDGER_CANON.md"
check_file "${DESIGN_ROOT}/2820_PHASE_AD_UI_BEHAVIOR_CANON.md"
check_file "${ROOT}/index.html"
check_file "${ROOT}/assets/css/phase-ad-ui.css"
check_file "${ROOT}/assets/js/phase-ad-stable-ui.js"

check_grep 'phase-ad-stable-ui.js' "${ROOT}/index.html" 'index loads Phase AD stable UI'
check_grep '部門別タスク台帳' "${ROOT}/assets/js/phase-ad-stable-ui.js" 'department task ledger UI'
check_grep 'department_task_ledger' "${ROOT}/assets/js/phase-ad-stable-ui.js" 'department task ledger state'
check_grep '成果物名' "${ROOT}/assets/js/phase-ad-stable-ui.js" 'deliverable name UI'
check_grep 'タスク名' "${ROOT}/assets/js/phase-ad-stable-ui.js" 'task name UI'
check_grep '参照ファイル' "${ROOT}/assets/js/phase-ad-stable-ui.js" 'reference files UI'
check_grep '添付ファイル' "${ROOT}/assets/js/phase-ad-stable-ui.js" 'attached files UI'
check_grep 'bound_task_ledger_row_ids' "${ROOT}/assets/js/phase-ad-stable-ui.js" 'work packet binds task ledger rows'
check_grep 'デザイン案件' "${ROOT}/assets/js/phase-ad-stable-ui.js" 'non-development business support'
check_grep 'ラフ案作成' "${DESIGN_ROOT}/2810_DEPARTMENT_TASK_LEDGER_CANON.md" 'design company example'
check_grep 'President-Origin Provisional Rule' "${DESIGN_ROOT}/2810_DEPARTMENT_TASK_LEDGER_CANON.md" 'president provisional rule'

if grep -q '部門設計書台帳' "${ROOT}/assets/js/phase-ad-stable-ui.js"; then
  fail 'old department design ledger label removed from UI'
else
  pass 'old department design ledger label removed from UI'
fi

if grep -q 'design_ledger' "${ROOT}/assets/js/phase-ad-stable-ui.js"; then
  fail 'old design_ledger state removed from UI'
else
  pass 'old design_ledger state removed from UI'
fi

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_AD_DEPARTMENT_TASK_LEDGER_PASS'
else
  printf '%s\n' 'RESULT: PHASE_AD_DEPARTMENT_TASK_LEDGER_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
