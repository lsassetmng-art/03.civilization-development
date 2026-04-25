#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_generation_registry.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW GENERATION REGISTRY ADDITIVE APPLY START"
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
      AND table_name = 'official_prepare_queue_item'
  ) THEN
    RAISE EXCEPTION 'official_prepare_queue_item is required before generation registry apply';
  END IF;
END;
$$;

-- ============================================================
-- FOUNDATION DOMAIN
-- ============================================================
INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'generation_registry',
    'Generation Registry',
    'normal',
    'integration',
    'Generated implementation-ready DDL registry derived from official prepare queue items'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

-- ============================================================
-- HELPER: SAFE OBJECT NAME
-- ============================================================
CREATE OR REPLACE FUNCTION cx22073jw.fn_safe_object_name(
  p_prefix text,
  p_base text,
  p_limit integer DEFAULT 63
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_raw text;
  v_hash text;
BEGIN
  v_raw := lower(regexp_replace(COALESCE(p_prefix, '') || COALESCE(p_base, ''), '[^a-z0-9_]+', '_', 'g'));
  v_raw := regexp_replace(v_raw, '_+', '_', 'g');
  v_raw := trim(both '_' from v_raw);

  IF char_length(v_raw) <= p_limit THEN
    RETURN v_raw;
  END IF;

  v_hash := substr(md5(v_raw), 1, 8);
  RETURN substr(v_raw, 1, GREATEST(1, p_limit - char_length(v_hash) - 1)) || '_' || v_hash;
END;
$$;

-- ============================================================
-- MASTER / REGISTRY / LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS cx22073jw.generation_profile_master (
  profile_code            text PRIMARY KEY,
  profile_name            text NOT NULL,
  generation_scope        text NOT NULL CHECK (generation_scope IN ('phase1','phase2','ad_hoc')),
  default_schema_name     text NOT NULL,
  naming_policy_json      jsonb NOT NULL DEFAULT '{}'::jsonb,
  description             text,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.official_prepare_generation_registry (
  generation_registry_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prepare_queue_item_id   uuid NOT NULL UNIQUE REFERENCES cx22073jw.official_prepare_queue_item(prepare_queue_item_id) ON DELETE CASCADE,
  candidate_area_id       uuid NOT NULL UNIQUE REFERENCES cx22073jw.candidate_area_registry(candidate_area_id) ON DELETE CASCADE,
  profile_code            text NOT NULL REFERENCES cx22073jw.generation_profile_master(profile_code),
  target_schema_name      text NOT NULL,
  target_table_name       text NOT NULL,
  target_view_name        text NOT NULL,
  target_function_name    text NOT NULL,
  object_family_code      text NOT NULL CHECK (
                           object_family_code IN (
                             'reference_projection',
                             'summary_projection',
                             'continuity_projection',
                             'index_projection',
                             'policy_context_projection',
                             'optimization_projection',
                             'mixed_projection'
                           )
                         ),
  role_signature          text[] NOT NULL DEFAULT ARRAY[]::text[],
  generation_status       text NOT NULL CHECK (
                           generation_status IN (
                             'planned',
                             'generated',
                             'reviewed',
                             'stale',
                             'applied'
                           )
                         ),
  generation_note         text,
  contract_stub           jsonb NOT NULL DEFAULT '{}'::jsonb,
  ddl_sql                 text NOT NULL DEFAULT '',
  last_generated_at       timestamptz,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (target_schema_name, target_table_name),
  UNIQUE (target_schema_name, target_view_name),
  UNIQUE (target_schema_name, target_function_name)
);

CREATE TABLE IF NOT EXISTS cx22073jw.official_prepare_generation_registry_log (
  generation_registry_log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_registry_id     uuid NOT NULL REFERENCES cx22073jw.official_prepare_generation_registry(generation_registry_id) ON DELETE CASCADE,
  action_code               text NOT NULL CHECK (
                             action_code IN (
                               'planned',
                               'generated',
                               'reviewed',
                               'stale',
                               'applied',
                               'note_updated'
                             )
                           ),
  from_status               text,
  to_status                 text,
  log_note                  text,
  actor_name                text NOT NULL DEFAULT 'Zero',
  created_at                timestamptz NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS ix_generation_profile_master_scope
  ON cx22073jw.generation_profile_master (generation_scope, default_schema_name);

CREATE INDEX IF NOT EXISTS ix_official_prepare_generation_registry_status
  ON cx22073jw.official_prepare_generation_registry (generation_status, object_family_code, last_generated_at DESC);

CREATE INDEX IF NOT EXISTS ix_official_prepare_generation_registry_profile
  ON cx22073jw.official_prepare_generation_registry (profile_code, target_schema_name);

CREATE INDEX IF NOT EXISTS ix_official_prepare_generation_registry_roles
  ON cx22073jw.official_prepare_generation_registry USING gin (role_signature);

CREATE INDEX IF NOT EXISTS ix_official_prepare_generation_registry_log_registry
  ON cx22073jw.official_prepare_generation_registry_log (generation_registry_id, created_at DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'generation_profile_master',
    'official_prepare_generation_registry'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c
        ON c.oid = tg.tgrelid
      JOIN pg_namespace n
        ON n.oid = c.relnamespace
      WHERE tg.tgname = format('trg_%s_updated_at', t)
        AND n.nspname = 'cx22073jw'
        AND c.relname = t
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER trg_%I_updated_at
         BEFORE UPDATE ON cx22073jw.%I
         FOR EACH ROW
         EXECUTE FUNCTION cx22073jw.fn_set_updated_at()',
        t, t
      );
    END IF;
  END LOOP;
END;
$$;

-- ============================================================
-- PROFILE SEED
-- ============================================================
INSERT INTO cx22073jw.generation_profile_master (
  profile_code,
  profile_name,
  generation_scope,
  default_schema_name,
  naming_policy_json,
  description
) VALUES
  (
    'phase1_default_profile',
    'Phase 1 Default Profile',
    'phase1',
    'cx22073jw',
    '{"table":"<area_slug>","view":"v_<area_slug>_latest","function":"fn_upsert_<area_slug>"}'::jsonb,
    'Default generation profile for phase1 official prepare queue'
  )
ON CONFLICT (profile_code) DO UPDATE
SET profile_name        = EXCLUDED.profile_name,
    generation_scope    = EXCLUDED.generation_scope,
    default_schema_name = EXCLUDED.default_schema_name,
    naming_policy_json  = EXCLUDED.naming_policy_json,
    description         = EXCLUDED.description,
    updated_at          = NOW();

-- ============================================================
-- REFRESH FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION cx22073jw.fn_refresh_phase1_generation_registry()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  INSERT INTO cx22073jw.official_prepare_generation_registry (
    prepare_queue_item_id,
    candidate_area_id,
    profile_code,
    target_schema_name,
    target_table_name,
    target_view_name,
    target_function_name,
    object_family_code,
    role_signature,
    generation_status,
    generation_note,
    contract_stub,
    ddl_sql
  )
  SELECT
    opqi.prepare_queue_item_id,
    car.candidate_area_id,
    'phase1_default_profile',
    'cx22073jw',
    cx22073jw.fn_safe_object_name('', car.area_slug),
    cx22073jw.fn_safe_object_name('v_', car.area_slug || '_latest'),
    cx22073jw.fn_safe_object_name('fn_upsert_', car.area_slug),
    CASE
      WHEN 'continuity-area' = ANY(car.area_roles) THEN 'continuity_projection'
      WHEN 'policy-context-area' = ANY(car.area_roles) THEN 'policy_context_projection'
      WHEN 'index-area' = ANY(car.area_roles) THEN 'index_projection'
      WHEN 'optimization-area' = ANY(car.area_roles) THEN 'optimization_projection'
      WHEN 'summary-area' = ANY(car.area_roles) AND NOT ('reference-area' = ANY(car.area_roles)) THEN 'summary_projection'
      WHEN 'reference-area' = ANY(car.area_roles) AND cardinality(car.area_roles) = 1 THEN 'reference_projection'
      ELSE 'mixed_projection'
    END,
    car.area_roles,
    'planned',
    'Prepared from active official prepare queue item.',
    jsonb_build_object(
      'queue_code', opqm.queue_code,
      'source_system', clsr.source_system,
      'source_app', clsr.source_app,
      'area_slug', car.area_slug,
      'priority_code', car.priority_code,
      'execution_group_code', opqi.execution_group_code,
      'ownership_mode', car.ownership_mode
    ),
    ''
  FROM cx22073jw.official_prepare_queue_item opqi
  JOIN cx22073jw.official_prepare_queue_master opqm
    ON opqm.prepare_queue_id = opqi.prepare_queue_id
  JOIN cx22073jw.candidate_area_registry car
    ON car.candidate_area_id = opqi.candidate_area_id
  JOIN cx22073jw.candidate_ledger_source_registry clsr
    ON clsr.ledger_source_id = car.ledger_source_id
  WHERE opqm.queue_code = 'phase1_candidate_prepare_queue'
    AND opqi.is_active = true
    AND opqi.item_status NOT IN ('dropped', 'deferred')
  ON CONFLICT (prepare_queue_item_id) DO UPDATE
  SET candidate_area_id    = EXCLUDED.candidate_area_id,
      profile_code         = EXCLUDED.profile_code,
      target_schema_name   = EXCLUDED.target_schema_name,
      target_table_name    = EXCLUDED.target_table_name,
      target_view_name     = EXCLUDED.target_view_name,
      target_function_name = EXCLUDED.target_function_name,
      object_family_code   = EXCLUDED.object_family_code,
      role_signature       = EXCLUDED.role_signature,
      generation_note      = EXCLUDED.generation_note,
      contract_stub        = EXCLUDED.contract_stub,
      updated_at           = NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- ============================================================
-- DDL BUILDER
-- ============================================================
CREATE OR REPLACE FUNCTION cx22073jw.fn_build_generation_sql(
  p_area_slug text
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_registry_id uuid;
  v_table_name text;
  v_view_name text;
  v_function_name text;
  v_roles text[];
  v_defs text[];
  v_idx_sql text := '';
  v_sql text;
  v_trigger_name text;
  v_subject_idx text;
  v_resume_idx text;
  v_priority_idx text;
  v_terms_idx text;
BEGIN
  SELECT
    ogr.generation_registry_id,
    ogr.target_table_name,
    ogr.target_view_name,
    ogr.target_function_name,
    ogr.role_signature
    INTO
    v_registry_id,
    v_table_name,
    v_view_name,
    v_function_name,
    v_roles
  FROM cx22073jw.official_prepare_generation_registry ogr
  JOIN cx22073jw.candidate_area_registry car
    ON car.candidate_area_id = ogr.candidate_area_id
  WHERE car.area_slug = p_area_slug;

  IF v_registry_id IS NULL THEN
    RAISE EXCEPTION 'generation registry not found for area_slug=%', p_area_slug;
  END IF;

  v_defs := ARRAY[
    '  row_id uuid PRIMARY KEY DEFAULT gen_random_uuid()',
    '  subject_key text NOT NULL',
    '  source_system text NOT NULL',
    '  source_app text',
    '  canonical_owner_system text NOT NULL',
    '  canonical_ref_key text',
    '  lifecycle_status text NOT NULL DEFAULT ''active'' CHECK (lifecycle_status IN (''active'',''archived'',''draft'',''deprecated''))'
  ];

  IF 'reference-area' = ANY(v_roles) THEN
    v_defs := array_append(v_defs, '  projection_payload jsonb NOT NULL DEFAULT ''{}''::jsonb');
  END IF;

  IF 'summary-area' = ANY(v_roles) THEN
    v_defs := array_append(v_defs, '  summary_text text');
    v_defs := array_append(v_defs, '  summary_payload jsonb NOT NULL DEFAULT ''{}''::jsonb');
  END IF;

  IF 'continuity-area' = ANY(v_roles) THEN
    v_defs := array_append(v_defs, '  continuity_payload jsonb NOT NULL DEFAULT ''{}''::jsonb');
    v_defs := array_append(v_defs, '  resume_at timestamptz');
  END IF;

  IF 'index-area' = ANY(v_roles) THEN
    v_defs := array_append(v_defs, '  index_terms text[] NOT NULL DEFAULT ARRAY[]::text[]');
    v_defs := array_append(v_defs, '  index_payload jsonb NOT NULL DEFAULT ''{}''::jsonb');
  END IF;

  IF 'policy-context-area' = ANY(v_roles) THEN
    v_defs := array_append(v_defs, '  policy_context_payload jsonb NOT NULL DEFAULT ''{}''::jsonb');
  END IF;

  IF 'optimization-area' = ANY(v_roles) THEN
    v_defs := array_append(v_defs, '  optimization_payload jsonb NOT NULL DEFAULT ''{}''::jsonb');
    v_defs := array_append(v_defs, '  priority_score numeric(10,2) NOT NULL DEFAULT 0');
  END IF;

  v_defs := array_append(v_defs, '  meta jsonb NOT NULL DEFAULT ''{}''::jsonb');
  v_defs := array_append(v_defs, '  created_at timestamptz NOT NULL DEFAULT NOW()');
  v_defs := array_append(v_defs, '  updated_at timestamptz NOT NULL DEFAULT NOW()');
  v_defs := array_append(v_defs, '  UNIQUE (subject_key)');

  v_subject_idx := cx22073jw.fn_safe_object_name('ix_', v_table_name || '_subject_key');
  v_trigger_name := cx22073jw.fn_safe_object_name('trg_', v_table_name || '_updated_at');

  v_idx_sql := format(
$IDX$
CREATE INDEX IF NOT EXISTS %I
  ON cx22073jw.%I (subject_key);
$IDX$,
    v_subject_idx,
    v_table_name
  );

  IF 'continuity-area' = ANY(v_roles) THEN
    v_resume_idx := cx22073jw.fn_safe_object_name('ix_', v_table_name || '_resume_at');
    v_idx_sql := v_idx_sql || E'\n\n' || format(
$IDX$
CREATE INDEX IF NOT EXISTS %I
  ON cx22073jw.%I (resume_at);
$IDX$,
      v_resume_idx,
      v_table_name
    );
  END IF;

  IF 'optimization-area' = ANY(v_roles) THEN
    v_priority_idx := cx22073jw.fn_safe_object_name('ix_', v_table_name || '_priority_score');
    v_idx_sql := v_idx_sql || E'\n\n' || format(
$IDX$
CREATE INDEX IF NOT EXISTS %I
  ON cx22073jw.%I (priority_score DESC);
$IDX$,
      v_priority_idx,
      v_table_name
    );
  END IF;

  IF 'index-area' = ANY(v_roles) THEN
    v_terms_idx := cx22073jw.fn_safe_object_name('ix_', v_table_name || '_index_terms');
    v_idx_sql := v_idx_sql || E'\n\n' || format(
$IDX$
CREATE INDEX IF NOT EXISTS %I
  ON cx22073jw.%I USING gin (index_terms);
$IDX$,
      v_terms_idx,
      v_table_name
    );
  END IF;

  v_sql := format(
$DDL$
CREATE TABLE IF NOT EXISTS cx22073jw.%I (
%s
);

%s

DO $TRG$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class c
      ON c.oid = tg.tgrelid
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE tg.tgname = %L
      AND n.nspname = 'cx22073jw'
      AND c.relname = %L
  ) THEN
    EXECUTE %L;
  END IF;
END;
$TRG$;

CREATE OR REPLACE VIEW cx22073jw.%I AS
SELECT *
FROM cx22073jw.%I
WHERE lifecycle_status = 'active';

COMMENT ON TABLE cx22073jw.%I IS %L;
COMMENT ON VIEW cx22073jw.%I IS %L;
-- planned function name: cx22073jw.%I
$DDL$,
    v_table_name,
    array_to_string(v_defs, E',\n'),
    v_idx_sql,
    v_trigger_name,
    v_table_name,
    format(
      'CREATE TRIGGER %I BEFORE UPDATE ON cx22073jw.%I FOR EACH ROW EXECUTE FUNCTION cx22073jw.fn_set_updated_at()',
      v_trigger_name,
      v_table_name
    ),
    v_view_name,
    v_table_name,
    v_table_name,
    'Generated skeleton table for candidate area ' || p_area_slug,
    v_view_name,
    'Generated active/latest view for candidate area ' || p_area_slug,
    v_function_name
  );

  RETURN v_sql;
END;
$$;

-- ============================================================
-- REGENERATE ALL SQL
-- ============================================================
CREATE OR REPLACE FUNCTION cx22073jw.fn_regenerate_all_generation_sql()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
  v_count integer := 0;
BEGIN
  FOR r IN
    SELECT ogr.generation_registry_id, car.area_slug
    FROM cx22073jw.official_prepare_generation_registry ogr
    JOIN cx22073jw.candidate_area_registry car
      ON car.candidate_area_id = ogr.candidate_area_id
  LOOP
    UPDATE cx22073jw.official_prepare_generation_registry
       SET ddl_sql = cx22073jw.fn_build_generation_sql(r.area_slug),
           generation_status = 'generated',
           last_generated_at = NOW(),
           updated_at = NOW()
     WHERE generation_registry_id = r.generation_registry_id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ============================================================
-- INITIAL REFRESH + GENERATE
-- ============================================================
SELECT cx22073jw.fn_refresh_phase1_generation_registry();
SELECT cx22073jw.fn_regenerate_all_generation_sql();

-- ============================================================
-- INITIAL LOG SEED
-- ============================================================
INSERT INTO cx22073jw.official_prepare_generation_registry_log (
  generation_registry_id,
  action_code,
  from_status,
  to_status,
  log_note,
  actor_name
)
SELECT
  ogr.generation_registry_id,
  'generated',
  NULL,
  ogr.generation_status,
  'Initial generation SQL created from phase1 generation registry.',
  'Zero'
FROM cx22073jw.official_prepare_generation_registry ogr
WHERE NOT EXISTS (
  SELECT 1
  FROM cx22073jw.official_prepare_generation_registry_log l
  WHERE l.generation_registry_id = ogr.generation_registry_id
    AND l.action_code = 'generated'
);

-- ============================================================
-- VIEWS
-- ============================================================
CREATE OR REPLACE VIEW cx22073jw.v_generation_registry_overview AS
SELECT
  opqm.queue_code,
  clsr.source_system,
  COALESCE(clsr.source_app, '-') AS source_app,
  car.area_name,
  car.area_slug,
  car.priority_code,
  car.area_roles,
  opqi.item_status,
  opqi.prepare_stage,
  ogr.object_family_code,
  ogr.profile_code,
  ogr.target_schema_name,
  ogr.target_table_name,
  ogr.target_view_name,
  ogr.target_function_name,
  ogr.generation_status,
  ogr.last_generated_at
FROM cx22073jw.official_prepare_generation_registry ogr
JOIN cx22073jw.official_prepare_queue_item opqi
  ON opqi.prepare_queue_item_id = ogr.prepare_queue_item_id
JOIN cx22073jw.official_prepare_queue_master opqm
  ON opqm.prepare_queue_id = opqi.prepare_queue_id
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = ogr.candidate_area_id
JOIN cx22073jw.candidate_ledger_source_registry clsr
  ON clsr.ledger_source_id = car.ledger_source_id;

CREATE OR REPLACE VIEW cx22073jw.v_generation_registry_summary AS
SELECT
  source_system,
  source_app,
  COUNT(*) AS generation_count,
  COUNT(*) FILTER (WHERE generation_status = 'planned') AS planned_count,
  COUNT(*) FILTER (WHERE generation_status = 'generated') AS generated_count,
  COUNT(*) FILTER (WHERE generation_status = 'reviewed') AS reviewed_count,
  COUNT(*) FILTER (WHERE generation_status = 'stale') AS stale_count,
  COUNT(*) FILTER (WHERE generation_status = 'applied') AS applied_count
FROM cx22073jw.v_generation_registry_overview
GROUP BY source_system, source_app;

CREATE OR REPLACE VIEW cx22073jw.v_generation_registry_priority_order AS
SELECT
  queue_code,
  source_system,
  source_app,
  area_name,
  area_slug,
  priority_code,
  object_family_code,
  target_table_name,
  target_view_name,
  target_function_name,
  generation_status
FROM cx22073jw.v_generation_registry_overview
ORDER BY
  CASE priority_code
    WHEN 'highest' THEN 10
    WHEN 'high' THEN 20
    WHEN 'medium-high' THEN 30
    WHEN 'medium' THEN 40
    WHEN 'conditional' THEN 50
    ELSE 90
  END,
  source_system,
  source_app,
  area_name;

COMMIT;

\echo '============================================================'
\echo 'GENERATION REGISTRY SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_generation_registry_summary;

\echo '============================================================'
\echo 'GENERATION REGISTRY PRIORITY ORDER'
\echo '============================================================'
TABLE cx22073jw.v_generation_registry_priority_order;

\echo '============================================================'
\echo 'DDL PREVIEW SAMPLE'
\echo '============================================================'
SELECT
  area_slug,
  left(ddl_sql, 700) AS ddl_preview
FROM cx22073jw.official_prepare_generation_registry ogr
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = ogr.candidate_area_id
ORDER BY area_slug
LIMIT 3;
SQL

  echo "============================================================"
  echo "CX22073JW GENERATION REGISTRY ADDITIVE APPLY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
