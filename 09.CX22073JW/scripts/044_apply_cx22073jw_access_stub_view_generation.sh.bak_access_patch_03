#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_stub_view_generation.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS STUB VIEW GENERATION START"
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
      AND table_name = 'access_actual_view_registry'
  ) THEN
    RAISE EXCEPTION 'access_actual_view_registry is required before stub view generation';
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
      'access_stub_view_generation',
      'AI Employee Stub View Generation',
      'normal',
      'integration',
      'Stub view generation and runtime catalog for AI employee actual views'
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

CREATE TABLE IF NOT EXISTS cx22073jw.access_stub_view_generation_run (
  stub_view_generation_run_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                     text NOT NULL UNIQUE,
  requested_view_count         integer NOT NULL DEFAULT 0,
  created_view_count           integer NOT NULL DEFAULT 0,
  existing_view_count          integer NOT NULL DEFAULT 0,
  error_view_count             integer NOT NULL DEFAULT 0,
  run_status                   text NOT NULL CHECK (run_status IN ('running','pass','partial','error')),
  actor_name                   text NOT NULL DEFAULT 'Zero',
  note_text                    text,
  created_at                   timestamptz NOT NULL DEFAULT NOW(),
  updated_at                   timestamptz NOT NULL DEFAULT NOW(),
  ended_at                     timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_stub_view_generation_item (
  stub_view_generation_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stub_view_generation_run_id  uuid NOT NULL REFERENCES cx22073jw.access_stub_view_generation_run(stub_view_generation_run_id) ON DELETE CASCADE,
  actual_view_code             text NOT NULL,
  logical_view_name            text NOT NULL,
  domain_code                  text NOT NULL,
  view_family_code             text NOT NULL,
  generation_status            text NOT NULL CHECK (generation_status IN ('created','skipped_existing','error')),
  error_text                   text,
  created_at                   timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_access_stub_view_generation_run_created
  ON cx22073jw.access_stub_view_generation_run (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_stub_view_generation_item_run
  ON cx22073jw.access_stub_view_generation_item (stub_view_generation_run_id, generation_status);

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
      WHERE tg.tgname = 'trg_access_stub_view_generation_run_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_stub_view_generation_run'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_stub_view_generation_run_updated_at
        BEFORE UPDATE ON cx22073jw.access_stub_view_generation_run
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_generate_access_stub_views()
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_run_id uuid;
  v_run_code text := 'access_stub_view_generation_' || to_char(NOW(), 'YYYYMMDD_HH24MISS');
  v_requested integer := 0;
  v_created integer := 0;
  v_existing integer := 0;
  v_error integer := 0;
  r record;
  v_exists boolean;
  v_sql text;
BEGIN
  INSERT INTO cx22073jw.access_stub_view_generation_run (
    run_code,
    run_status,
    actor_name,
    note_text
  )
  VALUES (
    v_run_code,
    'running',
    'Zero',
    'Generating missing AI employee stub views from actual view registry.'
  )
  RETURNING stub_view_generation_run_id INTO v_run_id;

  FOR r IN
    SELECT
      avr.actual_view_code,
      avr.domain_code,
      avr.view_family_code,
      avr.logical_view_name,
      avr.intended_schema_name,
      avr.sensitivity_code,
      avr.exposure_scope,
      avr.gate_required,
      avr.purpose_text,
      avr.lifecycle_status
    FROM cx22073jw.access_actual_view_registry avr
    WHERE avr.lifecycle_status IN ('registry_only','planned','active')
    ORDER BY avr.domain_code, avr.view_family_code, avr.logical_view_name
  LOOP
    v_requested := v_requested + 1;

    SELECT EXISTS (
      SELECT 1
      FROM information_schema.views v
      WHERE v.table_schema = r.intended_schema_name
        AND v.table_name = r.logical_view_name
    )
    INTO v_exists;

    IF v_exists THEN
      v_existing := v_existing + 1;

      INSERT INTO cx22073jw.access_stub_view_generation_item (
        stub_view_generation_run_id,
        actual_view_code,
        logical_view_name,
        domain_code,
        view_family_code,
        generation_status,
        error_text
      )
      VALUES (
        v_run_id,
        r.actual_view_code,
        r.logical_view_name,
        r.domain_code,
        r.view_family_code,
        'skipped_existing',
        NULL
      );
    ELSE
      BEGIN
        v_sql := format(
$FMT$
CREATE VIEW %I.%I AS
SELECT
  %L::text              AS actual_view_code,
  %L::text              AS domain_code,
  %L::text              AS view_family_code,
  %L::text              AS logical_view_name,
  %L::text              AS sensitivity_code,
  %L::text              AS exposure_scope,
  %s::boolean           AS gate_required,
  NULL::text            AS subject_key,
  NULL::text            AS summary_text,
  NULL::jsonb           AS context_payload,
  NULL::jsonb           AS policy_payload,
  NULL::jsonb           AS audit_payload,
  NULL::text            AS masking_note,
  NULL::integer         AS priority_rank,
  NULL::timestamptz     AS source_updated_at,
  %L::text              AS purpose_text,
  'stub_v1'::text       AS stub_version
WHERE false
$FMT$,
          r.intended_schema_name,
          r.logical_view_name,
          r.actual_view_code,
          r.domain_code,
          r.view_family_code,
          r.logical_view_name,
          r.sensitivity_code,
          r.exposure_scope,
          CASE WHEN r.gate_required THEN 'true' ELSE 'false' END,
          r.purpose_text
        );

        EXECUTE v_sql;

        v_created := v_created + 1;

        INSERT INTO cx22073jw.access_stub_view_generation_item (
          stub_view_generation_run_id,
          actual_view_code,
          logical_view_name,
          domain_code,
          view_family_code,
          generation_status,
          error_text
        )
        VALUES (
          v_run_id,
          r.actual_view_code,
          r.logical_view_name,
          r.domain_code,
          r.view_family_code,
          'created',
          NULL
        );
      EXCEPTION
        WHEN OTHERS THEN
          v_error := v_error + 1;

          INSERT INTO cx22073jw.access_stub_view_generation_item (
            stub_view_generation_run_id,
            actual_view_code,
            logical_view_name,
            domain_code,
            view_family_code,
            generation_status,
            error_text
          )
          VALUES (
            v_run_id,
            r.actual_view_code,
            r.logical_view_name,
            r.domain_code,
            r.view_family_code,
            'error',
            SQLERRM
          );
      END;
    END IF;
  END LOOP;

  UPDATE cx22073jw.access_stub_view_generation_run
     SET requested_view_count = v_requested,
         created_view_count   = v_created,
         existing_view_count  = v_existing,
         error_view_count     = v_error,
         run_status           = CASE
                                  WHEN v_requested = 0 THEN 'error'
                                  WHEN v_error = 0 THEN 'pass'
                                  WHEN v_created > 0 OR v_existing > 0 THEN 'partial'
                                  ELSE 'error'
                                END,
         note_text            = CASE
                                  WHEN v_requested = 0 THEN 'No actual views found in registry.'
                                  WHEN v_error = 0 THEN 'Stub view generation completed without errors.'
                                  ELSE 'Some stub views failed to generate.'
                                END,
         ended_at             = NOW(),
         updated_at           = NOW()
   WHERE stub_view_generation_run_id = v_run_id;

  RETURN v_run_id;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_stub_view_runtime_catalog AS
SELECT
  avr.domain_code,
  avr.view_family_code,
  avr.actual_view_code,
  avr.logical_view_name,
  avr.sensitivity_code,
  avr.exposure_scope,
  avr.gate_required,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM information_schema.views v
      WHERE v.table_schema = avr.intended_schema_name
        AND v.table_name = avr.logical_view_name
    ) THEN true
    ELSE false
  END AS stub_view_exists
FROM cx22073jw.access_actual_view_registry avr
ORDER BY avr.domain_code, avr.view_family_code, avr.logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_stub_view_missing AS
SELECT *
FROM cx22073jw.v_access_stub_view_runtime_catalog
WHERE stub_view_exists = false
ORDER BY domain_code, view_family_code, logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_stub_view_generation_latest_summary AS
SELECT
  run_code,
  requested_view_count,
  created_view_count,
  existing_view_count,
  error_view_count,
  run_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_stub_view_generation_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_stub_view_generation_latest_items AS
SELECT
  r.run_code,
  i.actual_view_code,
  i.logical_view_name,
  i.domain_code,
  i.view_family_code,
  i.generation_status,
  i.error_text,
  i.created_at
FROM cx22073jw.access_stub_view_generation_item i
JOIN cx22073jw.access_stub_view_generation_run r
  ON r.stub_view_generation_run_id = i.stub_view_generation_run_id
WHERE r.stub_view_generation_run_id = (
  SELECT stub_view_generation_run_id
  FROM cx22073jw.access_stub_view_generation_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.domain_code, i.view_family_code, i.logical_view_name;

SELECT cx22073jw.fn_generate_access_stub_views();

COMMIT;

\echo '============================================================'
\echo 'LATEST STUB VIEW GENERATION SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_access_stub_view_generation_latest_summary;

\echo '============================================================'
\echo 'RUNTIME CATALOG COUNTS'
\echo '============================================================'
SELECT
  domain_code,
  COUNT(*) AS total_views,
  COUNT(*) FILTER (WHERE stub_view_exists) AS existing_views,
  COUNT(*) FILTER (WHERE NOT stub_view_exists) AS missing_views
FROM cx22073jw.v_access_stub_view_runtime_catalog
GROUP BY domain_code
ORDER BY domain_code;

\echo '============================================================'
\echo 'MISSING STUB VIEWS'
\echo '============================================================'
TABLE cx22073jw.v_access_stub_view_missing;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS STUB VIEW GENERATION DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
