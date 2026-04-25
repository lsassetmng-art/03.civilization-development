#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
RUN_CODE="access_governed_apply_preflight_rerun_${RUN_TS}"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_governed_apply_preflight_rerun_after_role_provisioning.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS GOVERNED APPLY PREFLIGHT RERUN START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "run_code     : $RUN_CODE"
  echo "started_at   : $RUN_TS"
  echo "============================================================"

  echo "============================================================"
  echo "PHASE 1: PRECHECK"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SET search_path TO cx22073jw, public;

SELECT 'check_view_batch_summary' AS check_name,
       EXISTS (
         SELECT 1
         FROM information_schema.views
         WHERE table_schema='cx22073jw'
           AND table_name='v_access_governed_apply_batch_latest_summary'
       ) AS ok
UNION ALL
SELECT 'check_view_batch_items',
       EXISTS (
         SELECT 1
         FROM information_schema.views
         WHERE table_schema='cx22073jw'
           AND table_name='v_access_governed_apply_batch_latest_items'
       )
UNION ALL
SELECT 'check_fn_preflight',
       EXISTS (
         SELECT 1
         FROM pg_proc p
         JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname='cx22073jw'
           AND p.proname='fn_run_access_governed_apply_preflight'
       )
UNION ALL
SELECT 'check_view_role_registry_summary',
       EXISTS (
         SELECT 1
         FROM information_schema.views
         WHERE table_schema='cx22073jw'
           AND table_name='v_access_db_role_registry_summary'
       );
SQL

  LATEST_BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT batch_code
FROM cx22073jw.v_access_governed_apply_batch_latest_summary
LIMIT 1;
SQL
  )"

  if [ -z "${LATEST_BATCH_CODE:-}" ]; then
    echo "ERROR: latest governed apply batch summary not found"
    exit 1
  fi

  echo "============================================================"
  echo "PHASE 2: LATEST BATCH"
  echo "LATEST_BATCH_CODE=$LATEST_BATCH_CODE"
  echo "============================================================"

  echo "============================================================"
  echo "PHASE 3: BEFORE SNAPSHOT"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  role_code,
  domain_code,
  expected_db_role_name,
  role_status,
  role_exists_flag
FROM cx22073jw.v_access_db_role_registry_summary
ORDER BY domain_code, role_code;

SELECT
  request_code,
  logical_view_name,
  expected_db_role_name,
  role_exists_flag,
  view_exists_flag,
  runtime_apply_ready,
  preflight_status,
  execution_status
FROM cx22073jw.v_access_governed_apply_execution_latest_items
ORDER BY request_code, logical_view_name;
SQL

  echo "============================================================"
  echo "PHASE 4: RERUN PREFLIGHT"
  echo "============================================================"

  EXECUTION_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT cx22073jw.fn_run_access_governed_apply_preflight(
  '$RUN_CODE',
  '$LATEST_BATCH_CODE',
  'Zero',
  'Dry-run preflight rerun after AI employee DB role provisioning.'
);
SQL
  )"

  if [ -z "${EXECUTION_RUN_ID:-}" ]; then
    echo "ERROR: preflight rerun execution was not created"
    exit 1
  fi

  echo "EXECUTION_RUN_ID=$EXECUTION_RUN_ID"

  echo "============================================================"
  echo "PHASE 5: VERIFY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_governed_apply_execution_latest_summary;

SELECT
  request_code,
  preflight_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_governed_apply_execution_latest_items
GROUP BY request_code, preflight_status
ORDER BY request_code, preflight_status;

SELECT
  request_code,
  logical_view_name,
  expected_db_role_name,
  apply_status_before,
  runtime_apply_ready,
  gate_check_required,
  role_exists_flag,
  view_exists_flag,
  sql_present_flag,
  preflight_status,
  execution_status,
  result_note
FROM cx22073jw.v_access_governed_apply_execution_latest_items
ORDER BY request_code, logical_view_name;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS GOVERNED APPLY PREFLIGHT RERUN DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
