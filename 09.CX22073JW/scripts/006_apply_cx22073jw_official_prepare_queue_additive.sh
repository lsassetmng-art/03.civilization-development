#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_official_prepare_queue.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW OFFICIAL PREPARE QUEUE ADDITIVE APPLY START"
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
      AND table_name = 'candidate_area_registry'
  ) THEN
    RAISE EXCEPTION 'candidate_area_registry is required before official prepare queue apply';
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
    'official_prepare_queue',
    'Official Prepare Queue',
    'normal',
    'integration',
    'Official queue for candidate areas selected for implementation preparation'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

-- ============================================================
-- MASTER / ITEM / LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS cx22073jw.official_prepare_queue_master (
  prepare_queue_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_code              text NOT NULL UNIQUE,
  queue_name              text NOT NULL,
  queue_scope             text NOT NULL CHECK (queue_scope IN ('phase1','phase2','cross_system','system_specific')),
  target_release_wave     text NOT NULL,
  queue_status            text NOT NULL CHECK (queue_status IN ('draft','active','paused','closed')),
  owner_name              text NOT NULL,
  prepared_by             text,
  reviewer_name           text,
  description             text,
  meta                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.official_prepare_queue_item (
  prepare_queue_item_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prepare_queue_id        uuid NOT NULL REFERENCES cx22073jw.official_prepare_queue_master(prepare_queue_id) ON DELETE CASCADE,
  candidate_area_id       uuid NOT NULL REFERENCES cx22073jw.candidate_area_registry(candidate_area_id) ON DELETE CASCADE,
  item_status             text NOT NULL CHECK (
                           item_status IN (
                             'queued',
                             'scoping',
                             'designing',
                             'ready_for_review',
                             'approved',
                             'blocked',
                             'deferred',
                             'dropped'
                           )
                         ),
  prepare_stage           text NOT NULL CHECK (
                           prepare_stage IN (
                             'intake',
                             'scope_lock',
                             'data_model',
                             'api_contract',
                             'projection_design',
                             'review_gate',
                             'implementation_ready'
                           )
                         ),
  priority_rank           integer NOT NULL DEFAULT 100 CHECK (priority_rank > 0),
  execution_group_code    text NOT NULL,
  decision_note           text,
  blocker_note            text,
  planned_output_summary  text,
  is_active               boolean NOT NULL DEFAULT true,
  meta                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (prepare_queue_id, candidate_area_id)
);

CREATE TABLE IF NOT EXISTS cx22073jw.official_prepare_queue_item_log (
  prepare_queue_item_log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prepare_queue_item_id     uuid NOT NULL REFERENCES cx22073jw.official_prepare_queue_item(prepare_queue_item_id) ON DELETE CASCADE,
  action_code               text NOT NULL CHECK (
                             action_code IN (
                               'queued',
                               'status_changed',
                               'stage_changed',
                               'priority_changed',
                               'note_updated',
                               'blocked',
                               'deferred',
                               'approved'
                             )
                           ),
  from_status               text,
  to_status                 text,
  from_stage                text,
  to_stage                  text,
  log_note                  text,
  actor_name                text NOT NULL DEFAULT 'Zero',
  created_at                timestamptz NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS ix_official_prepare_queue_master_scope
  ON cx22073jw.official_prepare_queue_master (queue_scope, queue_status, target_release_wave);

CREATE INDEX IF NOT EXISTS ix_official_prepare_queue_item_queue_status
  ON cx22073jw.official_prepare_queue_item (prepare_queue_id, item_status, prepare_stage, priority_rank);

CREATE INDEX IF NOT EXISTS ix_official_prepare_queue_item_execution_group
  ON cx22073jw.official_prepare_queue_item (execution_group_code, priority_rank);

CREATE INDEX IF NOT EXISTS ix_official_prepare_queue_item_log_item
  ON cx22073jw.official_prepare_queue_item_log (prepare_queue_item_id, created_at DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'official_prepare_queue_master',
    'official_prepare_queue_item'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger
      WHERE tgname = format('trg_%s_updated_at', t)
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
-- DEFAULT QUEUE MASTER
-- ============================================================
INSERT INTO cx22073jw.official_prepare_queue_master (
  queue_code,
  queue_name,
  queue_scope,
  target_release_wave,
  queue_status,
  owner_name,
  prepared_by,
  reviewer_name,
  description,
  meta
) VALUES
  (
    'phase1_candidate_prepare_queue',
    'Phase 1 Candidate Prepare Queue',
    'phase1',
    'wave1',
    'active',
    'Boss',
    'Zero',
    'Sato (DB)',
    'Official preparation queue generated from active Phase 1 recommended candidate areas.',
    '{"generation_policy":"candidate_registry_phase1"}'::jsonb
  )
ON CONFLICT (queue_code) DO UPDATE
SET queue_name          = EXCLUDED.queue_name,
    queue_scope         = EXCLUDED.queue_scope,
    target_release_wave = EXCLUDED.target_release_wave,
    queue_status        = EXCLUDED.queue_status,
    owner_name          = EXCLUDED.owner_name,
    prepared_by         = EXCLUDED.prepared_by,
    reviewer_name       = EXCLUDED.reviewer_name,
    description         = EXCLUDED.description,
    meta                = EXCLUDED.meta,
    updated_at          = NOW();

-- ============================================================
-- REFRESH FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION cx22073jw.fn_refresh_phase1_prepare_queue()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_prepare_queue_id uuid;
  v_count integer := 0;
BEGIN
  SELECT prepare_queue_id
    INTO v_prepare_queue_id
  FROM cx22073jw.official_prepare_queue_master
  WHERE queue_code = 'phase1_candidate_prepare_queue';

  IF v_prepare_queue_id IS NULL THEN
    RAISE EXCEPTION 'phase1_candidate_prepare_queue not found';
  END IF;

  INSERT INTO cx22073jw.official_prepare_queue_item (
    prepare_queue_id,
    candidate_area_id,
    item_status,
    prepare_stage,
    priority_rank,
    execution_group_code,
    decision_note,
    planned_output_summary,
    is_active,
    meta
  )
  SELECT
    v_prepare_queue_id,
    car.candidate_area_id,
    'queued',
    'intake',
    CASE
      WHEN car.priority_code = 'highest' THEN 10
      WHEN car.priority_code = 'high' THEN 20
      WHEN car.priority_code = 'medium-high' THEN 30
      WHEN car.priority_code = 'medium' THEN 40
      WHEN car.priority_code = 'conditional' THEN 50
      ELSE 90
    END AS priority_rank,
    CASE
      WHEN clsr.source_system = 'StreamingOS' AND clsr.source_app = 'StreamWatch' THEN 'streamwatch_phase1'
      WHEN clsr.source_system = 'applications' AND clsr.source_app = 'StreamStudio' THEN 'streamstudio_phase1'
      WHEN clsr.source_system = 'StaticArtOS' THEN 'staticart_phase1'
      ELSE 'cross_system_phase1'
    END AS execution_group_code,
    'Auto-queued from active phase1 candidate registry.',
    CONCAT('Prepare canonical area: ', car.area_name),
    true,
    jsonb_build_object(
      'source_system', clsr.source_system,
      'source_app', clsr.source_app,
      'phase_recommendation', car.phase_recommendation
    )
  FROM cx22073jw.candidate_area_registry car
  JOIN cx22073jw.candidate_ledger_source_registry clsr
    ON clsr.ledger_source_id = car.ledger_source_id
  WHERE car.is_active = true
    AND car.is_phase1_recommended = true
  ON CONFLICT (prepare_queue_id, candidate_area_id) DO UPDATE
  SET item_status            = EXCLUDED.item_status,
      prepare_stage          = EXCLUDED.prepare_stage,
      priority_rank          = EXCLUDED.priority_rank,
      execution_group_code   = EXCLUDED.execution_group_code,
      decision_note          = EXCLUDED.decision_note,
      planned_output_summary = EXCLUDED.planned_output_summary,
      is_active              = EXCLUDED.is_active,
      meta                   = EXCLUDED.meta,
      updated_at             = NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_set_prepare_queue_item_status(
  p_queue_code      text,
  p_area_slug       text,
  p_to_status       text,
  p_to_stage        text,
  p_log_note        text DEFAULT NULL,
  p_actor_name      text DEFAULT 'Zero'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_item_id      uuid;
  v_from_status  text;
  v_from_stage   text;
BEGIN
  SELECT opqi.prepare_queue_item_id, opqi.item_status, opqi.prepare_stage
    INTO v_item_id, v_from_status, v_from_stage
  FROM cx22073jw.official_prepare_queue_item opqi
  JOIN cx22073jw.official_prepare_queue_master opqm
    ON opqm.prepare_queue_id = opqi.prepare_queue_id
  JOIN cx22073jw.candidate_area_registry car
    ON car.candidate_area_id = opqi.candidate_area_id
  WHERE opqm.queue_code = p_queue_code
    AND car.area_slug = p_area_slug;

  IF v_item_id IS NULL THEN
    RAISE EXCEPTION 'queue item not found for queue_code=% and area_slug=%', p_queue_code, p_area_slug;
  END IF;

  UPDATE cx22073jw.official_prepare_queue_item
     SET item_status = p_to_status,
         prepare_stage = p_to_stage,
         updated_at = NOW()
   WHERE prepare_queue_item_id = v_item_id;

  INSERT INTO cx22073jw.official_prepare_queue_item_log (
    prepare_queue_item_id,
    action_code,
    from_status,
    to_status,
    from_stage,
    to_stage,
    log_note,
    actor_name
  )
  VALUES (
    v_item_id,
    CASE
      WHEN p_to_status = 'blocked' THEN 'blocked'
      WHEN p_to_status = 'deferred' THEN 'deferred'
      WHEN p_to_status = 'approved' THEN 'approved'
      ELSE 'status_changed'
    END,
    v_from_status,
    p_to_status,
    v_from_stage,
    p_to_stage,
    p_log_note,
    p_actor_name
  );

  RETURN v_item_id;
END;
$$;

-- ============================================================
-- INITIAL REFRESH
-- ============================================================
SELECT cx22073jw.fn_refresh_phase1_prepare_queue();

-- ============================================================
-- INITIAL LOG SEED
-- ============================================================
INSERT INTO cx22073jw.official_prepare_queue_item_log (
  prepare_queue_item_id,
  action_code,
  from_status,
  to_status,
  from_stage,
  to_stage,
  log_note,
  actor_name
)
SELECT
  opqi.prepare_queue_item_id,
  'queued',
  NULL,
  opqi.item_status,
  NULL,
  opqi.prepare_stage,
  'Initial queue population from phase1 candidate registry.',
  'Zero'
FROM cx22073jw.official_prepare_queue_item opqi
JOIN cx22073jw.official_prepare_queue_master opqm
  ON opqm.prepare_queue_id = opqi.prepare_queue_id
WHERE opqm.queue_code = 'phase1_candidate_prepare_queue'
  AND NOT EXISTS (
    SELECT 1
    FROM cx22073jw.official_prepare_queue_item_log l
    WHERE l.prepare_queue_item_id = opqi.prepare_queue_item_id
      AND l.action_code = 'queued'
  );

-- ============================================================
-- VIEWS
-- ============================================================
CREATE OR REPLACE VIEW cx22073jw.v_official_prepare_queue_overview AS
SELECT
  opqm.queue_code,
  opqm.queue_name,
  opqm.queue_scope,
  opqm.target_release_wave,
  opqm.queue_status,
  clsr.source_system,
  COALESCE(clsr.source_app, '-') AS source_app,
  car.area_name,
  car.area_slug,
  car.priority_code,
  car.area_roles,
  opqi.item_status,
  opqi.prepare_stage,
  opqi.priority_rank,
  opqi.execution_group_code,
  opqi.decision_note,
  opqi.blocker_note,
  opqi.planned_output_summary
FROM cx22073jw.official_prepare_queue_item opqi
JOIN cx22073jw.official_prepare_queue_master opqm
  ON opqm.prepare_queue_id = opqi.prepare_queue_id
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = opqi.candidate_area_id
JOIN cx22073jw.candidate_ledger_source_registry clsr
  ON clsr.ledger_source_id = car.ledger_source_id
WHERE opqi.is_active = true;

CREATE OR REPLACE VIEW cx22073jw.v_official_prepare_queue_summary AS
SELECT
  queue_code,
  source_system,
  source_app,
  COUNT(*) AS item_count,
  COUNT(*) FILTER (WHERE item_status = 'queued') AS queued_count,
  COUNT(*) FILTER (WHERE item_status = 'scoping') AS scoping_count,
  COUNT(*) FILTER (WHERE item_status = 'designing') AS designing_count,
  COUNT(*) FILTER (WHERE item_status = 'ready_for_review') AS ready_for_review_count,
  COUNT(*) FILTER (WHERE item_status = 'approved') AS approved_count,
  COUNT(*) FILTER (WHERE item_status = 'blocked') AS blocked_count,
  COUNT(*) FILTER (WHERE item_status = 'deferred') AS deferred_count
FROM cx22073jw.v_official_prepare_queue_overview
GROUP BY queue_code, source_system, source_app;

CREATE OR REPLACE VIEW cx22073jw.v_official_prepare_queue_priority_order AS
SELECT
  queue_code,
  source_system,
  source_app,
  area_name,
  area_slug,
  priority_code,
  item_status,
  prepare_stage,
  priority_rank,
  execution_group_code
FROM cx22073jw.v_official_prepare_queue_overview
ORDER BY priority_rank, source_system, source_app, area_name;

COMMIT;

\echo '============================================================'
\echo 'OFFICIAL PREPARE QUEUE SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_official_prepare_queue_summary;

\echo '============================================================'
\echo 'OFFICIAL PREPARE QUEUE PRIORITY ORDER'
\echo '============================================================'
TABLE cx22073jw.v_official_prepare_queue_priority_order;

\echo '============================================================'
\echo 'FUNCTION SAMPLE: REFRESH COUNT'
\echo '============================================================'
SELECT cx22073jw.fn_refresh_phase1_prepare_queue() AS refreshed_rows;
SQL

  echo "============================================================"
  echo "CX22073JW OFFICIAL PREPARE QUEUE ADDITIVE APPLY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
