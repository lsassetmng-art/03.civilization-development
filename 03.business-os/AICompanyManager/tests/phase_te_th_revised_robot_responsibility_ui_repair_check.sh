#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"

INDEX_FILE="$(find "$IMPL_APP_DIR" -maxdepth 8 -type f -name 'index.html' | head -n 1 || true)"
JS_FILE="$(find "$IMPL_APP_DIR" -maxdepth 10 -type f -name 'phase-de-dh-workflow-final-local-ui.js' | head -n 1 || true)"

if [ -z "$INDEX_FILE" ] || [ -z "$JS_FILE" ]; then
  echo "RESULT: FAIL"
  echo "REASON: UI files missing"
  exit 1
fi

SCRIPT_COUNT="$(grep -oi '<script' "$INDEX_FILE" | wc -l | tr -d ' ')"
CORRECT_PATCH_COUNT="$(grep -c 'AICM_CORRECT_ROBOT_RESPONSIBILITY_UI_PATCH_BEGIN' "$JS_FILE" || true)"
BUSINESS_CATALOG_KEY_COUNT="$(grep -c 'aicm.businessRegisteredRobots.v1' "$JS_FILE" || true)"
PRESIDENT_KEY_COUNT="$(grep -c 'aicm.companyPresidentRobot.v2' "$JS_FILE" || true)"
ORG_PLACEMENT_KEY_COUNT="$(grep -c 'aicm.organizationRobotPlacements.v2' "$JS_FILE" || true)"

echo "SCRIPT_COUNT=$SCRIPT_COUNT"
echo "CORRECT_PATCH_COUNT=$CORRECT_PATCH_COUNT"
echo "BUSINESS_CATALOG_KEY_COUNT=$BUSINESS_CATALOG_KEY_COUNT"
echo "PRESIDENT_KEY_COUNT=$PRESIDENT_KEY_COUNT"
echo "ORG_PLACEMENT_KEY_COUNT=$ORG_PLACEMENT_KEY_COUNT"

if [ "$SCRIPT_COUNT" != "1" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

if [ "$CORRECT_PATCH_COUNT" = "0" ] || [ "$BUSINESS_CATALOG_KEY_COUNT" = "0" ] || [ "$PRESIDENT_KEY_COUNT" = "0" ] || [ "$ORG_PLACEMENT_KEY_COUNT" = "0" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED"
echo "psql: NOT EXECUTED"
echo "API WRITE: NOT EXECUTED"
echo "RLS APPLY: NOT EXECUTED"
