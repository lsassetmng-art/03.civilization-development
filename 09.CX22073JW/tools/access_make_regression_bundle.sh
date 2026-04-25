#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
LOGS_DIR="$BASE/logs"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$LOGS_DIR/${STAMP}_access_regression_bundle"

MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_regression_summary.md"
SMOKE_STDOUT_LOG="$OUT_DIR/020_smoke_suite_stdout.log"
SMOKE_RESULTS_TSV="$OUT_DIR/021_smoke_suite_results.tsv"
DB_STATUS_TSV="$OUT_DIR/030_db_status.tsv"
LATEST_LINKS_TXT="$OUT_DIR/040_latest_links.txt"
OPEN_BLOCKERS_LOG="$OUT_DIR/050_open_blockers.log"
HISTORY_LOG="$OUT_DIR/060_history.log"

mkdir -p "$OUT_DIR"

echo "============================================================"
echo "ACCESS REGRESSION BUNDLE"
echo "============================================================"
echo "out_dir : $OUT_DIR"
echo "============================================================"

SMOKE_STATUS="pass"
if "$TOOLS_DIR/access_smoke_suite.sh" > "$SMOKE_STDOUT_LOG" 2>&1; then
  SMOKE_STATUS="pass"
else
  SMOKE_STATUS="fail"
fi

SMOKE_OUT_DIR="$(grep '^out_dir=' "$SMOKE_STDOUT_LOG" | tail -n 1 | cut -d'=' -f2- || true)"
if [ -n "${SMOKE_OUT_DIR:-}" ] && [ -f "$SMOKE_OUT_DIR/010_results.tsv" ]; then
  cp "$SMOKE_OUT_DIR/010_results.tsv" "$SMOKE_RESULTS_TSV"
else
  : > "$SMOKE_RESULTS_TSV"
fi

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

if [ -x "$TOOLS_DIR/access_show_latest_links.sh" ]; then
  "$TOOLS_DIR/access_show_latest_links.sh" > "$LATEST_LINKS_TXT" 2>&1 || true
else
  echo "MISSING: $TOOLS_DIR/access_show_latest_links.sh" > "$LATEST_LINKS_TXT"
fi

if [ -x "$TOOLS_DIR/access_open_blockers.sh" ]; then
  "$TOOLS_DIR/access_open_blockers.sh" > "$OPEN_BLOCKERS_LOG" 2>&1 || true
else
  echo "MISSING: $TOOLS_DIR/access_open_blockers.sh" > "$OPEN_BLOCKERS_LOG"
fi

if [ -x "$TOOLS_DIR/access_history.sh" ]; then
  "$TOOLS_DIR/access_history.sh" > "$HISTORY_LOG" 2>&1 || true
else
  echo "MISSING: $TOOLS_DIR/access_history.sh" > "$HISTORY_LOG"
fi

RESULT_ROW_COUNT="$(awk 'END{print NR+0}' "$SMOKE_RESULTS_TSV")"
FAIL_ROW_COUNT="$(awk -F '\t' '$1=="fail"{c++} END{print c+0}' "$SMOKE_RESULTS_TSV")"
PASS_ROW_COUNT="$(awk -F '\t' '$1=="pass"{c++} END{print c+0}' "$SMOKE_RESULTS_TSV")"
MISSING_ROW_COUNT="$(awk -F '\t' '$1=="missing"{c++} END{print c+0}' "$SMOKE_RESULTS_TSV")"

cat > "$MANIFEST_MD" <<EOF_ACCESS_REGRESSION_MANIFEST
# ============================================================
# ACCESS REGRESSION BUNDLE MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR
smoke_status: $SMOKE_STATUS
smoke_out_dir: ${SMOKE_OUT_DIR:-NOT_FOUND}

included_files:
- 000_manifest.md
- 010_regression_summary.md
- 020_smoke_suite_stdout.log
- 021_smoke_suite_results.tsv
- 030_db_status.tsv
- 040_latest_links.txt
- 050_open_blockers.log
- 060_history.log
EOF_ACCESS_REGRESSION_MANIFEST

cat > "$SUMMARY_MD" <<EOF_ACCESS_REGRESSION_SUMMARY
# ============================================================
# ACCESS REGRESSION SUMMARY
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
out_dir: $OUT_DIR

smoke_status:
- smoke_status: $SMOKE_STATUS
- result_rows: $RESULT_ROW_COUNT
- pass_rows: $PASS_ROW_COUNT
- fail_rows: $FAIL_ROW_COUNT
- missing_rows: $MISSING_ROW_COUNT

note:
This bundle captures a read-only regression smoke result plus current DB status and supporting investigation outputs.
EOF_ACCESS_REGRESSION_SUMMARY

echo "============================================================"
echo "ACCESS REGRESSION BUNDLE CREATED"
echo "============================================================"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"

if [ "$SMOKE_STATUS" != "pass" ]; then
  exit 1
fi
