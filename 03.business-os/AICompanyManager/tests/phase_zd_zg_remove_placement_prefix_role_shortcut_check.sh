#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$IMPL_APP_DIR/index.html"
PREVIEW_JS="$IMPL_APP_DIR/assets/js/aicm-robot-placement-payload-preview.js"
GUARD_JS="$IMPL_APP_DIR/assets/js/aicm-legacy-local-robot-selection-guard.js"
MAIN_JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"
SERVER_JS="$IMPL_APP_DIR/server/aicm-local-ui-api-server.mjs"

grep -q 'AICM_ROLE_ELIGIBILITY_SEGMENT_STRICT_RESOLVER_V12' "$PREVIEW_JS"
grep -q 'AICM_LEGACY_GUARD_ROLE_ELIGIBILITY_SEGMENT_STRICT_V2' "$GUARD_JS"
grep -q 'idx = source.indexOf("対応:")' "$PREVIEW_JS"
grep -q 'idx = text.indexOf("対応:")' "$GUARD_JS"
grep -q 'isValidBusinessOsSelection(select, target)' "$GUARD_JS"
grep -q 'isInvalidLegacySelection(select, target)' "$GUARD_JS"
grep -q 'aicm_remove_placement_prefix_role_shortcut_v12' "$INDEX_FILE"
grep -q 'aicm_guard_remove_placement_prefix_role_shortcut_v2' "$INDEX_FILE"

if grep -q 'source.indexOf(String(target.role || "") + "配置:")' "$PREVIEW_JS"; then
  echo "RESULT: FAIL"
  echo "REASON: preview still accepts placement-prefix role shortcut"
  exit 1
fi

if grep -q 'AICM_ROLE_ELIGIBILITY_SEGMENT_STRICT_RESOLVER_V12' "$MAIN_JS_FILE"; then
  echo "RESULT: FAIL"
  echo "REASON: main UI JS should not be modified"
  exit 1
fi

node --check "$PREVIEW_JS" >/dev/null
node --check "$GUARD_JS" >/dev/null
node --check "$MAIN_JS_FILE" >/dev/null
node --check "$SERVER_JS" >/dev/null

echo "RESULT: PASS"
echo "PLACEMENT_PREFIX_ROLE_SHORTCUT_REMOVED: ACTIVE"
echo "ROLE_ELIGIBILITY_SEGMENT: 対応_ONLY"
echo "MANAGER_SHOULD_NOT_PICK_LEADER_HD_R4: EXPECTED"
echo "DB_WRITE: NOT_EXECUTED"
echo "API_WRITE: NOT_EXECUTED"
echo "RLS_APPLY: NOT_EXECUTED"
