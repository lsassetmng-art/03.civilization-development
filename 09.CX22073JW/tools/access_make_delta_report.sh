#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
OUT_DIR="$BASE/logs/$(date +%Y%m%d_%H%M%S)_access_delta_report"

REPORT_MD="$OUT_DIR/000_access_delta_report.md"
BASELINE_COMPARE_TSV="$OUT_DIR/010_baseline_compare.tsv"
BASELINE_DELTA_TSV="$OUT_DIR/011_baseline_delta.tsv"
LEGACY_COMPARE_TSV="$OUT_DIR/020_legacy_compare.tsv"
LEGACY_DELTA_TSV="$OUT_DIR/021_legacy_delta.tsv"
BUNDLE_COMPARE_TSV="$OUT_DIR/030_bundle_compare.tsv"
BUNDLE_DELTA_TSV="$OUT_DIR/031_bundle_delta.tsv"

mkdir -p "$OUT_DIR"

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BASELINE_COMPARE_TSV"
WITH ranked AS (
  SELECT
    run_code,
    core_status,
    legacy_status,
    operations_status,
    core_blocker_count,
    info_count,
    created_at,
    ended_at,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM cx22073jw.access_baseline_health_run
)
SELECT
  CASE rn WHEN 1 THEN 'latest' WHEN 2 THEN 'previous' ELSE rn::text END AS slot,
  run_code,
  core_status,
  legacy_status,
  operations_status,
  core_blocker_count,
  info_count,
  created_at,
  ended_at
FROM ranked
WHERE rn <= 2
ORDER BY rn;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BASELINE_DELTA_TSV"
WITH ranked AS (
  SELECT
    core_blocker_count,
    info_count,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM cx22073jw.access_baseline_health_run
),
latest AS (
  SELECT core_blocker_count, info_count FROM ranked WHERE rn = 1
),
previous AS (
  SELECT core_blocker_count, info_count FROM ranked WHERE rn = 2
)
SELECT
  COALESCE((SELECT core_blocker_count FROM latest), 0) AS latest_core_blocker_count,
  COALESCE((SELECT core_blocker_count FROM previous), 0) AS previous_core_blocker_count,
  COALESCE((SELECT core_blocker_count FROM latest), 0) - COALESCE((SELECT core_blocker_count FROM previous), 0) AS delta_core_blocker_count,
  COALESCE((SELECT info_count FROM latest), 0) AS latest_info_count,
  COALESCE((SELECT info_count FROM previous), 0) AS previous_info_count,
  COALESCE((SELECT info_count FROM latest), 0) - COALESCE((SELECT info_count FROM previous), 0) AS delta_info_count;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LEGACY_COMPARE_TSV"
WITH ranked AS (
  SELECT
    run_code,
    source_audit_run_code,
    db_hit_count,
    file_hit_count,
    blocker_count,
    readiness_status,
    created_at,
    ended_at,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM cx22073jw.access_legacy_cutover_gate_run
)
SELECT
  CASE rn WHEN 1 THEN 'latest' WHEN 2 THEN 'previous' ELSE rn::text END AS slot,
  run_code,
  source_audit_run_code,
  db_hit_count,
  file_hit_count,
  blocker_count,
  readiness_status,
  created_at,
  ended_at
FROM ranked
WHERE rn <= 2
ORDER BY rn;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LEGACY_DELTA_TSV"
WITH ranked AS (
  SELECT
    db_hit_count,
    file_hit_count,
    blocker_count,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM cx22073jw.access_legacy_cutover_gate_run
),
latest AS (
  SELECT db_hit_count, file_hit_count, blocker_count FROM ranked WHERE rn = 1
),
previous AS (
  SELECT db_hit_count, file_hit_count, blocker_count FROM ranked WHERE rn = 2
)
SELECT
  COALESCE((SELECT db_hit_count FROM latest), 0) AS latest_db_hit_count,
  COALESCE((SELECT db_hit_count FROM previous), 0) AS previous_db_hit_count,
  COALESCE((SELECT db_hit_count FROM latest), 0) - COALESCE((SELECT db_hit_count FROM previous), 0) AS delta_db_hit_count,
  COALESCE((SELECT file_hit_count FROM latest), 0) AS latest_file_hit_count,
  COALESCE((SELECT file_hit_count FROM previous), 0) AS previous_file_hit_count,
  COALESCE((SELECT file_hit_count FROM latest), 0) - COALESCE((SELECT file_hit_count FROM previous), 0) AS delta_file_hit_count,
  COALESCE((SELECT blocker_count FROM latest), 0) AS latest_blocker_count,
  COALESCE((SELECT blocker_count FROM previous), 0) AS previous_blocker_count,
  COALESCE((SELECT blocker_count FROM latest), 0) - COALESCE((SELECT blocker_count FROM previous), 0) AS delta_blocker_count;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BUNDLE_COMPARE_TSV"
WITH ranked AS (
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
    ended_at,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM cx22073jw.access_current_state_bundle_export_run
)
SELECT
  CASE rn WHEN 1 THEN 'latest' WHEN 2 THEN 'previous' ELSE rn::text END AS slot,
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
FROM ranked
WHERE rn <= 2
ORDER BY rn;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BUNDLE_DELTA_TSV"
WITH ranked AS (
  SELECT
    file_count,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM cx22073jw.access_current_state_bundle_export_run
),
latest AS (
  SELECT file_count FROM ranked WHERE rn = 1
),
previous AS (
  SELECT file_count FROM ranked WHERE rn = 2
)
SELECT
  COALESCE((SELECT file_count FROM latest), 0) AS latest_file_count,
  COALESCE((SELECT file_count FROM previous), 0) AS previous_file_count,
  COALESCE((SELECT file_count FROM latest), 0) - COALESCE((SELECT file_count FROM previous), 0) AS delta_file_count;
SQL

LATEST_BASELINE_RUN="$(awk 'NR==1{print $2}' "$BASELINE_COMPARE_TSV" 2>/dev/null || true)"
LATEST_LEGACY_RUN="$(awk 'NR==1{print $2}' "$LEGACY_COMPARE_TSV" 2>/dev/null || true)"
LATEST_BUNDLE_RUN="$(awk 'NR==1{print $2}' "$BUNDLE_COMPARE_TSV" 2>/dev/null || true)"

cat > "$REPORT_MD" <<DELTA_REPORT_MD
# ============================================================
# ACCESS DELTA REPORT
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')

latest_runs:
- baseline_run_code: ${LATEST_BASELINE_RUN:-NOT_FOUND}
- legacy_gate_run_code: ${LATEST_LEGACY_RUN:-NOT_FOUND}
- bundle_run_code: ${LATEST_BUNDLE_RUN:-NOT_FOUND}

artifacts:
- 010_baseline_compare.tsv
- 011_baseline_delta.tsv
- 020_legacy_compare.tsv
- 021_legacy_delta.tsv
- 030_bundle_compare.tsv
- 031_bundle_delta.tsv

note:
Use this report to see how the latest state changed from the immediately previous run.
DELTA_REPORT_MD

echo "============================================================"
echo "ACCESS DELTA REPORT CREATED"
echo "============================================================"
echo "out_dir   : $OUT_DIR"
echo "report_md : $REPORT_MD"
echo "============================================================"
sed -n '1,120p' "$REPORT_MD"
