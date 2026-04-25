#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
BATCH_CODE="access_activation_review_decision_batch_${RUN_TS}"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_activation_review_decision_registry.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS ACTIVATION REVIEW DECISION REGISTRY"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "batch_code   : $BATCH_CODE"
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
      AND table_name = 'v_access_activation_review_export_latest_summary'
  ) THEN
    RAISE EXCEPTION 'v_access_activation_review_export_latest_summary is required before review decision registry';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_access_activation_review_export_latest_items'
  ) THEN
    RAISE EXCEPTION 'v_access_activation_review_export_latest_items is required before review decision registry';
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
      'access_activation_review_decision_registry',
      'AI Employee Activation Review Decision Registry',
      'normal',
      'integration',
      'DB-side review decision registry for latest activation review export'
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

CREATE TABLE IF NOT EXISTS cx22073jw.access_activation_review_decision_batch (
  activation_review_decision_batch_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code                          text NOT NULL UNIQUE,
  source_export_run_code              text NOT NULL,
  source_export_root_path             text,
  request_count                       integer NOT NULL DEFAULT 0,
  item_count                          integer NOT NULL DEFAULT 0,
  approved_candidate_count            integer NOT NULL DEFAULT 0,
  gate_hold_count                     integer NOT NULL DEFAULT 0,
  scope_hold_count                    integer NOT NULL DEFAULT 0,
  rank_hold_count                     integer NOT NULL DEFAULT 0,
  rejected_hold_count                 integer NOT NULL DEFAULT 0,
  batch_status                        text NOT NULL CHECK (
                                        batch_status IN ('running','pass','partial','error')
                                      ),
  actor_name                          text NOT NULL DEFAULT 'Zero',
  note_text                           text,
  created_at                          timestamptz NOT NULL DEFAULT NOW(),
  updated_at                          timestamptz NOT NULL DEFAULT NOW(),
  ended_at                            timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_activation_review_decision_item (
  activation_review_decision_item_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_review_decision_batch_id uuid NOT NULL REFERENCES cx22073jw.access_activation_review_decision_batch(activation_review_decision_batch_id) ON DELETE CASCADE,
  request_code                        text NOT NULL,
  target_domain_code                  text NOT NULL,
  target_role_code                    text NOT NULL,
  actual_view_code                    text NOT NULL,
  logical_view_name                   text NOT NULL,
  source_decision_status              text NOT NULL,
  source_action_hint                  text NOT NULL,
  review_bucket                       text NOT NULL CHECK (
                                        review_bucket IN (
                                          'approved_candidate',
                                          'gate_hold',
                                          'scope_hold',
                                          'rank_hold',
                                          'rejected_hold'
                                        )
                                      ),
  human_review_status                 text NOT NULL DEFAULT 'pending' CHECK (
                                        human_review_status IN (
                                          'pending',
                                          'approved',
                                          'rejected',
                                          'needs_followup'
                                        )
                                      ),
  governed_apply_ready                boolean NOT NULL DEFAULT false,
  review_note                         text,
  created_at                          timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (activation_review_decision_batch_id, request_code, actual_view_code)
);

CREATE INDEX IF NOT EXISTS ix_access_activation_review_decision_batch_created
  ON cx22073jw.access_activation_review_decision_batch (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_activation_review_decision_item_batch
  ON cx22073jw.access_activation_review_decision_item (activation_review_decision_batch_id, review_bucket, request_code);

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
      WHERE tg.tgname = 'trg_access_activation_review_decision_batch_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_activation_review_decision_batch'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_activation_review_decision_batch_updated_at
        BEFORE UPDATE ON cx22073jw.access_activation_review_decision_batch
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_activation_review_decision_latest_batch_summary AS
SELECT
  batch_code,
  source_export_run_code,
  source_export_root_path,
  request_count,
  item_count,
  approved_candidate_count,
  gate_hold_count,
  scope_hold_count,
  rank_hold_count,
  rejected_hold_count,
  batch_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_activation_review_decision_batch
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_activation_review_decision_latest_items AS
SELECT
  b.batch_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.source_decision_status,
  i.source_action_hint,
  i.review_bucket,
  i.human_review_status,
  i.governed_apply_ready,
  i.review_note,
  i.created_at
FROM cx22073jw.access_activation_review_decision_item i
JOIN cx22073jw.access_activation_review_decision_batch b
  ON b.activation_review_decision_batch_id = i.activation_review_decision_batch_id
WHERE b.activation_review_decision_batch_id = (
  SELECT activation_review_decision_batch_id
  FROM cx22073jw.access_activation_review_decision_batch
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;

COMMIT;
SQL

  SOURCE_EXPORT_RUN_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT run_code
FROM cx22073jw.v_access_activation_review_export_latest_summary
LIMIT 1;
SQL
  )"

  SOURCE_EXPORT_ROOT_PATH="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_access_activation_review_export_latest_summary
LIMIT 1;
SQL
  )"

  if [ -z "${SOURCE_EXPORT_RUN_CODE:-}" ]; then
    echo "ERROR: latest activation review export summary not found"
    exit 1
  fi

  BATCH_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.access_activation_review_decision_batch (
  batch_code,
  source_export_run_code,
  source_export_root_path,
  batch_status,
  actor_name,
  note_text
)
VALUES (
  '$BATCH_CODE',
  '$SOURCE_EXPORT_RUN_CODE',
  '$SOURCE_EXPORT_ROOT_PATH',
  'running',
  'Zero',
  'Persisting latest activation review export into review decision registry.'
)
RETURNING activation_review_decision_batch_id;
SQL
  )"

  echo "BATCH_ID=$BATCH_ID"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.access_activation_review_decision_item (
  activation_review_decision_batch_id,
  request_code,
  target_domain_code,
  target_role_code,
  actual_view_code,
  logical_view_name,
  source_decision_status,
  source_action_hint,
  review_bucket,
  human_review_status,
  governed_apply_ready,
  review_note
)
SELECT
  '$BATCH_ID',
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.decision_status,
  i.decision_action_hint,
  CASE
    WHEN i.decision_action_hint = 'allow_apply_candidate' THEN 'approved_candidate'
    WHEN i.decision_action_hint = 'gate_review_required' THEN 'gate_hold'
    WHEN i.decision_action_hint = 'scope_review_required' THEN 'scope_hold'
    WHEN i.decision_action_hint = 'rank_review_required' THEN 'rank_hold'
    ELSE 'rejected_hold'
  END AS review_bucket,
  'pending',
  false,
  CASE
    WHEN i.decision_action_hint = 'allow_apply_candidate' THEN 'Pending human review before governed apply.'
    WHEN i.decision_action_hint = 'gate_review_required' THEN 'Gate review required before any apply candidate discussion.'
    WHEN i.decision_action_hint = 'scope_review_required' THEN 'Scope review required before approval candidate.'
    WHEN i.decision_action_hint = 'rank_review_required' THEN 'Rank review required before approval candidate.'
    ELSE 'Rejected hold. Do not apply.'
  END AS review_note
FROM cx22073jw.v_access_activation_review_export_latest_items i;

UPDATE cx22073jw.access_activation_review_decision_batch
   SET request_count            = (
         SELECT COUNT(DISTINCT request_code)
         FROM cx22073jw.access_activation_review_decision_item
         WHERE activation_review_decision_batch_id = '$BATCH_ID'
       ),
       item_count               = (
         SELECT COUNT(*)
         FROM cx22073jw.access_activation_review_decision_item
         WHERE activation_review_decision_batch_id = '$BATCH_ID'
       ),
       approved_candidate_count = (
         SELECT COUNT(*)
         FROM cx22073jw.access_activation_review_decision_item
         WHERE activation_review_decision_batch_id = '$BATCH_ID'
           AND review_bucket = 'approved_candidate'
       ),
       gate_hold_count          = (
         SELECT COUNT(*)
         FROM cx22073jw.access_activation_review_decision_item
         WHERE activation_review_decision_batch_id = '$BATCH_ID'
           AND review_bucket = 'gate_hold'
       ),
       scope_hold_count         = (
         SELECT COUNT(*)
         FROM cx22073jw.access_activation_review_decision_item
         WHERE activation_review_decision_batch_id = '$BATCH_ID'
           AND review_bucket = 'scope_hold'
       ),
       rank_hold_count          = (
         SELECT COUNT(*)
         FROM cx22073jw.access_activation_review_decision_item
         WHERE activation_review_decision_batch_id = '$BATCH_ID'
           AND review_bucket = 'rank_hold'
       ),
       rejected_hold_count      = (
         SELECT COUNT(*)
         FROM cx22073jw.access_activation_review_decision_item
         WHERE activation_review_decision_batch_id = '$BATCH_ID'
           AND review_bucket = 'rejected_hold'
       ),
       batch_status             = CASE
                                    WHEN (
                                      SELECT COUNT(*)
                                      FROM cx22073jw.access_activation_review_decision_item
                                      WHERE activation_review_decision_batch_id = '$BATCH_ID'
                                    ) > 0 THEN 'pass'
                                    ELSE 'error'
                                  END,
       note_text                = CASE
                                    WHEN (
                                      SELECT COUNT(*)
                                      FROM cx22073jw.access_activation_review_decision_item
                                      WHERE activation_review_decision_batch_id = '$BATCH_ID'
                                    ) > 0 THEN 'Review decision batch created from latest activation review export.'
                                    ELSE 'No latest export items found.'
                                  END,
       ended_at                 = NOW(),
       updated_at               = NOW()
 WHERE activation_review_decision_batch_id = '$BATCH_ID';
SQL

  echo "============================================================"
  echo "LATEST REVIEW DECISION BATCH SUMMARY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_activation_review_decision_latest_batch_summary;

SELECT
  request_code,
  review_bucket,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_activation_review_decision_latest_items
GROUP BY request_code, review_bucket
ORDER BY request_code, review_bucket;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS ACTIVATION REVIEW DECISION REGISTRY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
