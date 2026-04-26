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
printf '%s\n' 'AICompanyManager Phase V review2 check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/2000_PHASE_V_REVIEW2_ROADMAP.md"
check_file "${DESIGN_ROOT}/2010_SYSTEM_USE_NO_BILLING_CANON.md"
check_file "${DESIGN_ROOT}/2020_AIWORKER_ORGANIZATION_SELECTION_CANON.md"
check_file "${DESIGN_ROOT}/2030_MULTI_HANDOFF_TASK_HANDOFF_CANON.md"
check_file "${DESIGN_ROOT}/2040_CLEAN_SINGLE_SCREEN_UI_CANON.md"
check_file "${ROOT}/index.html"
check_file "${ROOT}/src/mock/phaseVData.js"
check_file "${ROOT}/assets/css/phase-v-ui.css"
check_file "${ROOT}/assets/js/phase-v-ui.js"

check_grep 'aicm-root' "${ROOT}/index.html" 'clean root'
check_grep 'phase-v-ui.css' "${ROOT}/index.html" 'phase v css only'
check_grep 'phase-v-ui.js' "${ROOT}/index.html" 'phase v js only'
check_grep 'phaseVData.js' "${ROOT}/index.html" 'phase v data only'
check_grep 'AIWorker' "${ROOT}/assets/js/phase-v-ui.js" 'AIWorker selection UI'
check_grep 'save-settings' "${ROOT}/assets/js/phase-v-ui.js" 'settings save action'
check_grep 'create-handoff' "${ROOT}/assets/js/phase-v-ui.js" 'multiple handoff creation'
check_grep 'task' "${ROOT}/assets/js/phase-v-ui.js" 'task handoff'
check_grep '課金なし' "${ROOT}/assets/js/phase-v-ui.js" 'no billing UI label'
check_grep 'system-use' "${DESIGN_ROOT}/2010_SYSTEM_USE_NO_BILLING_CANON.md" 'system use canon'
check_grep 'task' "${DESIGN_ROOT}/2030_MULTI_HANDOFF_TASK_HANDOFF_CANON.md" 'task handoff canon'

if grep -q 'phase-u-review-ui.js' "${ROOT}/index.html"; then
  fail 'old Phase U script removed from index'
else
  pass 'old Phase U script removed from index'
fi

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_V_REVIEW2_PASS'
else
  printf '%s\n' 'RESULT: PHASE_V_REVIEW2_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
