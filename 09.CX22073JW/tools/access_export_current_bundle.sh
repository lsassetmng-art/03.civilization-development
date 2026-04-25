#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
APPLY_090="$BASE/scripts/090_apply_cx22073jw_access_current_state_bundle_export.sh"
VERIFY_091="$BASE/scripts/091_verify_cx22073jw_access_current_state_bundle_export.sh"

if [ ! -x "$APPLY_090" ]; then
  echo "ERROR: missing apply script -> $APPLY_090"
  exit 1
fi

echo "============================================================"
echo "ACCESS CURRENT BUNDLE EXPORT"
echo "============================================================"

"$APPLY_090"

if [ -x "$VERIFY_091" ]; then
  "$VERIFY_091"
fi

echo "============================================================"
echo "ACCESS CURRENT BUNDLE EXPORT DONE"
echo "============================================================"
