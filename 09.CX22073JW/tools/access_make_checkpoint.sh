#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
SCRIPTS_DIR="$BASE/scripts"
DOCS_DIR="$BASE/docs"
LATEST_DIR="$BASE/latest"
LOGS_DIR="$BASE/logs"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_checkpoint"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
TOOLS_TSV="$OUT_DIR/010_tools_inventory.tsv"
SCRIPTS_TSV="$OUT_DIR/020_scripts_inventory.tsv"
DOCS_TSV="$OUT_DIR/030_docs_inventory.tsv"
LATEST_TSV="$OUT_DIR/040_latest_links.tsv"
DB_STATUS_TSV="$OUT_DIR/050_db_status.tsv"
DB_RUN_CODES_TSV="$OUT_DIR/051_db_run_codes.tsv"
HASH_TSV="$OUT_DIR/060_hash_inventory.tsv"
SUMMARY_MD="$OUT_DIR/070_checkpoint_summary.md"

mkdir -p "$OUT_DIR"

echo "============================================================"
echo "ACCESS MAKE CHECKPOINT"
echo "============================================================"
echo "out_dir: $OUT_DIR"
echo "============================================================"

find "$TOOLS_DIR" -maxdepth 1 -type f | sort | while IFS= read -r p; do
  [ -n "${p:-}" ] || continue
  if [ -x "$p" ]; then
    printf '%s\t%s\t%s\n' "tool" "executable" "$p"
  else
    printf '%s\t%s\t%s\n' "tool" "file" "$p"
  fi
done > "$TOOLS_TSV"

find "$SCRIPTS_DIR" -maxdepth 1 -type f | sort | while IFS= read -r p; do
  [ -n "${p:-}" ] || continue
  if [ -x "$p" ]; then
    printf '%s\t%s\t%s\n' "script" "executable" "$p"
  else
    printf '%s\t%s\t%s\n' "script" "file" "$p"
  fi
done > "$SCRIPTS_TSV"

find "$DOCS_DIR" -maxdepth 1 -type f | sort | while IFS= read -r p; do
  [ -n "${p:-}" ] || continue
  printf '%s\t%s\t%s\n' "doc" "file" "$p"
done > "$DOCS_TSV"

if [ -d "$LATEST_DIR" ]; then
  find "$LATEST_DIR" -maxdepth 1 -mindepth 1 | sort | while IFS= read -r p; do
    [ -n "${p:-}" ] || continue
    if [ -L "$p" ]; then
      printf '%s\t%s\t%s\n' "link" "$(basename "$p")" "$(readlink "$p" || true)"
    elif [ -e "$p" ]; then
      printf '%s\t%s\t%s\n' "path" "$(basename "$p")" "$p"
    else
      printf '%s\t%s\t%s\n' "broken" "$(basename "$p")" "$p"
    fi
  done > "$LATEST_TSV"
else
  : > "$LATEST_TSV"
fi

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$DB_STATUS_TSV"
SELECT
  b.run_code AS baseline_run_code,
  b.core_status,
  b.legacy_status,
  b.operations_status,
  b.core_blocker_count,
  b.info_count,
  g.run_code AS legacy_gate_run_code,
  g.readiness_status,
  g.blocker_count AS legacy_blocker_count,
  r.run_code AS retirement_run_code,
  r.plan_status,
  r.planned_drop_count,
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

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$DB_RUN_CODES_TSV"
SELECT 'baseline_run_code', COALESCE(run_code, '')
FROM cx22073jw.v_access_baseline_health_latest_summary
UNION ALL
SELECT 'legacy_gate_run_code', COALESCE(run_code, '')
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
UNION ALL
SELECT 'retirement_run_code', COALESCE(run_code, '')
FROM cx22073jw.v_access_legacy_retirement_plan_latest_summary
UNION ALL
SELECT 'bundle_run_code', COALESCE(run_code, '')
FROM cx22073jw.v_access_current_state_bundle_export_latest_summary;
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
HASH_COUNT="$(awk 'END{print NR+0}' "$HASH_TSV")"

cat > "$MANIFEST_MD" <<EOF_ACCESS_CHECKPOINT_MANIFEST
# ============================================================
# ACCESS CHECKPOINT MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_tools_inventory.tsv
- 020_scripts_inventory.tsv
- 030_docs_inventory.tsv
- 040_latest_links.tsv
- 050_db_status.tsv
- 051_db_run_codes.tsv
- 060_hash_inventory.tsv
- 070_checkpoint_summary.md
EOF_ACCESS_CHECKPOINT_MANIFEST

cat > "$SUMMARY_MD" <<EOF_ACCESS_CHECKPOINT_SUMMARY
# ============================================================
# ACCESS CHECKPOINT SUMMARY
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

inventory_counts:
- tools: $TOOLS_COUNT
- scripts: $SCRIPTS_COUNT
- docs: $DOCS_COUNT
- latest_links: $LATEST_COUNT
- hash_rows: $HASH_COUNT

note:
This checkpoint captures the current access workspace inventory and latest DB status snapshot.
EOF_ACCESS_CHECKPOINT_SUMMARY

echo "============================================================"
echo "ACCESS CHECKPOINT CREATED"
echo "============================================================"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
