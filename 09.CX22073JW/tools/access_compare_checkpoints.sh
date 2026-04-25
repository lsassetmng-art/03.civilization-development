#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"

LATEST_DIR="${1:-}"
PREVIOUS_DIR="${2:-}"

if [ -z "${LATEST_DIR:-}" ] || [ -z "${PREVIOUS_DIR:-}" ]; then
  mapfile -t checkpoint_dirs < <(
    find "$LOGS_DIR" -maxdepth 1 -type d -name '*_access_checkpoint' 2>/dev/null | sort | tail -n 2
  )
  if [ "${#checkpoint_dirs[@]}" -ge 2 ]; then
    PREVIOUS_DIR="${checkpoint_dirs[0]}"
    LATEST_DIR="${checkpoint_dirs[1]}"
  fi
fi

echo "============================================================"
echo "ACCESS COMPARE CHECKPOINTS"
echo "============================================================"

if [ -z "${LATEST_DIR:-}" ] || [ -z "${PREVIOUS_DIR:-}" ]; then
  echo "NOT_ENOUGH_CHECKPOINTS"
  echo "USAGE: access_compare_checkpoints.sh LATEST_DIR PREVIOUS_DIR"
  exit 0
fi

if [ ! -d "$LATEST_DIR" ] || [ ! -d "$PREVIOUS_DIR" ]; then
  echo "ERROR: checkpoint dir missing"
  echo "latest_dir   : ${LATEST_DIR:-}"
  echo "previous_dir : ${PREVIOUS_DIR:-}"
  exit 1
fi

echo "latest_dir   : $LATEST_DIR"
echo "previous_dir : $PREVIOUS_DIR"

compare_file_pair() {
  local label="$1"
  local latest_file="$2"
  local previous_file="$3"

  echo "------------------------------------------------------------"
  echo "$label"
  echo "latest_file   : ${latest_file:-NOT_FOUND}"
  echo "previous_file : ${previous_file:-NOT_FOUND}"

  if [ ! -f "$latest_file" ] || [ ! -f "$previous_file" ]; then
    echo "STATUS: FILE_MISSING"
    return 0
  fi

  if cmp -s "$latest_file" "$previous_file"; then
    echo "STATUS: SAME"
  else
    echo "STATUS: DIFFERENT"
    diff -u "$previous_file" "$latest_file" | sed -n '1,120p' || true
  fi
}

compare_file_pair \
  "tools inventory" \
  "$LATEST_DIR/010_tools_inventory.tsv" \
  "$PREVIOUS_DIR/010_tools_inventory.tsv"

compare_file_pair \
  "scripts inventory" \
  "$LATEST_DIR/020_scripts_inventory.tsv" \
  "$PREVIOUS_DIR/020_scripts_inventory.tsv"

compare_file_pair \
  "docs inventory" \
  "$LATEST_DIR/030_docs_inventory.tsv" \
  "$PREVIOUS_DIR/030_docs_inventory.tsv"

compare_file_pair \
  "latest links" \
  "$LATEST_DIR/040_latest_links.tsv" \
  "$PREVIOUS_DIR/040_latest_links.tsv"

compare_file_pair \
  "db status" \
  "$LATEST_DIR/050_db_status.tsv" \
  "$PREVIOUS_DIR/050_db_status.tsv"

compare_file_pair \
  "db run codes" \
  "$LATEST_DIR/051_db_run_codes.tsv" \
  "$PREVIOUS_DIR/051_db_run_codes.tsv"

compare_file_pair \
  "hash inventory" \
  "$LATEST_DIR/060_hash_inventory.tsv" \
  "$PREVIOUS_DIR/060_hash_inventory.tsv"

echo "============================================================"
echo "ACCESS COMPARE CHECKPOINTS DONE"
echo "============================================================"
