#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_workspace_stats.sh" <<'ACCESS_WORKSPACE_STATS_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
SCRIPTS_DIR="$BASE/scripts"
DOCS_DIR="$BASE/docs"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"
LATEST_DIR="$BASE/latest"

count_files() {
  local dir_path="$1"
  if [ -d "$dir_path" ]; then
    find "$dir_path" -maxdepth 1 -type f | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
}

count_dirs() {
  local dir_path="$1"
  if [ -d "$dir_path" ]; then
    find "$dir_path" -maxdepth 1 -mindepth 1 -type d | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
}

count_named_dirs() {
  local dir_path="$1"
  local pattern="$2"
  if [ -d "$dir_path" ]; then
    find "$dir_path" -maxdepth 1 -type d -name "$pattern" | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
}

dir_size_kb() {
  local dir_path="$1"
  if [ -d "$dir_path" ]; then
    du -sk "$dir_path" 2>/dev/null | awk '{print $1}'
  else
    echo 0
  fi
}

view_exists() {
  local v="$1"
  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | grep -qx 't'
SELECT EXISTS (
  SELECT 1
  FROM information_schema.views
  WHERE table_schema = 'cx22073jw'
    AND table_name = '$v'
);
SQL
}

TOOLS_COUNT="$(count_files "$TOOLS_DIR")"
SCRIPTS_COUNT="$(count_files "$SCRIPTS_DIR")"
DOCS_COUNT="$(count_files "$DOCS_DIR")"
LOG_DIR_COUNT="$(count_dirs "$LOGS_DIR")"
EXPORT_DIR_COUNT="$(count_dirs "$EXPORTS_DIR")"
LATEST_ENTRY_COUNT="$(
  if [ -d "$LATEST_DIR" ]; then
    find "$LATEST_DIR" -maxdepth 1 -mindepth 1 | wc -l | tr -d '[:space:]'
  else
    echo 0
  fi
)"
CHECKPOINT_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_checkpoint')"
SHIFT_REPORT_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_shift_report')"
TIMELINE_REPORT_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_timeline_report')"
INCIDENT_BUNDLE_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_incident_bundle')"
MASTER_BUNDLE_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_master_bundle')"
REGRESSION_BUNDLE_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_regression_bundle')"
STORAGE_REPORT_COUNT="$(count_named_dirs "$LOGS_DIR" '*_access_storage_report')"

BASE_SIZE_KB="$(dir_size_kb "$BASE")"
LOGS_SIZE_KB="$(dir_size_kb "$LOGS_DIR")"
EXPORTS_SIZE_KB="$(dir_size_kb "$EXPORTS_DIR")"
TOOLS_SIZE_KB="$(dir_size_kb "$TOOLS_DIR")"
DOCS_SIZE_KB="$(dir_size_kb "$DOCS_DIR")"

BASELINE_STATUS="unknown"
LEGACY_STATUS="unknown"
OPERATIONS_STATUS="unknown"
CORE_BLOCKER_COUNT="0"

if view_exists "v_access_baseline_health_latest_summary"; then
  BASELINE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(core_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"
  LEGACY_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(legacy_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"
  OPERATIONS_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(operations_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"
  CORE_BLOCKER_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(core_blocker_count::text, '0')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"
fi

echo "============================================================"
echo "ACCESS WORKSPACE STATS"
echo "============================================================"
echo "[inventory counts]"
echo "tools_count=$TOOLS_COUNT"
echo "scripts_count=$SCRIPTS_COUNT"
echo "docs_count=$DOCS_COUNT"
echo "log_dir_count=$LOG_DIR_COUNT"
echo "export_dir_count=$EXPORT_DIR_COUNT"
echo "latest_entry_count=$LATEST_ENTRY_COUNT"
echo
echo "[artifact family counts]"
echo "checkpoint_count=$CHECKPOINT_COUNT"
echo "shift_report_count=$SHIFT_REPORT_COUNT"
echo "timeline_report_count=$TIMELINE_REPORT_COUNT"
echo "incident_bundle_count=$INCIDENT_BUNDLE_COUNT"
echo "master_bundle_count=$MASTER_BUNDLE_COUNT"
echo "regression_bundle_count=$REGRESSION_BUNDLE_COUNT"
echo "storage_report_count=$STORAGE_REPORT_COUNT"
echo
echo "[size kb]"
echo "base_size_kb=$BASE_SIZE_KB"
echo "logs_size_kb=$LOGS_SIZE_KB"
echo "exports_size_kb=$EXPORTS_SIZE_KB"
echo "tools_size_kb=$TOOLS_SIZE_KB"
echo "docs_size_kb=$DOCS_SIZE_KB"
echo
echo "[db snapshot]"
echo "baseline_status=$BASELINE_STATUS"
echo "legacy_status=$LEGACY_STATUS"
echo "operations_status=$OPERATIONS_STATUS"
echo "core_blocker_count=$CORE_BLOCKER_COUNT"
echo "============================================================"
echo "ACCESS WORKSPACE STATS DONE"
echo "============================================================"
ACCESS_WORKSPACE_STATS_CMD
chmod +x "$TOOLS_DIR/access_workspace_stats.sh"

cat > "$TOOLS_DIR/access_make_storage_report.sh" <<'ACCESS_STORAGE_REPORT_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_storage_report"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_storage_report_summary.md"
WORKSPACE_STATS_TXT="$OUT_DIR/020_workspace_stats.txt"
TOP_LOG_DIRS_TSV="$OUT_DIR/030_top_log_dirs.tsv"
TOP_EXPORT_DIRS_TSV="$OUT_DIR/040_top_export_dirs.tsv"
TOP_TOOL_FILES_TSV="$OUT_DIR/050_top_tool_files.tsv"

mkdir -p "$OUT_DIR"

echo "============================================================"
echo "ACCESS STORAGE REPORT"
echo "============================================================"
echo "out_dir : $OUT_DIR"
echo "============================================================"

if [ -x "$TOOLS_DIR/access_workspace_stats.sh" ]; then
  "$TOOLS_DIR/access_workspace_stats.sh" > "$WORKSPACE_STATS_TXT" 2>&1
else
  echo "MISSING: $TOOLS_DIR/access_workspace_stats.sh" > "$WORKSPACE_STATS_TXT"
fi

if [ -d "$LOGS_DIR" ]; then
  find "$LOGS_DIR" -maxdepth 1 -mindepth 1 -type d -exec du -sk {} + 2>/dev/null | sort -nr | head -n 30 > "$TOP_LOG_DIRS_TSV" || true
else
  : > "$TOP_LOG_DIRS_TSV"
fi

if [ -d "$EXPORTS_DIR" ]; then
  find "$EXPORTS_DIR" -mindepth 1 -maxdepth 2 -type d -exec du -sk {} + 2>/dev/null | sort -nr | head -n 30 > "$TOP_EXPORT_DIRS_TSV" || true
else
  : > "$TOP_EXPORT_DIRS_TSV"
fi

if [ -d "$TOOLS_DIR" ]; then
  find "$TOOLS_DIR" -maxdepth 1 -type f -exec du -sk {} + 2>/dev/null | sort -nr | head -n 30 > "$TOP_TOOL_FILES_TSV" || true
else
  : > "$TOP_TOOL_FILES_TSV"
fi

TOP_LOG_COUNT="$(awk 'END{print NR+0}' "$TOP_LOG_DIRS_TSV")"
TOP_EXPORT_COUNT="$(awk 'END{print NR+0}' "$TOP_EXPORT_DIRS_TSV")"
TOP_TOOL_COUNT="$(awk 'END{print NR+0}' "$TOP_TOOL_FILES_TSV")"

cat > "$MANIFEST_MD" <<EOF_STORAGE_MANIFEST
# ============================================================
# ACCESS STORAGE REPORT MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_storage_report_summary.md
- 020_workspace_stats.txt
- 030_top_log_dirs.tsv
- 040_top_export_dirs.tsv
- 050_top_tool_files.tsv
EOF_STORAGE_MANIFEST

cat > "$SUMMARY_MD" <<EOF_STORAGE_SUMMARY
# ============================================================
# ACCESS STORAGE REPORT SUMMARY
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

top_lists:
- top_log_dirs_rows: $TOP_LOG_COUNT
- top_export_dirs_rows: $TOP_EXPORT_COUNT
- top_tool_files_rows: $TOP_TOOL_COUNT

note:
This report is intended for storage review, artifact growth tracking, and cleanup planning.
EOF_STORAGE_SUMMARY

echo "============================================================"
echo "ACCESS STORAGE REPORT CREATED"
echo "============================================================"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
ACCESS_STORAGE_REPORT_CMD
chmod +x "$TOOLS_DIR/access_make_storage_report.sh"

cat > "$TOOLS_DIR/access_cleanup_preview.sh" <<'ACCESS_CLEANUP_PREVIEW_CMD'
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
ACCESS_CLEANUP_PREVIEW_CMD
chmod +x "$TOOLS_DIR/access_cleanup_preview.sh"

cat > "$TOOLS_DIR/access_cleanup_empty_dirs.sh" <<'ACCESS_CLEANUP_EMPTY_DIRS_CMD'
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
ACCESS_CLEANUP_EMPTY_DIRS_CMD
chmod +x "$TOOLS_DIR/access_cleanup_empty_dirs.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_workspace_stats.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_130'

storage_cleanup_commands:
- ./access_workspace_stats.sh
- ./access_make_storage_report.sh
- ./access_cleanup_preview.sh [AGE_DAYS]
- ./access_cleanup_empty_dirs.sh

recommended_storage_flow:
1. ./access_workspace_stats.sh
2. ./access_make_storage_report.sh
3. ./access_cleanup_preview.sh 14
4. ./access_cleanup_empty_dirs.sh
README_APPEND_130
  fi
else
  cat > "$README_FILE" <<'README_NEW_130'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

storage_cleanup_commands:
- ./access_workspace_stats.sh
- ./access_make_storage_report.sh
- ./access_cleanup_preview.sh [AGE_DAYS]
- ./access_cleanup_empty_dirs.sh
README_NEW_130
fi

echo "============================================================"
echo "ACCESS STORAGE CLEANUP PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
