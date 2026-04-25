#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="$HOME/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_staticart_minimum_first_send_bridge.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW STATICART MINIMUM FIRST SEND BRIDGE APPLY"
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
      AND table_name = 'system_to_cx_knowledge_transfer_profile'
  ) THEN
    RAISE EXCEPTION 'system_to_cx_knowledge_transfer_profile is required before minimum first send bridge apply';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'area_payload_contract_registry'
  ) THEN
    RAISE EXCEPTION 'area_payload_contract_registry is required before minimum first send bridge apply';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'staticart_minimum_first_send_bridge',
    'StaticArt Minimum First Send Bridge',
    'normal',
    'integration',
    'Bridges StaticArt minimum first send knowledge blocks to actual payload contracts and projection targets'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.system_to_cx_transfer_area_binding (
  transfer_area_binding_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_profile_id         uuid NOT NULL REFERENCES cx22073jw.system_to_cx_knowledge_transfer_profile(transfer_profile_id) ON DELETE CASCADE,
  transfer_block_id           uuid NOT NULL REFERENCES cx22073jw.system_to_cx_knowledge_transfer_block(transfer_block_id) ON DELETE CASCADE,
  candidate_area_id           uuid NOT NULL REFERENCES cx22073jw.candidate_area_registry(candidate_area_id) ON DELETE CASCADE,
  target_slot_scope           text NOT NULL CHECK (target_slot_scope IN ('top_level_bridge','payload_bridge','meta_bridge')),
  target_payload_column_name  text CHECK (
                               target_payload_column_name IN (
                                 'projection_payload',
                                 'summary_payload',
                                 'continuity_payload',
                                 'index_payload',
                                 'policy_context_payload',
                                 'optimization_payload'
                               )
                             ),
  binding_status              text NOT NULL CHECK (binding_status IN ('planned','active','deprecated')),
  priority_rank               integer NOT NULL CHECK (priority_rank > 0),
  is_minimum_first_send       boolean NOT NULL DEFAULT false,
  binding_note                text,
  created_at                  timestamptz NOT NULL DEFAULT NOW(),
  updated_at                  timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (
    transfer_block_id,
    candidate_area_id,
    target_slot_scope,
    target_payload_column_name
  )
);

CREATE TABLE IF NOT EXISTS cx22073jw.system_to_cx_transfer_field_slot_binding (
  transfer_field_slot_binding_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_area_binding_id       uuid NOT NULL REFERENCES cx22073jw.system_to_cx_transfer_area_binding(transfer_area_binding_id) ON DELETE CASCADE,
  transfer_field_id              uuid NOT NULL REFERENCES cx22073jw.system_to_cx_knowledge_transfer_field(transfer_field_id) ON DELETE CASCADE,
  target_slot_type               text NOT NULL CHECK (target_slot_type IN ('table_column','payload_json_key','meta_json_key')),
  target_slot_name               text NOT NULL,
  mapping_mode                   text NOT NULL CHECK (mapping_mode IN ('direct','derived','normalized')),
  sort_order                     integer NOT NULL CHECK (sort_order > 0),
  mapping_note                   text,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  updated_at                     timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (
    transfer_area_binding_id,
    transfer_field_id,
    target_slot_type,
    target_slot_name
  )
);

CREATE TABLE IF NOT EXISTS cx22073jw.system_to_cx_transfer_contract_binding_snapshot (
  transfer_contract_binding_snapshot_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_area_binding_id              uuid NOT NULL UNIQUE REFERENCES cx22073jw.system_to_cx_transfer_area_binding(transfer_area_binding_id) ON DELETE CASCADE,
  mapped_field_count                    integer NOT NULL DEFAULT 0,
  target_contract_key_count             integer,
  matched_contract_key_count            integer,
  missing_contract_keys                 text[] NOT NULL DEFAULT ARRAY[]::text[],
  snapshot_json                         jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at                          timestamptz NOT NULL DEFAULT NOW(),
  created_at                            timestamptz NOT NULL DEFAULT NOW(),
  updated_at                            timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_system_to_cx_transfer_area_binding_profile
  ON cx22073jw.system_to_cx_transfer_area_binding (transfer_profile_id, priority_rank);

CREATE INDEX IF NOT EXISTS ix_system_to_cx_transfer_field_slot_binding_area
  ON cx22073jw.system_to_cx_transfer_field_slot_binding (transfer_area_binding_id, sort_order);

CREATE INDEX IF NOT EXISTS ix_system_to_cx_transfer_contract_binding_snapshot_area
  ON cx22073jw.system_to_cx_transfer_contract_binding_snapshot (transfer_area_binding_id, generated_at DESC);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'system_to_cx_transfer_area_binding',
    'system_to_cx_transfer_field_slot_binding',
    'system_to_cx_transfer_contract_binding_snapshot'
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

CREATE OR REPLACE FUNCTION cx22073jw.fn_refresh_staticart_minimum_first_send_bindings()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id uuid;
  v_count integer := 0;
BEGIN
  SELECT transfer_profile_id
    INTO v_profile_id
  FROM cx22073jw.system_to_cx_knowledge_transfer_profile
  WHERE profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'staticart exact transfer profile not found';
  END IF;

  -- area bindings
  INSERT INTO cx22073jw.system_to_cx_transfer_area_binding (
    transfer_profile_id,
    transfer_block_id,
    candidate_area_id,
    target_slot_scope,
    target_payload_column_name,
    binding_status,
    priority_rank,
    is_minimum_first_send,
    binding_note
  )
  SELECT
    v_profile_id,
    b.transfer_block_id,
    car.candidate_area_id,
    v.target_slot_scope,
    v.target_payload_column_name,
    'active',
    v.priority_rank,
    true,
    v.binding_note
  FROM (
    VALUES
      ('knowledge_pack_root','static_art_asset_area','top_level_bridge',NULL::text,10,'Knowledge root header bridge'),
      ('asset_identity_knowledge','static_art_asset_area','payload_bridge','projection_payload',20,'Identity knowledge to static art projection payload'),
      ('search_and_index_knowledge','asset_metadata_localization_area','payload_bridge','index_payload',30,'Search/index knowledge to localization index payload'),
      ('exhibition_knowledge','exhibition_projection_area','payload_bridge','projection_payload',40,'Exhibition knowledge to exhibition projection payload'),
      ('rights_digest_knowledge','asset_rights_policy_area','payload_bridge','policy_context_payload',50,'Rights digest knowledge to policy context payload')
  ) AS v(block_code, area_slug, target_slot_scope, target_payload_column_name, priority_rank, binding_note)
  JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
    ON b.transfer_profile_id = v_profile_id
   AND b.block_code = v.block_code
  JOIN cx22073jw.candidate_area_registry car
    ON car.area_slug = v.area_slug
  ON CONFLICT (
    transfer_block_id,
    candidate_area_id,
    target_slot_scope,
    target_payload_column_name
  ) DO UPDATE
  SET binding_status        = EXCLUDED.binding_status,
      priority_rank         = EXCLUDED.priority_rank,
      is_minimum_first_send = EXCLUDED.is_minimum_first_send,
      binding_note          = EXCLUDED.binding_note,
      updated_at            = NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- root field slots
  INSERT INTO cx22073jw.system_to_cx_transfer_field_slot_binding (
    transfer_area_binding_id,
    transfer_field_id,
    target_slot_type,
    target_slot_name,
    mapping_mode,
    sort_order,
    mapping_note
  )
  SELECT
    tab.transfer_area_binding_id,
    tf.transfer_field_id,
    v.target_slot_type,
    v.target_slot_name,
    v.mapping_mode,
    v.sort_order,
    v.mapping_note
  FROM cx22073jw.system_to_cx_transfer_area_binding tab
  JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
    ON b.transfer_block_id = tab.transfer_block_id
  JOIN (
    VALUES
      ('knowledge_pack_id','table_column','subject_key','direct',10,'knowledge_pack_id becomes subject_key'),
      ('asset_id','table_column','canonical_ref_key','direct',20,'asset_id anchor becomes canonical_ref_key'),
      ('source_system','table_column','source_system','direct',30,'fixed source system'),
      ('source_schema','meta_json_key','source_schema','direct',40,'root metadata'),
      ('generated_at','meta_json_key','generated_at','direct',50,'root metadata'),
      ('language_scope','meta_json_key','language_scope','direct',60,'root metadata'),
      ('canonical_updated_at_snapshot','meta_json_key','canonical_updated_at_snapshot','direct',70,'root metadata'),
      ('knowledge_status','meta_json_key','knowledge_status','direct',80,'root metadata'),
      ('knowledge_version','meta_json_key','knowledge_version','direct',90,'root metadata')
  ) AS v(field_code, target_slot_type, target_slot_name, mapping_mode, sort_order, mapping_note)
    ON b.block_code = 'knowledge_pack_root'
  JOIN cx22073jw.system_to_cx_knowledge_transfer_field tf
    ON tf.transfer_block_id = b.transfer_block_id
   AND tf.field_code = v.field_code
  WHERE tab.target_slot_scope = 'top_level_bridge'
    AND tab.is_minimum_first_send = true
  ON CONFLICT (
    transfer_area_binding_id,
    transfer_field_id,
    target_slot_type,
    target_slot_name
  ) DO UPDATE
  SET mapping_mode  = EXCLUDED.mapping_mode,
      sort_order    = EXCLUDED.sort_order,
      mapping_note  = EXCLUDED.mapping_note,
      updated_at    = NOW();

  -- payload field slots
  INSERT INTO cx22073jw.system_to_cx_transfer_field_slot_binding (
    transfer_area_binding_id,
    transfer_field_id,
    target_slot_type,
    target_slot_name,
    mapping_mode,
    sort_order,
    mapping_note
  )
  SELECT
    tab.transfer_area_binding_id,
    tf.transfer_field_id,
    'payload_json_key',
    tf.field_code,
    'direct',
    tf.sort_order,
    'Direct field-code to payload json key mapping'
  FROM cx22073jw.system_to_cx_transfer_area_binding tab
  JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
    ON b.transfer_block_id = tab.transfer_block_id
  JOIN cx22073jw.system_to_cx_knowledge_transfer_field tf
    ON tf.transfer_block_id = b.transfer_block_id
  WHERE tab.target_slot_scope = 'payload_bridge'
    AND tab.is_minimum_first_send = true
  ON CONFLICT (
    transfer_area_binding_id,
    transfer_field_id,
    target_slot_type,
    target_slot_name
  ) DO UPDATE
  SET mapping_mode = EXCLUDED.mapping_mode,
      sort_order   = EXCLUDED.sort_order,
      mapping_note = EXCLUDED.mapping_note,
      updated_at   = NOW();

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_sync_staticart_minimum_first_send_contract_keys()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
  v_count integer := 0;
BEGIN
  FOR r IN
    SELECT
      tab.candidate_area_id,
      tab.target_payload_column_name,
      ARRAY_AGG(tfsb.target_slot_name ORDER BY tfsb.sort_order) AS mapped_payload_keys
    FROM cx22073jw.system_to_cx_transfer_area_binding tab
    JOIN cx22073jw.system_to_cx_transfer_field_slot_binding tfsb
      ON tfsb.transfer_area_binding_id = tab.transfer_area_binding_id
    WHERE tab.is_minimum_first_send = true
      AND tab.target_slot_scope = 'payload_bridge'
      AND tfsb.target_slot_type = 'payload_json_key'
    GROUP BY
      tab.candidate_area_id,
      tab.target_payload_column_name
  LOOP
    UPDATE cx22073jw.area_payload_contract_registry apcr
       SET optional_keys = (
             SELECT ARRAY(
               SELECT DISTINCT x
               FROM unnest(
                 COALESCE(apcr.optional_keys, ARRAY[]::text[])
                 || COALESCE(r.mapped_payload_keys, ARRAY[]::text[])
               ) AS x
               ORDER BY 1
             )
           ),
           updated_at = NOW()
     WHERE apcr.candidate_area_id = r.candidate_area_id
       AND apcr.payload_column_name = r.target_payload_column_name;

    v_count := v_count + 1;
  END LOOP;

  PERFORM cx22073jw.fn_refresh_area_exact_contract_snapshots();

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_refresh_staticart_transfer_contract_binding_snapshots()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
  v_mapped_keys text[];
  v_contract_keys text[];
  v_missing text[];
  v_matched_count integer;
  v_contract_count integer;
  v_snapshot jsonb;
  v_count integer := 0;
BEGIN
  FOR r IN
    SELECT
      tab.transfer_area_binding_id,
      tab.target_slot_scope,
      tab.target_payload_column_name,
      car.area_slug,
      ogr.target_table_name,
      ogr.target_view_name
    FROM cx22073jw.system_to_cx_transfer_area_binding tab
    JOIN cx22073jw.candidate_area_registry car
      ON car.candidate_area_id = tab.candidate_area_id
    LEFT JOIN cx22073jw.official_prepare_generation_registry ogr
      ON ogr.candidate_area_id = car.candidate_area_id
    WHERE tab.is_minimum_first_send = true
    ORDER BY tab.priority_rank
  LOOP
    SELECT COALESCE(
      ARRAY_AGG(tfsb.target_slot_name ORDER BY tfsb.sort_order),
      ARRAY[]::text[]
    )
      INTO v_mapped_keys
    FROM cx22073jw.system_to_cx_transfer_field_slot_binding tfsb
    WHERE tfsb.transfer_area_binding_id = r.transfer_area_binding_id
      AND (
        (r.target_slot_scope = 'payload_bridge' AND tfsb.target_slot_type = 'payload_json_key')
        OR
        (r.target_slot_scope = 'top_level_bridge' AND tfsb.target_slot_type IN ('table_column','meta_json_key'))
      );

    IF r.target_slot_scope = 'payload_bridge' THEN
      SELECT COALESCE(
        ARRAY(
          SELECT DISTINCT x
          FROM (
            SELECT unnest(COALESCE(apcr.required_keys, ARRAY[]::text[])) AS x
            UNION
            SELECT unnest(COALESCE(apcr.optional_keys, ARRAY[]::text[])) AS x
          ) q
          ORDER BY 1
        ),
        ARRAY[]::text[]
      )
        INTO v_contract_keys
      FROM cx22073jw.system_to_cx_transfer_area_binding tab
      JOIN cx22073jw.area_payload_contract_registry apcr
        ON apcr.candidate_area_id = tab.candidate_area_id
       AND apcr.payload_column_name = tab.target_payload_column_name
      WHERE tab.transfer_area_binding_id = r.transfer_area_binding_id;

      SELECT COALESCE(
        ARRAY(
          SELECT mk
          FROM unnest(COALESCE(v_mapped_keys, ARRAY[]::text[])) AS mk
          WHERE NOT (mk = ANY(COALESCE(v_contract_keys, ARRAY[]::text[])))
          ORDER BY 1
        ),
        ARRAY[]::text[]
      )
        INTO v_missing;

      v_contract_count := cardinality(COALESCE(v_contract_keys, ARRAY[]::text[]));
      v_matched_count := cardinality(COALESCE(v_mapped_keys, ARRAY[]::text[]))
                         - cardinality(COALESCE(v_missing, ARRAY[]::text[]));
    ELSE
      v_contract_keys := NULL;
      v_missing := ARRAY[]::text[];
      v_contract_count := NULL;
      v_matched_count := NULL;
    END IF;

    v_snapshot := jsonb_build_object(
      'target_slot_scope', r.target_slot_scope,
      'target_payload_column_name', r.target_payload_column_name,
      'area_slug', r.area_slug,
      'target_table_name', r.target_table_name,
      'target_view_name', r.target_view_name,
      'mapped_keys', COALESCE(v_mapped_keys, ARRAY[]::text[]),
      'contract_keys', COALESCE(v_contract_keys, ARRAY[]::text[]),
      'missing_contract_keys', COALESCE(v_missing, ARRAY[]::text[])
    );

    INSERT INTO cx22073jw.system_to_cx_transfer_contract_binding_snapshot (
      transfer_area_binding_id,
      mapped_field_count,
      target_contract_key_count,
      matched_contract_key_count,
      missing_contract_keys,
      snapshot_json,
      generated_at
    )
    VALUES (
      r.transfer_area_binding_id,
      cardinality(COALESCE(v_mapped_keys, ARRAY[]::text[])),
      v_contract_count,
      v_matched_count,
      COALESCE(v_missing, ARRAY[]::text[]),
      v_snapshot,
      NOW()
    )
    ON CONFLICT (transfer_area_binding_id) DO UPDATE
    SET mapped_field_count         = EXCLUDED.mapped_field_count,
        target_contract_key_count  = EXCLUDED.target_contract_key_count,
        matched_contract_key_count = EXCLUDED.matched_contract_key_count,
        missing_contract_keys      = EXCLUDED.missing_contract_keys,
        snapshot_json              = EXCLUDED.snapshot_json,
        generated_at               = EXCLUDED.generated_at,
        updated_at                 = NOW();

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

SELECT cx22073jw.fn_refresh_staticart_minimum_first_send_bindings();
SELECT cx22073jw.fn_sync_staticart_minimum_first_send_contract_keys();
SELECT cx22073jw.fn_refresh_staticart_transfer_contract_binding_snapshots();

CREATE OR REPLACE VIEW cx22073jw.v_staticart_minimum_first_send_area_bindings AS
SELECT
  p.profile_code,
  b.block_code,
  b.block_name,
  car.area_slug,
  tab.target_slot_scope,
  tab.target_payload_column_name,
  ogr.target_table_name,
  ogr.target_view_name,
  ogr.target_function_name,
  tab.priority_rank,
  tab.binding_status,
  tab.binding_note
FROM cx22073jw.system_to_cx_transfer_area_binding tab
JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
  ON p.transfer_profile_id = tab.transfer_profile_id
JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
  ON b.transfer_block_id = tab.transfer_block_id
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = tab.candidate_area_id
LEFT JOIN cx22073jw.official_prepare_generation_registry ogr
  ON ogr.candidate_area_id = car.candidate_area_id
WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
  AND tab.is_minimum_first_send = true
ORDER BY tab.priority_rank, b.block_code, car.area_slug;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_minimum_first_send_field_bindings AS
SELECT
  p.profile_code,
  b.block_code,
  car.area_slug,
  tab.target_slot_scope,
  tab.target_payload_column_name,
  tf.field_code,
  tfsb.target_slot_type,
  tfsb.target_slot_name,
  tfsb.mapping_mode,
  tfsb.sort_order,
  tfsb.mapping_note
FROM cx22073jw.system_to_cx_transfer_field_slot_binding tfsb
JOIN cx22073jw.system_to_cx_transfer_area_binding tab
  ON tab.transfer_area_binding_id = tfsb.transfer_area_binding_id
JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
  ON p.transfer_profile_id = tab.transfer_profile_id
JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
  ON b.transfer_block_id = tab.transfer_block_id
JOIN cx22073jw.system_to_cx_knowledge_transfer_field tf
  ON tf.transfer_field_id = tfsb.transfer_field_id
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = tab.candidate_area_id
WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
  AND tab.is_minimum_first_send = true
ORDER BY tab.priority_rank, tfsb.sort_order, tf.field_code;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_minimum_first_send_contract_coverage AS
SELECT
  p.profile_code,
  b.block_code,
  car.area_slug,
  tab.target_payload_column_name,
  scs.mapped_field_count,
  scs.target_contract_key_count,
  scs.matched_contract_key_count,
  scs.missing_contract_keys,
  scs.generated_at
FROM cx22073jw.system_to_cx_transfer_contract_binding_snapshot scs
JOIN cx22073jw.system_to_cx_transfer_area_binding tab
  ON tab.transfer_area_binding_id = scs.transfer_area_binding_id
JOIN cx22073jw.system_to_cx_knowledge_transfer_profile p
  ON p.transfer_profile_id = tab.transfer_profile_id
JOIN cx22073jw.system_to_cx_knowledge_transfer_block b
  ON b.transfer_block_id = tab.transfer_block_id
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = tab.candidate_area_id
WHERE p.profile_code = 'staticart_to_cx22073jw_knowledge_exact_list_v1'
  AND tab.is_minimum_first_send = true
ORDER BY tab.priority_rank, b.block_code, car.area_slug;

COMMIT;

\echo '============================================================'
\echo 'AREA BINDINGS'
\echo '============================================================'
TABLE cx22073jw.v_staticart_minimum_first_send_area_bindings;

\echo '============================================================'
\echo 'FIELD BINDING COUNTS'
\echo '============================================================'
SELECT block_code, area_slug, COUNT(*) AS field_binding_count
FROM cx22073jw.v_staticart_minimum_first_send_field_bindings
GROUP BY block_code, area_slug
ORDER BY block_code, area_slug;

\echo '============================================================'
\echo 'CONTRACT COVERAGE'
\echo '============================================================'
TABLE cx22073jw.v_staticart_minimum_first_send_contract_coverage;
SQL

  echo "============================================================"
  echo "CX22073JW STATICART MINIMUM FIRST SEND BRIDGE DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
