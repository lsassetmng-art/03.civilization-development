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
printf '%s\n' 'AICompanyManager Phase X separated screens robot naming check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/2200_PHASE_X_SEPARATED_SCREENS_ROBOT_NAMING_ROADMAP.md"
check_file "${DESIGN_ROOT}/2210_SEPARATED_COMPANY_ORGANIZATION_SCREENS_CANON.md"
check_file "${DESIGN_ROOT}/2220_ROBOT_NAMING_PER_WORK_ROBOT_CANON.md"
check_file "${DESIGN_ROOT}/2230_PHASE_X_UI_BEHAVIOR_CANON.md"
check_file "${ROOT}/src/mock/phaseVData.js"
check_file "${ROOT}/assets/css/phase-v-ui.css"
check_file "${ROOT}/assets/js/phase-v-ui.js"

check_grep 'company-add' "${ROOT}/assets/js/phase-v-ui.js" 'company add tab'
check_grep 'company-edit' "${ROOT}/assets/js/phase-v-ui.js" 'company edit tab'
check_grep 'org-add' "${ROOT}/assets/js/phase-v-ui.js" 'organization add tab'
check_grep 'org-edit' "${ROOT}/assets/js/phase-v-ui.js" 'organization edit tab'
check_grep 'renderCompanyAdd' "${ROOT}/assets/js/phase-v-ui.js" 'separate company add screen'
check_grep 'renderCompanyEdit' "${ROOT}/assets/js/phase-v-ui.js" 'separate company edit screen'
check_grep 'renderOrgAdd' "${ROOT}/assets/js/phase-v-ui.js" 'separate organization add screen'
check_grep 'renderOrgEdit' "${ROOT}/assets/js/phase-v-ui.js" 'separate organization edit screen'
check_grep 'robot_name' "${ROOT}/src/mock/phaseVData.js" 'robot name in mock data'
check_grep 'robotLabel' "${ROOT}/assets/js/phase-v-ui.js" 'robot label function'
check_grep '@' "${ROOT}/assets/js/phase-v-ui.js" 'name at role display'
check_grep '名前@ロール' "${DESIGN_ROOT}/2220_ROBOT_NAMING_PER_WORK_ROBOT_CANON.md" 'name at role design'
check_grep '各作業ロボット' "${ROOT}/assets/js/phase-v-ui.js" 'per work robot naming UI'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_X_SEPARATED_SCREENS_ROBOT_NAMING_PASS'
else
  printf '%s\n' 'RESULT: PHASE_X_SEPARATED_SCREENS_ROBOT_NAMING_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
