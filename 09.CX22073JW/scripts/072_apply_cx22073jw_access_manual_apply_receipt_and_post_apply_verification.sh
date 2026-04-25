#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"

RUN_TS="$(date +%Y%m%d_%H%M%S)"
RECEIPT_BATCH_CODE="access_manual_apply_receipt_${RUN_TS}"
VERIFY_RUN_CODE="access_post_apply_verify_${RUN_TS}"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_manual_apply_receipt_and_post_apply_verification.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS MANUAL APPLY RECEIPT / POST VERIFY"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "receipt      : $RECEIPT_BATCH_CODE"
  echo "verify       : $VERIFY_RUN_CODE"
  echo "started_at   : $RUN_TS"
  echo "============================================================"

  echo "============================================================"
  echo "PHASE 1: PRECHECK"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SET search_path TO cx22073jw, public;

SELECT 'check_handoff_summary_view' AS check_name,
       EXISTS (
         SELECT 1
         FROM information_schema.views
         WHERE table_schema='cx22073jw'
           AND table_name='v_access_final_handoff_export_latest_summary'
       ) AS ok
UNION ALL
SELECT 'check_handoff_items_view',
       EXISTS (
         SELECT 1
         FROM information_schema.views
         WHERE table_schema='cx22073jw'
           AND table_name='v_access_final_handoff_export_latest_items'
       )
UNION ALL
SELECT 'check_role_registry_summary',
       EXISTS (
         SELECT 1
         FROM information_schema.views
         WHERE table_schema='cx22073jw'
           AND table_name='v_access_db_role_registry_summary'
       );
SQL

  echo "============================================================"
  echo "PHASE 2: CREATE / REPLACE RECEIPT + VERIFY OBJECTS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

CREATE TABLE IF NOT EXISTS cx22073jw.access_manual_apply_receipt_batch (
  manual_apply_receipt_batch_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code                    text NOT NULL UNIQUE,
  source_handoff_run_code       text NOT NULL,
  source_export_root_path       text,
  requested_item_count          integer NOT NULL DEFAULT 0,
  seeded_item_count             integer NOT NULL DEFAULT 0,
  batch_status                  text NOT NULL CHECK (batch_status IN ('running','pass','partial','error')),
  actor_name                    text NOT NULL DEFAULT 'Zero',
  note_text                     text,
  created_at                    timestamptz NOT NULL DEFAULT NOW(),
  updated_at                    timestamptz NOT NULL DEFAULT NOW(),
  ended_at                      timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_manual_apply_receipt_item (
  manual_apply_receipt_item_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_apply_receipt_batch_id uuid NOT NULL REFERENCES cx22073jw.access_manual_apply_receipt_batch(manual_apply_receipt_batch_id) ON DELETE CASCADE,
  request_code                  text NOT NULL,
  target_domain_code            text NOT NULL,
  target_role_code              text NOT NULL,
  actual_view_code              text NOT NULL,
  logical_view_name             text NOT NULL,
  expected_db_role_name         text NOT NULL,
  receipt_status                text NOT NULL CHECK (receipt_status IN ('pending_confirmation','confirmed_applied','confirmed_skipped','confirmed_failed')),
  manual_executor_name          text,
  manual_apply_note             text,
  created_at                    timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (manual_apply_receipt_batch_id, request_code, actual_view_code)
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_post_apply_verification_run (
  post_apply_verification_run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                       text NOT NULL UNIQUE,
  source_receipt_batch_code      text NOT NULL,
  requested_item_count           integer NOT NULL DEFAULT 0,
  verified_applied_count         integer NOT NULL DEFAULT 0,
  not_yet_applied_count          integer NOT NULL DEFAULT 0,
  precheck_fail_count            integer NOT NULL DEFAULT 0,
  run_status                     text NOT NULL CHECK (run_status IN ('running','pass','partial','error')),
  actor_name                     text NOT NULL DEFAULT 'Zero',
  note_text                      text,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  updated_at                     timestamptz NOT NULL DEFAULT NOW(),
  ended_at                       timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_post_apply_verification_item (
  post_apply_verification_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_apply_verification_run_id  uuid NOT NULL REFERENCES cx22073jw.access_post_apply_verification_run(post_apply_verification_run_id) ON DELETE CASCADE,
  source_receipt_batch_code       text NOT NULL,
  request_code                    text NOT NULL,
  target_domain_code              text NOT NULL,
  target_role_code                text NOT NULL,
  actual_view_code                text NOT NULL,
  logical_view_name               text NOT NULL,
  expected_db_role_name           text NOT NULL,
  role_exists_flag                boolean NOT NULL DEFAULT false,
  view_exists_flag                boolean NOT NULL DEFAULT false,
  select_grant_present_flag       boolean NOT NULL DEFAULT false,
  verification_status             text NOT NULL CHECK (verification_status IN ('verified_applied','not_yet_applied','precheck_fail')),
  result_note                     text,
  created_at                      timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (post_apply_verification_run_id, request_code, actual_view_code)
);

CREATE INDEX IF NOT EXISTS ix_access_manual_apply_receipt_batch_created
  ON cx22073jw.access_manual_apply_receipt_batch (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_manual_apply_receipt_item_batch
  ON cx22073jw.access_manual_apply_receipt_item (manual_apply_receipt_batch_id, receipt_status, request_code);

CREATE INDEX IF NOT EXISTS ix_access_post_apply_verification_run_created
  ON cx22073jw.access_post_apply_verification_run (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_post_apply_verification_item_run
  ON cx22073jw.access_post_apply_verification_item (post_apply_verification_run_id, verification_status, request_code);

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
      WHERE tg.tgname = 'trg_access_manual_apply_receipt_batch_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_manual_apply_receipt_batch'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_manual_apply_receipt_batch_updated_at
        BEFORE UPDATE ON cx22073jw.access_manual_apply_receipt_batch
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_post_apply_verification_run_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_post_apply_verification_run'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_post_apply_verification_run_updated_at
        BEFORE UPDATE ON cx22073jw.access_post_apply_verification_run
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_create_access_manual_apply_receipt_batch(
  p_batch_code text,
  p_actor_name text DEFAULT 'Zero',
  p_note_text text DEFAULT 'Seeded from latest final handoff pass items awaiting manual confirmation.'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch_id uuid;
  v_source_run_code text;
  v_source_export_root_path text;
  v_item_count integer := 0;
BEGIN
  SELECT
    run_code,
    export_root_path
  INTO
    v_source_run_code,
    v_source_export_root_path
  FROM cx22073jw.v_access_final_handoff_export_latest_summary
  LIMIT 1;

  IF COALESCE(v_source_run_code, '') = '' THEN
    RAISE EXCEPTION 'latest final handoff export summary not found';
  END IF;

  INSERT INTO cx22073jw.access_manual_apply_receipt_batch (
    batch_code,
    source_handoff_run_code,
    source_export_root_path,
    batch_status,
    actor_name,
    note_text
  )
  VALUES (
    p_batch_code,
    v_source_run_code,
    v_source_export_root_path,
    'running',
    p_actor_name,
    p_note_text
  )
  RETURNING manual_apply_receipt_batch_id INTO v_batch_id;

  INSERT INTO cx22073jw.access_manual_apply_receipt_item (
    manual_apply_receipt_batch_id,
    request_code,
    target_domain_code,
    target_role_code,
    actual_view_code,
    logical_view_name,
    expected_db_role_name,
    receipt_status,
    manual_executor_name,
    manual_apply_note
  )
  SELECT
    v_batch_id,
    i.request_code,
    i.target_domain_code,
    i.target_role_code,
    i.actual_view_code,
    i.logical_view_name,
    i.expected_db_role_name,
    'pending_confirmation',
    NULL,
    'Awaiting manual apply confirmation.'
  FROM cx22073jw.v_access_final_handoff_export_latest_items i
  WHERE i.handoff_bucket = 'pass_item';

  GET DIAGNOSTICS v_item_count = ROW_COUNT;

  UPDATE cx22073jw.access_manual_apply_receipt_batch
     SET requested_item_count = v_item_count,
         seeded_item_count    = v_item_count,
         batch_status         = CASE
                                  WHEN v_item_count > 0 THEN 'pass'
                                  ELSE 'error'
                                END,
         ended_at             = NOW(),
         updated_at           = NOW()
   WHERE manual_apply_receipt_batch_id = v_batch_id;

  RETURN v_batch_id;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_run_access_post_apply_verification(
  p_run_code text,
  p_source_receipt_batch_code text,
  p_actor_name text DEFAULT 'Zero',
  p_note_text text DEFAULT 'Post-apply verification only. Checks whether SELECT grant is visible.'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_run_id uuid;
  v_requested integer := 0;
  v_verified integer := 0;
  v_notyet integer := 0;
  v_precheck integer := 0;
  r record;
  v_role_exists boolean;
  v_view_exists boolean;
  v_select_present boolean;
  v_status text;
  v_note text;
BEGIN
  INSERT INTO cx22073jw.access_post_apply_verification_run (
    run_code,
    source_receipt_batch_code,
    run_status,
    actor_name,
    note_text
  )
  VALUES (
    p_run_code,
    p_source_receipt_batch_code,
    'running',
    p_actor_name,
    p_note_text
  )
  RETURNING post_apply_verification_run_id INTO v_run_id;

  FOR r IN
    SELECT
      i.request_code,
      i.target_domain_code,
      i.target_role_code,
      i.actual_view_code,
      i.logical_view_name,
      i.expected_db_role_name
    FROM cx22073jw.access_manual_apply_receipt_item i
    JOIN cx22073jw.access_manual_apply_receipt_batch b
      ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
    WHERE b.batch_code = p_source_receipt_batch_code
    ORDER BY i.request_code, i.logical_view_name
  LOOP
    v_requested := v_requested + 1;

    SELECT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = r.expected_db_role_name
    )
    INTO v_role_exists;

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.views
      WHERE table_schema = 'cx22073jw'
        AND table_name = r.logical_view_name
    )
    INTO v_view_exists;

    IF v_role_exists AND v_view_exists THEN
      SELECT has_table_privilege(
        r.expected_db_role_name,
        'cx22073jw.' || r.logical_view_name,
        'SELECT'
      )
      INTO v_select_present;
    ELSE
      v_select_present := false;
    END IF;

    IF NOT v_role_exists OR NOT v_view_exists THEN
      v_status := 'precheck_fail';
      v_note := 'Role or view is missing, so post-apply verification cannot confirm grant presence.';
      v_precheck := v_precheck + 1;
    ELSIF v_select_present THEN
      v_status := 'verified_applied';
      v_note := 'SELECT privilege is visible for expected role on target view.';
      v_verified := v_verified + 1;
    ELSE
      v_status := 'not_yet_applied';
      v_note := 'SELECT privilege is not visible yet for expected role on target view.';
      v_notyet := v_notyet + 1;
    END IF;

    INSERT INTO cx22073jw.access_post_apply_verification_item (
      post_apply_verification_run_id,
      source_receipt_batch_code,
      request_code,
      target_domain_code,
      target_role_code,
      actual_view_code,
      logical_view_name,
      expected_db_role_name,
      role_exists_flag,
      view_exists_flag,
      select_grant_present_flag,
      verification_status,
      result_note
    )
    VALUES (
      v_run_id,
      p_source_receipt_batch_code,
      r.request_code,
      r.target_domain_code,
      r.target_role_code,
      r.actual_view_code,
      r.logical_view_name,
      r.expected_db_role_name,
      v_role_exists,
      v_view_exists,
      v_select_present,
      v_status,
      v_note
    );
  END LOOP;

  UPDATE cx22073jw.access_post_apply_verification_run
     SET requested_item_count   = v_requested,
         verified_applied_count = v_verified,
         not_yet_applied_count  = v_notyet,
         precheck_fail_count    = v_precheck,
         run_status             = CASE
                                    WHEN v_requested = 0 THEN 'error'
                                    WHEN v_precheck = 0 AND v_notyet = 0 THEN 'pass'
                                    WHEN v_verified > 0 OR v_notyet > 0 THEN 'partial'
                                    ELSE 'error'
                                  END,
         ended_at               = NOW(),
         updated_at             = NOW()
   WHERE post_apply_verification_run_id = v_run_id;

  RETURN v_run_id;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_manual_apply_receipt_latest_batch_summary AS
SELECT
  batch_code,
  source_handoff_run_code,
  source_export_root_path,
  requested_item_count,
  seeded_item_count,
  batch_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_manual_apply_receipt_latest_items AS
SELECT
  b.batch_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.expected_db_role_name,
  i.receipt_status,
  i.manual_executor_name,
  i.manual_apply_note,
  i.created_at
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.manual_apply_receipt_batch_id = (
  SELECT manual_apply_receipt_batch_id
  FROM cx22073jw.access_manual_apply_receipt_batch
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_post_apply_verification_latest_summary AS
SELECT
  run_code,
  source_receipt_batch_code,
  requested_item_count,
  verified_applied_count,
  not_yet_applied_count,
  precheck_fail_count,
  run_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_post_apply_verification_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_post_apply_verification_latest_items AS
SELECT
  r.run_code,
  i.source_receipt_batch_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.expected_db_role_name,
  i.role_exists_flag,
  i.view_exists_flag,
  i.select_grant_present_flag,
  i.verification_status,
  i.result_note,
  i.created_at
FROM cx22073jw.access_post_apply_verification_item i
JOIN cx22073jw.access_post_apply_verification_run r
  ON r.post_apply_verification_run_id = i.post_apply_verification_run_id
WHERE r.post_apply_verification_run_id = (
  SELECT post_apply_verification_run_id
  FROM cx22073jw.access_post_apply_verification_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;

COMMIT;
SQL

  echo "============================================================"
  echo "PHASE 3: CREATE RECEIPT BATCH"
  echo "============================================================"

  RECEIPT_BATCH_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT cx22073jw.fn_create_access_manual_apply_receipt_batch(
  '$RECEIPT_BATCH_CODE',
  'Zero',
  'Seed latest final handoff pass items into manual apply receipt.'
);
SQL
  )"

  if [ -z "${RECEIPT_BATCH_ID:-}" ]; then
    echo "ERROR: manual apply receipt batch was not created"
    exit 1
  fi

  echo "RECEIPT_BATCH_ID=$RECEIPT_BATCH_ID"

  echo "============================================================"
  echo "PHASE 4: RUN POST-APPLY VERIFICATION"
  echo "============================================================"

  VERIFY_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT cx22073jw.fn_run_access_post_apply_verification(
  '$VERIFY_RUN_CODE',
  '$RECEIPT_BATCH_CODE',
  'Zero',
  'Verify whether manual GRANT application is visible after final handoff.'
);
SQL
  )"

  if [ -z "${VERIFY_RUN_ID:-}" ]; then
    echo "ERROR: post-apply verification run was not created"
    exit 1
  fi

  echo "VERIFY_RUN_ID=$VERIFY_RUN_ID"

  echo "============================================================"
  echo "PHASE 5: VERIFY"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_manual_apply_receipt_latest_batch_summary;

SELECT
  request_code,
  receipt_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_manual_apply_receipt_latest_items
GROUP BY request_code, receipt_status
ORDER BY request_code, receipt_status;

TABLE cx22073jw.v_access_post_apply_verification_latest_summary;

SELECT
  request_code,
  verification_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_post_apply_verification_latest_items
GROUP BY request_code, verification_status
ORDER BY request_code, verification_status;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS MANUAL APPLY RECEIPT / POST VERIFY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
