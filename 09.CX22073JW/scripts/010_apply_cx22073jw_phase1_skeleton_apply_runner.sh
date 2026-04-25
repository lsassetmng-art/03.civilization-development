#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
TMP_DIR="$HOME/.tmp/cx22073jw_phase1_skeleton_apply_runner"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_phase1_skeleton_apply_runner.log"
MANIFEST_FILE="$TMP_DIR/${RUN_TS}_phase1_manifest.tsv"
BATCH_CODE="phase1_apply_${RUN_TS}"

mkdir -p "$LOGS_DIR" "$TMP_DIR"

{
  echo "============================================================"
  echo "CX22073JW PHASE1 SKELETON APPLY RUNNER START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "tmp dir      : $TMP_DIR"
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
      AND table_name = 'official_prepare_generation_registry'
  ) THEN
    RAISE EXCEPTION 'official_prepare_generation_registry is required before phase1 skeleton apply runner';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'phase1_skeleton_apply_runner',
    'Phase 1 Skeleton Apply Runner',
    'normal',
    'integration',
    'Applies generated phase1 skeleton DDL from generation registry'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.phase1_skeleton_apply_batch (
  apply_batch_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code             text NOT NULL UNIQUE,
  batch_scope            text NOT NULL CHECK (batch_scope IN ('phase1','manual')),
  batch_status           text NOT NULL CHECK (batch_status IN ('running','done','failed','partial')),
  actor_name             text NOT NULL DEFAULT 'Zero',
  planned_count          integer NOT NULL DEFAULT 0,
  applied_count          integer NOT NULL DEFAULT 0,
  failed_count           integer NOT NULL DEFAULT 0,
  log_file_path          text,
  manifest_file_path     text,
  note_text              text,
  started_at             timestamptz NOT NULL DEFAULT NOW(),
  ended_at               timestamptz,
  meta                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at             timestamptz NOT NULL DEFAULT NOW(),
  updated_at             timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.phase1_skeleton_apply_item_log (
  apply_item_log_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apply_batch_id         uuid NOT NULL REFERENCES cx22073jw.phase1_skeleton_apply_batch(apply_batch_id) ON DELETE CASCADE,
  generation_registry_id uuid NOT NULL REFERENCES cx22073jw.official_prepare_generation_registry(generation_registry_id) ON DELETE CASCADE,
  area_slug              text NOT NULL,
  target_table_name      text NOT NULL,
  target_view_name       text NOT NULL,
  apply_status           text NOT NULL CHECK (apply_status IN ('applied','skipped','failed')),
  sql_file_path          text,
  message_text           text,
  applied_at             timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_phase1_skeleton_apply_batch_status
  ON cx22073jw.phase1_skeleton_apply_batch (batch_status, started_at DESC);

CREATE INDEX IF NOT EXISTS ix_phase1_skeleton_apply_item_log_batch
  ON cx22073jw.phase1_skeleton_apply_item_log (apply_batch_id, applied_at DESC);

CREATE INDEX IF NOT EXISTS ix_phase1_skeleton_apply_item_log_registry
  ON cx22073jw.phase1_skeleton_apply_item_log (generation_registry_id, applied_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class c
      ON c.oid = tg.tgrelid
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE tg.tgname = 'trg_phase1_skeleton_apply_batch_updated_at'
      AND n.nspname = 'cx22073jw'
      AND c.relname = 'phase1_skeleton_apply_batch'
  ) THEN
    EXECUTE '
      CREATE TRIGGER trg_phase1_skeleton_apply_batch_updated_at
      BEFORE UPDATE ON cx22073jw.phase1_skeleton_apply_batch
      FOR EACH ROW
      EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
    ';
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_phase1_skeleton_apply_batch_summary AS
SELECT
  psab.batch_code,
  psab.batch_scope,
  psab.batch_status,
  psab.actor_name,
  psab.planned_count,
  psab.applied_count,
  psab.failed_count,
  psab.started_at,
  psab.ended_at
FROM cx22073jw.phase1_skeleton_apply_batch psab
ORDER BY psab.started_at DESC;

CREATE OR REPLACE VIEW cx22073jw.v_phase1_skeleton_apply_target_status AS
SELECT
  clsr.source_system,
  COALESCE(clsr.source_app, '-') AS source_app,
  car.area_slug,
  car.area_name,
  ogr.target_schema_name,
  ogr.target_table_name,
  ogr.target_view_name,
  ogr.target_function_name,
  ogr.generation_status,
  (to_regclass(ogr.target_schema_name || '.' || ogr.target_table_name) IS NOT NULL) AS table_exists,
  (to_regclass(ogr.target_schema_name || '.' || ogr.target_view_name) IS NOT NULL) AS view_exists
FROM cx22073jw.official_prepare_generation_registry ogr
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = ogr.candidate_area_id
JOIN cx22073jw.candidate_ledger_source_registry clsr
  ON clsr.ledger_source_id = car.ledger_source_id
ORDER BY car.area_slug;

COMMIT;
SQL

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
UPDATE cx22073jw.phase1_skeleton_apply_batch b
   SET batch_status = 'failed',
       ended_at = NOW(),
       updated_at = NOW(),
       note_text = COALESCE(note_text, '') || ' Auto-closed as orphaned before rerun.'
 WHERE b.batch_status = 'running'
   AND NOT EXISTS (
     SELECT 1
     FROM cx22073jw.phase1_skeleton_apply_item_log l
     WHERE l.apply_batch_id = b.apply_batch_id
   );
SQL

  PENDING_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | tr -d '[:space:]'
SELECT COUNT(*)
FROM cx22073jw.official_prepare_generation_registry ogr
JOIN cx22073jw.official_prepare_queue_item opqi
  ON opqi.prepare_queue_item_id = ogr.prepare_queue_item_id
JOIN cx22073jw.official_prepare_queue_master opqm
  ON opqm.prepare_queue_id = opqi.prepare_queue_id
WHERE opqm.queue_code = 'phase1_candidate_prepare_queue'
  AND opqi.is_active = true
  AND ogr.generation_status IN ('generated','reviewed');
SQL
  )"

  BATCH_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.phase1_skeleton_apply_batch (
  batch_code,
  batch_scope,
  batch_status,
  actor_name,
  planned_count,
  applied_count,
  failed_count,
  log_file_path,
  manifest_file_path,
  note_text,
  meta
)
VALUES (
  '$BATCH_CODE',
  'phase1',
  'running',
  'Zero',
  $PENDING_COUNT,
  0,
  0,
  '$LOG_FILE',
  '$MANIFEST_FILE',
  'Phase1 skeleton apply batch created by shell runner.',
  jsonb_build_object('run_ts', '$RUN_TS')
)
RETURNING apply_batch_id;
SQL
  )"

  echo "BATCH_ID      : $BATCH_ID"
  echo "PENDING_COUNT : $PENDING_COUNT"

  if [ -z "$BATCH_ID" ]; then
    echo "ERROR: BATCH_ID is empty"
    exit 1
  fi

  if [ "$PENDING_COUNT" -eq 0 ]; then
    psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
UPDATE cx22073jw.phase1_skeleton_apply_batch
   SET batch_status = 'done',
       ended_at = NOW(),
       updated_at = NOW(),
       note_text = 'No generated/reviewed rows pending apply.'
 WHERE apply_batch_id = '$BATCH_ID';
SQL
    echo "No pending generated rows. Batch closed."
    exit 0
  fi

  psql "$PERSONA_DATABASE_URL" -At -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$MANIFEST_FILE"
SELECT
  ogr.generation_registry_id,
  car.area_slug,
  ogr.target_table_name,
  ogr.target_view_name,
  replace(encode(convert_to(ogr.ddl_sql, 'UTF8'), 'base64'), E'\n', '') AS ddl_b64
FROM cx22073jw.official_prepare_generation_registry ogr
JOIN cx22073jw.official_prepare_queue_item opqi
  ON opqi.prepare_queue_item_id = ogr.prepare_queue_item_id
JOIN cx22073jw.official_prepare_queue_master opqm
  ON opqm.prepare_queue_id = opqi.prepare_queue_id
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = ogr.candidate_area_id
WHERE opqm.queue_code = 'phase1_candidate_prepare_queue'
  AND opqi.is_active = true
  AND ogr.generation_status IN ('generated','reviewed')
ORDER BY
  CASE car.priority_code
    WHEN 'highest' THEN 10
    WHEN 'high' THEN 20
    WHEN 'medium-high' THEN 30
    WHEN 'medium' THEN 40
    WHEN 'conditional' THEN 50
    ELSE 90
  END,
  car.area_slug;
SQL

  APPLIED_COUNT=0
  FAILED_COUNT=0

  while IFS=$'\t' read -r GENERATION_REGISTRY_ID AREA_SLUG TARGET_TABLE_NAME TARGET_VIEW_NAME DDL_B64; do
    [ -n "${GENERATION_REGISTRY_ID:-}" ] || continue

    SQL_FILE="$TMP_DIR/${AREA_SLUG}.sql"

    printf '%s' "$DDL_B64" | base64 -d > "$SQL_FILE"

    echo "------------------------------------------------------------"
    echo "APPLYING: $AREA_SLUG"
    echo "TABLE   : $TARGET_TABLE_NAME"
    echo "VIEW    : $TARGET_VIEW_NAME"
    echo "SQLFILE : $SQL_FILE"
    echo "------------------------------------------------------------"

    if psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE" >> "$LOG_FILE" 2>&1; then
      APPLIED_COUNT=$((APPLIED_COUNT + 1))

      psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
UPDATE cx22073jw.official_prepare_generation_registry
   SET generation_status = 'applied',
       generation_note = 'Skeleton DDL applied by phase1 runner batch $BATCH_CODE',
       updated_at = NOW()
 WHERE generation_registry_id = '$GENERATION_REGISTRY_ID';

INSERT INTO cx22073jw.official_prepare_generation_registry_log (
  generation_registry_id,
  action_code,
  from_status,
  to_status,
  log_note,
  actor_name
)
VALUES (
  '$GENERATION_REGISTRY_ID',
  'applied',
  'generated',
  'applied',
  'Skeleton DDL applied by shell runner.',
  'Zero'
);

INSERT INTO cx22073jw.phase1_skeleton_apply_item_log (
  apply_batch_id,
  generation_registry_id,
  area_slug,
  target_table_name,
  target_view_name,
  apply_status,
  sql_file_path,
  message_text
)
VALUES (
  '$BATCH_ID',
  '$GENERATION_REGISTRY_ID',
  '$AREA_SLUG',
  '$TARGET_TABLE_NAME',
  '$TARGET_VIEW_NAME',
  'applied',
  '$SQL_FILE',
  'Applied successfully.'
);
SQL
    else
      FAILED_COUNT=$((FAILED_COUNT + 1))

      psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.phase1_skeleton_apply_item_log (
  apply_batch_id,
  generation_registry_id,
  area_slug,
  target_table_name,
  target_view_name,
  apply_status,
  sql_file_path,
  message_text
)
VALUES (
  '$BATCH_ID',
  '$GENERATION_REGISTRY_ID',
  '$AREA_SLUG',
  '$TARGET_TABLE_NAME',
  '$TARGET_VIEW_NAME',
  'failed',
  '$SQL_FILE',
  'Apply failed. See shell log file.'
);

UPDATE cx22073jw.phase1_skeleton_apply_batch
   SET batch_status = 'failed',
       applied_count = $APPLIED_COUNT,
       failed_count = $FAILED_COUNT,
       ended_at = NOW(),
       updated_at = NOW(),
       note_text = 'Batch stopped on first failure.'
 WHERE apply_batch_id = '$BATCH_ID';
SQL

      echo "FAILED: $AREA_SLUG"
      echo "See log: $LOG_FILE"
      exit 1
    fi
  done < "$MANIFEST_FILE"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
UPDATE cx22073jw.phase1_skeleton_apply_batch
   SET batch_status = 'done',
       applied_count = $APPLIED_COUNT,
       failed_count = $FAILED_COUNT,
       ended_at = NOW(),
       updated_at = NOW(),
       note_text = 'Phase1 skeleton apply batch completed successfully.'
 WHERE apply_batch_id = '$BATCH_ID';
SQL

  echo "============================================================"
  echo "PHASE1 SKELETON APPLY RUNNER DONE"
  echo "BATCH_CODE    : $BATCH_CODE"
  echo "APPLIED_COUNT : $APPLIED_COUNT"
  echo "FAILED_COUNT  : $FAILED_COUNT"
  echo "MANIFEST_FILE : $MANIFEST_FILE"
  echo "LOG_FILE      : $LOG_FILE"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '============================================================'
\echo 'LATEST BATCH SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_phase1_skeleton_apply_batch_summary;

\echo '============================================================'
\echo 'TARGET STATUS SUMMARY'
\echo '============================================================'
SELECT
  COUNT(*) AS total_targets,
  COUNT(*) FILTER (WHERE generation_status = 'applied') AS applied_targets,
  COUNT(*) FILTER (WHERE table_exists) AS table_exists_count,
  COUNT(*) FILTER (WHERE view_exists) AS view_exists_count
FROM cx22073jw.v_phase1_skeleton_apply_target_status;
SQL

} | tee "$LOG_FILE"
