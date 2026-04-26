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

check_not_grep() {
  if grep -q "$1" "$2" 2>/dev/null; then fail "$3"; else pass "$3"; fi
}

printf '%s\n' '============================================================'
printf '%s\n' 'AICompanyManager Phase AH company common rules check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/3200_PHASE_AH_COMPANY_COMMON_RULES_ROADMAP.md"
check_file "${DESIGN_ROOT}/3210_COMPANY_COMMON_RULES_CANON.md"
check_file "${ROOT}/index.html"
check_file "${ROOT}/assets/css/phase-ah-ui.css"
check_file "${ROOT}/assets/js/phase-ah-stable-ui.js"

check_grep 'phase-ah-stable-ui.js' "${ROOT}/index.html" 'index loads Phase AH stable UI'
check_grep '会社共通ルール' "${ROOT}/assets/js/phase-ah-stable-ui.js" 'company common rules label'
check_grep 'company_common_rules' "${ROOT}/assets/js/phase-ah-stable-ui.js" 'company common rules state'
check_grep 'addCompanyCommonRules' "${ROOT}/assets/js/phase-ah-stable-ui.js" 'company common rules add handler'
check_grep 'normalizeCompanyCommonRules' "${ROOT}/assets/js/phase-ah-stable-ui.js" 'company common rules migration'
check_grep '設計開発規約欄は廃止' "${ROOT}/assets/js/phase-ah-stable-ui.js" 'separate development rule section removed message'
check_grep '会社共通ルール' "${DESIGN_ROOT}/3210_COMPANY_COMMON_RULES_CANON.md" 'company common rules design'
check_grep 'Do not keep these as separate' "${DESIGN_ROOT}/3210_COMPANY_COMMON_RULES_CANON.md" 'separate sections removed design'

check_not_grep '設計開発規約' "${ROOT}/index.html" 'index has no design development rule wording'
check_not_grep '設計開発ルール' "${ROOT}/index.html" 'index has no design development rule label'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_AH_COMPANY_COMMON_RULES_PASS'
else
  printf '%s\n' 'RESULT: PHASE_AH_COMPANY_COMMON_RULES_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
