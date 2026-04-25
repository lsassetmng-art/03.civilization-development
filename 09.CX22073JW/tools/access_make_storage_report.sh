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
