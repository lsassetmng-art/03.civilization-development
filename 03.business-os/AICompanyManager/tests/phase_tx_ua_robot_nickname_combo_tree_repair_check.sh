#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"
INDEX_FILE="$IMPL_APP_DIR/index.html"
JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"

SCRIPT_COUNT="$(grep -oi '<script' "$INDEX_FILE" | wc -l | tr -d ' ')"
PATCH_MARKER_COUNT="$(grep -c 'AICM_.*PATCH_BEGIN' "$JS_FILE" || true)"
COMBO_ADD_ACTION_COUNT="$(grep -c 'add-organization-robot-assignment-v2' "$JS_FILE" || true)"
PRESIDENT_NICKNAME_COUNT="$(grep -c 'president_robot_nickname' "$JS_FILE" || true)"
ORG_TREE_COUNT="$(grep -c 'aicmOrganizationTreeHtml' "$JS_FILE" || true)"
TEXTAREA_ROBOT_COUNT="$(grep -n 'ロボット配置' "$JS_FILE" | grep -c 'textarea' || true)"

echo "SCRIPT_COUNT=$SCRIPT_COUNT"
echo "PATCH_MARKER_COUNT=$PATCH_MARKER_COUNT"
echo "COMBO_ADD_ACTION_COUNT=$COMBO_ADD_ACTION_COUNT"
echo "PRESIDENT_NICKNAME_COUNT=$PRESIDENT_NICKNAME_COUNT"
echo "ORG_TREE_COUNT=$ORG_TREE_COUNT"
echo "TEXTAREA_ROBOT_COUNT=$TEXTAREA_ROBOT_COUNT"

if [ "$SCRIPT_COUNT" != "1" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

if [ "$PATCH_MARKER_COUNT" != "0" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

if [ "$COMBO_ADD_ACTION_COUNT" = "0" ] || [ "$PRESIDENT_NICKNAME_COUNT" = "0" ] || [ "$ORG_TREE_COUNT" = "0" ] || [ "$TEXTAREA_ROBOT_COUNT" != "0" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

node --check "$JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED"
echo "psql: NOT EXECUTED"
echo "API WRITE: NOT EXECUTED"
echo "RLS APPLY: NOT EXECUTED"
echo "QUANTITY_CONSUMPTION: NOT EXECUTED"
