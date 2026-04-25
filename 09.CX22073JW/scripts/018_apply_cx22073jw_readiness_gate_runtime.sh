#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_readiness_gate_runtime.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW READINESS GATE RUNTIME APPLY START"
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
      AND table_name = 'exact_contract_sample_case_registry'
  ) THEN
    RAISE EXCEPTION 'exact_contract_sample_case_registry is required before readiness gate runtime apply';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'readiness_gate_runtime',
    'Readiness Gate Runtime',
    'normal',
    'integration',
    'Phase1 runtime readiness evaluation for applied/generated CX22073JW projection areas'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.readiness_gate_master (
  readiness_gate_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_code               text NOT NULL UNIQUE,
  gate_name               text NOT NULL,
  gate_scope              text NOT NULL CHECK (gate_scope IN ('phase1','phase2','ad_hoc')),
  gate_status             text NOT NULL CHECK (gate_status IN ('draft','active','paused','closed')),
  owner_name              text NOT NULL,
  prepared_by             text,
  reviewer_name           text,
  description             text,
  meta                    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.readiness_gate_rule_master (
  readiness_gate_rule_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  readiness_gate_id       uuid NOT NULL REFERENCES cx22073jw.readiness_gate_master(readiness_gate_id) ON DELETE CASCADE,
  rule_code               text NOT NULL UNIQUE,
  rule_group              text NOT NULL CHECK (rule_group IN ('structure','contract','runtime','sample')),
  rule_name               text NOT NULL,
  target_scope            text NOT NULL CHECK (target_scope IN ('area','global')),
  comparator_code         text NOT NULL CHECK (comparator_code IN ('eq','ge','dynamic')),
  threshold_numeric       numeric(18,4),
  description             text,
  sort_order              integer NOT NULL CHECK (sort_order > 0),
  is_active               boolean NOT NULL DEFAULT true,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.readiness_gate_run (
  readiness_gate_run_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  readiness_gate_id       uuid NOT NULL REFERENCES cx22073jw.readiness_gate_master(readiness_gate_id) ON DELETE CASCADE,
  run_status              text NOT NULL CHECK (run_status IN ('pass','fail','partial','error','running')),
  total_checks            integer NOT NULL DEFAULT 0,
  passed_checks           integer NOT NULL DEFAULT 0,
  failed_checks           integer NOT NULL DEFAULT 0,
  target_area_count       integer NOT NULL DEFAULT 0,
  actor_name              text NOT NULL DEFAULT 'Zero',
  note_text               text,
  started_at              timestamptz NOT NULL DEFAULT NOW(),
  ended_at                timestamptz,
  created_at              timestamptz NOT NULL DEFAULT NOW(),
  updated_at              timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.readiness_gate_result (
  readiness_gate_result_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  readiness_gate_run_id    uuid NOT NULL REFERENCES cx22073jw.readiness_gate_run(readiness_gate_run_id) ON DELETE CASCADE,
  readiness_gate_rule_id   uuid NOT NULL REFERENCES cx22073jw.readiness_gate_rule_master(readiness_gate_rule_id) ON DELETE CASCADE,
  area_slug                text,
  pass_flag                boolean NOT NULL,
  actual_numeric           numeric(18,4),
  actual_text              text,
  detail_json              jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at               timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_readiness_gate_rule_master_gate
  ON cx22073jw.readiness_gate_rule_master (readiness_gate_id, sort_order);

CREATE INDEX IF NOT EXISTS ix_readiness_gate_run_gate
  ON cx22073jw.readiness_gate_run (readiness_gate_id, started_at DESC);

CREATE INDEX IF NOT EXISTS ix_readiness_gate_result_run
  ON cx22073jw.readiness_gate_result (readiness_gate_run_id, area_slug, pass_flag);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'readiness_gate_master',
    'readiness_gate_rule_master',
    'readiness_gate_run'
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

INSERT INTO cx22073jw.readiness_gate_master (
  gate_code,
  gate_name,
  gate_scope,
  gate_status,
  owner_name,
  prepared_by,
  reviewer_name,
  description,
  meta
) VALUES
  (
    'phase1_runtime_readiness_gate',
    'Phase1 Runtime Readiness Gate',
    'phase1',
    'active',
    'Boss',
    'Zero',
    'Sato (DB)',
    'Evaluates phase1 queue areas for structure existence, contract lock, wrapper runtime, and sample execution readiness.',
    '{"queue_code":"phase1_candidate_prepare_queue"}'::jsonb
  )
ON CONFLICT (gate_code) DO UPDATE
SET gate_name      = EXCLUDED.gate_name,
    gate_scope     = EXCLUDED.gate_scope,
    gate_status    = EXCLUDED.gate_status,
    owner_name     = EXCLUDED.owner_name,
    prepared_by    = EXCLUDED.prepared_by,
    reviewer_name  = EXCLUDED.reviewer_name,
    description    = EXCLUDED.description,
    meta           = EXCLUDED.meta,
    updated_at     = NOW();

WITH g AS (
  SELECT readiness_gate_id
  FROM cx22073jw.readiness_gate_master
  WHERE gate_code = 'phase1_runtime_readiness_gate'
)
INSERT INTO cx22073jw.readiness_gate_rule_master (
  readiness_gate_id,
  rule_code,
  rule_group,
  rule_name,
  target_scope,
  comparator_code,
  threshold_numeric,
  description,
  sort_order,
  is_active
)
SELECT
  g.readiness_gate_id,
  v.rule_code,
  v.rule_group,
  v.rule_name,
  v.target_scope,
  v.comparator_code,
  v.threshold_numeric,
  v.description,
  v.sort_order,
  true
FROM g
JOIN (
  VALUES
    ('phase1_table_exists','structure','Physical table exists','area','eq',1,'Applied/generated target table must exist',10),
    ('phase1_view_exists','structure','Active/latest view exists','area','eq',1,'Applied/generated target view must exist',20),
    ('phase1_wrapper_exists','runtime','Wrapper function exists','area','eq',1,'Area wrapper function must exist',30),
    ('phase1_snapshot_locked','contract','Exact contract snapshot locked','area','eq',1,'Area exact contract snapshot must be locked',40),
    ('phase1_valid_case_exists','sample','Valid sample case exists','area','ge',1,'At least one active valid sample case must exist',50),
    ('phase1_valid_success_all','sample','All valid sample cases succeed','area','dynamic',NULL,'All active valid sample cases must have latest success result',60),
    ('phase1_invalid_case_exists','sample','Invalid sample case exists','area','ge',1,'At least one active invalid sample case must exist',70),
    ('phase1_invalid_expected_failure_all','sample','All invalid sample cases fail as expected','area','dynamic',NULL,'All active invalid cases must have latest expected_failure result',80)
) AS v(
  rule_code, rule_group, rule_name, target_scope, comparator_code, threshold_numeric, description, sort_order
) ON true
ON CONFLICT (rule_code) DO UPDATE
SET rule_group        = EXCLUDED.rule_group,
    rule_name         = EXCLUDED.rule_name,
    target_scope      = EXCLUDED.target_scope,
    comparator_code   = EXCLUDED.comparator_code,
    threshold_numeric = EXCLUDED.threshold_numeric,
    description       = EXCLUDED.description,
    sort_order        = EXCLUDED.sort_order,
    is_active         = EXCLUDED.is_active,
    updated_at        = NOW();

CREATE OR REPLACE FUNCTION cx22073jw.fn_run_phase1_runtime_readiness_gate()
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_gate_id uuid;
  v_run_id uuid;
  v_total_checks integer := 0;
  v_passed_checks integer := 0;
  v_failed_checks integer := 0;
  v_target_area_count integer := 0;

  r_area record;

  v_table_exists boolean;
  v_view_exists boolean;
  v_wrapper_exists boolean;
  v_snapshot_locked boolean;

  v_valid_case_count integer;
  v_valid_success_count integer;
  v_invalid_case_count integer;
  v_invalid_expected_failure_count integer;

  v_rule_id uuid;
BEGIN
  SELECT rgm.readiness_gate_id
    INTO v_gate_id
  FROM cx22073jw.readiness_gate_master rgm
  WHERE rgm.gate_code = 'phase1_runtime_readiness_gate'
    AND rgm.gate_status = 'active'
  LIMIT 1;

  IF v_gate_id IS NULL THEN
    RAISE EXCEPTION 'active phase1_runtime_readiness_gate not found';
  END IF;

  INSERT INTO cx22073jw.readiness_gate_run (
    readiness_gate_id,
    run_status,
    actor_name,
    note_text
  )
  VALUES (
    v_gate_id,
    'running',
    'Zero',
    'Phase1 runtime readiness gate evaluation started.'
  )
  RETURNING readiness_gate_run_id INTO v_run_id;

  FOR r_area IN
    SELECT
      car.area_slug,
      ogr.generation_registry_id,
      ogr.target_schema_name,
      ogr.target_table_name,
      ogr.target_view_name,
      ogr.target_function_name
    FROM cx22073jw.official_prepare_queue_item opqi
    JOIN cx22073jw.official_prepare_queue_master opqm
      ON opqm.prepare_queue_id = opqi.prepare_queue_id
    JOIN cx22073jw.candidate_area_registry car
      ON car.candidate_area_id = opqi.candidate_area_id
    JOIN cx22073jw.official_prepare_generation_registry ogr
      ON ogr.prepare_queue_item_id = opqi.prepare_queue_item_id
    WHERE opqm.queue_code = 'phase1_candidate_prepare_queue'
      AND opqi.is_active = true
    ORDER BY opqi.priority_rank, car.area_slug
  LOOP
    v_target_area_count := v_target_area_count + 1;

    v_table_exists := to_regclass(r_area.target_schema_name || '.' || r_area.target_table_name) IS NOT NULL;
    v_view_exists := to_regclass(r_area.target_schema_name || '.' || r_area.target_view_name) IS NOT NULL;

    SELECT EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_namespace n
        ON n.oid = p.pronamespace
      WHERE n.nspname = r_area.target_schema_name
        AND p.proname = r_area.target_function_name
    )
    INTO v_wrapper_exists;

    SELECT EXISTS (
      SELECT 1
      FROM cx22073jw.area_exact_contract_snapshot aecs
      WHERE aecs.generation_registry_id = r_area.generation_registry_id
        AND aecs.contract_status = 'locked'
    )
    INTO v_snapshot_locked;

    SELECT COUNT(*)
      INTO v_valid_case_count
    FROM cx22073jw.exact_contract_sample_case_registry scr
    WHERE scr.area_slug = r_area.area_slug
      AND scr.expected_result = 'success'
      AND scr.is_active = true;

    SELECT COUNT(*)
      INTO v_valid_success_count
    FROM cx22073jw.exact_contract_sample_case_registry scr
    LEFT JOIN LATERAL (
      SELECT srl.execution_status
      FROM cx22073jw.exact_contract_sample_run_log srl
      WHERE srl.sample_case_id = scr.sample_case_id
      ORDER BY srl.executed_at DESC
      LIMIT 1
    ) lr ON true
    WHERE scr.area_slug = r_area.area_slug
      AND scr.expected_result = 'success'
      AND scr.is_active = true
      AND lr.execution_status = 'success';

    SELECT COUNT(*)
      INTO v_invalid_case_count
    FROM cx22073jw.exact_contract_sample_case_registry scr
    WHERE scr.area_slug = r_area.area_slug
      AND scr.expected_result = 'validation_error'
      AND scr.is_active = true;

    SELECT COUNT(*)
      INTO v_invalid_expected_failure_count
    FROM cx22073jw.exact_contract_sample_case_registry scr
    LEFT JOIN LATERAL (
      SELECT srl.execution_status
      FROM cx22073jw.exact_contract_sample_run_log srl
      WHERE srl.sample_case_id = scr.sample_case_id
      ORDER BY srl.executed_at DESC
      LIMIT 1
    ) lr ON true
    WHERE scr.area_slug = r_area.area_slug
      AND scr.expected_result = 'validation_error'
      AND scr.is_active = true
      AND lr.execution_status = 'expected_failure';

    SELECT rgrm.readiness_gate_rule_id INTO v_rule_id
    FROM cx22073jw.readiness_gate_rule_master rgrm
    WHERE rgrm.rule_code = 'phase1_table_exists';

    INSERT INTO cx22073jw.readiness_gate_result (
      readiness_gate_run_id, readiness_gate_rule_id, area_slug, pass_flag, actual_numeric, actual_text, detail_json
    )
    VALUES (
      v_run_id, v_rule_id, r_area.area_slug, v_table_exists,
      CASE WHEN v_table_exists THEN 1 ELSE 0 END,
      CASE WHEN v_table_exists THEN 'table_exists' ELSE 'table_missing' END,
      jsonb_build_object('target_table_name', r_area.target_table_name)
    );

    SELECT rgrm.readiness_gate_rule_id INTO v_rule_id
    FROM cx22073jw.readiness_gate_rule_master rgrm
    WHERE rgrm.rule_code = 'phase1_view_exists';

    INSERT INTO cx22073jw.readiness_gate_result (
      readiness_gate_run_id, readiness_gate_rule_id, area_slug, pass_flag, actual_numeric, actual_text, detail_json
    )
    VALUES (
      v_run_id, v_rule_id, r_area.area_slug, v_view_exists,
      CASE WHEN v_view_exists THEN 1 ELSE 0 END,
      CASE WHEN v_view_exists THEN 'view_exists' ELSE 'view_missing' END,
      jsonb_build_object('target_view_name', r_area.target_view_name)
    );

    SELECT rgrm.readiness_gate_rule_id INTO v_rule_id
    FROM cx22073jw.readiness_gate_rule_master rgrm
    WHERE rgrm.rule_code = 'phase1_wrapper_exists';

    INSERT INTO cx22073jw.readiness_gate_result (
      readiness_gate_run_id, readiness_gate_rule_id, area_slug, pass_flag, actual_numeric, actual_text, detail_json
    )
    VALUES (
      v_run_id, v_rule_id, r_area.area_slug, v_wrapper_exists,
      CASE WHEN v_wrapper_exists THEN 1 ELSE 0 END,
      CASE WHEN v_wrapper_exists THEN 'wrapper_exists' ELSE 'wrapper_missing' END,
      jsonb_build_object('target_function_name', r_area.target_function_name)
    );

    SELECT rgrm.readiness_gate_rule_id INTO v_rule_id
    FROM cx22073jw.readiness_gate_rule_master rgrm
    WHERE rgrm.rule_code = 'phase1_snapshot_locked';

    INSERT INTO cx22073jw.readiness_gate_result (
      readiness_gate_run_id, readiness_gate_rule_id, area_slug, pass_flag, actual_numeric, actual_text, detail_json
    )
    VALUES (
      v_run_id, v_rule_id, r_area.area_slug, v_snapshot_locked,
      CASE WHEN v_snapshot_locked THEN 1 ELSE 0 END,
      CASE WHEN v_snapshot_locked THEN 'snapshot_locked' ELSE 'snapshot_not_locked' END,
      '{}'::jsonb
    );

    SELECT rgrm.readiness_gate_rule_id INTO v_rule_id
    FROM cx22073jw.readiness_gate_rule_master rgrm
    WHERE rgrm.rule_code = 'phase1_valid_case_exists';

    INSERT INTO cx22073jw.readiness_gate_result (
      readiness_gate_run_id, readiness_gate_rule_id, area_slug, pass_flag, actual_numeric, actual_text, detail_json
    )
    VALUES (
      v_run_id, v_rule_id, r_area.area_slug, v_valid_case_count >= 1,
      v_valid_case_count, v_valid_case_count::text, '{}'::jsonb
    );

    SELECT rgrm.readiness_gate_rule_id INTO v_rule_id
    FROM cx22073jw.readiness_gate_rule_master rgrm
    WHERE rgrm.rule_code = 'phase1_valid_success_all';

    INSERT INTO cx22073jw.readiness_gate_result (
      readiness_gate_run_id, readiness_gate_rule_id, area_slug, pass_flag, actual_numeric, actual_text, detail_json
    )
    VALUES (
      v_run_id, v_rule_id, r_area.area_slug,
      (v_valid_case_count > 0 AND v_valid_success_count = v_valid_case_count),
      v_valid_success_count,
      v_valid_success_count::text || '/' || v_valid_case_count::text,
      jsonb_build_object(
        'valid_case_count', v_valid_case_count,
        'valid_success_count', v_valid_success_count
      )
    );

    SELECT rgrm.readiness_gate_rule_id INTO v_rule_id
    FROM cx22073jw.readiness_gate_rule_master rgrm
    WHERE rgrm.rule_code = 'phase1_invalid_case_exists';

    INSERT INTO cx22073jw.readiness_gate_result (
      readiness_gate_run_id, readiness_gate_rule_id, area_slug, pass_flag, actual_numeric, actual_text, detail_json
    )
    VALUES (
      v_run_id, v_rule_id, r_area.area_slug, v_invalid_case_count >= 1,
      v_invalid_case_count, v_invalid_case_count::text, '{}'::jsonb
    );

    SELECT rgrm.readiness_gate_rule_id INTO v_rule_id
    FROM cx22073jw.readiness_gate_rule_master rgrm
    WHERE rgrm.rule_code = 'phase1_invalid_expected_failure_all';

    INSERT INTO cx22073jw.readiness_gate_result (
      readiness_gate_run_id, readiness_gate_rule_id, area_slug, pass_flag, actual_numeric, actual_text, detail_json
    )
    VALUES (
      v_run_id, v_rule_id, r_area.area_slug,
      (v_invalid_case_count > 0 AND v_invalid_expected_failure_count = v_invalid_case_count),
      v_invalid_expected_failure_count,
      v_invalid_expected_failure_count::text || '/' || v_invalid_case_count::text,
      jsonb_build_object(
        'invalid_case_count', v_invalid_case_count,
        'invalid_expected_failure_count', v_invalid_expected_failure_count
      )
    );
  END LOOP;

  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE pass_flag),
         COUNT(*) FILTER (WHERE NOT pass_flag)
    INTO v_total_checks, v_passed_checks, v_failed_checks
  FROM cx22073jw.readiness_gate_result rgr
  WHERE rgr.readiness_gate_run_id = v_run_id;

  UPDATE cx22073jw.readiness_gate_run
     SET total_checks = v_total_checks,
         passed_checks = v_passed_checks,
         failed_checks = v_failed_checks,
         target_area_count = v_target_area_count,
         run_status = CASE
                        WHEN v_total_checks = 0 THEN 'error'
                        WHEN v_failed_checks = 0 THEN 'pass'
                        ELSE 'fail'
                      END,
         note_text = CASE
                       WHEN v_total_checks = 0 THEN 'No readiness checks executed.'
                       WHEN v_failed_checks = 0 THEN 'All readiness checks passed.'
                       ELSE 'Readiness gate has failed checks.'
                     END,
         ended_at = NOW(),
         updated_at = NOW()
   WHERE readiness_gate_run_id = v_run_id;

  RETURN v_run_id;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_readiness_gate_latest_run_summary AS
WITH latest_run AS (
  SELECT rgr.*
  FROM cx22073jw.readiness_gate_run rgr
  JOIN cx22073jw.readiness_gate_master rgm
    ON rgm.readiness_gate_id = rgr.readiness_gate_id
  WHERE rgm.gate_code = 'phase1_runtime_readiness_gate'
  ORDER BY rgr.started_at DESC
  LIMIT 1
)
SELECT
  rgm.gate_code,
  rgm.gate_name,
  lr.readiness_gate_run_id,
  lr.run_status,
  lr.total_checks,
  lr.passed_checks,
  lr.failed_checks,
  lr.target_area_count,
  lr.started_at,
  lr.ended_at,
  lr.note_text
FROM latest_run lr
JOIN cx22073jw.readiness_gate_master rgm
  ON rgm.readiness_gate_id = lr.readiness_gate_id;

CREATE OR REPLACE VIEW cx22073jw.v_readiness_gate_latest_area_status AS
WITH latest_run AS (
  SELECT rgr.readiness_gate_run_id
  FROM cx22073jw.readiness_gate_run rgr
  JOIN cx22073jw.readiness_gate_master rgm
    ON rgm.readiness_gate_id = rgr.readiness_gate_id
  WHERE rgm.gate_code = 'phase1_runtime_readiness_gate'
  ORDER BY rgr.started_at DESC
  LIMIT 1
)
SELECT
  rgr.area_slug,
  bool_and(rgr.pass_flag) AS area_pass,
  COUNT(*) AS check_count,
  COUNT(*) FILTER (WHERE rgr.pass_flag) AS passed_count,
  COUNT(*) FILTER (WHERE NOT rgr.pass_flag) AS failed_count
FROM cx22073jw.readiness_gate_result rgr
JOIN latest_run lr
  ON lr.readiness_gate_run_id = rgr.readiness_gate_run_id
GROUP BY rgr.area_slug
ORDER BY rgr.area_slug;

CREATE OR REPLACE VIEW cx22073jw.v_readiness_gate_latest_failed_checks AS
WITH latest_run AS (
  SELECT rgr.readiness_gate_run_id
  FROM cx22073jw.readiness_gate_run rgr
  JOIN cx22073jw.readiness_gate_master rgm
    ON rgm.readiness_gate_id = rgr.readiness_gate_id
  WHERE rgm.gate_code = 'phase1_runtime_readiness_gate'
  ORDER BY rgr.started_at DESC
  LIMIT 1
)
SELECT
  rr.area_slug,
  rrm.rule_code,
  rrm.rule_name,
  rr.actual_numeric,
  rr.actual_text,
  rr.detail_json
FROM cx22073jw.readiness_gate_result rr
JOIN latest_run lr
  ON lr.readiness_gate_run_id = rr.readiness_gate_run_id
JOIN cx22073jw.readiness_gate_rule_master rrm
  ON rrm.readiness_gate_rule_id = rr.readiness_gate_rule_id
WHERE rr.pass_flag = false
ORDER BY rr.area_slug, rrm.sort_order;

SELECT cx22073jw.fn_run_phase1_runtime_readiness_gate();

COMMIT;

\echo '============================================================'
\echo 'LATEST READINESS GATE SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_readiness_gate_latest_run_summary;

\echo '============================================================'
\echo 'LATEST AREA STATUS'
\echo '============================================================'
TABLE cx22073jw.v_readiness_gate_latest_area_status;

\echo '============================================================'
\echo 'LATEST FAILED CHECKS'
\echo '============================================================'
TABLE cx22073jw.v_readiness_gate_latest_failed_checks;
SQL

  echo "============================================================"
  echo "CX22073JW READINESS GATE RUNTIME APPLY DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
