#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"

RUN_TS="$(date +%Y%m%d_%H%M%S)"
PROMOTION_BATCH_CODE="access_runtime_ready_promotion_${RUN_TS}"
REFRESH_GOV_BATCH_CODE="access_governed_apply_batch_refresh_${RUN_TS}"
REFRESH_PREFLIGHT_RUN_CODE="access_governed_apply_preflight_refresh_${RUN_TS}"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_runtime_ready_promotion_and_preflight_refresh.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS RUNTIME READY PROMOTION / PREFLIGHT REFRESH"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "promotion    : $PROMOTION_BATCH_CODE"
  echo "gov_batch    : $REFRESH_GOV_BATCH_CODE"
  echo "preflight    : $REFRESH_PREFLIGHT_RUN_CODE"
  echo "started_at   : $RUN_TS"
  echo "============================================================"

  echo "============================================================"
  echo "PHASE 1: PRECHECK"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SET search_path TO cx22073jw, public;

SELECT 'check_queue_table' AS check_name,
       EXISTS (
         SELECT 1
         FROM information_schema.tables
         WHERE table_schema='cx22073jw'
           AND table_name='access_governed_apply_queue'
       ) AS ok
UNION ALL
SELECT 'check_latest_queue_view',
       EXISTS (
         SELECT 1
         FROM information_schema.views
         WHERE table_schema='cx22073jw'
           AND table_name='v_access_governed_apply_queue_latest_summary'
       )
UNION ALL
SELECT 'check_prepare_batch_fn',
       EXISTS (
         SELECT 1
         FROM pg_proc p
         JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname='cx22073jw'
           AND p.proname='fn_prepare_access_governed_apply_batch'
       )
UNION ALL
SELECT 'check_preflight_fn',
       EXISTS (
         SELECT 1
         FROM pg_proc p
         JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname='cx22073jw'
           AND p.proname='fn_run_access_governed_apply_preflight'
       );
SQL

  SOURCE_QUEUE_BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT source_batch_code
FROM cx22073jw.v_access_governed_apply_queue_latest_summary
LIMIT 1;
SQL
  )"

  if [ -z "${SOURCE_QUEUE_BATCH_CODE:-}" ]; then
    echo "ERROR: latest governed apply queue summary not found"
    exit 1
  fi

  echo "SOURCE_QUEUE_BATCH_CODE=$SOURCE_QUEUE_BATCH_CODE"

  echo "============================================================"
  echo "PHASE 2: CREATE / REPLACE PROMOTION OBJECTS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

CREATE TABLE IF NOT EXISTS cx22073jw.access_runtime_ready_promotion_batch (
  runtime_ready_promotion_batch_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code                       text NOT NULL UNIQUE,
  source_queue_batch_code          text NOT NULL,
  target_request_code              text,
  promoted_count                   integer NOT NULL DEFAULT 0,
  skipped_gate_count               integer NOT NULL DEFAULT 0,
  unchanged_count                  integer NOT NULL DEFAULT 0,
  batch_status                     text NOT NULL CHECK (batch_status IN ('running','pass','partial','error')),
  actor_name                       text NOT NULL DEFAULT 'Zero',
  note_text                        text,
  created_at                       timestamptz NOT NULL DEFAULT NOW(),
  updated_at                       timestamptz NOT NULL DEFAULT NOW(),
  ended_at                         timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_runtime_ready_promotion_item (
  runtime_ready_promotion_item_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  runtime_ready_promotion_batch_id uuid NOT NULL REFERENCES cx22073jw.access_runtime_ready_promotion_batch(runtime_ready_promotion_batch_id) ON DELETE CASCADE,
  queue_code                       text NOT NULL,
  request_code                     text NOT NULL,
  target_domain_code               text NOT NULL,
  target_role_code                 text NOT NULL,
  actual_view_code                 text NOT NULL,
  logical_view_name                text NOT NULL,
  previous_runtime_apply_ready     boolean NOT NULL,
  new_runtime_apply_ready          boolean NOT NULL,
  gate_check_required              boolean NOT NULL,
  action_status                    text NOT NULL CHECK (action_status IN ('promoted','skipped_gate','unchanged')),
  note_text                        text,
  created_at                       timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (runtime_ready_promotion_batch_id, queue_code)
);

CREATE INDEX IF NOT EXISTS ix_access_runtime_ready_promotion_batch_created
  ON cx22073jw.access_runtime_ready_promotion_batch (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_runtime_ready_promotion_item_batch
  ON cx22073jw.access_runtime_ready_promotion_item (runtime_ready_promotion_batch_id, action_status, request_code);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'cx22073jw'
      AND p.proname = 'fn_set_updated_at'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_runtime_ready_promotion_batch_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_runtime_ready_promotion_batch'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_runtime_ready_promotion_batch_updated_at
        BEFORE UPDATE ON cx22073jw.access_runtime_ready_promotion_batch
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_promote_access_governed_apply_runtime_ready(
  p_batch_code text,
  p_source_queue_batch_code text,
  p_target_request_code text DEFAULT NULL,
  p_actor_name text DEFAULT 'Zero',
  p_note_text text DEFAULT 'Promote non-gate queue items to runtime_apply_ready.'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch_id uuid;
  v_promoted integer := 0;
  v_skipped_gate integer := 0;
  v_unchanged integer := 0;
  r record;
BEGIN
  INSERT INTO cx22073jw.access_runtime_ready_promotion_batch (
    batch_code,
    source_queue_batch_code,
    target_request_code,
    batch_status,
    actor_name,
    note_text
  )
  VALUES (
    p_batch_code,
    p_source_queue_batch_code,
    p_target_request_code,
    'running',
    p_actor_name,
    p_note_text
  )
  RETURNING runtime_ready_promotion_batch_id INTO v_batch_id;

  FOR r IN
    SELECT
      q.queue_code,
      q.request_code,
      q.target_domain_code,
      q.target_role_code,
      q.actual_view_code,
      q.logical_view_name,
      q.runtime_apply_ready,
      q.gate_check_required
    FROM cx22073jw.access_governed_apply_queue q
    WHERE q.source_batch_code = p_source_queue_batch_code
      AND (p_target_request_code IS NULL OR q.request_code = p_target_request_code)
      AND q.queue_status IN ('queued','prepared')
    ORDER BY q.request_code, q.logical_view_name
  LOOP
    IF r.gate_check_required THEN
      v_skipped_gate := v_skipped_gate + 1;

      INSERT INTO cx22073jw.access_runtime_ready_promotion_item (
        runtime_ready_promotion_batch_id,
        queue_code,
        request_code,
        target_domain_code,
        target_role_code,
        actual_view_code,
        logical_view_name,
        previous_runtime_apply_ready,
        new_runtime_apply_ready,
        gate_check_required,
        action_status,
        note_text
      )
      VALUES (
        v_batch_id,
        r.queue_code,
        r.request_code,
        r.target_domain_code,
        r.target_role_code,
        r.actual_view_code,
        r.logical_view_name,
        r.runtime_apply_ready,
        r.runtime_apply_ready,
        r.gate_check_required,
        'skipped_gate',
        'Skipped because gate_check_required=true.'
      );
    ELSIF r.runtime_apply_ready THEN
      v_unchanged := v_unchanged + 1;

      INSERT INTO cx22073jw.access_runtime_ready_promotion_item (
        runtime_ready_promotion_batch_id,
        queue_code,
        request_code,
        target_domain_code,
        target_role_code,
        actual_view_code,
        logical_view_name,
        previous_runtime_apply_ready,
        new_runtime_apply_ready,
        gate_check_required,
        action_status,
        note_text
      )
      VALUES (
        v_batch_id,
        r.queue_code,
        r.request_code,
        r.target_domain_code,
        r.target_role_code,
        r.actual_view_code,
        r.logical_view_name,
        r.runtime_apply_ready,
        r.runtime_apply_ready,
        r.gate_check_required,
        'unchanged',
        'Already runtime_apply_ready=true.'
      );
    ELSE
      UPDATE cx22073jw.access_governed_apply_queue
         SET runtime_apply_ready = true,
             queue_status        = 'prepared',
             note_text           = COALESCE(note_text, 'Promoted to runtime_apply_ready.')
       WHERE queue_code = r.queue_code;

      v_promoted := v_promoted + 1;

      INSERT INTO cx22073jw.access_runtime_ready_promotion_item (
        runtime_ready_promotion_batch_id,
        queue_code,
        request_code,
        target_domain_code,
        target_role_code,
        actual_view_code,
        logical_view_name,
        previous_runtime_apply_ready,
        new_runtime_apply_ready,
        gate_check_required,
        action_status,
        note_text
      )
      VALUES (
        v_batch_id,
        r.queue_code,
        r.request_code,
        r.target_domain_code,
        r.target_role_code,
        r.actual_view_code,
        r.logical_view_name,
        r.runtime_apply_ready,
        true,
        r.gate_check_required,
        'promoted',
        'Promoted to runtime_apply_ready=true.'
      );
    END IF;
  END LOOP;

  UPDATE cx22073jw.access_runtime_ready_promotion_batch
     SET promoted_count     = v_promoted,
         skipped_gate_count = v_skipped_gate,
         unchanged_count    = v_unchanged,
         batch_status       = CASE
                                WHEN (v_promoted + v_skipped_gate + v_unchanged) = 0 THEN 'error'
                                WHEN v_promoted > 0 THEN 'pass'
                                ELSE 'partial'
                              END,
         ended_at           = NOW(),
         updated_at         = NOW()
   WHERE runtime_ready_promotion_batch_id = v_batch_id;

  RETURN v_batch_id;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_runtime_ready_promotion_latest_batch_summary AS
SELECT
  batch_code,
  source_queue_batch_code,
  target_request_code,
  promoted_count,
  skipped_gate_count,
  unchanged_count,
  batch_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_runtime_ready_promotion_batch
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_runtime_ready_promotion_latest_items AS
SELECT
  b.batch_code,
  i.queue_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.previous_runtime_apply_ready,
  i.new_runtime_apply_ready,
  i.gate_check_required,
  i.action_status,
  i.note_text,
  i.created_at
FROM cx22073jw.access_runtime_ready_promotion_item i
JOIN cx22073jw.access_runtime_ready_promotion_batch b
  ON b.runtime_ready_promotion_batch_id = i.runtime_ready_promotion_batch_id
WHERE b.runtime_ready_promotion_batch_id = (
  SELECT runtime_ready_promotion_batch_id
  FROM cx22073jw.access_runtime_ready_promotion_batch
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;

COMMIT;
SQL

  echo "============================================================"
  echo "PHASE 3: PROMOTE RUNTIME READY"
  echo "============================================================"

  PROMOTION_BATCH_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT cx22073jw.fn_promote_access_governed_apply_runtime_ready(
  '$PROMOTION_BATCH_CODE',
  '$SOURCE_QUEUE_BATCH_CODE',
  NULL,
  'Zero',
  'Promote all non-gate items in latest queue batch to runtime_apply_ready.'
);
SQL
  )"

  if [ -z "${PROMOTION_BATCH_ID:-}" ]; then
    echo "ERROR: runtime ready promotion batch was not created"
    exit 1
  fi

  echo "PROMOTION_BATCH_ID=$PROMOTION_BATCH_ID"

  echo "============================================================"
  echo "PHASE 4: REBUILD GOVERNED APPLY BATCH"
  echo "============================================================"

  REFRESH_GOV_BATCH_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT cx22073jw.fn_prepare_access_governed_apply_batch(
  '$REFRESH_GOV_BATCH_CODE',
  '$SOURCE_QUEUE_BATCH_CODE'
);
SQL
  )"

  if [ -z "${REFRESH_GOV_BATCH_ID:-}" ]; then
    echo "ERROR: refreshed governed apply batch was not created"
    exit 1
  fi

  echo "REFRESH_GOV_BATCH_ID=$REFRESH_GOV_BATCH_ID"

  echo "============================================================"
  echo "PHASE 5: RERUN PREFLIGHT"
  echo "============================================================"

  REFRESH_PREFLIGHT_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT cx22073jw.fn_run_access_governed_apply_preflight(
  '$REFRESH_PREFLIGHT_RUN_CODE',
  '$REFRESH_GOV_BATCH_CODE',
  'Zero',
  'Dry-run preflight rerun after runtime_apply_ready promotion.'
);
SQL
  )"

  if [ -z "${REFRESH_PREFLIGHT_RUN_ID:-}" ]; then
    echo "ERROR: refreshed preflight run was not created"
    exit 1
  fi

  echo "REFRESH_PREFLIGHT_RUN_ID=$REFRESH_PREFLIGHT_RUN_ID"

  echo "============================================================"
  echo "PHASE 6: VERIFY"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_runtime_ready_promotion_latest_batch_summary;

SELECT
  request_code,
  action_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_runtime_ready_promotion_latest_items
GROUP BY request_code, action_status
ORDER BY request_code, action_status;

TABLE cx22073jw.v_access_governed_apply_batch_latest_summary;

SELECT
  request_code,
  apply_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_governed_apply_batch_latest_items
GROUP BY request_code, apply_status
ORDER BY request_code, apply_status;

TABLE cx22073jw.v_access_governed_apply_execution_latest_summary;

SELECT
  request_code,
  preflight_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_governed_apply_execution_latest_items
GROUP BY request_code, preflight_status
ORDER BY request_code, preflight_status;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS RUNTIME READY PROMOTION / PREFLIGHT REFRESH DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
