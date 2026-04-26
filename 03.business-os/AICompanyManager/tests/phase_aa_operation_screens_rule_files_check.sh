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
printf '%s\n' 'AICompanyManager Phase AA operation screens rule files check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/2500_PHASE_AA_OPERATION_SCREENS_RULE_FILES_ROADMAP.md"
check_file "${DESIGN_ROOT}/2510_COMPANY_OPERATION_SCREEN_CANON.md"
check_file "${DESIGN_ROOT}/2520_ORGANIZATION_OPERATION_SCREEN_CANON.md"
check_file "${DESIGN_ROOT}/2530_PHASE_AA_UI_BEHAVIOR_CANON.md"
check_file "${ROOT}/assets/js/phase-aa-operation-screens-extension.js"
check_file "${ROOT}/index.html"

check_grep '会社操作' "${ROOT}/assets/js/phase-aa-operation-screens-extension.js" 'company operation screen'
check_grep '組織操作' "${ROOT}/assets/js/phase-aa-operation-screens-extension.js" 'organization operation screen'
check_grep 'data-aa-screen="company-operation"' "${ROOT}/assets/js/phase-aa-operation-screens-extension.js" 'dashboard route to company operation'
check_grep 'data-aa-screen="organization-operation"' "${ROOT}/assets/js/phase-aa-operation-screens-extension.js" 'dashboard route to organization operation'
check_grep '社内規則' "${ROOT}/assets/js/phase-aa-operation-screens-extension.js" 'company rule file label'
check_grep 'aa-company-rule-files' "${ROOT}/assets/js/phase-aa-operation-screens-extension.js" 'company rule file input'
check_grep '組織ルール' "${ROOT}/assets/js/phase-aa-operation-screens-extension.js" 'organization rule file label'
check_grep 'data-aa-tree-rule-files' "${ROOT}/assets/js/phase-aa-operation-screens-extension.js" 'organization tree rule files'
check_grep 'data-aa-unit-rule-files' "${ROOT}/assets/js/phase-aa-operation-screens-extension.js" 'organization unit rule files'
check_grep 'rule_files' "${ROOT}/assets/js/phase-aa-operation-screens-extension.js" 'rule file metadata state'
check_grep 'removeInlineOperationPanels' "${ROOT}/assets/js/phase-aa-operation-screens-extension.js" 'inline operation panels hidden'
check_grep 'phase-aa-operation-screens-extension.js' "${ROOT}/index.html" 'index loads phase AA extension'
check_grep '会社操作' "${DESIGN_ROOT}/2510_COMPANY_OPERATION_SCREEN_CANON.md" 'company operation design'
check_grep '組織操作' "${DESIGN_ROOT}/2520_ORGANIZATION_OPERATION_SCREEN_CANON.md" 'organization operation design'
check_grep 'file name' "${DESIGN_ROOT}/2510_COMPANY_OPERATION_SCREEN_CANON.md" 'company file metadata design'
check_grep 'organization unit level' "${DESIGN_ROOT}/2520_ORGANIZATION_OPERATION_SCREEN_CANON.md" 'organization unit file design'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_AA_OPERATION_SCREENS_RULE_FILES_PASS'
else
  printf '%s\n' 'RESULT: PHASE_AA_OPERATION_SCREENS_RULE_FILES_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
