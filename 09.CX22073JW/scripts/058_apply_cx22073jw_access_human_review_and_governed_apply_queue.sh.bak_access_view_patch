#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_human_review_and_governed_apply_queue.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS HUMAN REVIEW / GOVERNED APPLY QUEUE"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
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
      AND table_name = 'v_access_activation_review_decision_latest_batch_summary'
  ) THEN
    RAISE EXCEPTION 'v_access_activation_review_decision_latest_batch_summary is required before human review / apply queue';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_access_activation_review_decision_latest_items'
  ) THEN
    RAISE EXCEPTION 'v_access_activation_review_decision_latest_items is required before human review / apply queue';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_activation_review_decision_batch'
  ) THEN
    RAISE EXCEPTION 'access_activation_review_decision_batch is required before human review / apply queue';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_activation_review_decision_item'
  ) THEN
    RAISE EXCEPTION 'access_activation_review_decision_item is required before human review / apply queue';
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
      'access_human_review_governed_apply_queue',
      'AI Employee Human Review Governed Apply Queue',
      'normal',
      'integration',
      'Human review action log and governed apply queue for AI employee activation items'
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

CREATE TABLE IF NOT EXISTS cx22073jw.access_human_review_action_log (
  human_review_action_log_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_review_decision_batch_id  uuid NOT NULL REFERENCES cx22073jw.access_activation_review_decision_batch(activation_review_decision_batch_id) ON DELETE CASCADE,
  request_code                         text NOT NULL,
  actual_view_code                     text NOT NULL,
  logical_view_name                    text NOT NULL,
  previous_human_review_status         text NOT NULL,
  new_human_review_status              text NOT NULL CHECK (
                                         new_human_review_status IN (
                                           'pending',
                                           'approved',
                                           'rejected',
                                           'needs_followup'
                                         )
                                       ),
  reviewer_name                        text NOT NULL,
  review_note                          text,
  created_at                           timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_governed_apply_queue (
  governed_apply_queue_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_code                           text NOT NULL UNIQUE,
  source_batch_code                    text NOT NULL,
  request_code                         text NOT NULL,
  target_domain_code                   text NOT NULL,
  target_role_code                     text NOT NULL,
  actual_view_code                     text NOT NULL,
  logical_view_name                    text NOT NULL,
  queue_status                         text NOT NULL CHECK (
                                         queue_status IN (
                                           'queued',
                                           'prepared',
                                           'applied',
                                           'skipped',
                                           'cancelled'
                                         )
                                       ),
  gate_check_required                  boolean NOT NULL DEFAULT false,
  runtime_apply_ready                  boolean NOT NULL DEFAULT false,
  actor_name                           text NOT NULL DEFAULT 'Zero',
  note_text                            text,
  created_at                           timestamptz NOT NULL DEFAULT NOW(),
  updated_at                           timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (source_batch_code, request_code, actual_view_code)
);

CREATE INDEX IF NOT EXISTS ix_access_human_review_action_log_batch
  ON cx22073jw.access_human_review_action_log (activation_review_decision_batch_id, request_code, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_governed_apply_queue_created
  ON cx22073jw.access_governed_apply_queue (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_governed_apply_queue_status
  ON cx22073jw.access_governed_apply_queue (queue_status, target_domain_code, target_role_code);

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
      WHERE tg.tgname = 'trg_access_governed_apply_queue_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_governed_apply_queue'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_governed_apply_queue_updated_at
        BEFORE UPDATE ON cx22073jw.access_governed_apply_queue
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_mark_access_review_items(
  p_batch_code text,
  p_request_code text,
  p_review_bucket text,
  p_new_human_review_status text,
  p_reviewer_name text,
  p_review_note text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch_id uuid;
  v_updated integer := 0;
BEGIN
  SELECT activation_review_decision_batch_id
    INTO v_batch_id
  FROM cx22073jw.access_activation_review_decision_batch
  WHERE batch_code = p_batch_code
  LIMIT 1;

  IF v_batch_id IS NULL THEN
    RAISE EXCEPTION 'batch_code not found: %', p_batch_code;
  END IF;

  INSERT INTO cx22073jw.access_human_review_action_log (
    activation_review_decision_batch_id,
    request_code,
    actual_view_code,
    logical_view_name,
    previous_human_review_status,
    new_human_review_status,
    reviewer_name,
    review_note
  )
  SELECT
    v_batch_id,
    i.request_code,
    i.actual_view_code,
    i.logical_view_name,
    i.human_review_status,
    p_new_human_review_status,
    p_reviewer_name,
    p_review_note
  FROM cx22073jw.access_activation_review_decision_item i
  WHERE i.activation_review_decision_batch_id = v_batch_id
    AND i.request_code = p_request_code
    AND i.review_bucket = p_review_bucket;

  UPDATE cx22073jw.access_activation_review_decision_item
     SET human_review_status = p_new_human_review_status,
         review_note         = COALESCE(p_review_note, review_note)
   WHERE activation_review_decision_batch_id = v_batch_id
     AND request_code = p_request_code
     AND review_bucket = p_review_bucket;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_compile_access_governed_apply_queue(
  p_batch_code text
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch_id uuid;
  v_inserted integer := 0;
BEGIN
  SELECT activation_review_decision_batch_id
    INTO v_batch_id
  FROM cx22073jw.access_activation_review_decision_batch
  WHERE batch_code = p_batch_code
  LIMIT 1;

  IF v_batch_id IS NULL THEN
    RAISE EXCEPTION 'batch_code not found: %', p_batch_code;
  END IF;

  INSERT INTO cx22073jw.access_governed_apply_queue (
    queue_code,
    source_batch_code,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    queue_status,
    gate_check_required,
    runtime_apply_ready,
    actor_name,
    note_text
  )
  SELECT
    'govapply_' || replace(gen_random_uuid()::text, '-', ''),
    b.batch_code,
    i.request_code,
    i.target_domain_code,
    i.target_role_code,
    i.actual_view_code,
    i.logical_view_name,
    'queued',
    false,
    false,
    'Zero',
    'Queued from approved_candidate human review result. Final governed apply still pending.'
  FROM cx22073jw.access_activation_review_decision_item i
  JOIN cx22073jw.access_activation_review_decision_batch b
    ON b.activation_review_decision_batch_id = i.activation_review_decision_batch_id
  WHERE i.activation_review_decision_batch_id = v_batch_id
    AND i.review_bucket = 'approved_candidate'
    AND i.human_review_status = 'approved'
  ON CONFLICT (source_batch_code, request_code, actual_view_code) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  UPDATE cx22073jw.access_activation_review_decision_item i
     SET governed_apply_ready = true,
         review_note = COALESCE(i.review_note, 'Approved for governed apply queue.') 
   WHERE i.activation_review_decision_batch_id = v_batch_id
     AND i.review_bucket = 'approved_candidate'
     AND i.human_review_status = 'approved'
     AND EXISTS (
       SELECT 1
       FROM cx22073jw.access_governed_apply_queue q
       WHERE q.source_batch_code = p_batch_code
         AND q.request_code = i.request_code
         AND q.actual_view_code = i.actual_view_code
     );

  RETURN v_inserted;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_human_review_latest_action_log AS
SELECT
  b.batch_code,
  l.request_code,
  l.actual_view_code,
  l.logical_view_name,
  l.previous_human_review_status,
  l.new_human_review_status,
  l.reviewer_name,
  l.review_note,
  l.created_at
FROM cx22073jw.access_human_review_action_log l
JOIN cx22073jw.access_activation_review_decision_batch b
  ON b.activation_review_decision_batch_id = l.activation_review_decision_batch_id
WHERE b.activation_review_decision_batch_id = (
  SELECT activation_review_decision_batch_id
  FROM cx22073jw.access_activation_review_decision_batch
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY l.created_at DESC, l.request_code, l.logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_queue_latest_summary AS
SELECT
  source_batch_code,
  COUNT(*) AS queue_item_count,
  COUNT(*) FILTER (WHERE queue_status = 'queued') AS queued_count,
  COUNT(*) FILTER (WHERE queue_status = 'prepared') AS prepared_count,
  COUNT(*) FILTER (WHERE queue_status = 'applied') AS applied_count,
  COUNT(*) FILTER (WHERE queue_status = 'skipped') AS skipped_count,
  COUNT(*) FILTER (WHERE queue_status = 'cancelled') AS cancelled_count,
  MIN(created_at) AS first_created_at,
  MAX(created_at) AS last_created_at
FROM cx22073jw.access_governed_apply_queue
GROUP BY source_batch_code
ORDER BY last_created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_governed_apply_queue_latest_items AS
SELECT
  q.source_batch_code,
  q.request_code,
  q.target_domain_code,
  q.target_role_code,
  q.actual_view_code,
  q.logical_view_name,
  q.queue_status,
  q.gate_check_required,
  q.runtime_apply_ready,
  q.note_text,
  q.created_at
FROM cx22073jw.access_governed_apply_queue q
WHERE q.source_batch_code = (
  SELECT source_batch_code
  FROM cx22073jw.v_access_governed_apply_queue_latest_summary
  LIMIT 1
)
ORDER BY q.request_code, q.logical_view_name;

COMMIT;
SQL

  LATEST_BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT batch_code
FROM cx22073jw.v_access_activation_review_decision_latest_batch_summary
LIMIT 1;
SQL
  )"

  if [ -z "${LATEST_BATCH_CODE:-}" ]; then
    echo "ERROR: latest review decision batch not found"
    exit 1
  fi

  echo "LATEST_BATCH_CODE=$LATEST_BATCH_CODE"

  SMOKE_REQUEST_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT request_code
FROM cx22073jw.v_access_activation_review_decision_latest_items
WHERE target_domain_code = 'utility_assist'
  AND target_role_code = 'document_writer'
  AND review_bucket = 'approved_candidate'
LIMIT 1;
SQL
  )"

  if [ -n "${SMOKE_REQUEST_CODE:-}" ]; then
    echo "SMOKE_REQUEST_CODE=$SMOKE_REQUEST_CODE"

    psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT cx22073jw.fn_mark_access_review_items(
  '$LATEST_BATCH_CODE',
  '$SMOKE_REQUEST_CODE',
  'approved_candidate',
  'approved',
  'Zero',
  'smoke human review: approved approved_candidate items for utility_assist/document_writer'
);
SQL
  else
    echo "WARN: no utility_assist/document_writer approved_candidate request found for smoke approval"
  fi

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT cx22073jw.fn_compile_access_governed_apply_queue('$LATEST_BATCH_CODE');
SQL

  echo "============================================================"
  echo "LATEST HUMAN REVIEW ACTION LOG"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_human_review_latest_action_log;
SQL

  echo "============================================================"
  echo "LATEST GOVERNED APPLY QUEUE SUMMARY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_governed_apply_queue_latest_summary;

TABLE cx22073jw.v_access_governed_apply_queue_latest_items;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS HUMAN REVIEW / GOVERNED APPLY QUEUE DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
