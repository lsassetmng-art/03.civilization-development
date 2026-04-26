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

check_not_grep() {
  if grep -q "$1" "$2" 2>/dev/null; then fail "$3"; else pass "$3"; fi
}

printf '%s\n' '============================================================'
printf '%s\n' 'AICompanyManager Phase AE supplemental materials role filter check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/2900_PHASE_AE_SUPPLEMENTAL_MATERIALS_ROLE_FILTER_ROADMAP.md"
check_file "${DESIGN_ROOT}/2910_REFERENCE_FILE_SUPPLEMENTAL_MATERIAL_CANON.md"
check_file "${DESIGN_ROOT}/2920_DEPARTMENT_ROLE_ROBOT_SELECTION_CANON.md"
check_file "${DESIGN_ROOT}/2990_PHASE_AE_SUPPLEMENTAL_MATERIALS_ROLE_FILTER_COMPLETION_REPORT.md"
check_file "${ROOT}/index.html"
check_file "${ROOT}/assets/css/phase-ae-ui.css"
check_file "${ROOT}/assets/js/phase-ae-stable-ui.js"

check_grep 'phase-ae-stable-ui.js' "${ROOT}/index.html" 'index loads Phase AE stable UI'
check_grep '補足資料' "${ROOT}/assets/js/phase-ae-stable-ui.js" 'supplemental material label'
check_grep '参照ファイル（作業前・作業中に読む資料）' "${ROOT}/assets/js/phase-ae-stable-ui.js" 'reference file help text'
check_grep '補足資料（メモ・スクショ・例・追加説明）' "${ROOT}/assets/js/phase-ae-stable-ui.js" 'supplemental material help text'
check_grep 'supplemental_materials' "${ROOT}/assets/js/phase-ae-stable-ui.js" 'supplemental materials state'
check_grep 'ROLE_CANDIDATES' "${ROOT}/assets/js/phase-ae-stable-ui.js" 'role candidates'
check_grep 'Manager Alpha@Manager' "${ROOT}/assets/js/phase-ae-stable-ui.js" 'manager candidate'
check_grep 'Leader Alpha@Leader' "${ROOT}/assets/js/phase-ae-stable-ui.js" 'leader candidate'
check_grep 'Worker Alpha@Worker' "${ROOT}/assets/js/phase-ae-stable-ui.js" 'worker candidate'
check_grep 'applyDepartmentRoleRobotFilter' "${ROOT}/assets/js/phase-ae-stable-ui.js" 'role robot filter function'
check_grep 'selected department' "${DESIGN_ROOT}/2920_DEPARTMENT_ROLE_ROBOT_SELECTION_CANON.md" 'selected department design'
check_grep 'selected role' "${DESIGN_ROOT}/2920_DEPARTMENT_ROLE_ROBOT_SELECTION_CANON.md" 'selected role design'
check_grep '補足資料' "${DESIGN_ROOT}/2910_REFERENCE_FILE_SUPPLEMENTAL_MATERIAL_CANON.md" 'supplemental material design'
check_grep '参照ファイル' "${DESIGN_ROOT}/2910_REFERENCE_FILE_SUPPLEMENTAL_MATERIAL_CANON.md" 'reference file design'

check_not_grep 'ledger-attached-files' "${ROOT}/assets/js/phase-ae-stable-ui.js" 'old ledger-attached-files removed'
check_not_grep 'attached_files' "${ROOT}/assets/js/phase-ae-stable-ui.js" 'old attached_files state removed'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_AE_SUPPLEMENTAL_MATERIALS_ROLE_FILTER_PASS'
else
  printf '%s\n' 'RESULT: PHASE_AE_SUPPLEMENTAL_MATERIALS_ROLE_FILTER_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
