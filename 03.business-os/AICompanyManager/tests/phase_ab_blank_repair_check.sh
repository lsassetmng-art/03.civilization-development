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
printf '%s\n' 'AICompanyManager Phase AB blank repair check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/2600_PHASE_AB_BLANK_SCREEN_REPAIR_ROADMAP.md"
check_file "${ROOT}/index.html"
check_file "${ROOT}/assets/css/phase-ab-ui.css"
check_file "${ROOT}/assets/js/phase-ab-stable-ui.js"

check_grep 'phase-ab-stable-ui.js' "${ROOT}/index.html" 'index loads stable ui'
check_grep 'phase-ab-ui.css' "${ROOT}/index.html" 'index loads stable css'

if grep -q 'phase-aa-operation-screens-extension.js\|phase-z-delete-extension.js\|phase-v-ui.js' "${ROOT}/index.html"; then
  fail 'old extension scripts removed from index'
else
  pass 'old extension scripts removed from index'
fi

check_grep '会社操作へ' "${ROOT}/assets/js/phase-ab-stable-ui.js" 'dashboard route company operation'
check_grep '組織操作へ' "${ROOT}/assets/js/phase-ab-stable-ui.js" 'dashboard route organization operation'
check_grep '社内規則ファイル' "${ROOT}/assets/js/phase-ab-stable-ui.js" 'company rule file attachment'
check_grep '組織ツリールールファイル' "${ROOT}/assets/js/phase-ab-stable-ui.js" 'tree rule file attachment'
check_grep '組織ルールファイル' "${ROOT}/assets/js/phase-ab-stable-ui.js" 'unit rule file attachment'
check_grep 'handoff-files' "${ROOT}/assets/js/phase-ab-stable-ui.js" 'handoff file input'
check_grep 'robotLabel' "${ROOT}/assets/js/phase-ab-stable-ui.js" 'robot name at role'
check_grep 'window.onerror' "${ROOT}/assets/js/phase-ab-stable-ui.js" 'visible error handler'

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_AB_BLANK_REPAIR_PASS'
else
  printf '%s\n' 'RESULT: PHASE_AB_BLANK_REPAIR_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
