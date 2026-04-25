#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_BASE="$BASE/exports/ai-employee-grants"

RUN_TS="$(date +%Y%m%d_%H%M%S)"
GRANT_RUN_CODE="access_grant_export_${RUN_TS}"
SMOKE_RUN_CODE="access_stub_smoke_${RUN_TS}"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_grant_export_and_stub_smoke.log"

EXPORT_ROOT="$EXPORTS_BASE/$RUN_TS"
ROLE_DIR="$EXPORT_ROOT/roles"
DOMAIN_DIR="$EXPORT_ROOT/domains"

MANIFEST_MD="$EXPORT_ROOT/000_manifest.md"
ROLE_MATRIX_TSV="$EXPORT_ROOT/010_role_actual_view_matrix.tsv"
DOMAIN_SUMMARY_TSV="$EXPORT_ROOT/020_domain_summary.tsv"
GATE_CONTROLLED_TSV="$EXPORT_ROOT/030_gate_controlled_views.tsv"
EXPORT_SUMMARY_JSON="$EXPORT_ROOT/040_export_summary.json"

mkdir -p "$LOGS_DIR" "$EXPORT_ROOT" "$ROLE_DIR" "$DOMAIN_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS GRANT EXPORT AND STUB SMOKE START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "grant_run    : $GRANT_RUN_CODE"
  echo "smoke_run    : $SMOKE_RUN_CODE"
  echo "export_root  : $EXPORT_ROOT"
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
    RAISE EXCEPTION 'v_access_role_actual_view_grant_matrix is required before grant export';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_access_gate_controlled_actual_views'
  ) THEN
    RAISE EXCEPTION 'v_access_gate_controlled_actual_views is required before grant export';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_access_stub_view_runtime_catalog'
  ) THEN
    RAISE EXCEPTION 'v_access_stub_view_runtime_catalog is required before stub smoke';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_actual_view_registry'
  ) THEN
    RAISE EXCEPTION 'access_actual_view_registry is required before stub smoke';
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
      'access_grant_export_and_stub_smoke',
      'AI Employee Grant Export And Stub Smoke',
      'normal',
      'integration',
      'Grant export package and stub smoke runtime for AI employee views'
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

CREATE TABLE IF NOT EXISTS cx22073jw.access_grant_export_run (
  grant_export_run_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                      text NOT NULL UNIQUE,
  export_root_path              text NOT NULL,
  manifest_md_path              text,
  role_matrix_tsv_path          text,
  domain_summary_tsv_path       text,
  gate_controlled_tsv_path      text,
  export_summary_json_path      text,
  total_role_count              integer NOT NULL DEFAULT 0,
  total_domain_count            integer NOT NULL DEFAULT 0,
  total_actual_view_grant_count integer NOT NULL DEFAULT 0,
  total_sql_file_count          integer NOT NULL DEFAULT 0,
  run_status                    text NOT NULL CHECK (run_status IN ('running','pass','partial','error')),
  actor_name                    text NOT NULL DEFAULT 'Zero',
  note_text                     text,
  created_at                    timestamptz NOT NULL DEFAULT NOW(),
  updated_at                    timestamptz NOT NULL DEFAULT NOW(),
  ended_at                      timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_grant_export_item (
  grant_export_item_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_export_run_id           uuid NOT NULL REFERENCES cx22073jw.access_grant_export_run(grant_export_run_id) ON DELETE CASCADE,
  domain_code                   text NOT NULL,
  role_code                     text NOT NULL,
  actual_view_code              text NOT NULL,
  logical_view_name             text NOT NULL,
  suggested_db_role_name        text NOT NULL,
  grant_mode                    text NOT NULL CHECK (grant_mode IN ('required','conditional')),
  gate_needed                   boolean NOT NULL DEFAULT false,
  role_sql_file_path            text,
  domain_sql_file_path          text,
  created_at                    timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_stub_smoke_run (
  stub_smoke_run_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                      text NOT NULL UNIQUE,
  requested_view_count          integer NOT NULL DEFAULT 0,
  passed_view_count             integer NOT NULL DEFAULT 0,
  failed_view_count             integer NOT NULL DEFAULT 0,
  missing_view_count            integer NOT NULL DEFAULT 0,
  run_status                    text NOT NULL CHECK (run_status IN ('running','pass','partial','error')),
  actor_name                    text NOT NULL DEFAULT 'Zero',
  note_text                     text,
  created_at                    timestamptz NOT NULL DEFAULT NOW(),
  updated_at                    timestamptz NOT NULL DEFAULT NOW(),
  ended_at                      timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_stub_smoke_item (
  stub_smoke_item_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stub_smoke_run_id             uuid NOT NULL REFERENCES cx22073jw.access_stub_smoke_run(stub_smoke_run_id) ON DELETE CASCADE,
  actual_view_code              text NOT NULL,
  logical_view_name             text NOT NULL,
  domain_code                   text NOT NULL,
  view_family_code              text NOT NULL,
  smoke_status                  text NOT NULL CHECK (smoke_status IN ('pass','fail','missing')),
  column_count                  integer,
  row_count                     bigint,
  error_text                    text,
  created_at                    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_access_grant_export_run_created
  ON cx22073jw.access_grant_export_run (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_grant_export_item_run
  ON cx22073jw.access_grant_export_item (grant_export_run_id, domain_code, role_code);

CREATE INDEX IF NOT EXISTS ix_access_stub_smoke_run_created
  ON cx22073jw.access_stub_smoke_run (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_stub_smoke_item_run
  ON cx22073jw.access_stub_smoke_item (stub_smoke_run_id, smoke_status, domain_code);

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
      WHERE tg.tgname = 'trg_access_grant_export_run_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_grant_export_run'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_grant_export_run_updated_at
        BEFORE UPDATE ON cx22073jw.access_grant_export_run
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_stub_smoke_run_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_stub_smoke_run'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_stub_smoke_run_updated_at
        BEFORE UPDATE ON cx22073jw.access_stub_smoke_run
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION cx22073jw.fn_run_access_stub_smoke()
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_run_id uuid;
  v_run_code text := 'access_stub_smoke_' || to_char(NOW(), 'YYYYMMDD_HH24MISS');
  v_requested integer := 0;
  v_passed integer := 0;
  v_failed integer := 0;
  v_missing integer := 0;
  r record;
  v_col_count integer;
  v_row_count bigint;
BEGIN
  INSERT INTO cx22073jw.access_stub_smoke_run (
    run_code,
    run_status,
    actor_name,
    note_text
  )
  VALUES (
    v_run_code,
    'running',
    'Zero',
    'Running smoke test against AI employee stub views.'
  )
  RETURNING stub_smoke_run_id INTO v_run_id;

  FOR r IN
    SELECT
      avr.actual_view_code,
      avr.domain_code,
      avr.view_family_code,
      avr.logical_view_name,
      avr.intended_schema_name
    FROM cx22073jw.access_actual_view_registry avr
    ORDER BY avr.domain_code, avr.logical_view_name
  LOOP
    v_requested := v_requested + 1;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.views v
      WHERE v.table_schema = r.intended_schema_name
        AND v.table_name = r.logical_view_name
    ) THEN
      v_missing := v_missing + 1;

      INSERT INTO cx22073jw.access_stub_smoke_item (
        stub_smoke_run_id,
        actual_view_code,
        logical_view_name,
        domain_code,
        view_family_code,
        smoke_status,
        column_count,
        row_count,
        error_text
      )
      VALUES (
        v_run_id,
        r.actual_view_code,
        r.logical_view_name,
        r.domain_code,
        r.view_family_code,
        'missing',
        NULL,
        NULL,
        'view not found'
      );
    ELSE
      BEGIN
        SELECT COUNT(*)
          INTO v_col_count
        FROM information_schema.columns c
        WHERE c.table_schema = r.intended_schema_name
          AND c.table_name = r.logical_view_name;

        EXECUTE format(
          'SELECT COUNT(*)::bigint FROM %I.%I',
          r.intended_schema_name,
          r.logical_view_name
        )
        INTO v_row_count;

        IF v_col_count > 0 THEN
          v_passed := v_passed + 1;

          INSERT INTO cx22073jw.access_stub_smoke_item (
            stub_smoke_run_id,
            actual_view_code,
            logical_view_name,
            domain_code,
            view_family_code,
            smoke_status,
            column_count,
            row_count,
            error_text
          )
          VALUES (
            v_run_id,
            r.actual_view_code,
            r.logical_view_name,
            r.domain_code,
            r.view_family_code,
            'pass',
            v_col_count,
            v_row_count,
            NULL
          );
        ELSE
          v_failed := v_failed + 1;

          INSERT INTO cx22073jw.access_stub_smoke_item (
            stub_smoke_run_id,
            actual_view_code,
            logical_view_name,
            domain_code,
            view_family_code,
            smoke_status,
            column_count,
            row_count,
            error_text
          )
          VALUES (
            v_run_id,
            r.actual_view_code,
            r.logical_view_name,
            r.domain_code,
            r.view_family_code,
            'fail',
            v_col_count,
            v_row_count,
            'view exists but has no columns'
          );
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          v_failed := v_failed + 1;

          INSERT INTO cx22073jw.access_stub_smoke_item (
            stub_smoke_run_id,
            actual_view_code,
            logical_view_name,
            domain_code,
            view_family_code,
            smoke_status,
            column_count,
            row_count,
            error_text
          )
          VALUES (
            v_run_id,
            r.actual_view_code,
            r.logical_view_name,
            r.domain_code,
            r.view_family_code,
            'fail',
            NULL,
            NULL,
            SQLERRM
          );
      END;
    END IF;
  END LOOP;

  UPDATE cx22073jw.access_stub_smoke_run
     SET requested_view_count = v_requested,
         passed_view_count    = v_passed,
         failed_view_count    = v_failed,
         missing_view_count   = v_missing,
         run_status           = CASE
                                  WHEN v_requested = 0 THEN 'error'
                                  WHEN v_failed = 0 AND v_missing = 0 THEN 'pass'
                                  WHEN v_passed > 0 THEN 'partial'
                                  ELSE 'error'
                                END,
         note_text            = CASE
                                  WHEN v_requested = 0 THEN 'No actual views found.'
                                  WHEN v_failed = 0 AND v_missing = 0 THEN 'All registered views passed smoke.'
                                  ELSE 'Some views are missing or failed smoke.'
                                END,
         ended_at             = NOW(),
         updated_at           = NOW()
   WHERE stub_smoke_run_id = v_run_id;

  RETURN v_run_id;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_grant_export_latest_summary AS
SELECT
  run_code,
  export_root_path,
  total_role_count,
  total_domain_count,
  total_actual_view_grant_count,
  total_sql_file_count,
  run_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_grant_export_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_grant_export_latest_items AS
SELECT
  r.run_code,
  i.domain_code,
  i.role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.suggested_db_role_name,
  i.grant_mode,
  i.gate_needed,
  i.role_sql_file_path,
  i.domain_sql_file_path
FROM cx22073jw.access_grant_export_item i
JOIN cx22073jw.access_grant_export_run r
  ON r.grant_export_run_id = i.grant_export_run_id
WHERE r.grant_export_run_id = (
  SELECT grant_export_run_id
  FROM cx22073jw.access_grant_export_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.domain_code, i.role_code, i.logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_stub_smoke_latest_summary AS
SELECT
  run_code,
  requested_view_count,
  passed_view_count,
  failed_view_count,
  missing_view_count,
  run_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_stub_smoke_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_stub_smoke_latest_items AS
SELECT
  r.run_code,
  i.actual_view_code,
  i.logical_view_name,
  i.domain_code,
  i.view_family_code,
  i.smoke_status,
  i.column_count,
  i.row_count,
  i.error_text,
  i.created_at
FROM cx22073jw.access_stub_smoke_item i
JOIN cx22073jw.access_stub_smoke_run r
  ON r.stub_smoke_run_id = i.stub_smoke_run_id
WHERE r.stub_smoke_run_id = (
  SELECT stub_smoke_run_id
  FROM cx22073jw.access_stub_smoke_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.domain_code, i.logical_view_name;

COMMIT;
SQL

  GRANT_EXPORT_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.access_grant_export_run (
  run_code,
  export_root_path,
  run_status,
  actor_name,
  note_text
)
VALUES (
  '$GRANT_RUN_CODE',
  '$EXPORT_ROOT',
  'running',
  'Zero',
  'Exporting AI employee grant skeleton SQL and summary artifacts.'
)
RETURNING grant_export_run_id;
SQL
  )"

  echo "GRANT_EXPORT_RUN_ID=$GRANT_EXPORT_RUN_ID"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$ROLE_MATRIX_TSV"
SELECT
  domain_code,
  role_code,
  actual_view_code,
  logical_view_name,
  grant_mode,
  CASE WHEN gate_needed THEN 'true' ELSE 'false' END
FROM cx22073jw.v_access_role_actual_view_grant_matrix
ORDER BY domain_code, role_code, logical_view_name;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$DOMAIN_SUMMARY_TSV"
SELECT
  domain_code,
  COUNT(DISTINCT role_code) AS role_count,
  COUNT(DISTINCT actual_view_code) AS actual_view_count,
  COUNT(*) AS grant_count
FROM cx22073jw.v_access_role_actual_view_grant_matrix
GROUP BY domain_code
ORDER BY domain_code;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$GATE_CONTROLLED_TSV"
SELECT
  domain_code,
  view_family_code,
  actual_view_code,
  logical_view_name,
  sensitivity_code,
  exposure_scope
FROM cx22073jw.v_access_gate_controlled_actual_views
ORDER BY domain_code, logical_view_name;
SQL

  cat > "$MANIFEST_MD" <<EOF
# ============================================================
# ACCESS GRANT EXPORT MANIFEST
# ============================================================

grant_run_code: $GRANT_RUN_CODE
generated_at: $RUN_TS
export_root: $EXPORT_ROOT

files:
- 000_manifest.md
- 010_role_actual_view_matrix.tsv
- 020_domain_summary.tsv
- 030_gate_controlled_views.tsv
- 040_export_summary.json
- roles/*.sql
- domains/*.sql

notes:
- GRANT SQL in this package is upper-bound skeleton only
- runtime grants must still intersect rank, app scope, and gate
- gate-controlled views remain gate-controlled even if SELECT skeleton exists
EOF

  if [ -s "$ROLE_MATRIX_TSV" ]; then
    cut -f1 "$ROLE_MATRIX_TSV" | LC_ALL=C sort -u | while read -r DOMAIN_CODE; do
      [ -n "${DOMAIN_CODE:-}" ] || continue

      DOMAIN_FILE="$DOMAIN_DIR/${DOMAIN_CODE}.sql"

      cat > "$DOMAIN_FILE" <<EOF
-- ============================================================
-- ACCESS DOMAIN GRANT SKELETON
-- ============================================================
-- domain_code: $DOMAIN_CODE
-- generated_at: $RUN_TS
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

EOF

      awk -F'\t' -v domain="$DOMAIN_CODE" '
        $1 == domain {
          role=$2
          actual=$3
          logical=$4
          mode=$5
          gate=$6
          grantee="aiemp_role__" role
          print "-- ------------------------------------------------------------"
          print "-- role_code: " role
          print "-- actual_view_code: " actual
          print "-- grant_mode: " mode
          print "-- gate_needed: " gate
          print "GRANT SELECT ON cx22073jw." logical " TO " grantee ";"
          print ""
        }
      ' "$ROLE_MATRIX_TSV" >> "$DOMAIN_FILE"
    done

    cut -f2 "$ROLE_MATRIX_TSV" | LC_ALL=C sort -u | while read -r ROLE_CODE; do
      [ -n "${ROLE_CODE:-}" ] || continue

      ROLE_FILE="$ROLE_DIR/${ROLE_CODE}.sql"

      cat > "$ROLE_FILE" <<EOF
-- ============================================================
-- ACCESS ROLE GRANT SKELETON
-- ============================================================
-- role_code: $ROLE_CODE
-- suggested_db_role_name: aiemp_role__${ROLE_CODE}
-- generated_at: $RUN_TS
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

EOF

      awk -F'\t' -v role="$ROLE_CODE" '
        $2 == role {
          domain=$1
          actual=$3
          logical=$4
          mode=$5
          gate=$6
          grantee="aiemp_role__" role
          print "-- ------------------------------------------------------------"
          print "-- domain_code: " domain
          print "-- actual_view_code: " actual
          print "-- grant_mode: " mode
          print "-- gate_needed: " gate
          print "GRANT SELECT ON cx22073jw." logical " TO " grantee ";"
          print ""
        }
      ' "$ROLE_MATRIX_TSV" >> "$ROLE_FILE"
    done
  fi

  TOTAL_ROLE_COUNT="$(cut -f2 "$ROLE_MATRIX_TSV" | LC_ALL=C sort -u | grep -c . || true)"
  TOTAL_DOMAIN_COUNT="$(cut -f1 "$ROLE_MATRIX_TSV" | LC_ALL=C sort -u | grep -c . || true)"
  TOTAL_ACTUAL_VIEW_GRANT_COUNT="$(wc -l < "$ROLE_MATRIX_TSV" | tr -d '[:space:]')"
  TOTAL_SQL_FILE_COUNT="$(
    {
      find "$ROLE_DIR" -maxdepth 1 -type f -name '*.sql'
      find "$DOMAIN_DIR" -maxdepth 1 -type f -name '*.sql'
    } | wc -l | tr -d '[:space:]'
  )"

  cat > "$EXPORT_SUMMARY_JSON" <<EOF
{
  "grant_run_code": "$GRANT_RUN_CODE",
  "generated_at": "$RUN_TS",
  "export_root": "$EXPORT_ROOT",
  "total_role_count": $TOTAL_ROLE_COUNT,
  "total_domain_count": $TOTAL_DOMAIN_COUNT,
  "total_actual_view_grant_count": $TOTAL_ACTUAL_VIEW_GRANT_COUNT,
  "total_sql_file_count": $TOTAL_SQL_FILE_COUNT,
  "notes": [
    "upper-bound skeleton only",
    "intersect with rank, app scope, and gate before actual runtime grant",
    "gate-controlled views remain gate-controlled"
  ]
}
EOF

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.access_grant_export_item (
  grant_export_run_id,
  domain_code,
  role_code,
  actual_view_code,
  logical_view_name,
  suggested_db_role_name,
  grant_mode,
  gate_needed,
  role_sql_file_path,
  domain_sql_file_path
)
SELECT
  '$GRANT_EXPORT_RUN_ID',
  m.domain_code,
  m.role_code,
  m.actual_view_code,
  m.logical_view_name,
  'aiemp_role__' || m.role_code,
  m.grant_mode,
  m.gate_needed,
  '$ROLE_DIR/' || m.role_code || '.sql',
  '$DOMAIN_DIR/' || m.domain_code || '.sql'
FROM cx22073jw.v_access_role_actual_view_grant_matrix m;

UPDATE cx22073jw.access_grant_export_run
   SET manifest_md_path              = '$MANIFEST_MD',
       role_matrix_tsv_path          = '$ROLE_MATRIX_TSV',
       domain_summary_tsv_path       = '$DOMAIN_SUMMARY_TSV',
       gate_controlled_tsv_path      = '$GATE_CONTROLLED_TSV',
       export_summary_json_path      = '$EXPORT_SUMMARY_JSON',
       total_role_count              = $TOTAL_ROLE_COUNT,
       total_domain_count            = $TOTAL_DOMAIN_COUNT,
       total_actual_view_grant_count = $TOTAL_ACTUAL_VIEW_GRANT_COUNT,
       total_sql_file_count          = $TOTAL_SQL_FILE_COUNT,
       run_status                    = CASE
                                        WHEN $TOTAL_ACTUAL_VIEW_GRANT_COUNT > 0 THEN 'pass'
                                        ELSE 'error'
                                      END,
       note_text                     = CASE
                                        WHEN $TOTAL_ACTUAL_VIEW_GRANT_COUNT > 0 THEN 'Grant skeleton export completed.'
                                        ELSE 'No grant matrix rows found.'
                                      END,
       ended_at                      = NOW(),
       updated_at                    = NOW()
 WHERE grant_export_run_id = '$GRANT_EXPORT_RUN_ID';
SQL

  SMOKE_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | tr -d '[:space:]'
SELECT cx22073jw.fn_run_access_stub_smoke();
SQL
  )"

  echo "SMOKE_RUN_ID=$SMOKE_RUN_ID"

  echo "============================================================"
  echo "EXPORTED FILES"
  echo "============================================================"
  find "$EXPORT_ROOT" -maxdepth 2 -type f | LC_ALL=C sort

  echo "============================================================"
  echo "LATEST GRANT EXPORT SUMMARY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_grant_export_latest_summary;

SELECT
  domain_code,
  COUNT(*) AS grant_item_count
FROM cx22073jw.v_access_grant_export_latest_items
GROUP BY domain_code
ORDER BY domain_code;

TABLE cx22073jw.v_access_stub_smoke_latest_summary;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS GRANT EXPORT AND STUB SMOKE DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
