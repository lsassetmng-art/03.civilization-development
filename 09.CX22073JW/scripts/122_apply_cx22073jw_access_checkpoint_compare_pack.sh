#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_compare_checkpoints.sh" <<'ACCESS_COMPARE_CHECKPOINTS_CMD'
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
ACCESS_COMPARE_CHECKPOINTS_CMD
chmod +x "$TOOLS_DIR/access_compare_checkpoints.sh"

cat > "$TOOLS_DIR/access_make_checkpoint_diff_report.sh" <<'ACCESS_CHECKPOINT_DIFF_REPORT_CMD'
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

if [ -z "${LATEST_DIR:-}" ] || [ -z "${PREVIOUS_DIR:-}" ]; then
  echo "NOT_ENOUGH_CHECKPOINTS"
  echo "USAGE: access_make_checkpoint_diff_report.sh LATEST_DIR PREVIOUS_DIR"
  exit 0
fi

if [ ! -d "$LATEST_DIR" ] || [ ! -d "$PREVIOUS_DIR" ]; then
  echo "ERROR: checkpoint dir missing"
  echo "latest_dir   : ${LATEST_DIR:-}"
  echo "previous_dir : ${PREVIOUS_DIR:-}"
  exit 1
fi

OUT_DIR="$BASE/logs/$(date +%Y%m%d_%H%M%S)_access_checkpoint_diff_report"
MANIFEST_MD="$OUT_DIR/000_manifest.md"
REPORT_MD="$OUT_DIR/010_checkpoint_diff_report.md"
TOOLS_DIFF="$OUT_DIR/020_tools_inventory.diff"
SCRIPTS_DIFF="$OUT_DIR/030_scripts_inventory.diff"
DOCS_DIFF="$OUT_DIR/040_docs_inventory.diff"
LATEST_DIFF="$OUT_DIR/050_latest_links.diff"
DB_STATUS_DIFF="$OUT_DIR/060_db_status.diff"
DB_RUN_CODES_DIFF="$OUT_DIR/070_db_run_codes.diff"
HASH_DIFF="$OUT_DIR/080_hash_inventory.diff"

mkdir -p "$OUT_DIR"

make_diff_file() {
  local previous_file="$1"
  local latest_file="$2"
  local out_file="$3"

  if [ ! -f "$previous_file" ] || [ ! -f "$latest_file" ]; then
    {
      echo "FILE_MISSING"
      echo "previous_file=$previous_file"
      echo "latest_file=$latest_file"
    } > "$out_file"
    return 0
  fi

  if cmp -s "$previous_file" "$latest_file"; then
    echo "NO_DIFF" > "$out_file"
  else
    diff -u "$previous_file" "$latest_file" > "$out_file" || true
  fi
}

make_diff_file \
  "$PREVIOUS_DIR/010_tools_inventory.tsv" \
  "$LATEST_DIR/010_tools_inventory.tsv" \
  "$TOOLS_DIFF"

make_diff_file \
  "$PREVIOUS_DIR/020_scripts_inventory.tsv" \
  "$LATEST_DIR/020_scripts_inventory.tsv" \
  "$SCRIPTS_DIFF"

make_diff_file \
  "$PREVIOUS_DIR/030_docs_inventory.tsv" \
  "$LATEST_DIR/030_docs_inventory.tsv" \
  "$DOCS_DIFF"

make_diff_file \
  "$PREVIOUS_DIR/040_latest_links.tsv" \
  "$LATEST_DIR/040_latest_links.tsv" \
  "$LATEST_DIFF"

make_diff_file \
  "$PREVIOUS_DIR/050_db_status.tsv" \
  "$LATEST_DIR/050_db_status.tsv" \
  "$DB_STATUS_DIFF"

make_diff_file \
  "$PREVIOUS_DIR/051_db_run_codes.tsv" \
  "$LATEST_DIR/051_db_run_codes.tsv" \
  "$DB_RUN_CODES_DIFF"

make_diff_file \
  "$PREVIOUS_DIR/060_hash_inventory.tsv" \
  "$LATEST_DIR/060_hash_inventory.tsv" \
  "$HASH_DIFF"

diff_status() {
  local diff_file="$1"
  if [ ! -f "$diff_file" ]; then
    echo "missing"
  elif grep -qx 'NO_DIFF' "$diff_file"; then
    echo "same"
  elif grep -qx 'FILE_MISSING' "$diff_file"; then
    echo "file_missing"
  else
    echo "different"
  fi
}

TOOLS_STATUS="$(diff_status "$TOOLS_DIFF")"
SCRIPTS_STATUS="$(diff_status "$SCRIPTS_DIFF")"
DOCS_STATUS="$(diff_status "$DOCS_DIFF")"
LATEST_STATUS="$(diff_status "$LATEST_DIFF")"
DB_STATUS_STATUS="$(diff_status "$DB_STATUS_DIFF")"
DB_RUN_CODES_STATUS="$(diff_status "$DB_RUN_CODES_DIFF")"
HASH_STATUS="$(diff_status "$HASH_DIFF")"

cat > "$MANIFEST_MD" <<EOF_CHECKPOINT_DIFF_MANIFEST
# ============================================================
# ACCESS CHECKPOINT DIFF REPORT MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
latest_dir: $LATEST_DIR
previous_dir: $PREVIOUS_DIR
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_checkpoint_diff_report.md
- 020_tools_inventory.diff
- 030_scripts_inventory.diff
- 040_docs_inventory.diff
- 050_latest_links.diff
- 060_db_status.diff
- 070_db_run_codes.diff
- 080_hash_inventory.diff
EOF_CHECKPOINT_DIFF_MANIFEST

cat > "$REPORT_MD" <<EOF_CHECKPOINT_DIFF_REPORT
# ============================================================
# ACCESS CHECKPOINT DIFF REPORT
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
latest_dir: $LATEST_DIR
previous_dir: $PREVIOUS_DIR

diff_status:
- tools_inventory: $TOOLS_STATUS
- scripts_inventory: $SCRIPTS_STATUS
- docs_inventory: $DOCS_STATUS
- latest_links: $LATEST_STATUS
- db_status: $DB_STATUS_STATUS
- db_run_codes: $DB_RUN_CODES_STATUS
- hash_inventory: $HASH_STATUS

artifacts:
- 020_tools_inventory.diff
- 030_scripts_inventory.diff
- 040_docs_inventory.diff
- 050_latest_links.diff
- 060_db_status.diff
- 070_db_run_codes.diff
- 080_hash_inventory.diff

note:
Use this report to compare the latest checkpoint against the immediately previous checkpoint.
EOF_CHECKPOINT_DIFF_REPORT

echo "============================================================"
echo "ACCESS CHECKPOINT DIFF REPORT CREATED"
echo "============================================================"
echo "out_dir    : $OUT_DIR"
echo "report_md  : $REPORT_MD"
echo "============================================================"
sed -n '1,120p' "$REPORT_MD"
ACCESS_CHECKPOINT_DIFF_REPORT_CMD
chmod +x "$TOOLS_DIR/access_make_checkpoint_diff_report.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_compare_checkpoints.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_122'

checkpoint_compare_commands:
- ./access_compare_checkpoints.sh [LATEST_DIR] [PREVIOUS_DIR]
- ./access_make_checkpoint_diff_report.sh [LATEST_DIR] [PREVIOUS_DIR]

recommended_checkpoint_compare_flow:
1. ./access_list_checkpoints.sh
2. ./access_compare_checkpoints.sh
3. ./access_make_checkpoint_diff_report.sh
README_APPEND_122
  fi
else
  cat > "$README_FILE" <<'README_NEW_122'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

checkpoint_compare_commands:
- ./access_compare_checkpoints.sh [LATEST_DIR] [PREVIOUS_DIR]
- ./access_make_checkpoint_diff_report.sh [LATEST_DIR] [PREVIOUS_DIR]
README_NEW_122
fi

echo "============================================================"
echo "ACCESS CHECKPOINT COMPARE PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
