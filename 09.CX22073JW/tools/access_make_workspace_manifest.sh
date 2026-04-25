#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
SCRIPTS_DIR="$BASE/scripts"
DOCS_DIR="$BASE/docs"
LATEST_DIR="$BASE/latest"
LOGS_DIR="$BASE/logs"
EXPORTS_DIR="$BASE/exports"
ARCHIVE_DIR="$BASE/archive"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_workspace_manifest"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_workspace_manifest_summary.md"
TOOLS_TSV="$OUT_DIR/020_tools.tsv"
SCRIPTS_TSV="$OUT_DIR/030_scripts.tsv"
DOCS_TSV="$OUT_DIR/040_docs.tsv"
LATEST_TSV="$OUT_DIR/050_latest.tsv"
EXPORTS_TSV="$OUT_DIR/060_exports.tsv"
ARCHIVE_TSV="$OUT_DIR/070_archive.tsv"
DB_STATUS_TSV="$OUT_DIR/080_db_status.tsv"
HASH_TSV="$OUT_DIR/090_hash.tsv"

mkdir -p "$OUT_DIR"

list_files_simple() {
  local dir_path="$1"
  local tag="$2"
  local out_file="$3"

  if [ -d "$dir_path" ]; then
    find "$dir_path" -maxdepth 1 -type f | sort | while IFS= read -r p; do
      [ -n "${p:-}" ] || continue
      size_bytes="$(wc -c < "$p" | tr -d '[:space:]' || true)"
      printf '%s\t%s\t%s\n' "$tag" "$p" "${size_bytes:-0}"
    done > "$out_file"
  else
    : > "$out_file"
  fi
}

list_dir_simple() {
  local dir_path="$1"
  local tag="$2"
  local out_file="$3"

  if [ -d "$dir_path" ]; then
    find "$dir_path" -mindepth 1 -maxdepth 2 | sort | while IFS= read -r p; do
      [ -n "${p:-}" ] || continue
      if [ -d "$p" ]; then
        printf '%s\t%s\t%s\n' "$tag" "dir" "$p"
      elif [ -f "$p" ]; then
        printf '%s\t%s\t%s\n' "$tag" "file" "$p"
      elif [ -L "$p" ]; then
        printf '%s\t%s\t%s\n' "$tag" "link" "$p"
      fi
    done > "$out_file"
  else
    : > "$out_file"
  fi
}

list_files_simple "$TOOLS_DIR" "tool" "$TOOLS_TSV"
list_files_simple "$SCRIPTS_DIR" "script" "$SCRIPTS_TSV"
list_files_simple "$DOCS_DIR" "doc" "$DOCS_TSV"

if [ -d "$LATEST_DIR" ]; then
  find "$LATEST_DIR" -maxdepth 1 -mindepth 1 | sort | while IFS= read -r p; do
    [ -n "${p:-}" ] || continue
    if [ -L "$p" ]; then
      printf '%s\t%s\t%s\n' "link" "$(basename "$p")" "$(readlink "$p" || true)"
    elif [ -d "$p" ]; then
      printf '%s\t%s\t%s\n' "dir" "$(basename "$p")" "$p"
    elif [ -f "$p" ]; then
      printf '%s\t%s\t%s\n' "file" "$(basename "$p")" "$p"
    fi
  done > "$LATEST_TSV"
else
  : > "$LATEST_TSV"
fi

list_dir_simple "$EXPORTS_DIR" "export" "$EXPORTS_TSV"
list_dir_simple "$ARCHIVE_DIR" "archive" "$ARCHIVE_TSV"

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$DB_STATUS_TSV"
SELECT
  b.run_code AS baseline_run_code,
  b.core_status,
  b.legacy_status,
  b.operations_status,
  b.core_blocker_count,
  g.run_code AS legacy_gate_run_code,
  g.readiness_status,
  g.blocker_count,
  r.run_code AS retirement_run_code,
  r.plan_status,
  c.run_code AS bundle_run_code,
  c.export_status,
  c.file_count
FROM cx22073jw.v_access_baseline_health_latest_summary b
LEFT JOIN cx22073jw.v_access_legacy_cutover_gate_latest_summary g
  ON TRUE
LEFT JOIN cx22073jw.v_access_legacy_retirement_plan_latest_summary r
  ON TRUE
LEFT JOIN cx22073jw.v_access_current_state_bundle_export_latest_summary c
  ON TRUE;
SQL

{
  find "$TOOLS_DIR" -maxdepth 1 -type f
  find "$SCRIPTS_DIR" -maxdepth 1 -type f
  find "$DOCS_DIR" -maxdepth 1 -type f
} | sort | while IFS= read -r p; do
  [ -n "${p:-}" ] || continue
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$p"
  else
    cksum "$p"
  fi
done > "$HASH_TSV"

TOOLS_COUNT="$(awk 'END{print NR+0}' "$TOOLS_TSV")"
SCRIPTS_COUNT="$(awk 'END{print NR+0}' "$SCRIPTS_TSV")"
DOCS_COUNT="$(awk 'END{print NR+0}' "$DOCS_TSV")"
LATEST_COUNT="$(awk 'END{print NR+0}' "$LATEST_TSV")"
EXPORTS_COUNT="$(awk 'END{print NR+0}' "$EXPORTS_TSV")"
ARCHIVE_COUNT="$(awk 'END{print NR+0}' "$ARCHIVE_TSV")"
HASH_COUNT="$(awk 'END{print NR+0}' "$HASH_TSV")"

cat > "$MANIFEST_MD" <<EOF_ACCESS_MANIFEST_134
# ============================================================
# ACCESS WORKSPACE MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_workspace_manifest_summary.md
- 020_tools.tsv
- 030_scripts.tsv
- 040_docs.tsv
- 050_latest.tsv
- 060_exports.tsv
- 070_archive.tsv
- 080_db_status.tsv
- 090_hash.tsv
EOF_ACCESS_MANIFEST_134

cat > "$SUMMARY_MD" <<EOF_ACCESS_SUMMARY_134
# ============================================================
# ACCESS WORKSPACE MANIFEST SUMMARY
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

inventory_counts:
- tools: $TOOLS_COUNT
- scripts: $SCRIPTS_COUNT
- docs: $DOCS_COUNT
- latest_entries: $LATEST_COUNT
- export_entries: $EXPORTS_COUNT
- archive_entries: $ARCHIVE_COUNT
- hash_rows: $HASH_COUNT

note:
This manifest is the consolidated workspace inventory and DB status snapshot.
EOF_ACCESS_SUMMARY_134

echo "============================================================"
echo "ACCESS WORKSPACE MANIFEST CREATED"
echo "============================================================"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
