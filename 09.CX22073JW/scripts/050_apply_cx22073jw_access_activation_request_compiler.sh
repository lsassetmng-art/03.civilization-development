#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_activation_request_compiler.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS ACTIVATION REQUEST COMPILER START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "started_at   : $RUN_TS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_role_access_bundle_master'
  ) THEN
    RAISE EXCEPTION 'access_role_access_bundle_master is required before activation compiler';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_role_access_bundle_item'
  ) THEN
    RAISE EXCEPTION 'access_role_access_bundle_item is required before activation compiler';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_activation_request'
  ) THEN
    RAISE EXCEPTION 'access_activation_request is required before activation compiler';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_activation_request_view_decision'
  ) THEN
    RAISE EXCEPTION 'access_activation_request_view_decision is required before activation compiler';
  END IF;
END;
\$\$;

DO \$\$
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
      'access_activation_request_compiler',
      'AI Employee Activation Request Compiler',
      'normal',
      'integration',
      'Activation request compiler and per-view decision population for AI employees'
    )
    ON CONFLICT (domain_code) DO UPDATE
    SET domain_name   = EXCLUDED.domain_name,
        layer_code    = EXCLUDED.layer_code,
        domain_family = EXCLUDED.domain_family,
        description   = EXCLUDED.description,
        updated_at    = NOW();
  END IF;
END;
\$\$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_refresh_access_activation_request_decisions(
  p_activation_request_id uuid
)
RETURNS integer
LANGUAGE plpgsql
AS \$\$
DECLARE
  v_req record;
  v_inserted integer := 0;
BEGIN
  SELECT *
    INTO v_req
  FROM cx22073jw.access_activation_request
  WHERE activation_request_id = p_activation_request_id
  LIMIT 1;

  IF v_req.activation_request_id IS NULL THEN
    RAISE EXCEPTION 'activation_request_id not found: %', p_activation_request_id;
  END IF;

  DELETE FROM cx22073jw.access_activation_request_view_decision
  WHERE activation_request_id = p_activation_request_id;

  INSERT INTO cx22073jw.access_activation_request_view_decision (
    activation_request_id,
    actual_view_code,
    logical_view_name,
    bundle_inclusion_mode,
    gate_needed,
    decision_status,
    decision_note
  )
  SELECT
    v_req.activation_request_id,
    bi.actual_view_code,
    bi.logical_view_name,
    bi.grant_mode,
    bi.gate_needed,
    CASE
      WHEN bi.gate_needed THEN 'requires_gate'
      WHEN COALESCE(v_req.requested_rank_code, '') = '' THEN 'requires_rank_intersection'
      WHEN COALESCE(v_req.requested_app_scope, '') = '' THEN 'requires_scope_intersection'
      WHEN bi.grant_mode = 'conditional' THEN 'requires_scope_intersection'
      ELSE 'allowed_upper_bound'
    END AS decision_status,
    CASE
      WHEN bi.gate_needed THEN 'Gate-controlled view. Separate gate approval is required.'
      WHEN COALESCE(v_req.requested_rank_code, '') = '' THEN 'Requested rank is missing. Rank intersection review is required.'
      WHEN COALESCE(v_req.requested_app_scope, '') = '' THEN 'Requested app scope is missing. App scope intersection review is required.'
      WHEN bi.grant_mode = 'conditional' THEN 'Conditional bundle item. Scope review is required.'
      ELSE 'Upper-bound allowed at compiler stage. Final runtime intersection still required.'
    END AS decision_note
  FROM cx22073jw.access_role_access_bundle_master bm
  JOIN cx22073jw.access_role_access_bundle_item bi
    ON bi.role_access_bundle_id = bm.role_access_bundle_id
  WHERE bm.domain_code   = v_req.target_domain_code
    AND bm.role_code     = v_req.target_role_code
    AND bm.bundle_scope  = 'upper_bound_role_bundle'
    AND bm.bundle_status = 'active';

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RETURN v_inserted;
END;
\$\$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_create_access_activation_request(
  p_target_domain_code text,
  p_target_role_code text,
  p_requested_rank_code text DEFAULT NULL,
  p_requested_app_scope text DEFAULT NULL,
  p_requested_by text DEFAULT 'Zero',
  p_note_text text DEFAULT NULL,
  p_request_status text DEFAULT 'submitted'
)
RETURNS uuid
LANGUAGE plpgsql
AS \$\$
DECLARE
  v_request_id uuid;
  v_request_code text := 'actreq_' || p_target_domain_code || '_' || p_target_role_code || '_' || to_char(NOW(), 'YYYYMMDD_HH24MISSMS');
  v_bundle_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM cx22073jw.access_role_access_bundle_master bm
    WHERE bm.domain_code   = p_target_domain_code
      AND bm.role_code     = p_target_role_code
      AND bm.bundle_scope  = 'upper_bound_role_bundle'
      AND bm.bundle_status = 'active'
  )
  INTO v_bundle_exists;

  IF NOT v_bundle_exists THEN
    RAISE EXCEPTION 'active upper-bound bundle not found for domain=% role=%', p_target_domain_code, p_target_role_code;
  END IF;

  INSERT INTO cx22073jw.access_activation_request (
    request_code,
    target_domain_code,
    target_role_code,
    requested_rank_code,
    requested_app_scope,
    request_status,
    requested_by,
    note_text
  )
  VALUES (
    v_request_code,
    p_target_domain_code,
    p_target_role_code,
    p_requested_rank_code,
    p_requested_app_scope,
    p_request_status,
    p_requested_by,
    p_note_text
  )
  RETURNING activation_request_id INTO v_request_id;

  PERFORM cx22073jw.fn_refresh_access_activation_request_decisions(v_request_id);

  RETURN v_request_id;
END;
\$\$;

CREATE OR REPLACE VIEW cx22073jw.v_access_activation_request_compiled_summary AS
SELECT
  r.request_code,
  r.target_domain_code,
  r.target_role_code,
  r.requested_rank_code,
  r.requested_app_scope,
  r.request_status,
  r.requested_by,
  COUNT(d.actual_view_code) AS total_decision_count,
  COUNT(d.actual_view_code) FILTER (WHERE d.decision_status = 'allowed_upper_bound') AS allowed_upper_bound_count,
  COUNT(d.actual_view_code) FILTER (WHERE d.decision_status = 'requires_gate') AS requires_gate_count,
  COUNT(d.actual_view_code) FILTER (WHERE d.decision_status = 'requires_scope_intersection') AS requires_scope_count,
  COUNT(d.actual_view_code) FILTER (WHERE d.decision_status = 'requires_rank_intersection') AS requires_rank_count,
  COUNT(d.actual_view_code) FILTER (WHERE d.decision_status = 'rejected') AS rejected_count,
  r.note_text,
  r.created_at
FROM cx22073jw.access_activation_request r
LEFT JOIN cx22073jw.access_activation_request_view_decision d
  ON d.activation_request_id = r.activation_request_id
GROUP BY
  r.request_code,
  r.target_domain_code,
  r.target_role_code,
  r.requested_rank_code,
  r.requested_app_scope,
  r.request_status,
  r.requested_by,
  r.note_text,
  r.created_at
ORDER BY r.created_at DESC;

CREATE OR REPLACE VIEW cx22073jw.v_access_activation_request_latest_decisions AS
SELECT
  r.request_code,
  r.target_domain_code,
  r.target_role_code,
  d.actual_view_code,
  d.logical_view_name,
  d.bundle_inclusion_mode,
  d.gate_needed,
  d.decision_status,
  d.decision_note,
  d.created_at
FROM cx22073jw.access_activation_request_view_decision d
JOIN cx22073jw.access_activation_request r
  ON r.activation_request_id = d.activation_request_id
WHERE r.activation_request_id = (
  SELECT activation_request_id
  FROM cx22073jw.access_activation_request
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY d.logical_view_name;

SELECT cx22073jw.fn_create_access_activation_request(
  'operations',
  'consult_support',
  'RANK_TBD',
  'ERP_RESIDENT_SURFACE',
  'Zero',
  'compiler smoke request: operations consult_support'
);

SELECT cx22073jw.fn_create_access_activation_request(
  'streaming',
  'stream_cohost',
  'RANK_TBD',
  'STREAMING_PUBLIC_SURFACE',
  'Zero',
  'compiler smoke request: streaming stream_cohost'
);

SELECT cx22073jw.fn_create_access_activation_request(
  'education',
  'subject_lecturer',
  'RANK_TBD',
  'EDUCATION_SUBJECT_SURFACE',
  'Zero',
  'compiler smoke request: education subject_lecturer'
);

SELECT cx22073jw.fn_create_access_activation_request(
  'utility_assist',
  'document_writer',
  'RANK_TBD',
  'UTILITY_ASSIST_SURFACE',
  'Zero',
  'compiler smoke request: utility document_writer'
);

COMMIT;

\echo '============================================================'
\echo 'LATEST COMPILED REQUESTS'
\echo '============================================================'
SELECT *
FROM cx22073jw.v_access_activation_request_compiled_summary
LIMIT 10;

\echo '============================================================'
\echo 'LATEST REQUEST DECISIONS'
\echo '============================================================'
TABLE cx22073jw.v_access_activation_request_latest_decisions;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS ACTIVATION REQUEST COMPILER DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
