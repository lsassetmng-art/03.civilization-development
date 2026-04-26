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
printf '%s\n' 'AICompanyManager Phase U review reflection check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/1900_PHASE_U_REVIEW_REFLECTION_ROADMAP.md"
check_file "${DESIGN_ROOT}/1910_MULTI_COMPANY_ORGANIZATION_SETTINGS_DESIGN.md"
check_file "${DESIGN_ROOT}/1920_WORK_HANDOFF_MATERIALS_DESIGN.md"
check_file "${DESIGN_ROOT}/1930_PHASE_U_UI_REVISION_CANON.md"
check_file "${DESIGN_ROOT}/1940_AUTOMATED_REVIEW_DELIVERY_ONLY_HUMAN_GATE.md"
check_file "${ROOT}/src/mock/phaseUReviewData.js"
check_file "${ROOT}/assets/css/phase-u-review.css"
check_file "${ROOT}/assets/js/phase-u-review-ui.js"
check_file "${ROOT}/index.html"

check_grep '複数会社' "${DESIGN_ROOT}/1900_PHASE_U_REVIEW_REFLECTION_ROADMAP.md" 'multi company review input'
check_grep 'robot_naming_rule' "${DESIGN_ROOT}/1910_MULTI_COMPANY_ORGANIZATION_SETTINGS_DESIGN.md" 'robot naming design'
check_grep 'organization_units' "${ROOT}/src/mock/phaseUReviewData.js" 'organization mock data'
check_grep 'aicm-horizontal-dashboard' "${ROOT}/assets/css/phase-u-review.css" 'horizontal dashboard css'
check_grep '設定画面' "${ROOT}/assets/js/phase-u-review-ui.js" 'settings screen'
check_grep 'AI自動レビュー' "${ROOT}/assets/js/phase-u-review-ui.js" 'AI auto review UI'
check_grep '納品時のみ人間確認' "${ROOT}/assets/js/phase-u-review-ui.js" 'delivery only human gate'
check_grep '引き継ぎワンブロック' "${ROOT}/assets/js/phase-u-review-ui.js" 'handoff oneblock'
check_grep './assets/css/phase-u-review.css' "${ROOT}/index.html" 'index css injection'
check_grep './src/mock/phaseUReviewData.js' "${ROOT}/index.html" 'index data script injection'
check_grep './assets/js/phase-u-review-ui.js' "${ROOT}/index.html" 'index ui script injection'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_U_REVIEW_REFLECTION_PASS'
else
  printf '%s\n' 'RESULT: PHASE_U_REVIEW_REFLECTION_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
