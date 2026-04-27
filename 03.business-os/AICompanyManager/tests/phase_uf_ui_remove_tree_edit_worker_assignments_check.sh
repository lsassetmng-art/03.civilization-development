#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"
INDEX_FILE="$IMPL_APP_DIR/index.html"
JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"

SCRIPT_COUNT="$(grep -oi '<script' "$INDEX_FILE" | wc -l | tr -d ' ')"
PATCH_MARKER_COUNT="$(grep -c 'AICM_.*PATCH_BEGIN' "$JS_FILE" || true)"
TREE_COUNT="$(grep -c '課ツリー\|組織ツリー\|aicmOrganizationTreeHtml' "$JS_FILE" || true)"
MANAGER_ACTION_COUNT="$(grep -c 'save-department-manager-v2' "$JS_FILE" || true)"
LEADER_ACTION_COUNT="$(grep -c 'save-section-leader-v2' "$JS_FILE" || true)"
WORKER_ADD_COUNT="$(grep -c 'add-section-worker-assignment-v2' "$JS_FILE" || true)"
WORKER_UPDATE_COUNT="$(grep -c 'update-section-worker-assignment-v2' "$JS_FILE" || true)"

echo "SCRIPT_COUNT=$SCRIPT_COUNT"
echo "PATCH_MARKER_COUNT=$PATCH_MARKER_COUNT"
echo "TREE_COUNT=$TREE_COUNT"
echo "MANAGER_ACTION_COUNT=$MANAGER_ACTION_COUNT"
echo "LEADER_ACTION_COUNT=$LEADER_ACTION_COUNT"
echo "WORKER_ADD_COUNT=$WORKER_ADD_COUNT"
echo "WORKER_UPDATE_COUNT=$WORKER_UPDATE_COUNT"

if [ "$SCRIPT_COUNT" != "1" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

if [ "$PATCH_MARKER_COUNT" != "0" ] || [ "$TREE_COUNT" != "0" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

if [ "$MANAGER_ACTION_COUNT" = "0" ] || [ "$LEADER_ACTION_COUNT" = "0" ] || [ "$WORKER_ADD_COUNT" = "0" ] || [ "$WORKER_UPDATE_COUNT" = "0" ]; then
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
