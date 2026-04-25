#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
SCRIPTS_DIR="$BASE/scripts"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
RUN_CODE="access_legacy_db_blocker_patch_${RUN_TS}"
RUN_DIR="$LOGS_DIR/${RUN_TS}_access_legacy_db_blocker_patch"

BACKUP_VIEWS_SQL="$RUN_DIR/010_backup_views.sql"
BACKUP_FUNCTIONS_SQL="$RUN_DIR/020_backup_functions.sql"
PATCHED_VIEWS_SQL="$RUN_DIR/030_patched_views.sql"
PATCHED_FUNCTIONS_SQL="$RUN_DIR/040_patched_functions.sql"
REFRESH_DB_BLOCKERS_TSV="$RUN_DIR/050_refresh_db_blockers.tsv"
REFRESH_GATE_SUMMARY_JSON="$RUN_DIR/060_refresh_gate_summary.json"
LOG_FILE="$RUN_DIR/070_run.log"

AUDIT_APPLY="$SCRIPTS_DIR/078_apply_cx22073jw_access_legacy_compat_audit.sh"
GATE_APPLY="$SCRIPTS_DIR/080_apply_cx22073jw_access_legacy_cutover_readiness_gate.sh"

mkdir -p "$RUN_DIR"

{
  echo "============================================================"
  echo "ACCESS LEGACY DB BLOCKER PATCH / GATE REFRESH START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "run_code     : $RUN_CODE"
  echo "run_dir      : $RUN_DIR"
  echo "============================================================"

  if [ ! -x "$AUDIT_APPLY" ]; then
    echo "ERROR: missing audit apply script -> $AUDIT_APPLY"
    exit 1
  fi

  if [ ! -x "$GATE_APPLY" ]; then
    echo "ERROR: missing gate apply script -> $GATE_APPLY"
    exit 1
  fi

  echo "============================================================"
  echo "PHASE 1: CREATE PATCH REGISTRY"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

CREATE TABLE IF NOT EXISTS cx22073jw.access_legacy_db_blocker_patch_run (
  legacy_db_blocker_patch_run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                       text NOT NULL UNIQUE,
  target_view_count              integer NOT NULL DEFAULT 0,
  target_function_count          integer NOT NULL DEFAULT 0,
  patched_view_count             integer NOT NULL DEFAULT 0,
  patched_function_count         integer NOT NULL DEFAULT 0,
  error_count                    integer NOT NULL DEFAULT 0,
  run_status                     text NOT NULL CHECK (run_status IN ('running','pass','partial','error')),
  actor_name                     text NOT NULL DEFAULT 'Zero',
  note_text                      text,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  updated_at                     timestamptz NOT NULL DEFAULT NOW(),
  ended_at                       timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_legacy_db_blocker_patch_item (
  legacy_db_blocker_patch_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_db_blocker_patch_run_id  uuid NOT NULL REFERENCES cx22073jw.access_legacy_db_blocker_patch_run(legacy_db_blocker_patch_run_id) ON DELETE CASCADE,
  object_group                    text NOT NULL CHECK (object_group IN ('view','function')),
  object_schema                   text NOT NULL,
  object_name                     text NOT NULL,
  object_identity                 text NOT NULL,
  patch_status                    text NOT NULL CHECK (patch_status IN ('patched','skipped','error')),
  error_text                      text,
  created_at                      timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_access_legacy_db_blocker_patch_run_created
  ON cx22073jw.access_legacy_db_blocker_patch_run (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_legacy_db_blocker_patch_item_run
  ON cx22073jw.access_legacy_db_blocker_patch_item (legacy_db_blocker_patch_run_id, object_group, patch_status);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'cx22073jw'
      AND p.proname = 'fn_set_updated_at'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_legacy_db_blocker_patch_run_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_legacy_db_blocker_patch_run'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_legacy_db_blocker_patch_run_updated_at
        BEFORE UPDATE ON cx22073jw.access_legacy_db_blocker_patch_run
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_legacy_db_blocker_patch_latest_summary AS
SELECT
  run_code,
  target_view_count,
  target_function_count,
  patched_view_count,
  patched_function_count,
  error_count,
  run_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_db_blocker_patch_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_legacy_db_blocker_patch_latest_items AS
SELECT
  r.run_code,
  i.object_group,
  i.object_schema,
  i.object_name,
  i.object_identity,
  i.patch_status,
  i.error_text,
  i.created_at
FROM cx22073jw.access_legacy_db_blocker_patch_item i
JOIN cx22073jw.access_legacy_db_blocker_patch_run r
  ON r.legacy_db_blocker_patch_run_id = i.legacy_db_blocker_patch_run_id
WHERE r.legacy_db_blocker_patch_run_id = (
  SELECT legacy_db_blocker_patch_run_id
  FROM cx22073jw.access_legacy_db_blocker_patch_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.object_group, i.object_identity;

COMMIT;
SQL

  PATCH_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.access_legacy_db_blocker_patch_run (
  run_code,
  run_status,
  actor_name,
  note_text
)
VALUES (
  '$RUN_CODE',
  'running',
  'Zero',
  'Patch DB-side legacy compat blockers from v_access_* to v_access_*.'
)
RETURNING legacy_db_blocker_patch_run_id;
SQL
  )"

  if [ -z "${PATCH_RUN_ID:-}" ]; then
    echo "ERROR: patch run was not created"
    exit 1
  fi

  echo "PATCH_RUN_ID=$PATCH_RUN_ID"

  echo "============================================================"
  echo "PHASE 2: EXPORT BACKUP SQL"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' > "$BACKUP_VIEWS_SQL"
SELECT
  '-- ' || table_schema || '.' || table_name || E'\n'
  || 'CREATE OR REPLACE VIEW '
  || quote_ident(table_schema) || '.'
  || quote_ident(table_name) || ' AS '
  || pg_get_viewdef((quote_ident(table_schema) || '.' || quote_ident(table_name))::regclass, true)
  || E';\n'
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name NOT LIKE 'v_access_%'
  AND view_definition ~ 'v_access_[a-z0-9_]+'
ORDER BY table_name;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' > "$BACKUP_FUNCTIONS_SQL"
SELECT
  '-- ' || n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' || E'\n'
  || pg_get_functiondef(p.oid) || E'\n'
FROM pg_proc p
JOIN pg_namespace n
  ON n.oid = p.pronamespace
WHERE n.nspname = 'cx22073jw'
  AND pg_get_functiondef(p.oid) ~ 'v_access_[a-z0-9_]+'
ORDER BY p.proname, pg_get_function_identity_arguments(p.oid);
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' > "$PATCHED_VIEWS_SQL"
SELECT
  '-- ' || table_schema || '.' || table_name || E'\n'
  || 'CREATE OR REPLACE VIEW '
  || quote_ident(table_schema) || '.'
  || quote_ident(table_name) || ' AS '
  || replace(
       pg_get_viewdef((quote_ident(table_schema) || '.' || quote_ident(table_name))::regclass, true),
       'v_access_',
       'v_access_'
     )
  || E';\n'
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name NOT LIKE 'v_access_%'
  AND view_definition ~ 'v_access_[a-z0-9_]+'
ORDER BY table_name;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' > "$PATCHED_FUNCTIONS_SQL"
SELECT
  '-- ' || n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' || E'\n'
  || replace(
       pg_get_functiondef(p.oid),
       'v_access_',
       'v_access_'
     ) || E'\n'
FROM pg_proc p
JOIN pg_namespace n
  ON n.oid = p.pronamespace
WHERE n.nspname = 'cx22073jw'
  AND pg_get_functiondef(p.oid) ~ 'v_access_[a-z0-9_]+'
ORDER BY p.proname, pg_get_function_identity_arguments(p.oid);
SQL

  echo "============================================================"
  echo "PHASE 3: APPLY DB PATCH"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
DO \$\$
DECLARE
  v_run_id uuid := '$PATCH_RUN_ID';
  v_target_views integer := 0;
  v_target_functions integer := 0;
  v_patched_views integer := 0;
  v_patched_functions integer := 0;
  v_errors integer := 0;
  r record;
  v_sql text;
BEGIN
  FOR r IN
    SELECT
      table_schema,
      table_name
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name NOT LIKE 'v_access_%'
      AND view_definition ~ 'v_access_[a-z0-9_]+'
    ORDER BY table_name
  LOOP
    v_target_views := v_target_views + 1;
    BEGIN
      v_sql := 'CREATE OR REPLACE VIEW '
            || quote_ident(r.table_schema) || '.'
            || quote_ident(r.table_name) || ' AS '
            || replace(
                 pg_get_viewdef((quote_ident(r.table_schema) || '.' || quote_ident(r.table_name))::regclass, true),
                 'v_access_',
                 'v_access_'
               );

      EXECUTE v_sql;

      INSERT INTO cx22073jw.access_legacy_db_blocker_patch_item (
        legacy_db_blocker_patch_run_id,
        object_group,
        object_schema,
        object_name,
        object_identity,
        patch_status,
        error_text
      )
      VALUES (
        v_run_id,
        'view',
        r.table_schema,
        r.table_name,
        r.table_schema || '.' || r.table_name,
        'patched',
        NULL
      );

      v_patched_views := v_patched_views + 1;
    EXCEPTION
      WHEN OTHERS THEN
        INSERT INTO cx22073jw.access_legacy_db_blocker_patch_item (
          legacy_db_blocker_patch_run_id,
          object_group,
          object_schema,
          object_name,
          object_identity,
          patch_status,
          error_text
        )
        VALUES (
          v_run_id,
          'view',
          r.table_schema,
          r.table_name,
          r.table_schema || '.' || r.table_name,
          'error',
          SQLERRM
        );
        v_errors := v_errors + 1;
    END;
  END LOOP;

  FOR r IN
    SELECT
      n.nspname AS function_schema,
      p.proname AS function_name,
      p.oid AS function_oid,
      pg_get_function_identity_arguments(p.oid) AS identity_args
    FROM pg_proc p
    JOIN pg_namespace n
      ON n.oid = p.pronamespace
    WHERE n.nspname = 'cx22073jw'
      AND pg_get_functiondef(p.oid) ~ 'v_access_[a-z0-9_]+'
    ORDER BY p.proname, pg_get_function_identity_arguments(p.oid)
  LOOP
    v_target_functions := v_target_functions + 1;
    BEGIN
      v_sql := replace(
                 pg_get_functiondef(r.function_oid),
                 'v_access_',
                 'v_access_'
               );

      EXECUTE v_sql;

      INSERT INTO cx22073jw.access_legacy_db_blocker_patch_item (
        legacy_db_blocker_patch_run_id,
        object_group,
        object_schema,
        object_name,
        object_identity,
        patch_status,
        error_text
      )
      VALUES (
        v_run_id,
        'function',
        r.function_schema,
        r.function_name,
        r.function_schema || '.' || r.function_name || '(' || r.identity_args || ')',
        'patched',
        NULL
      );

      v_patched_functions := v_patched_functions + 1;
    EXCEPTION
      WHEN OTHERS THEN
        INSERT INTO cx22073jw.access_legacy_db_blocker_patch_item (
          legacy_db_blocker_patch_run_id,
          object_group,
          object_schema,
          object_name,
          object_identity,
          patch_status,
          error_text
        )
        VALUES (
          v_run_id,
          'function',
          r.function_schema,
          r.function_name,
          r.function_schema || '.' || r.function_name || '(' || r.identity_args || ')',
          'error',
          SQLERRM
        );
        v_errors := v_errors + 1;
    END;
  END LOOP;

  UPDATE cx22073jw.access_legacy_db_blocker_patch_run
     SET target_view_count      = v_target_views,
         target_function_count  = v_target_functions,
         patched_view_count     = v_patched_views,
         patched_function_count = v_patched_functions,
         error_count            = v_errors,
         run_status             = CASE
                                    WHEN (v_target_views + v_target_functions) = 0 THEN 'pass'
                                    WHEN v_errors = 0 THEN 'pass'
                                    WHEN (v_patched_views + v_patched_functions) > 0 THEN 'partial'
                                    ELSE 'error'
                                  END,
         ended_at               = NOW(),
         updated_at             = NOW()
   WHERE legacy_db_blocker_patch_run_id = v_run_id;
END
\$\$;
SQL

  echo "============================================================"
  echo "PHASE 4: RERUN LEGACY COMPAT AUDIT"
  echo "============================================================"
  "$AUDIT_APPLY"

  echo "============================================================"
  echo "PHASE 5: RERUN CUTOVER GATE"
  echo "============================================================"
  "$GATE_APPLY"

  echo "============================================================"
  echo "PHASE 6: EXPORT REFRESHED DB BLOCKERS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$REFRESH_DB_BLOCKERS_TSV"
SELECT
  blocker_group,
  blocker_identity,
  blocker_detail
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
WHERE blocker_group IN ('db_view','db_function')
ORDER BY blocker_group, blocker_identity, blocker_detail;
SQL

  GATE_RUN_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT run_code
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  READINESS_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT readiness_status
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  DB_HIT_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT db_hit_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  FILE_HIT_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT file_hit_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  BLOCKER_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT blocker_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  PATCHED_VIEW_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | head -n 1
SELECT patched_view_count
FROM cx22073jw.v_access_legacy_db_blocker_patch_latest_summary
LIMIT 1;
SQL
  )"

  PATCHED_FUNCTION_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | head -n 1
SELECT patched_function_count
FROM cx22073jw.v_access_legacy_db_blocker_patch_latest_summary
LIMIT 1;
SQL
  )"

  ERROR_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | head -n 1
SELECT error_count
FROM cx22073jw.v_access_legacy_db_blocker_patch_latest_summary
LIMIT 1;
SQL
  )"

  cat > "$REFRESH_GATE_SUMMARY_JSON" <<EOF
{
  "gate_run_code": "$GATE_RUN_CODE",
  "readiness_status": "$READINESS_STATUS",
  "db_hit_count": $DB_HIT_COUNT,
  "file_hit_count": $FILE_HIT_COUNT,
  "blocker_count": $BLOCKER_COUNT,
  "patched_view_count": $PATCHED_VIEW_COUNT,
  "patched_function_count": $PATCHED_FUNCTION_COUNT,
  "error_count": $ERROR_COUNT
}
EOF

  echo "============================================================"
  echo "FINAL VERIFY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_legacy_db_blocker_patch_latest_summary;

SELECT
  object_group,
  patch_status,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_legacy_db_blocker_patch_latest_items
GROUP BY object_group, patch_status
ORDER BY object_group, patch_status;

TABLE cx22073jw.v_access_legacy_cutover_gate_latest_summary;

SELECT
  blocker_group,
  COUNT(*) AS blocker_count
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
GROUP BY blocker_group
ORDER BY blocker_group;
SQL

  echo "============================================================"
  echo "ACCESS LEGACY DB BLOCKER PATCH / GATE REFRESH DONE"
  echo "backup_views      : $BACKUP_VIEWS_SQL"
  echo "backup_functions  : $BACKUP_FUNCTIONS_SQL"
  echo "patched_views_sql : $PATCHED_VIEWS_SQL"
  echo "patched_funcs_sql : $PATCHED_FUNCTIONS_SQL"
  echo "db_blockers       : $REFRESH_DB_BLOCKERS_TSV"
  echo "gate_summary      : $REFRESH_GATE_SUMMARY_JSON"
  echo "log_file          : $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
