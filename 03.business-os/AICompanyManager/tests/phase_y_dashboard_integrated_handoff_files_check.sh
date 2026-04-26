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
printf '%s\n' 'AICompanyManager Phase Y dashboard integrated handoff files check'
printf '%s\n' '============================================================'

check_file "${DESIGN_ROOT}/2300_PHASE_Y_DASHBOARD_INTEGRATED_HANDOFF_FILES_ROADMAP.md"
check_file "${DESIGN_ROOT}/2310_DASHBOARD_INTEGRATED_COMPANY_ORG_OPERATION_CANON.md"
check_file "${DESIGN_ROOT}/2320_HANDOFF_ATTACHMENT_CANON.md"
check_file "${ROOT}/assets/css/phase-v-ui.css"
check_file "${ROOT}/assets/js/phase-v-ui.js"

check_grep 'renderCompanyAddPanel' "${ROOT}/assets/js/phase-v-ui.js" 'company add inside dashboard'
check_grep 'renderCompanyEditPanel' "${ROOT}/assets/js/phase-v-ui.js" 'company edit inside dashboard'
check_grep 'renderOrgTreeAddPanel' "${ROOT}/assets/js/phase-v-ui.js" 'org tree add inside dashboard'
check_grep 'renderOrgUnitAddPanel' "${ROOT}/assets/js/phase-v-ui.js" 'org unit add inside dashboard'
check_grep 'renderOrgEditPanel' "${ROOT}/assets/js/phase-v-ui.js" 'org edit inside dashboard'
check_grep 'type="file"' "${ROOT}/assets/js/phase-v-ui.js" 'handoff file input'
check_grep 'multiple' "${ROOT}/assets/js/phase-v-ui.js" 'multiple file selection'
check_grep 'pendingAttachments' "${ROOT}/assets/js/phase-v-ui.js" 'pending attachments state'
check_grep 'attachments:' "${ROOT}/assets/js/phase-v-ui.js" 'handoff attachments output'
check_grep '会社ダッシュボード' "${ROOT}/assets/js/phase-v-ui.js" 'dashboard main tab'
check_grep '組織ツリー追加' "${ROOT}/assets/js/phase-v-ui.js" 'org tree add label'
check_grep '追加ファイル' "${ROOT}/assets/js/phase-v-ui.js" 'additional file label'

if grep -q 'company-add' "${ROOT}/assets/js/phase-v-ui.js"; then
  fail 'company-add top-level tab removed'
else
  pass 'company-add top-level tab removed'
fi

if grep -q 'org-add' "${ROOT}/assets/js/phase-v-ui.js"; then
  fail 'org-add top-level tab removed'
else
  pass 'org-add top-level tab removed'
fi

printf '%s\n' '------------------------------------------------------------'
printf 'PASS_COUNT: %s\n' "$PASS_COUNT"
printf 'FAIL_COUNT: %s\n' "$FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '%s\n' 'RESULT: PHASE_Y_DASHBOARD_INTEGRATED_HANDOFF_FILES_PASS'
else
  printf '%s\n' 'RESULT: PHASE_Y_DASHBOARD_INTEGRATED_HANDOFF_FILES_FAIL'
  exit 1
fi

printf '%s\n' '============================================================'
