#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
OUT_DIR="$BASE/logs/$(date +%Y%m%d_%H%M%S)_access_timeline_report"

REPORT_MD="$OUT_DIR/000_access_timeline_report.md"
BASELINE_TSV="$OUT_DIR/010_baseline_runs.tsv"
LEGACY_GATE_TSV="$OUT_DIR/020_legacy_gate_runs.tsv"
RETIREMENT_TSV="$OUT_DIR/030_retirement_plan_runs.tsv"
BUNDLE_TSV="$OUT_DIR/040_bundle_export_runs.tsv"
DB_PATCH_TSV="$OUT_DIR/050_db_blocker_patch_runs.tsv"
LATEST_STATUS_TSV="$OUT_DIR/060_latest_status_snapshot.tsv"

mkdir -p "$OUT_DIR"

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BASELINE_TSV"
SELECT
  run_code,
  core_status,
  legacy_status,
  operations_status,
  core_blocker_count,
  info_count,
  created_at,
  ended_at
FROM cx22073jw.access_baseline_health_run
ORDER BY created_at DESC
LIMIT 30;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LEGACY_GATE_TSV"
SELECT
  run_code,
  source_audit_run_code,
  db_hit_count,
  file_hit_count,
  blocker_count,
  readiness_status,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_cutover_gate_run
ORDER BY created_at DESC
LIMIT 30;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$RETIREMENT_TSV"
SELECT
  run_code,
  source_gate_run_code,
  readiness_status_snapshot,
  legacy_view_count,
  planned_drop_count,
  blocker_count,
  plan_status,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_retirement_plan_run
ORDER BY created_at DESC
LIMIT 30;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BUNDLE_TSV"
SELECT
  run_code,
  export_root_path,
  baseline_run_code,
  legacy_gate_run_code,
  retirement_plan_run_code,
  manual_receipt_batch_code,
  confirmed_reverify_run_code,
  file_count,
  export_status,
  created_at,
  ended_at
FROM cx22073jw.access_current_state_bundle_export_run
ORDER BY created_at DESC
LIMIT 30;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$DB_PATCH_TSV"
SELECT
  run_code,
  target_view_count,
  target_function_count,
  patched_view_count,
  patched_function_count,
  error_count,
  run_status,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_db_blocker_patch_run
ORDER BY created_at DESC
LIMIT 30;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LATEST_STATUS_TSV"
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
  c.export_status
FROM cx22073jw.v_access_baseline_health_latest_summary b
LEFT JOIN cx22073jw.v_access_legacy_cutover_gate_latest_summary g
  ON TRUE
LEFT JOIN cx22073jw.v_access_legacy_retirement_plan_latest_summary r
  ON TRUE
LEFT JOIN cx22073jw.v_access_current_state_bundle_export_latest_summary c
  ON TRUE;
SQL

LATEST_CORE_STATUS="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(core_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
)"

LATEST_LEGACY_STATUS="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(legacy_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
)"

LATEST_OPERATIONS_STATUS="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(operations_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
)"

BASELINE_COUNT="$(awk 'END{print NR+0}' "$BASELINE_TSV")"
LEGACY_COUNT="$(awk 'END{print NR+0}' "$LEGACY_GATE_TSV")"
RETIREMENT_COUNT="$(awk 'END{print NR+0}' "$RETIREMENT_TSV")"
BUNDLE_COUNT="$(awk 'END{print NR+0}' "$BUNDLE_TSV")"
DB_PATCH_COUNT="$(awk 'END{print NR+0}' "$DB_PATCH_TSV")"

cat > "$REPORT_MD" <<TIMELINE_REPORT_MD
# ============================================================
# ACCESS TIMELINE REPORT
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
latest_core_status: $LATEST_CORE_STATUS
latest_legacy_status: $LATEST_LEGACY_STATUS
latest_operations_status: $LATEST_OPERATIONS_STATUS

included_counts:
- baseline_runs: $BASELINE_COUNT
- legacy_gate_runs: $LEGACY_COUNT
- retirement_plan_runs: $RETIREMENT_COUNT
- bundle_export_runs: $BUNDLE_COUNT
- db_blocker_patch_runs: $DB_PATCH_COUNT

artifacts:
- 010_baseline_runs.tsv
- 020_legacy_gate_runs.tsv
- 030_retirement_plan_runs.tsv
- 040_bundle_export_runs.tsv
- 050_db_blocker_patch_runs.tsv
- 060_latest_status_snapshot.tsv

note:
Use this report for trend review, handoff, and recent-run tracing.
TIMELINE_REPORT_MD

echo "============================================================"
echo "ACCESS TIMELINE REPORT CREATED"
echo "============================================================"
echo "out_dir    : $OUT_DIR"
echo "report_md  : $REPORT_MD"
echo "============================================================"
sed -n '1,120p' "$REPORT_MD"
