#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_rank_scope_gate_intersection_evaluator.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS RANK / SCOPE / GATE EVALUATOR START"
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
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_activation_request'
  ) THEN
    RAISE EXCEPTION 'access_activation_request is required before intersection evaluator';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_activation_request_view_decision'
  ) THEN
    RAISE EXCEPTION 'access_activation_request_view_decision is required before intersection evaluator';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_actual_view_registry'
  ) THEN
    RAISE EXCEPTION 'access_actual_view_registry is required before intersection evaluator';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_access_role_access_bundle_item_matrix'
  ) THEN
    RAISE EXCEPTION 'v_access_role_access_bundle_item_matrix is required before intersection evaluator';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n
      ON n.oid = p.pronamespace
    WHERE n.nspname = 'cx22073jw'
      AND p.proname = 'fn_create_access_activation_request'
  ) THEN
    RAISE EXCEPTION 'fn_create_access_activation_request is required before intersection evaluator';
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
      'access_rank_scope_gate_evaluator',
      'AI Employee Rank Scope Gate Evaluator',
      'normal',
      'integration',
      'Rank / app scope / gate intersection evaluator for AI employee activation requests'
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

CREATE TABLE IF NOT EXISTS cx22073jw.access_rank_registry (
  rank_code              text PRIMARY KEY,
  rank_name              text NOT NULL,
  provisional_flag       boolean NOT NULL DEFAULT true,
  allow_public           boolean NOT NULL DEFAULT true,
  allow_masked           boolean NOT NULL DEFAULT true,
  allow_support          boolean NOT NULL DEFAULT true,
  allow_operational      boolean NOT NULL DEFAULT true,
  allow_audit            boolean NOT NULL DEFAULT true,
  allow_safety           boolean NOT NULL DEFAULT true,
  allow_privileged       boolean NOT NULL DEFAULT false,
  allow_restricted       boolean NOT NULL DEFAULT false,
  description            text,
  created_at             timestamptz NOT NULL DEFAULT NOW(),
  updated_at             timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_app_scope_registry (
  app_scope_code         text PRIMARY KEY,
  domain_code            text NOT NULL,
  scope_name             text NOT NULL,
  scope_group            text NOT NULL,
  provisional_flag       boolean NOT NULL DEFAULT true,
  description            text,
  created_at             timestamptz NOT NULL DEFAULT NOW(),
  updated_at             timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_app_scope_actual_view_allowlist (
  app_scope_code         text NOT NULL REFERENCES cx22073jw.access_app_scope_registry(app_scope_code),
  actual_view_code       text NOT NULL REFERENCES cx22073jw.access_actual_view_registry(actual_view_code),
  allow_mode             text NOT NULL CHECK (allow_mode IN ('allow','conditional')),
  note_text              text,
  created_at             timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (app_scope_code, actual_view_code)
);

CREATE INDEX IF NOT EXISTS ix_access_app_scope_registry_domain
  ON cx22073jw.access_app_scope_registry (domain_code, scope_group);

CREATE INDEX IF NOT EXISTS ix_access_app_scope_actual_view_allowlist_scope
  ON cx22073jw.access_app_scope_actual_view_allowlist (app_scope_code, allow_mode);

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
      WHERE tg.tgname = 'trg_access_rank_registry_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_rank_registry'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_rank_registry_updated_at
        BEFORE UPDATE ON cx22073jw.access_rank_registry
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_app_scope_registry_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_app_scope_registry'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_app_scope_registry_updated_at
        BEFORE UPDATE ON cx22073jw.access_app_scope_registry
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

INSERT INTO cx22073jw.access_rank_registry (
  rank_code,
  rank_name,
  provisional_flag,
  allow_public,
  allow_masked,
  allow_support,
  allow_operational,
  allow_audit,
  allow_safety,
  allow_privileged,
  allow_restricted,
  description
) VALUES
  (
    'RANK_TBD',
    'Temporary Rank Placeholder',
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    'Temporary placeholder rank used until official formal rank names are supplied by AI governance.'
  )
ON CONFLICT (rank_code) DO UPDATE
SET rank_name         = EXCLUDED.rank_name,
    provisional_flag  = EXCLUDED.provisional_flag,
    allow_public      = EXCLUDED.allow_public,
    allow_masked      = EXCLUDED.allow_masked,
    allow_support     = EXCLUDED.allow_support,
    allow_operational = EXCLUDED.allow_operational,
    allow_audit       = EXCLUDED.allow_audit,
    allow_safety      = EXCLUDED.allow_safety,
    allow_privileged  = EXCLUDED.allow_privileged,
    allow_restricted  = EXCLUDED.allow_restricted,
    description       = EXCLUDED.description,
    updated_at        = NOW();

INSERT INTO cx22073jw.access_app_scope_registry (
  app_scope_code,
  domain_code,
  scope_name,
  scope_group,
  provisional_flag,
  description
) VALUES
  ('ERP_RESIDENT_SURFACE', 'operations', 'ERP Resident Surface', 'resident_surface', true, 'ERP resident surface for operations-domain AI assistance'),
  ('STREAMING_PUBLIC_SURFACE', 'streaming', 'Streaming Public Surface', 'public_surface', true, 'Public streaming surface for streamer AI employees'),
  ('EDUCATION_SUBJECT_SURFACE', 'education', 'Education Subject Surface', 'subject_surface', true, 'Education subject support surface'),
  ('UTILITY_ASSIST_SURFACE', 'utility_assist', 'Utility Assist Surface', 'utility_surface', true, 'Utility assistance surface for drafting and daily support')
ON CONFLICT (app_scope_code) DO UPDATE
SET domain_code       = EXCLUDED.domain_code,
    scope_name        = EXCLUDED.scope_name,
    scope_group       = EXCLUDED.scope_group,
    provisional_flag  = EXCLUDED.provisional_flag,
    description       = EXCLUDED.description,
    updated_at        = NOW();

DELETE FROM cx22073jw.access_app_scope_actual_view_allowlist
WHERE app_scope_code IN (
  'ERP_RESIDENT_SURFACE',
  'STREAMING_PUBLIC_SURFACE',
  'EDUCATION_SUBJECT_SURFACE',
  'UTILITY_ASSIST_SURFACE'
);

INSERT INTO cx22073jw.access_app_scope_actual_view_allowlist (
  app_scope_code,
  actual_view_code,
  allow_mode,
  note_text
)
SELECT
  'ERP_RESIDENT_SURFACE',
  actual_view_code,
  CASE WHEN grant_mode = 'required' THEN 'allow' ELSE 'conditional' END,
  'Derived from operations consult_support upper-bound bundle.'
FROM cx22073jw.v_access_role_access_bundle_item_matrix
WHERE domain_code = 'operations'
  AND role_code = 'consult_support';

INSERT INTO cx22073jw.access_app_scope_actual_view_allowlist (
  app_scope_code,
  actual_view_code,
  allow_mode,
  note_text
)
SELECT
  'STREAMING_PUBLIC_SURFACE',
  actual_view_code,
  CASE WHEN grant_mode = 'required' THEN 'allow' ELSE 'conditional' END,
  'Derived from streaming stream_cohost upper-bound bundle.'
FROM cx22073jw.v_access_role_access_bundle_item_matrix
WHERE domain_code = 'streaming'
  AND role_code = 'stream_cohost';

INSERT INTO cx22073jw.access_app_scope_actual_view_allowlist (
  app_scope_code,
  actual_view_code,
  allow_mode,
  note_text
)
SELECT
  'EDUCATION_SUBJECT_SURFACE',
  actual_view_code,
  CASE WHEN grant_mode = 'required' THEN 'allow' ELSE 'conditional' END,
  'Derived from education subject_lecturer upper-bound bundle.'
FROM cx22073jw.v_access_role_access_bundle_item_matrix
WHERE domain_code = 'education'
  AND role_code = 'subject_lecturer';

INSERT INTO cx22073jw.access_app_scope_actual_view_allowlist (
  app_scope_code,
  actual_view_code,
  allow_mode,
  note_text
)
SELECT
  'UTILITY_ASSIST_SURFACE',
  actual_view_code,
  CASE WHEN grant_mode = 'required' THEN 'allow' ELSE 'conditional' END,
  'Derived from utility_assist document_writer upper-bound bundle.'
FROM cx22073jw.v_access_role_access_bundle_item_matrix
WHERE domain_code = 'utility_assist'
  AND role_code = 'document_writer';

CREATE OR REPLACE FUNCTION cx22073jw.fn_evaluate_access_activation_request(
  p_activation_request_id uuid
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_req record;
  v_updated integer := 0;
BEGIN
  SELECT *
    INTO v_req
  FROM cx22073jw.access_activation_request
  WHERE activation_request_id = p_activation_request_id
  LIMIT 1;

  IF v_req.activation_request_id IS NULL THEN
    RAISE EXCEPTION 'activation_request_id not found: %', p_activation_request_id;
  END IF;

  UPDATE cx22073jw.access_activation_request_view_decision d
     SET decision_status = CASE
                             WHEN rr.rank_code IS NULL THEN 'requires_rank_intersection'
                             WHEN sr.app_scope_code IS NULL THEN 'requires_scope_intersection'
                             WHEN avr.sensitivity_code = 'public'      AND NOT rr.allow_public      THEN 'rejected'
                             WHEN avr.sensitivity_code = 'masked'      AND NOT rr.allow_masked      THEN 'rejected'
                             WHEN avr.sensitivity_code = 'support'     AND NOT rr.allow_support     THEN 'rejected'
                             WHEN avr.sensitivity_code = 'operational' AND NOT rr.allow_operational THEN 'rejected'
                             WHEN avr.sensitivity_code = 'audit'       AND NOT rr.allow_audit       THEN 'rejected'
                             WHEN avr.sensitivity_code = 'safety'      AND NOT rr.allow_safety      THEN 'rejected'
                             WHEN avr.sensitivity_code = 'privileged'  AND NOT rr.allow_privileged  THEN 'rejected'
                             WHEN avr.sensitivity_code = 'restricted'  AND NOT rr.allow_restricted  THEN 'rejected'
                             WHEN avs.app_scope_code IS NULL AND d.bundle_inclusion_mode = 'conditional' THEN 'requires_scope_intersection'
                             WHEN avs.app_scope_code IS NULL THEN 'rejected'
                             WHEN d.gate_needed THEN 'requires_gate'
                             ELSE 'allowed_upper_bound'
                           END,
         decision_note   = CASE
                             WHEN rr.rank_code IS NULL THEN 'Requested rank is not registered. Rank intersection review is required.'
                             WHEN sr.app_scope_code IS NULL THEN 'Requested app scope is not registered for this evaluation stage.'
                             WHEN avr.sensitivity_code = 'public'      AND NOT rr.allow_public      THEN 'Rank does not allow public view access.'
                             WHEN avr.sensitivity_code = 'masked'      AND NOT rr.allow_masked      THEN 'Rank does not allow masked view access.'
                             WHEN avr.sensitivity_code = 'support'     AND NOT rr.allow_support     THEN 'Rank does not allow support view access.'
                             WHEN avr.sensitivity_code = 'operational' AND NOT rr.allow_operational THEN 'Rank does not allow operational view access.'
                             WHEN avr.sensitivity_code = 'audit'       AND NOT rr.allow_audit       THEN 'Rank does not allow audit view access.'
                             WHEN avr.sensitivity_code = 'safety'      AND NOT rr.allow_safety      THEN 'Rank does not allow safety view access.'
                             WHEN avr.sensitivity_code = 'privileged'  AND NOT rr.allow_privileged  THEN 'Rank does not allow privileged view access.'
                             WHEN avr.sensitivity_code = 'restricted'  AND NOT rr.allow_restricted  THEN 'Rank does not allow restricted view access.'
                             WHEN avs.app_scope_code IS NULL AND d.bundle_inclusion_mode = 'conditional' THEN 'Conditional view is not yet allowlisted for the requested app scope.'
                             WHEN avs.app_scope_code IS NULL THEN 'Actual view is not allowlisted for the requested app scope.'
                             WHEN d.gate_needed THEN 'Rank and scope allow upper-bound review, but separate gate approval is still required.'
                             ELSE 'Rank and scope currently allow upper-bound review. Final runtime intersection and approval still required.'
                           END
    FROM cx22073jw.access_actual_view_registry avr
    LEFT JOIN cx22073jw.access_rank_registry rr
      ON rr.rank_code = v_req.requested_rank_code
    LEFT JOIN cx22073jw.access_app_scope_registry sr
      ON sr.app_scope_code = v_req.requested_app_scope
    LEFT JOIN cx22073jw.access_app_scope_actual_view_allowlist avs
      ON avs.app_scope_code = v_req.requested_app_scope
     AND avs.actual_view_code = d.actual_view_code
   WHERE d.activation_request_id = v_req.activation_request_id
     AND avr.actual_view_code = d.actual_view_code;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_evaluate_all_access_activation_requests()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_total integer := 0;
  r record;
BEGIN
  FOR r IN
    SELECT activation_request_id
    FROM cx22073jw.access_activation_request
    ORDER BY created_at
  LOOP
    v_total := v_total + cx22073jw.fn_evaluate_access_activation_request(r.activation_request_id);
  END LOOP;

  RETURN v_total;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_rank_registry_summary AS
SELECT
  rank_code,
  rank_name,
  provisional_flag,
  allow_public,
  allow_masked,
  allow_support,
  allow_operational,
  allow_audit,
  allow_safety,
  allow_privileged,
  allow_restricted,
  description
FROM cx22073jw.access_rank_registry
ORDER BY rank_code;

CREATE OR REPLACE VIEW cx22073jw.v_access_app_scope_summary AS
SELECT
  s.app_scope_code,
  s.domain_code,
  s.scope_name,
  s.scope_group,
  s.provisional_flag,
  COUNT(a.actual_view_code) AS allowlisted_view_count
FROM cx22073jw.access_app_scope_registry s
LEFT JOIN cx22073jw.access_app_scope_actual_view_allowlist a
  ON a.app_scope_code = s.app_scope_code
GROUP BY
  s.app_scope_code,
  s.domain_code,
  s.scope_name,
  s.scope_group,
  s.provisional_flag
ORDER BY s.domain_code, s.app_scope_code;

CREATE OR REPLACE VIEW cx22073jw.v_access_activation_request_intersection_summary AS
SELECT
  r.request_code,
  r.target_domain_code,
  r.target_role_code,
  r.requested_rank_code,
  r.requested_app_scope,
  r.request_status,
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
  r.note_text,
  r.created_at
ORDER BY r.created_at DESC;

CREATE OR REPLACE VIEW cx22073jw.v_access_activation_request_latest_intersection_decisions AS
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
  'privileged_assist',
  'RANK_TBD',
  'ERP_RESIDENT_SURFACE',
  'Zero',
  'intersection smoke request: operations privileged_assist against ERP resident scope',
  'submitted'
);

SELECT cx22073jw.fn_evaluate_all_access_activation_requests();

COMMIT;

\echo '============================================================'
\echo 'RANK REGISTRY SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_access_rank_registry_summary;

\echo '============================================================'
\echo 'APP SCOPE SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_access_app_scope_summary;

\echo '============================================================'
\echo 'ACTIVATION INTERSECTION SUMMARY'
\echo '============================================================'
SELECT *
FROM cx22073jw.v_access_activation_request_intersection_summary
LIMIT 20;

\echo '============================================================'
\echo 'LATEST INTERSECTION DECISIONS'
\echo '============================================================'
TABLE cx22073jw.v_access_activation_request_latest_intersection_decisions;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS RANK / SCOPE / GATE EVALUATOR DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
