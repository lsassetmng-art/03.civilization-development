#!/data/data/com.termux/files/usr/bin/bash
set -eu

HOME_DIR="/data/data/com.termux/files/home"
IMPL_APP_DIR="$HOME_DIR/03.civilization-development/03.business-os/AICompanyManager"
INDEX_FILE="$IMPL_APP_DIR/index.html"
JS_FILE="$IMPL_APP_DIR/assets/js/phase-de-dh-workflow-final-local-ui.js"

SCRIPT_COUNT="$(grep -oi '<script' "$INDEX_FILE" | wc -l | tr -d ' ')"
PATCH_MARKER_COUNT="$(grep -c 'AICM_.*PATCH_BEGIN' "$JS_FILE" || true)"
SECTION_DETAIL_COUNT="$(grep -c '課詳細' "$JS_FILE" || true)"
SECTION_ADD_COUNT="$(grep -c '課追加' "$JS_FILE" || true)"
SECTION_LIST_COUNT="$(grep -c '課一覧' "$JS_FILE" || true)"

echo "SCRIPT_COUNT=$SCRIPT_COUNT"
echo "PATCH_MARKER_COUNT=$PATCH_MARKER_COUNT"
echo "SECTION_DETAIL_COUNT=$SECTION_DETAIL_COUNT"
echo "SECTION_ADD_COUNT=$SECTION_ADD_COUNT"
echo "SECTION_LIST_COUNT=$SECTION_LIST_COUNT"

if [ "$SCRIPT_COUNT" != "1" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

if [ "$PATCH_MARKER_COUNT" != "0" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

if [ "$SECTION_DETAIL_COUNT" = "0" ] || [ "$SECTION_ADD_COUNT" = "0" ] || [ "$SECTION_LIST_COUNT" = "0" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

node --check "$JS_FILE" >/dev/null

echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED"
echo "psql: NOT EXECUTED"
echo "API WRITE: NOT EXECUTED"
echo "RLS APPLY: NOT EXECUTED"
