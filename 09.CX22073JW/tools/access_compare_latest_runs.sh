#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

echo "============================================================"
echo "ACCESS COMPARE LATEST RUNS"
echo "============================================================"

echo "[baseline latest vs previous]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
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

echo "[baseline delta]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
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

echo "[legacy cutover latest vs previous]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
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

echo "[legacy cutover delta]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
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

echo "[bundle export latest vs previous]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
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

echo "[bundle export delta]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
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

echo "============================================================"
echo "ACCESS COMPARE LATEST RUNS DONE"
echo "============================================================"
