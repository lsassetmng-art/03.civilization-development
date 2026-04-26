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
printf '%s\n' 'AICompanyManager Phase AC work packet department ledger check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/2700_PHASE_AC_WORK_PACKET_DEPARTMENT_LEDGER_ROADMAP.md"
check_file "${DESIGN_ROOT}/2710_COMPANY_UNIFIED_RULES_CANON.md"
check_file "${DESIGN_ROOT}/2720_DEPARTMENT_DESIGN_DOCUMENT_LEDGER_CANON.md"
check_file "${DESIGN_ROOT}/2730_MANAGER_LEADER_WORK_BREAKDOWN_CANON.md"
check_file "${DESIGN_ROOT}/2740_STRUCTURED_WORK_PACKET_CANON.md"
check_file "${ROOT}/index.html"
check_file "${ROOT}/assets/css/phase-ac-ui.css"
check_file "${ROOT}/assets/js/phase-ac-stable-ui.js"

check_grep 'phase-ac-stable-ui.js' "${ROOT}/index.html" 'index loads Phase AC stable UI'
check_grep '会社統一ルール' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'company unified rules UI'
check_grep '部門設計書台帳' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'department design ledger UI'
check_grep '構造化仕事パケット' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'structured work packet UI'
check_grep '一括配布先部門' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'bulk department delivery UI'
check_grep '部門受信箱' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'department inbox UI'
check_grep 'Manager 粗分解表' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'manager broad breakdown UI'
check_grep 'Leader 成果物・タスク分解' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'leader task breakdown UI'
check_grep 'Worker 成果物' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'worker deliverable UI'
check_grep 'bound_ledger_item_ids' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'explicit ledger binding'
check_grep 'company_rules' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'company rules state'
check_grep 'design_development_rules' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'design development rules state'
check_grep 'design_ledger' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'department design ledger state'
check_grep 'フリーテキストは仕事名と補足メモだけ' "${ROOT}/assets/js/phase-ac-stable-ui.js" 'minimal free text UI'
check_grep 'President' "${DESIGN_ROOT}/2730_MANAGER_LEADER_WORK_BREAKDOWN_CANON.md" 'President flow design'
check_grep 'Manager' "${DESIGN_ROOT}/2730_MANAGER_LEADER_WORK_BREAKDOWN_CANON.md" 'Manager flow design'
check_grep 'Leader' "${DESIGN_ROOT}/2730_MANAGER_LEADER_WORK_BREAKDOWN_CANON.md" 'Leader flow design'
check_grep 'Worker' "${DESIGN_ROOT}/2730_MANAGER_LEADER_WORK_BREAKDOWN_CANON.md" 'Worker flow design'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_AC_WORK_PACKET_DEPARTMENT_LEDGER_PASS'
else
  printf '%s\n' 'RESULT: PHASE_AC_WORK_PACKET_DEPARTMENT_LEDGER_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
