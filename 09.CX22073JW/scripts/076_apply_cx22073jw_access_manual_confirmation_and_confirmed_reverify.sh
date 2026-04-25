#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
REVERIFY_RUN_CODE="access_post_apply_confirmed_only_${RUN_TS}"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_manual_confirmation_and_confirmed_reverify.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS MANUAL CONFIRMATION / CONFIRMED REVERIFY"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "reverify_run : $REVERIFY_RUN_CODE"
  echo "started_at   : $RUN_TS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

CREATE TABLE IF NOT EXISTS cx22073jw.access_manual_apply_confirmation_log (
  manual_apply_confirmation_log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_apply_receipt_batch_id    uuid NOT NULL REFERENCES cx22073jw.access_manual_apply_receipt_batch(manual_apply_receipt_batch_id) ON DELETE CASCADE,
  request_code                     text NOT NULL,
  actual_view_code                 text NOT NULL,
  logical_view_name                text NOT NULL,
  previous_receipt_status          text NOT NULL,
  new_receipt_status               text NOT NULL CHECK (
                                     new_receipt_status IN (
                                       'pending_confirmation',
                                       'confirmed_applied',
                                       'confirmed_skipped',
                                       'confirmed_failed'
                                     )
                                   ),
  executor_name                    text NOT NULL,
  confirmation_note                text,
  created_at                       timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_access_manual_apply_confirmation_log_batch
  ON cx22073jw.access_manual_apply_confirmation_log (manual_apply_receipt_batch_id, request_code, created_at DESC);

CREATE OR REPLACE FUNCTION cx22073jw.fn_confirm_access_manual_apply_receipt_items(
  p_batch_code text,
  p_request_code text DEFAULT NULL,
  p_new_receipt_status text DEFAULT 'confirmed_applied',
  p_executor_name text DEFAULT 'Zero',
  p_confirmation_note text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_batch_id uuid;
  v_updated integer := 0;
BEGIN
  IF p_new_receipt_status NOT IN ('confirmed_applied','confirmed_skipped','confirmed_failed') THEN
    RAISE EXCEPTION 'unsupported receipt status: %', p_new_receipt_status;
  END IF;

  SELECT manual_apply_receipt_batch_id
    INTO v_batch_id
  FROM cx22073jw.access_manual_apply_receipt_batch
  WHERE batch_code = p_batch_code
  LIMIT 1;

  IF v_batch_id IS NULL THEN
    RAISE EXCEPTION 'batch_code not found: %', p_batch_code;
  END IF;

  INSERT INTO cx22073jw.access_manual_apply_confirmation_log (
    manual_apply_receipt_batch_id,
    request_code,
    actual_view_code,
    logical_view_name,
    previous_receipt_status,
    new_receipt_status,
    executor_name,
    confirmation_note
  )
  SELECT
    v_batch_id,
    i.request_code,
    i.actual_view_code,
    i.logical_view_name,
    i.receipt_status,
    p_new_receipt_status,
    p_executor_name,
    p_confirmation_note
  FROM cx22073jw.access_manual_apply_receipt_item i
  WHERE i.manual_apply_receipt_batch_id = v_batch_id
    AND (p_request_code IS NULL OR i.request_code = p_request_code);

  UPDATE cx22073jw.access_manual_apply_receipt_item
     SET receipt_status      = p_new_receipt_status,
         manual_executor_name = p_executor_name,
         manual_apply_note    = COALESCE(p_confirmation_note, manual_apply_note)
   WHERE manual_apply_receipt_batch_id = v_batch_id
     AND (p_request_code IS NULL OR request_code = p_request_code);

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_run_access_post_apply_verification_confirmed_only(
  p_run_code text,
  p_source_receipt_batch_code text,
  p_actor_name text DEFAULT 'Zero',
  p_note_text text DEFAULT 'Confirmed-only post-apply verification.'
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
      AND i.receipt_status = 'confirmed_applied'
    ORDER BY i.request_code, i.logical_view_name
  LOOP
    v_requested := v_requested + 1;

    SELECT EXISTS (
      SELECT 1 FROM pg_roles WHERE rolname = r.expected_db_role_name
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
      v_note := 'Role or view is missing.';
      v_precheck := v_precheck + 1;
    ELSIF v_select_present THEN
      v_status := 'verified_applied';
      v_note := 'SELECT privilege is visible.';
      v_verified := v_verified + 1;
    ELSE
      v_status := 'not_yet_applied';
      v_note := 'SELECT privilege is not visible yet.';
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

CREATE OR REPLACE VIEW cx22073jw.v_access_manual_apply_receipt_latest_pending_summary AS
SELECT
  b.batch_code,
  COUNT(*) AS total_item_count,
  COUNT(*) FILTER (WHERE i.receipt_status = 'pending_confirmation') AS pending_confirmation_count,
  COUNT(*) FILTER (WHERE i.receipt_status = 'confirmed_applied') AS confirmed_applied_count,
  COUNT(*) FILTER (WHERE i.receipt_status = 'confirmed_skipped') AS confirmed_skipped_count,
  COUNT(*) FILTER (WHERE i.receipt_status = 'confirmed_failed') AS confirmed_failed_count
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.manual_apply_receipt_batch_id = (
  SELECT manual_apply_receipt_batch_id
  FROM cx22073jw.access_manual_apply_receipt_batch
  ORDER BY created_at DESC
  LIMIT 1
)
GROUP BY b.batch_code;

CREATE OR REPLACE VIEW cx22073jw.v_access_manual_apply_confirmation_latest_log AS
SELECT
  b.batch_code,
  l.request_code,
  l.actual_view_code,
  l.logical_view_name,
  l.previous_receipt_status,
  l.new_receipt_status,
  l.executor_name,
  l.confirmation_note,
  l.created_at
FROM cx22073jw.access_manual_apply_confirmation_log l
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = l.manual_apply_receipt_batch_id
WHERE b.manual_apply_receipt_batch_id = (
  SELECT manual_apply_receipt_batch_id
  FROM cx22073jw.access_manual_apply_receipt_batch
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY l.created_at DESC, l.request_code, l.logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary AS
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
WHERE note_text ILIKE 'Confirmed-only%'
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_post_apply_verification_latest_confirmed_only_items AS
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
  WHERE note_text ILIKE 'Confirmed-only%'
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;

COMMIT;
SQL

  LATEST_BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT batch_code
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;
SQL
  )"

  if [ -z "${LATEST_BATCH_CODE:-}" ]; then
    echo "ERROR: latest access_manual_apply_receipt_batch not found"
    exit 1
  fi

  echo "LATEST_BATCH_CODE=$LATEST_BATCH_CODE"

  CONFIRMED_APPLIED_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT COUNT(*)
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.batch_code = '$LATEST_BATCH_CODE'
  AND i.receipt_status = 'confirmed_applied';
SQL
  )"

  echo "CONFIRMED_APPLIED_COUNT=$CONFIRMED_APPLIED_COUNT"

  if [ "${CONFIRMED_APPLIED_COUNT:-0}" -gt 0 ]; then
    REVERIFY_RUN_ID="$(
      psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT cx22073jw.fn_run_access_post_apply_verification_confirmed_only(
  '$REVERIFY_RUN_CODE',
  '$LATEST_BATCH_CODE',
  'Zero',
  'Confirmed-only post-apply verification.'
);
SQL
    )"
    echo "REVERIFY_RUN_ID=$REVERIFY_RUN_ID"
  else
    echo "WARN: no confirmed_applied items yet; confirmed-only reverify was skipped"
  fi

  echo "============================================================"
  echo "VERIFY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_manual_apply_receipt_latest_pending_summary;

SELECT
  request_code,
  receipt_status,
  COUNT(*) AS item_count
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.manual_apply_receipt_batch_id = (
  SELECT manual_apply_receipt_batch_id
  FROM cx22073jw.access_manual_apply_receipt_batch
  ORDER BY created_at DESC
  LIMIT 1
)
GROUP BY request_code, receipt_status
ORDER BY request_code, receipt_status;

TABLE cx22073jw.v_access_manual_apply_confirmation_latest_log;

TABLE cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS MANUAL CONFIRMATION / CONFIRMED REVERIFY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
