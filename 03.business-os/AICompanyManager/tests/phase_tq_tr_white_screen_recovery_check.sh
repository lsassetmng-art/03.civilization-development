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
MARKER_COUNT="$(grep -c 'AICM_.*PATCH_BEGIN' "$JS_FILE" || true)"

echo "SCRIPT_COUNT=$SCRIPT_COUNT"
echo "PATCH_MARKER_COUNT=$MARKER_COUNT"

if [ "$SCRIPT_COUNT" != "1" ]; then
  echo "RESULT: FAIL"
  exit 1
fi

if command -v node >/dev/null 2>&1; then
  node --check "$JS_FILE" >/dev/null
fi

echo "RESULT: PASS"
echo "DB WRITE: NOT EXECUTED"
echo "psql: NOT EXECUTED"
echo "API WRITE: NOT EXECUTED"
echo "RLS APPLY: NOT EXECUTED"
