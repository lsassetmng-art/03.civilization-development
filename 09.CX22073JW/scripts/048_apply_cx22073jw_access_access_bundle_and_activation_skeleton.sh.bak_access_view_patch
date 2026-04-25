#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_access_bundle_and_activation_skeleton.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS ACCESS BUNDLE / ACTIVATION SKELETON"
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
      AND table_name = 'v_access_role_actual_view_grant_matrix'
  ) THEN
    RAISE EXCEPTION 'v_access_role_actual_view_grant_matrix is required before access bundle bootstrap';
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
      'access_access_bundle_activation',
      'AI Employee Access Bundle Activation',
      'normal',
      'integration',
      'Role access bundle and activation request skeleton for AI employees'
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

CREATE TABLE IF NOT EXISTS cx22073jw.access_role_access_bundle_master (
  role_access_bundle_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_code                   text NOT NULL UNIQUE,
  domain_code                   text NOT NULL,
  role_code                     text NOT NULL,
  bundle_scope                  text NOT NULL CHECK (bundle_scope IN ('upper_bound_role_bundle')),
  bundle_status                 text NOT NULL CHECK (bundle_status IN ('draft','active','paused','retired')),
  gate_needed_view_count        integer NOT NULL DEFAULT 0,
  non_gate_view_count           integer NOT NULL DEFAULT 0,
  total_view_count              integer NOT NULL DEFAULT 0,
  actor_name                    text NOT NULL DEFAULT 'Zero',
  note_text                     text,
  created_at                    timestamptz NOT NULL DEFAULT NOW(),
  updated_at                    timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (domain_code, role_code, bundle_scope)
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_role_access_bundle_item (
  role_access_bundle_item_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_access_bundle_id         uuid NOT NULL REFERENCES cx22073jw.access_role_access_bundle_master(role_access_bundle_id) ON DELETE CASCADE,
  actual_view_code              text NOT NULL,
  logical_view_name             text NOT NULL,
  view_family_code              text NOT NULL,
  grant_mode                    text NOT NULL CHECK (grant_mode IN ('required','conditional')),
  gate_needed                   boolean NOT NULL DEFAULT false,
  audit_obligation              boolean NOT NULL DEFAULT true,
  sort_order                    integer NOT NULL DEFAULT 100,
  created_at                    timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (role_access_bundle_id, actual_view_code)
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_activation_request (
  activation_request_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_code                  text NOT NULL UNIQUE,
  target_domain_code            text NOT NULL,
  target_role_code              text NOT NULL,
  requested_rank_code           text,
  requested_app_scope           text,
  request_status                text NOT NULL CHECK (
                                 request_status IN (
                                   'draft',
                                   'submitted',
                                   'in_review',
                                   'approved_pending_apply',
                                   'rejected',
                                   'cancelled'
                                 )
                               ),
  requested_by                  text NOT NULL DEFAULT 'Zero',
  reviewer_name                 text,
  approver_name                 text,
  note_text                     text,
  created_at                    timestamptz NOT NULL DEFAULT NOW(),
  updated_at                    timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_activation_request_view_decision (
  activation_request_view_decision_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_request_id         uuid NOT NULL REFERENCES cx22073jw.access_activation_request(activation_request_id) ON DELETE CASCADE,
  actual_view_code              text NOT NULL,
  logical_view_name             text NOT NULL,
  bundle_inclusion_mode         text NOT NULL CHECK (bundle_inclusion_mode IN ('required','conditional')),
  gate_needed                   boolean NOT NULL DEFAULT false,
  decision_status               text NOT NULL CHECK (
                                 decision_status IN (
                                   'pending',
                                   'allowed_upper_bound',
                                   'requires_gate',
                                   'requires_scope_intersection',
                                   'requires_rank_intersection',
                                   'rejected'
                                 )
                               ),
  decision_note                 text,
  created_at                    timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (activation_request_id, actual_view_code)
);

CREATE INDEX IF NOT EXISTS ix_access_role_access_bundle_master_role
  ON cx22073jw.access_role_access_bundle_master (domain_code, role_code, bundle_status);

CREATE INDEX IF NOT EXISTS ix_access_role_access_bundle_item_bundle
  ON cx22073jw.access_role_access_bundle_item (role_access_bundle_id, sort_order);

CREATE INDEX IF NOT EXISTS ix_access_activation_request_role
  ON cx22073jw.access_activation_request (target_domain_code, target_role_code, request_status);

CREATE INDEX IF NOT EXISTS ix_access_activation_request_view_decision_req
  ON cx22073jw.access_activation_request_view_decision (activation_request_id, decision_status);

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
      WHERE tg.tgname = 'trg_access_role_access_bundle_master_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_role_access_bundle_master'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_role_access_bundle_master_updated_at
        BEFORE UPDATE ON cx22073jw.access_role_access_bundle_master
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_activation_request_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_activation_request'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_activation_request_updated_at
        BEFORE UPDATE ON cx22073jw.access_activation_request
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

INSERT INTO cx22073jw.access_role_access_bundle_master (
  bundle_code,
  domain_code,
  role_code,
  bundle_scope,
  bundle_status,
  gate_needed_view_count,
  non_gate_view_count,
  total_view_count,
  actor_name,
  note_text
)
SELECT
  'bundle__' || m.domain_code || '__' || m.role_code,
  m.domain_code,
  m.role_code,
  'upper_bound_role_bundle',
  'active',
  COUNT(*) FILTER (WHERE m.gate_needed),
  COUNT(*) FILTER (WHERE NOT m.gate_needed),
  COUNT(*),
  'Zero',
  'Upper-bound access bundle generated from role actual view grant matrix.'
FROM cx22073jw.v_access_role_actual_view_grant_matrix m
GROUP BY m.domain_code, m.role_code
ON CONFLICT (domain_code, role_code, bundle_scope) DO UPDATE
SET bundle_code            = EXCLUDED.bundle_code,
    bundle_status          = EXCLUDED.bundle_status,
    gate_needed_view_count = EXCLUDED.gate_needed_view_count,
    non_gate_view_count    = EXCLUDED.non_gate_view_count,
    total_view_count       = EXCLUDED.total_view_count,
    actor_name             = EXCLUDED.actor_name,
    note_text              = EXCLUDED.note_text,
    updated_at             = NOW();

DELETE FROM cx22073jw.access_role_access_bundle_item bi
WHERE EXISTS (
  SELECT 1
  FROM cx22073jw.access_role_access_bundle_master bm
  WHERE bm.role_access_bundle_id = bi.role_access_bundle_id
    AND bm.bundle_scope = 'upper_bound_role_bundle'
);

INSERT INTO cx22073jw.access_role_access_bundle_item (
  role_access_bundle_id,
  actual_view_code,
  logical_view_name,
  view_family_code,
  grant_mode,
  gate_needed,
  audit_obligation,
  sort_order
)
SELECT
  bm.role_access_bundle_id,
  m.actual_view_code,
  m.logical_view_name,
  m.view_family_code,
  m.grant_mode,
  m.gate_needed,
  m.audit_obligation,
  ROW_NUMBER() OVER (
    PARTITION BY bm.role_access_bundle_id
    ORDER BY m.logical_view_name
  )::integer
FROM cx22073jw.access_role_access_bundle_master bm
JOIN cx22073jw.v_access_role_actual_view_grant_matrix m
  ON m.domain_code = bm.domain_code
 AND m.role_code   = bm.role_code
WHERE bm.bundle_scope = 'upper_bound_role_bundle';

CREATE OR REPLACE VIEW cx22073jw.v_access_role_access_bundle_summary AS
SELECT
  bm.bundle_code,
  bm.domain_code,
  bm.role_code,
  bm.bundle_status,
  bm.gate_needed_view_count,
  bm.non_gate_view_count,
  bm.total_view_count,
  bm.note_text,
  bm.created_at
FROM cx22073jw.access_role_access_bundle_master bm
ORDER BY bm.domain_code, bm.role_code;

CREATE OR REPLACE VIEW cx22073jw.v_access_role_access_bundle_item_matrix AS
SELECT
  bm.bundle_code,
  bm.domain_code,
  bm.role_code,
  bi.actual_view_code,
  bi.logical_view_name,
  bi.view_family_code,
  bi.grant_mode,
  bi.gate_needed,
  bi.audit_obligation,
  bi.sort_order
FROM cx22073jw.access_role_access_bundle_master bm
JOIN cx22073jw.access_role_access_bundle_item bi
  ON bi.role_access_bundle_id = bm.role_access_bundle_id
ORDER BY bm.domain_code, bm.role_code, bi.sort_order;

CREATE OR REPLACE VIEW cx22073jw.v_access_activation_request_latest_summary AS
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  requested_rank_code,
  requested_app_scope,
  request_status,
  requested_by,
  reviewer_name,
  approver_name,
  note_text,
  created_at
FROM cx22073jw.access_activation_request
ORDER BY created_at DESC
LIMIT 20;

COMMIT;

\echo '============================================================'
\echo 'ROLE ACCESS BUNDLE SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_access_role_access_bundle_summary;

\echo '============================================================'
\echo 'GATE COUNTS BY DOMAIN'
\echo '============================================================'
SELECT
  domain_code,
  COUNT(*) AS role_count,
  SUM(gate_needed_view_count) AS gate_needed_views,
  SUM(total_view_count) AS total_views
FROM cx22073jw.v_access_role_access_bundle_summary
GROUP BY domain_code
ORDER BY domain_code;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS ACCESS BUNDLE / ACTIVATION DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
