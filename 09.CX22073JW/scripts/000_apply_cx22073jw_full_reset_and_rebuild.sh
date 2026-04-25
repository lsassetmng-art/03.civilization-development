#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_cx22073jw.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW FULL RESET + REBUILD"
  echo "phase   : implementation-bootstrap"
  echo "review  : Sato (DB)"
  echo "started : $RUN_TS"
  echo "target  : schema cx22073jw"
  echo "============================================================"

  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP SCHEMA IF EXISTS cx22073jw CASCADE;
CREATE SCHEMA cx22073jw;

COMMENT ON SCHEMA cx22073jw IS 'CX22073JW canonical knowledge/reference foundation with storage optimization, indexing, summarization, placement, and triple-only access route support.';

CREATE OR REPLACE FUNCTION cx22073jw.fn_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE cx22073jw.system_config (
  config_key        text PRIMARY KEY,
  config_value      jsonb NOT NULL DEFAULT '{}'::jsonb,
  description       text,
  created_at        timestamptz NOT NULL DEFAULT NOW(),
  updated_at        timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.access_route (
  route_code        text PRIMARY KEY CHECK (route_code ~ '^[a-z0-9_]+$'),
  route_name        text NOT NULL,
  route_kind        text NOT NULL CHECK (route_kind IN ('standard','system','privileged')),
  is_privileged     boolean NOT NULL DEFAULT false,
  description       text,
  created_at        timestamptz NOT NULL DEFAULT NOW(),
  updated_at        timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.data_domain (
  domain_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_code       text NOT NULL UNIQUE CHECK (domain_code ~ '^[a-z0-9_]+$'),
  domain_name       text NOT NULL,
  domain_role       text NOT NULL CHECK (
                     domain_role IN (
                       'knowledge',
                       'reference',
                       'storage_optimization',
                       'index',
                       'summary',
                       'placement',
                       'secret'
                     )),
  owner_scope       text NOT NULL CHECK (owner_scope IN ('user','system','triple','mixed')),
  is_active         boolean NOT NULL DEFAULT true,
  description       text,
  meta              jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT NOW(),
  updated_at        timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.access_policy (
  policy_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_code        text NOT NULL REFERENCES cx22073jw.access_route(route_code) ON DELETE CASCADE,
  domain_id         uuid NOT NULL REFERENCES cx22073jw.data_domain(domain_id) ON DELETE CASCADE,
  privilege_code    text NOT NULL CHECK (privilege_code IN ('read','write','admin','optimize')),
  is_allowed        boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT NOW(),
  updated_at        timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (route_code, domain_id, privilege_code)
);

CREATE TABLE cx22073jw.content_unit (
  content_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id               uuid NOT NULL REFERENCES cx22073jw.data_domain(domain_id) ON DELETE RESTRICT,
  content_key             text NOT NULL,
  title                   text NOT NULL,
  content_type            text NOT NULL,
  source_kind             text NOT NULL CHECK (
                           source_kind IN (
                             'local_upload',
                             'cloud_reviewed',
                             'imported',
                             'generated',
                             'manual'
                           )),
  storage_tier            text NOT NULL DEFAULT 'hot' CHECK (
                           storage_tier IN ('hot','warm','cold','archive')
                         ),
  lifecycle_state         text NOT NULL DEFAULT 'active' CHECK (
                           lifecycle_state IN ('draft','active','archived','deleted')
                         ),
  created_by_route_code   text NOT NULL REFERENCES cx22073jw.access_route(route_code),
  is_triple_accessible    boolean NOT NULL DEFAULT false,
  canonical_version_no    integer,
  meta                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (domain_id, content_key)
);

CREATE TABLE cx22073jw.content_version (
  version_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id              uuid NOT NULL REFERENCES cx22073jw.content_unit(content_id) ON DELETE CASCADE,
  version_no              integer NOT NULL CHECK (version_no > 0),
  body_text               text,
  body_json               jsonb,
  checksum_sha256         text,
  compression_status      text NOT NULL DEFAULT 'raw' CHECK (
                           compression_status IN ('raw','queued','compressed','failed')
                         ),
  summary_status          text NOT NULL DEFAULT 'pending' CHECK (
                           summary_status IN ('pending','ready','failed')
                         ),
  indexing_status         text NOT NULL DEFAULT 'pending' CHECK (
                           indexing_status IN ('pending','ready','failed')
                         ),
  is_current              boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (content_id, version_no)
);

CREATE TABLE cx22073jw.content_summary (
  summary_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id              uuid NOT NULL REFERENCES cx22073jw.content_version(version_id) ON DELETE CASCADE,
  summary_kind            text NOT NULL CHECK (
                           summary_kind IN ('short','medium','long','keywords','index_card')
                         ),
  summary_text            text NOT NULL,
  summary_json            jsonb NOT NULL DEFAULT '{}'::jsonb,
  model_name              text,
  quality_score           numeric(5,2),
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (version_id, summary_kind)
);

CREATE TABLE cx22073jw.content_placement (
  placement_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id              uuid NOT NULL REFERENCES cx22073jw.content_unit(content_id) ON DELETE CASCADE,
  logical_zone            text NOT NULL,
  physical_locator        text,
  priority_score          numeric(10,2) NOT NULL DEFAULT 0,
  optimization_reason     text,
  is_current              boolean NOT NULL DEFAULT true,
  active_from             timestamptz NOT NULL DEFAULT NOW(),
  active_to               timestamptz,
  meta                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.content_relation (
  relation_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_content_id         uuid NOT NULL REFERENCES cx22073jw.content_unit(content_id) ON DELETE CASCADE,
  to_content_id           uuid NOT NULL REFERENCES cx22073jw.content_unit(content_id) ON DELETE CASCADE,
  relation_type           text NOT NULL,
  weight_score            numeric(10,4) NOT NULL DEFAULT 1,
  meta                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (from_content_id, to_content_id, relation_type),
  CHECK (from_content_id <> to_content_id)
);

CREATE TABLE cx22073jw.storage_optimization_job (
  job_id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type                text NOT NULL CHECK (
                           job_type IN (
                             'placement',
                             'compression',
                             'summarization',
                             'indexing',
                             'reindex',
                             'rebalance'
                           )),
  status                  text NOT NULL DEFAULT 'queued' CHECK (
                           status IN ('queued','running','done','failed','canceled')
                         ),
  requested_by_route_code text NOT NULL REFERENCES cx22073jw.access_route(route_code),
  target_content_id       uuid REFERENCES cx22073jw.content_unit(content_id) ON DELETE SET NULL,
  request_payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_payload          jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at              timestamptz,
  ended_at                timestamptz,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE cx22073jw.access_audit_log (
  audit_id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  route_code              text NOT NULL REFERENCES cx22073jw.access_route(route_code),
  domain_id               uuid REFERENCES cx22073jw.data_domain(domain_id) ON DELETE SET NULL,
  content_id              uuid REFERENCES cx22073jw.content_unit(content_id) ON DELETE SET NULL,
  action_code             text NOT NULL,
  result_code             text NOT NULL,
  detail                  jsonb NOT NULL DEFAULT '{}'::jsonb,
  requested_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ux_content_version_current
  ON cx22073jw.content_version (content_id)
  WHERE is_current = true;

CREATE UNIQUE INDEX ux_content_placement_current_zone
  ON cx22073jw.content_placement (content_id, logical_zone)
  WHERE is_current = true;

CREATE INDEX ix_access_policy_route_domain
  ON cx22073jw.access_policy (route_code, domain_id, privilege_code);

CREATE INDEX ix_content_unit_domain
  ON cx22073jw.content_unit (domain_id, lifecycle_state, storage_tier);

CREATE INDEX ix_content_unit_triple
  ON cx22073jw.content_unit (is_triple_accessible);

CREATE INDEX ix_content_version_status
  ON cx22073jw.content_version (summary_status, indexing_status, compression_status);

CREATE INDEX ix_content_summary_kind
  ON cx22073jw.content_summary (summary_kind);

CREATE INDEX ix_content_relation_from
  ON cx22073jw.content_relation (from_content_id, relation_type);

CREATE INDEX ix_storage_optimization_job_status
  ON cx22073jw.storage_optimization_job (status, job_type, created_at DESC);

CREATE INDEX ix_access_audit_log_requested_at
  ON cx22073jw.access_audit_log (requested_at DESC);

CREATE OR REPLACE FUNCTION cx22073jw.fn_register_new_version(
  p_content_id      uuid,
  p_body_text       text DEFAULT NULL,
  p_body_json       jsonb DEFAULT NULL,
  p_checksum_sha256 text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_version_no integer;
  v_version_id      uuid;
BEGIN
  PERFORM 1
  FROM cx22073jw.content_unit
  WHERE content_id = p_content_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'content_id not found: %', p_content_id;
  END IF;

  UPDATE cx22073jw.content_version
     SET is_current = false
   WHERE content_id = p_content_id
     AND is_current = true;

  SELECT COALESCE(MAX(version_no), 0) + 1
    INTO v_next_version_no
  FROM cx22073jw.content_version
  WHERE content_id = p_content_id;

  INSERT INTO cx22073jw.content_version (
    content_id,
    version_no,
    body_text,
    body_json,
    checksum_sha256,
    compression_status,
    summary_status,
    indexing_status,
    is_current
  )
  VALUES (
    p_content_id,
    v_next_version_no,
    p_body_text,
    p_body_json,
    p_checksum_sha256,
    'raw',
    'pending',
    'pending',
    true
  )
  RETURNING version_id INTO v_version_id;

  UPDATE cx22073jw.content_unit
     SET canonical_version_no = v_next_version_no
   WHERE content_id = p_content_id;

  RETURN v_version_id;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_route_has_privilege(
  p_route_code     text,
  p_domain_id      uuid,
  p_privilege_code text
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_privileged boolean;
  v_allowed    boolean;
BEGIN
  SELECT is_privileged
    INTO v_privileged
  FROM cx22073jw.access_route
  WHERE route_code = p_route_code;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF COALESCE(v_privileged, false) THEN
    RETURN true;
  END IF;

  SELECT is_allowed
    INTO v_allowed
  FROM cx22073jw.access_policy
  WHERE route_code = p_route_code
    AND domain_id = p_domain_id
    AND privilege_code = p_privilege_code
  LIMIT 1;

  RETURN COALESCE(v_allowed, false);
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_enqueue_optimization_job(
  p_job_type                text,
  p_requested_by_route_code text,
  p_target_content_id       uuid DEFAULT NULL,
  p_request_payload         jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_job_id uuid;
BEGIN
  INSERT INTO cx22073jw.storage_optimization_job (
    job_type,
    requested_by_route_code,
    target_content_id,
    request_payload
  )
  VALUES (
    p_job_type,
    p_requested_by_route_code,
    p_target_content_id,
    COALESCE(p_request_payload, '{}'::jsonb)
  )
  RETURNING job_id INTO v_job_id;

  RETURN v_job_id;
END;
$$;

CREATE VIEW cx22073jw.v_content_latest AS
SELECT
  cu.content_id,
  dd.domain_code,
  dd.domain_name,
  dd.domain_role,
  cu.content_key,
  cu.title,
  cu.content_type,
  cu.source_kind,
  cu.storage_tier,
  cu.lifecycle_state,
  cu.is_triple_accessible,
  cu.canonical_version_no,
  cv.version_id,
  cv.version_no,
  cv.compression_status,
  cv.summary_status,
  cv.indexing_status,
  ss.summary_text AS short_summary,
  cu.meta,
  cu.created_at,
  cu.updated_at
FROM cx22073jw.content_unit cu
JOIN cx22073jw.data_domain dd
  ON dd.domain_id = cu.domain_id
LEFT JOIN cx22073jw.content_version cv
  ON cv.content_id = cu.content_id
 AND cv.is_current = true
LEFT JOIN cx22073jw.content_summary ss
  ON ss.version_id = cv.version_id
 AND ss.summary_kind = 'short';

CREATE VIEW cx22073jw.v_triple_route_contents AS
SELECT
  vcl.*
FROM cx22073jw.v_content_latest vcl
JOIN cx22073jw.data_domain dd
  ON dd.domain_code = vcl.domain_code
WHERE vcl.is_triple_accessible = true
   OR dd.owner_scope = 'triple';

INSERT INTO cx22073jw.access_route (
  route_code,
  route_name,
  route_kind,
  is_privileged,
  description
)
VALUES
  ('normal', 'Normal Route', 'standard', false, 'Standard application access route'),
  ('system_optimizer', 'System Optimizer Route', 'system', false, 'Internal storage/index/summary optimization route'),
  ('triple', 'Triple Dedicated Route', 'privileged', true, 'Privileged dedicated route for restricted CX22073JW access');

INSERT INTO cx22073jw.data_domain (
  domain_code,
  domain_name,
  domain_role,
  owner_scope,
  description,
  meta
)
VALUES
  ('knowledge_base', 'Knowledge Base', 'knowledge', 'user', 'Canonical knowledge storage for user/project knowledge', '{"priority":"high"}'::jsonb),
  ('reference_base', 'Reference Base', 'reference', 'mixed', 'Reference and lookup data domain', '{"priority":"high"}'::jsonb),
  ('storage_optimizer', 'Storage Optimizer', 'storage_optimization', 'system', 'Storage optimization planning and execution domain', '{"priority":"medium"}'::jsonb),
  ('index_engine', 'Index Engine', 'index', 'system', 'Indexing and retrieval preparation domain', '{"priority":"medium"}'::jsonb),
  ('summary_engine', 'Summary Engine', 'summary', 'system', 'Summary and compression assistance domain', '{"priority":"medium"}'::jsonb),
  ('placement_engine', 'Placement Engine', 'placement', 'system', 'Logical and physical placement optimization domain', '{"priority":"medium"}'::jsonb),
  ('triple_secret_path', 'Triple Secret Path', 'secret', 'triple', 'Privileged restricted domain for triple-only access route', '{"priority":"critical"}'::jsonb);

INSERT INTO cx22073jw.access_policy (route_code, domain_id, privilege_code, is_allowed)
SELECT 'normal', domain_id, 'read', true
FROM cx22073jw.data_domain
WHERE domain_code IN ('knowledge_base', 'reference_base');

INSERT INTO cx22073jw.access_policy (route_code, domain_id, privilege_code, is_allowed)
SELECT 'normal', domain_id, 'write', true
FROM cx22073jw.data_domain
WHERE domain_code IN ('knowledge_base');

INSERT INTO cx22073jw.access_policy (route_code, domain_id, privilege_code, is_allowed)
SELECT 'system_optimizer', domain_id, 'read', true
FROM cx22073jw.data_domain;

INSERT INTO cx22073jw.access_policy (route_code, domain_id, privilege_code, is_allowed)
SELECT 'system_optimizer', domain_id, 'optimize', true
FROM cx22073jw.data_domain
WHERE domain_code IN ('storage_optimizer', 'index_engine', 'summary_engine', 'placement_engine');

INSERT INTO cx22073jw.access_policy (route_code, domain_id, privilege_code, is_allowed)
SELECT 'triple', domain_id, 'admin', true
FROM cx22073jw.data_domain;

INSERT INTO cx22073jw.system_config (
  config_key,
  config_value,
  description
)
VALUES
  ('system_identity', '{"name":"CX22073JW","type":"knowledge-reference-foundation"}'::jsonb, 'System identity'),
  ('reset_policy', '{"mode":"drop_schema_cascade","scope":"cx22073jw"}'::jsonb, 'Reset policy used by bootstrap'),
  ('optimizer_scope', '{"features":["storage","placement","compression","summary","index"]}'::jsonb, 'Optimizer enabled feature list');

CREATE TRIGGER trg_system_config_updated_at
BEFORE UPDATE ON cx22073jw.system_config
FOR EACH ROW
EXECUTE FUNCTION cx22073jw.fn_set_updated_at();

CREATE TRIGGER trg_access_route_updated_at
BEFORE UPDATE ON cx22073jw.access_route
FOR EACH ROW
EXECUTE FUNCTION cx22073jw.fn_set_updated_at();

CREATE TRIGGER trg_data_domain_updated_at
BEFORE UPDATE ON cx22073jw.data_domain
FOR EACH ROW
EXECUTE FUNCTION cx22073jw.fn_set_updated_at();

CREATE TRIGGER trg_access_policy_updated_at
BEFORE UPDATE ON cx22073jw.access_policy
FOR EACH ROW
EXECUTE FUNCTION cx22073jw.fn_set_updated_at();

CREATE TRIGGER trg_content_unit_updated_at
BEFORE UPDATE ON cx22073jw.content_unit
FOR EACH ROW
EXECUTE FUNCTION cx22073jw.fn_set_updated_at();

CREATE TRIGGER trg_content_summary_updated_at
BEFORE UPDATE ON cx22073jw.content_summary
FOR EACH ROW
EXECUTE FUNCTION cx22073jw.fn_set_updated_at();

CREATE TRIGGER trg_content_placement_updated_at
BEFORE UPDATE ON cx22073jw.content_placement
FOR EACH ROW
EXECUTE FUNCTION cx22073jw.fn_set_updated_at();

CREATE TRIGGER trg_content_relation_updated_at
BEFORE UPDATE ON cx22073jw.content_relation
FOR EACH ROW
EXECUTE FUNCTION cx22073jw.fn_set_updated_at();

CREATE TRIGGER trg_storage_optimization_job_updated_at
BEFORE UPDATE ON cx22073jw.storage_optimization_job
FOR EACH ROW
EXECUTE FUNCTION cx22073jw.fn_set_updated_at();

COMMIT;

\echo '============================================================'
\echo 'CX22073JW TABLES'
\echo '============================================================'
\dt cx22073jw.*

\echo '============================================================'
\echo 'CX22073JW VIEWS'
\echo '============================================================'
\dv cx22073jw.*

\echo '============================================================'
\echo 'CX22073JW FUNCTIONS'
\echo '============================================================'
\df cx22073jw.*

\echo '============================================================'
\echo 'CX22073JW SEEDED ROUTES'
\echo '============================================================'
TABLE cx22073jw.access_route;

\echo '============================================================'
\echo 'CX22073JW SEEDED DOMAINS'
\echo '============================================================'
SELECT domain_code, domain_role, owner_scope, is_active
FROM cx22073jw.data_domain
ORDER BY domain_code;
SQL

  echo "============================================================"
  echo "DONE : $RUN_TS"
  echo "LOG  : $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
