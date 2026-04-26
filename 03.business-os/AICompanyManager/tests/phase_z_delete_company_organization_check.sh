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
printf '%s\n' 'AICompanyManager Phase Z delete company organization check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/2400_PHASE_Z_DELETE_COMPANY_ORGANIZATION_ROADMAP.md"
check_file "${DESIGN_ROOT}/2410_COMPANY_ORGANIZATION_DELETE_CANON.md"
check_file "${ROOT}/assets/js/phase-z-delete-extension.js"
check_file "${ROOT}/index.html"

check_grep '会社削除' "${ROOT}/assets/js/phase-z-delete-extension.js" 'company delete UI'
check_grep 'delete-company-from-dashboard' "${ROOT}/assets/js/phase-z-delete-extension.js" 'company delete action'
check_grep '最後の1社は削除できません' "${ROOT}/assets/js/phase-z-delete-extension.js" 'last company guard'
check_grep 'data-delete-tree' "${ROOT}/assets/js/phase-z-delete-extension.js" 'organization tree delete hint'
check_grep 'data-delete-unit' "${ROOT}/assets/js/phase-z-delete-extension.js" 'organization unit delete hint'
check_grep 'phase-z-delete-extension.js' "${ROOT}/index.html" 'index loads delete extension'
check_grep 'company delete' "${DESIGN_ROOT}/2410_COMPANY_ORGANIZATION_DELETE_CANON.md" 'company delete design'
check_grep 'organization tree delete' "${DESIGN_ROOT}/2410_COMPANY_ORGANIZATION_DELETE_CANON.md" 'organization tree delete design'
check_grep 'organization unit delete' "${DESIGN_ROOT}/2410_COMPANY_ORGANIZATION_DELETE_CANON.md" 'organization unit delete design'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_Z_DELETE_COMPANY_ORGANIZATION_PASS'
else
  printf '%s\n' 'RESULT: PHASE_Z_DELETE_COMPANY_ORGANIZATION_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
