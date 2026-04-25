#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
BATCH_CODE="access_governed_apply_batch_${RUN_TS}"
ATTEMPT_CODE="access_governed_apply_attempt_${RUN_TS}"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_governed_apply_batch_preparation.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS GOVERNED APPLY BATCH PREPARATION"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "batch_code   : $BATCH_CODE"
  echo "attempt_code : $ATTEMPT_CODE"
  echo "started_at   : $RUN_TS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_access_governed_apply_queue_latest_summary'
  ) THEN
    RAISE EXCEPTION 'v_access_governed_apply_queue_latest_summary is required before governed apply batch preparation';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_access_governed_apply_queue_latest_items'
  ) THEN
    RAISE EXCEPTION 'v_access_governed_apply_queue_latest_items is required before governed apply batch preparation';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_governed_apply_queue'
  ) THEN
    RAISE EXCEPTION 'access_governed_apply_queue is required before governed apply batch preparation';
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'foundation_domain_master'
  ) THEN
    INSERT INTO cx22073jw.foundation_domain_master (
      domain_code, domain_name, layer_code, domain_family, description
    ) VALUES (
      'access_governed_apply_batch_preparation',
      'AI Employee Governed Apply Batch Preparation',
      'normal',
      'integration',
      'Prepare governed apply batch and dry-run attempt registry for AI employee activation'
    )
    ON CONFLICT (domain_code) DO UPDATE
    SET domain_name   = EXCLUDED.domain_name,
        layer_code    = EXCLUDED.layer_code,
        domain_family = EXCLUDED.domain_family,
        description   = EXCLUDED.description,
        updated_at    = NOW();
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS cx22073jw.access_governed_apply_batch (
  governed_apply_batch_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code                   text NOT NULL UNIQUE,
  source_queue_batch_code      text NOT NULL,
  item_count                   integer NOT NULL DEFAULT 0,
  prepared_count               integer NOT NULL DEFAULT 0,
  waiting_runtime_count        integer NOT NULL DEFAULT 0,
  skipped_gate_count           integer NOT NULL DEFAULT 0,
  batch_status                 text NOT NULL CHECK (
                                 batch_status IN (
                                   'running',
                                   'prepared',
                                   'partial',
                                   'error',
                                   'applied'
                                 )
                               ),
  actor_name                   text NOT NULL DEFAULT 'Zero',
  note_text                    text,
  created_at                   timestamptz NOT NULL DEFAULT NOW(),
  updated_at                   timestamptz NOT NULL DEFAULT NOW(),
  ended_at                     timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_governed_apply_batch_item (
  governed_apply_batch_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  governed_apply_batch_id      uuid NOT NULL REFERENCES cx22073jw.access_governed_apply_batch(governed_apply_batch_id) ON DELETE CASCADE,
  queue_code                   text NOT NULL,
  request_code                 text NOT NULL,
  target_domain_code           text NOT NULL,
  target_role_code             text NOT NULL,
  actual_view_code             text NOT NULL,
  logical_view_name            text NOT NULL,
  gate_check_required          boolean NOT NULL DEFAULT false,
  runtime_apply_ready          boolean NOT NULL DEFAULT false,
  prepared_sql_text            text NOT NULL,
  apply_status                 text NOT NULL CHECK (
                                 apply_status IN (
                                   'prepared',
                                   'waiting_runtime',
                                   'skipped_gate',
                                   'applied',
                                   'error'
                                 )
                               ),
  note_text                    text,
  created_at                   timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (governed_apply_batch_id, request_code, actual_view_code)
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_governed_apply_attempt_log (
  governed_apply_attempt_log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  governed_apply_batch_id       uuid NOT NULL REFERENCES cx22073jw.access_governed_apply_batch(governed_apply_batch_id) ON DELETE CASCADE,
  attempt_code                  text NOT NULL UNIQUE,
  attempt_status                text NOT NULL CHECK (
                                  attempt_status IN (
                                    'dry_run_prepared',
                                    'apply_pending',
                                    'applied',
                                    'error'
                                  )
                                ),
  executor_name                 text NOT NULL DEFAULT 'Zero',
  note_text                     text,
  created_at                    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_access_governed_apply_batch_created
  ON cx22073jw.access_governed_apply_batch (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_governed_apply_batch_item_batch
  ON cx22073jw.access_governed_apply_batch_item (governed_apply_batch_id, apply_status, request_code);

CREATE INDEX IF NOT EXISTS ix_access_governed_apply_attempt_log_batch
  ON cx22073jw.access_governed_apply_attempt_log (governed_apply_batch_id, created_at DESC);

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
      WHERE tg.tgname = 'trg_access_governed_apply_batch_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_governed_apply_batch'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_governed_apply_batch_updated_at
        BEFORE UPDATE ON cx22073jw.access_governed_apply_batch
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_prepare_access_governed_apply_batch(
  p_batch_code text,
  p_source_queue_batch_code text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch_id uuid;
BEGIN
  INSERT INTO cx22073jw.access_governed_apply_batch (
    batch_code,
    source_queue_batch_code,
    batch_status,
    actor_name,
    note_text
  )
  VALUES (
    p_batch_code,
    p_source_queue_batch_code,
    'running',
    'Zero',
    'Preparing governed apply batch from latest governed apply queue.'
  )
  RETURNING governed_apply_batch_id INTO v_batch_id;

  INSERT INTO cx22073jw.access_governed_apply_batch_item (
    governed_apply_batch_id,
    queue_code,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    gate_check_required,
    runtime_apply_ready,
    prepared_sql_text,
    apply_status,
    note_text
  )
  SELECT
    v_batch_id,
    q.queue_code,
    q.request_code,
    q.target_domain_code,
    q.target_role_code,
    q.actual_view_code,
    q.logical_view_name,
    q.gate_check_required,
    q.runtime_apply_ready,
    'GRANT SELECT ON cx22073jw.' || q.logical_view_name || ' TO aiemp_role__' || q.target_role_code || ';' AS prepared_sql_text,
    CASE
      WHEN q.gate_check_required THEN 'skipped_gate'
      WHEN q.runtime_apply_ready THEN 'prepared'
      ELSE 'waiting_runtime'
    END AS apply_status,
    CASE
      WHEN q.gate_check_required THEN 'Gate check still required.'
      WHEN q.runtime_apply_ready THEN 'Prepared and runtime-apply-ready.'
      ELSE 'Prepared skeleton only. Runtime apply readiness is still false.'
    END AS note_text
  FROM cx22073jw.access_governed_apply_queue q
  WHERE q.source_batch_code = p_source_queue_batch_code
    AND q.queue_status IN ('queued','prepared');

  UPDATE cx22073jw.access_governed_apply_queue
     SET queue_status = 'prepared',
         note_text    = COALESCE(note_text, 'Prepared into governed apply batch.')
   WHERE source_batch_code = p_source_queue_batch_code
     AND queue_status = 'queued';

  UPDATE cx22073jw.access_governed_apply_batch
     SET item_count            = (
           SELECT COUNT(*)
           FROM cx22073jw.access_governed_apply_batch_item
           WHERE governed_apply_batch_id = v_batch_id
         ),
         prepared_count        = (
           SELECT COUNT(*)
           FROM cx22073jw.access_governed_apply_batch_item
           WHERE governed_apply_batch_id = v_batch_id
             AND apply_status = 'prepared'
         ),
         waiting_runtime_count = (
           SELECT COUNT(*)
           FROM cx22073jw.access_governed_apply_batch_item
           WHERE governed_apply_batch_id = v_batch_id
             AND apply_status = 'waiting_runtime'
         ),
         skipped_gate_count    = (
           SELECT COUNT(*)
           FROM cx22073jw.access_governed_apply_batch_item
           WHERE governed_apply_batch_id = v_batch_id
             AND apply_status = 'skipped_gate'
         ),
         batch_status          = CASE
                                   WHEN (
                                     SELECT COUNT(*)
                                     FROM cx22073jw.access_governed_apply_batch_item
                                     WHERE governed_apply_batch_id = v_batch_id
                                   ) = 0 THEN 'error'
                                   WHEN (
                                     SELECT COUNT(*)
                                     FROM cx22073jw.access_governed_apply_batch_item
                                     WHERE governed_apply_batch_id = v_batch_id
                                       AND apply_status = 'waiting_runtime'
                                   ) > 0 THEN 'partial'
                                   ELSE 'prepared'
                                 END,
         ended_at              = NOW(),
         updated_at            = NOW()
   WHERE governed_apply_batch_id = v_batch_id;

  RETURN v_batch_id;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_batch_latest_summary AS
SELECT
  batch_code,
  source_queue_batch_code,
  item_count,
  prepared_count,
  waiting_runtime_count,
  skipped_gate_count,
  batch_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_governed_apply_batch
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_batch_latest_items AS
SELECT
  b.batch_code,
  b.source_queue_batch_code,
  i.queue_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.gate_check_required,
  i.runtime_apply_ready,
  i.apply_status,
  i.prepared_sql_text,
  i.note_text,
  i.created_at
FROM cx22073jw.access_governed_apply_batch_item i
JOIN cx22073jw.access_governed_apply_batch b
  ON b.governed_apply_batch_id = i.governed_apply_batch_id
WHERE b.governed_apply_batch_id = (
  SELECT governed_apply_batch_id
  FROM cx22073jw.access_governed_apply_batch
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_attempt_latest_summary AS
SELECT
  b.batch_code,
  l.attempt_code,
  l.attempt_status,
  l.executor_name,
  l.note_text,
  l.created_at
FROM cx22073jw.access_governed_apply_attempt_log l
JOIN cx22073jw.access_governed_apply_batch b
  ON b.governed_apply_batch_id = l.governed_apply_batch_id
ORDER BY l.created_at DESC
LIMIT 1;

COMMIT;
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

  BATCH_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT cx22073jw.fn_prepare_access_governed_apply_batch(
  '$BATCH_CODE',
  '$SOURCE_QUEUE_BATCH_CODE'
);
SQL
  )"

  if [ -z "${BATCH_ID:-}" ]; then
    echo "ERROR: governed apply batch was not created"
    exit 1
  fi

  echo "BATCH_ID=$BATCH_ID"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.access_governed_apply_attempt_log (
  governed_apply_batch_id,
  attempt_code,
  attempt_status,
  executor_name,
  note_text
)
VALUES (
  '$BATCH_ID',
  '$ATTEMPT_CODE',
  'dry_run_prepared',
  'Zero',
  'Dry-run preparation only. No runtime GRANT or activation apply executed.'
);
SQL

  echo "============================================================"
  echo "LATEST GOVERNED APPLY BATCH SUMMARY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_governed_apply_batch_latest_summary;

SELECT
  request_code,
  apply_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_governed_apply_batch_latest_items
GROUP BY request_code, apply_status
ORDER BY request_code, apply_status;

TABLE cx22073jw.v_access_governed_apply_attempt_latest_summary;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS GOVERNED APPLY BATCH PREPARATION DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
