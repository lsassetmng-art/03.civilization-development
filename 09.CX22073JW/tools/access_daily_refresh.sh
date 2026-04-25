#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"

STATUS_CMD="$BASE/tools/access_status.sh"
LEGACY_CMD="$BASE/tools/access_legacy_readiness.sh"

APPLY_088="$BASE/scripts/088_apply_cx22073jw_access_baseline_health_gate.sh"
VERIFY_089="$BASE/scripts/089_verify_cx22073jw_access_baseline_health_gate.sh"
APPLY_090="$BASE/scripts/090_apply_cx22073jw_access_current_state_bundle_export.sh"
VERIFY_091="$BASE/scripts/091_verify_cx22073jw_access_current_state_bundle_export.sh"

echo "============================================================"
echo "ACCESS DAILY REFRESH START"
echo "============================================================"

if [ -x "$APPLY_088" ]; then
  echo "[1/4] baseline health refresh"
  "$APPLY_088"
  if [ -x "$VERIFY_089" ]; then
    "$VERIFY_089"
  fi
else
  echo "WARN: missing baseline apply -> $APPLY_088"
fi

if [ -x "$APPLY_090" ]; then
  echo "[2/4] current bundle export"
  "$APPLY_090"
  if [ -x "$VERIFY_091" ]; then
    "$VERIFY_091"
  fi
else
  echo "WARN: missing bundle apply -> $APPLY_090"
fi

if [ -x "$STATUS_CMD" ]; then
  echo "[3/4] status"
  "$STATUS_CMD"
else
  echo "WARN: missing status cmd -> $STATUS_CMD"
fi

if [ -x "$LEGACY_CMD" ]; then
  echo "[4/4] legacy readiness"
  "$LEGACY_CMD"
else
  echo "WARN: missing legacy cmd -> $LEGACY_CMD"
fi

echo "============================================================"
echo "ACCESS DAILY REFRESH DONE"
echo "============================================================"
