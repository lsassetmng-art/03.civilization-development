#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"
LATEST_DIR="$BASE/latest"

TMP_FILE="$BASE/.tmp_access_empty_dirs_$$.txt"
trap 'rm -f "$TMP_FILE"' EXIT

mkdir -p "$BASE"

{
  find "$LOGS_DIR" -mindepth 1 -type d -empty 2>/dev/null || true
  find "$EXPORTS_DIR" -mindepth 1 -type d -empty 2>/dev/null || true
  find "$LATEST_DIR" -mindepth 1 -type d -empty 2>/dev/null || true
} | sort -u > "$TMP_FILE"

EMPTY_COUNT="$(awk 'END{print NR+0}' "$TMP_FILE")"

echo "============================================================"
echo "ACCESS CLEANUP EMPTY DIRS"
echo "============================================================"
echo "empty_dir_count_before=$EMPTY_COUNT"
echo "============================================================"

if [ "$EMPTY_COUNT" -eq 0 ]; then
  echo "NO_EMPTY_DIRS"
  exit 0
fi

sed -n '1,200p' "$TMP_FILE"

while IFS= read -r dir_path; do
  [ -n "${dir_path:-}" ] || continue
  rmdir "$dir_path" 2>/dev/null || true
done < "$TMP_FILE"

{
  find "$LOGS_DIR" -mindepth 1 -type d -empty 2>/dev/null || true
  find "$EXPORTS_DIR" -mindepth 1 -type d -empty 2>/dev/null || true
  find "$LATEST_DIR" -mindepth 1 -type d -empty 2>/dev/null || true
} | sort -u > "$TMP_FILE"

EMPTY_COUNT_AFTER="$(awk 'END{print NR+0}' "$TMP_FILE")"

echo "============================================================"
echo "ACCESS CLEANUP EMPTY DIRS DONE"
echo "============================================================"
echo "empty_dir_count_after=$EMPTY_COUNT_AFTER"
echo "============================================================"
