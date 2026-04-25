#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

AGE_DAYS="${1:-14}"

case "$AGE_DAYS" in
  ''|*[!0-9]*)
    echo "ERROR: AGE_DAYS must be numeric"
    echo "USAGE: access_cleanup_preview.sh [AGE_DAYS]"
    exit 1
    ;;
esac

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"

echo "============================================================"
echo "ACCESS CLEANUP PREVIEW"
echo "============================================================"
echo "age_days : $AGE_DAYS"
echo "============================================================"

echo "[old log dirs]"
if [ -d "$LOGS_DIR" ]; then
  find "$LOGS_DIR" -maxdepth 1 -mindepth 1 -type d -mtime +"$AGE_DAYS" | sort || true
else
  echo "MISSING: $LOGS_DIR"
fi

echo
echo "[old export dirs]"
if [ -d "$EXPORTS_DIR" ]; then
  find "$EXPORTS_DIR" -mindepth 2 -maxdepth 2 -type d -mtime +"$AGE_DAYS" | sort || true
else
  echo "MISSING: $EXPORTS_DIR"
fi

echo
echo "[old empty dirs]"
find "$BASE" \
  \( -path "$LOGS_DIR/*" -o -path "$EXPORTS_DIR/*" -o -path "$BASE/latest/*" \) \
  -type d -empty 2>/dev/null | sort || true

echo "============================================================"
echo "ACCESS CLEANUP PREVIEW DONE"
echo "============================================================"
