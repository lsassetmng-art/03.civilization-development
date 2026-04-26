#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESIGN_ROOT="/data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/AICompanyManager"

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  printf 'PASS: %s\n' "$1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  printf 'FAIL: %s\n' "$1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

check_file() {
  if [ -f "$1" ]; then
    pass "$1"
  else
    fail "$1"
  fi
}

check_grep() {
  pattern="$1"
  file="$2"
  label="$3"
  if [ -f "$file" ] && grep -q "$pattern" "$file"; then
    pass "$label"
  else
    fail "$label"
  fi
}

printf '%s\n' '============================================================'
printf '%s\n' 'AICompanyManager Phase W multi company org tree check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/2100_PHASE_W_MULTI_COMPANY_ORG_TREE_ROADMAP.md"
check_file "${DESIGN_ROOT}/2110_MULTI_COMPANY_CREATION_CANON.md"
check_file "${DESIGN_ROOT}/2120_MULTI_ORGANIZATION_TREE_CANON.md"
check_file "${DESIGN_ROOT}/2130_PHASE_W_UI_BEHAVIOR_CANON.md"
check_file "${ROOT}/src/mock/phaseVData.js"
check_file "${ROOT}/assets/css/phase-v-ui.css"
check_file "${ROOT}/assets/js/phase-v-ui.js"
check_file "${ROOT}/tests/phase_w_multi_company_org_tree_check.sh"

check_grep 'add-company' "${ROOT}/assets/js/phase-v-ui.js" 'add company action'
check_grep 'add-org-tree' "${ROOT}/assets/js/phase-v-ui.js" 'add org tree action'
check_grep 'data-add-unit' "${ROOT}/assets/js/phase-v-ui.js" 'add org unit action'
check_grep 'parent_unit_id' "${ROOT}/assets/js/phase-v-ui.js" 'parent unit tree support'
check_grep 'organization_trees' "${ROOT}/src/mock/phaseVData.js" 'organization trees mock'
check_grep 'tree-alpha-dev' "${ROOT}/src/mock/phaseVData.js" 'multiple tree mock dev'
check_grep 'tree-alpha-delivery' "${ROOT}/src/mock/phaseVData.js" 'multiple tree mock delivery'
check_grep 'AIWorker' "${ROOT}/assets/js/phase-v-ui.js" 'AIWorker selection'
check_grep '会社を追加' "${ROOT}/assets/js/phase-v-ui.js" 'company add UI label'
check_grep '組織ツリーを追加' "${ROOT}/assets/js/phase-v-ui.js" 'org tree add UI label'
check_grep '組織要員を追加' "${ROOT}/assets/js/phase-v-ui.js" 'org unit add UI label'
check_grep 'multiple organization trees' "${DESIGN_ROOT}/2120_MULTI_ORGANIZATION_TREE_CANON.md" 'multi organization tree design'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_W_MULTI_COMPANY_ORG_TREE_PASS'
else
  printf '%s\n' 'RESULT: PHASE_W_MULTI_COMPANY_ORG_TREE_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
