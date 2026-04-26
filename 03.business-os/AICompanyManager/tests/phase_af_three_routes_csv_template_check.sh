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
printf '%s\n' 'AICompanyManager Phase AF three routes CSV template check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/3000_PHASE_AF_THREE_ROUTES_CSV_TEMPLATE_ROADMAP.md"
check_file "${DESIGN_ROOT}/3010_THREE_WORK_ROUTES_CANON.md"
check_file "${DESIGN_ROOT}/3020_DEPARTMENT_TASK_LEDGER_CSV_IMPORT_CANON.md"
check_file "${DESIGN_ROOT}/3030_CSV_TEMPLATE_PROMPT_COPY_CANON.md"
check_file "${ROOT}/index.html"
check_file "${ROOT}/assets/css/phase-af-ui.css"
check_file "${ROOT}/assets/js/phase-af-stable-ui.js"

check_grep 'phase-af-stable-ui.js' "${ROOT}/index.html" 'index loads Phase AF stable UI'
check_grep 'president_policy_route' "${ROOT}/assets/js/phase-af-stable-ui.js" 'president policy route UI'
check_grep 'user_to_manager_route' "${ROOT}/assets/js/phase-af-stable-ui.js" 'user to manager route UI'
check_grep 'user_to_leader_route' "${ROOT}/assets/js/phase-af-stable-ui.js" 'user to leader route UI'
check_grep 'ManagerからLeaderへ配布' "${ROOT}/assets/js/phase-af-stable-ui.js" 'manager to leader distribution'
check_grep 'LeaderからWorkerへ配布' "${ROOT}/assets/js/phase-af-stable-ui.js" 'leader to worker distribution'
check_grep 'CSVアップロード' "${ROOT}/assets/js/phase-af-stable-ui.js" 'csv upload UI'
check_grep 'CSVプレビュー' "${ROOT}/assets/js/phase-af-stable-ui.js" 'csv preview UI'
check_grep '正常行を一括追加' "${ROOT}/assets/js/phase-af-stable-ui.js" 'csv import UI'
check_grep 'CSV作成テンプレ' "${ROOT}/assets/js/phase-af-stable-ui.js" 'csv template screen'
check_grep 'ChatGPT用プロンプトをコピー' "${ROOT}/assets/js/phase-af-stable-ui.js" 'copy prompt button'
check_grep 'deliverable_name,task_name,work_type,responsible_role,status' "${ROOT}/assets/js/phase-af-stable-ui.js" 'csv header'
check_grep 'parseDepartmentTaskLedgerCsv' "${ROOT}/assets/js/phase-af-stable-ui.js" 'csv parser'
check_grep 'importDepartmentTaskLedgerRows' "${ROOT}/assets/js/phase-af-stable-ui.js" 'csv import function'
check_grep 'supplemental_materials' "${ROOT}/assets/js/phase-af-stable-ui.js" 'supplemental materials csv field'
check_grep 'CSVのみ出力' "${ROOT}/assets/js/phase-af-stable-ui.js" 'prompt output rule'
check_grep 'CSV作成テンプレ' "${DESIGN_ROOT}/3030_CSV_TEMPLATE_PROMPT_COPY_CANON.md" 'csv template design'
check_grep 'one-click copy button' "${DESIGN_ROOT}/3030_CSV_TEMPLATE_PROMPT_COPY_CANON.md" 'one click copy design'
check_grep 'user_to_manager_route' "${DESIGN_ROOT}/3010_THREE_WORK_ROUTES_CANON.md" 'user manager route design'
check_grep 'user_to_leader_route' "${DESIGN_ROOT}/3010_THREE_WORK_ROUTES_CANON.md" 'user leader route design'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_AF_THREE_ROUTES_CSV_TEMPLATE_PASS'
else
  printf '%s\n' 'RESULT: PHASE_AF_THREE_ROUTES_CSV_TEMPLATE_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
