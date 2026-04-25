#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
RUN_CODE="access_legacy_compat_audit_${RUN_TS}"
RUN_DIR="$LOGS_DIR/${RUN_TS}_access_legacy_compat_audit"
FILE_HITS_TSV="$RUN_DIR/010_file_hits.tsv"
DB_HITS_TSV="$RUN_DIR/020_db_hits.tsv"
SUMMARY_JSON="$RUN_DIR/030_summary.json"
LOG_FILE="$RUN_DIR/040_run.log"

mkdir -p "$RUN_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS LEGACY COMPAT AUDIT START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "run_code     : $RUN_CODE"
  echo "base         : $BASE"
  echo "run_dir      : $RUN_DIR"
  echo "============================================================"

  echo "============================================================"
  echo "PHASE 1: CREATE AUDIT OBJECTS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

CREATE TABLE IF NOT EXISTS cx22073jw.access_legacy_compat_audit_run (
  legacy_compat_audit_run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                   text NOT NULL UNIQUE,
  base_path                  text NOT NULL,
  db_hit_count               integer NOT NULL DEFAULT 0,
  file_hit_count             integer NOT NULL DEFAULT 0,
  db_view_hit_count          integer NOT NULL DEFAULT 0,
  db_function_hit_count      integer NOT NULL DEFAULT 0,
  run_status                 text NOT NULL CHECK (run_status IN ('running','pass','partial','error')),
  actor_name                 text NOT NULL DEFAULT 'Zero',
  note_text                  text,
  created_at                 timestamptz NOT NULL DEFAULT NOW(),
  updated_at                 timestamptz NOT NULL DEFAULT NOW(),
  ended_at                   timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_legacy_compat_audit_db_item (
  legacy_compat_audit_db_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_compat_audit_run_id     uuid NOT NULL REFERENCES cx22073jw.access_legacy_compat_audit_run(legacy_compat_audit_run_id) ON DELETE CASCADE,
  object_group                   text NOT NULL CHECK (object_group IN ('view','function')),
  object_schema                  text NOT NULL,
  object_name                    text NOT NULL,
  referenced_legacy_name         text NOT NULL,
  created_at                     timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_legacy_compat_audit_file_item (
  legacy_compat_audit_file_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_compat_audit_run_id       uuid NOT NULL REFERENCES cx22073jw.access_legacy_compat_audit_run(legacy_compat_audit_run_id) ON DELETE CASCADE,
  file_path                        text NOT NULL,
  line_no                          integer NOT NULL,
  matched_text                     text NOT NULL,
  created_at                       timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_access_legacy_compat_audit_run_created
  ON cx22073jw.access_legacy_compat_audit_run (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_legacy_compat_audit_db_item_run
  ON cx22073jw.access_legacy_compat_audit_db_item (legacy_compat_audit_run_id, object_group, object_name);

CREATE INDEX IF NOT EXISTS ix_access_legacy_compat_audit_file_item_run
  ON cx22073jw.access_legacy_compat_audit_file_item (legacy_compat_audit_run_id, file_path, line_no);

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
      WHERE tg.tgname = 'trg_access_legacy_compat_audit_run_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_legacy_compat_audit_run'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_legacy_compat_audit_run_updated_at
        BEFORE UPDATE ON cx22073jw.access_legacy_compat_audit_run
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_legacy_compat_audit_latest_summary AS
SELECT
  run_code,
  base_path,
  db_hit_count,
  file_hit_count,
  db_view_hit_count,
  db_function_hit_count,
  run_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_compat_audit_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_legacy_compat_audit_latest_db_items AS
SELECT
  r.run_code,
  i.object_group,
  i.object_schema,
  i.object_name,
  i.referenced_legacy_name,
  i.created_at
FROM cx22073jw.access_legacy_compat_audit_db_item i
JOIN cx22073jw.access_legacy_compat_audit_run r
  ON r.legacy_compat_audit_run_id = i.legacy_compat_audit_run_id
WHERE r.legacy_compat_audit_run_id = (
  SELECT legacy_compat_audit_run_id
  FROM cx22073jw.access_legacy_compat_audit_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.object_group, i.object_name, i.referenced_legacy_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_legacy_compat_audit_latest_file_items AS
SELECT
  r.run_code,
  i.file_path,
  i.line_no,
  i.matched_text,
  i.created_at
FROM cx22073jw.access_legacy_compat_audit_file_item i
JOIN cx22073jw.access_legacy_compat_audit_run r
  ON r.legacy_compat_audit_run_id = i.legacy_compat_audit_run_id
WHERE r.legacy_compat_audit_run_id = (
  SELECT legacy_compat_audit_run_id
  FROM cx22073jw.access_legacy_compat_audit_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.file_path, i.line_no;

COMMIT;
SQL

  echo "============================================================"
  echo "PHASE 2: CREATE RUN"
  echo "============================================================"

  AUDIT_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.access_legacy_compat_audit_run (
  run_code,
  base_path,
  run_status,
  actor_name,
  note_text
)
VALUES (
  '$RUN_CODE',
  '$BASE',
  'running',
  'Zero',
  'Audit remaining legacy v_access_* compatibility dependencies.'
)
RETURNING legacy_compat_audit_run_id;
SQL
  )"

  if [ -z "${AUDIT_RUN_ID:-}" ]; then
    echo "ERROR: audit run was not created"
    exit 1
  fi

  echo "AUDIT_RUN_ID=$AUDIT_RUN_ID"

  echo "============================================================"
  echo "PHASE 3: DB HIT COLLECTION"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$DB_HITS_TSV"
WITH view_hits AS (
  SELECT
    'view' AS object_group,
    v.table_schema AS object_schema,
    v.table_name AS object_name,
    (regexp_matches(v.view_definition, '(v_access_[a-z0-9_]+)', 'g'))[1] AS referenced_legacy_name
  FROM information_schema.views v
  WHERE v.table_schema = 'cx22073jw'
    AND v.table_name NOT LIKE 'v_access_%'
    AND v.view_definition ~ 'v_access_[a-z0-9_]+'
),
function_hits AS (
  SELECT
    'function' AS object_group,
    n.nspname AS object_schema,
    p.proname AS object_name,
    (regexp_matches(pg_get_functiondef(p.oid), '(v_access_[a-z0-9_]+)', 'g'))[1] AS referenced_legacy_name
  FROM pg_proc p
  JOIN pg_namespace n
    ON n.oid = p.pronamespace
  WHERE n.nspname = 'cx22073jw'
    AND pg_get_functiondef(p.oid) ~ 'v_access_[a-z0-9_]+'
)
SELECT *
FROM (
  SELECT * FROM view_hits
  UNION ALL
  SELECT * FROM function_hits
) s
ORDER BY object_group, object_name, referenced_legacy_name;
SQL

  sed -n '1,200p' "$DB_HITS_TSV" || true

  if [ -s "$DB_HITS_TSV" ]; then
    while IFS=$'\t' read -r object_group object_schema object_name referenced_legacy_name; do
      [ -n "${object_group:-}" ] || continue
      [ "$object_group" = "view" ] || [ "$object_group" = "function" ] || continue

      esc_schema="$(printf "%s" "$object_schema" | sed "s/'/''/g")"
      esc_name="$(printf "%s" "$object_name" | sed "s/'/''/g")"
      esc_ref="$(printf "%s" "$referenced_legacy_name" | sed "s/'/''/g")"

      psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.access_legacy_compat_audit_db_item (
  legacy_compat_audit_run_id,
  object_group,
  object_schema,
  object_name,
  referenced_legacy_name
)
VALUES (
  '$AUDIT_RUN_ID',
  '$object_group',
  '$esc_schema',
  '$esc_name',
  '$esc_ref'
);
SQL
    done < "$DB_HITS_TSV"
  fi

  echo "============================================================"
  echo "PHASE 4: FILE HIT COLLECTION"
  echo "============================================================"

  find "$BASE" -type f \
    \( -name '*.sh' -o -name '*.sql' -o -name '*.md' -o -name '*.txt' -o -name '*.tsv' -o -name '*.json' -o -name '*.yaml' -o -name '*.yml' \) \
    ! -path "$BASE/logs/*" \
    ! -path "$BASE/exports/*" \
    ! -path "$BASE/.git/*" \
    -print0 |
  while IFS= read -r -d '' f; do
    grep -nE '\bv_access_[A-Za-z0-9_]*\b' "$f" || true
  done | awk -F: -v OFS='\t' '
    NF >= 3 {
      file=$1
      line=$2
      text=$0
      sub(/^[^:]*:[0-9]*:/,"",text)
      print file, line, text
    }
  ' > "$FILE_HITS_TSV"

  sed -n '1,200p' "$FILE_HITS_TSV" || true

  if [ -s "$FILE_HITS_TSV" ]; then
    while IFS=$'\t' read -r file_path line_no matched_text; do
      [ -n "${file_path:-}" ] || continue
      esc_text="$(printf "%s" "$matched_text" | sed "s/'/''/g")"
      esc_path="$(printf "%s" "$file_path" | sed "s/'/''/g")"
      psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.access_legacy_compat_audit_file_item (
  legacy_compat_audit_run_id,
  file_path,
  line_no,
  matched_text
)
VALUES (
  '$AUDIT_RUN_ID',
  '$esc_path',
  $line_no,
  '$esc_text'
);
SQL
    done < "$FILE_HITS_TSV"
  fi

  DB_HIT_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT COUNT(*)
FROM cx22073jw.access_legacy_compat_audit_db_item
WHERE legacy_compat_audit_run_id = '$AUDIT_RUN_ID';
SQL
  )"

  FILE_HIT_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT COUNT(*)
FROM cx22073jw.access_legacy_compat_audit_file_item
WHERE legacy_compat_audit_run_id = '$AUDIT_RUN_ID';
SQL
  )"

  DB_VIEW_HIT_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT COUNT(*)
FROM cx22073jw.access_legacy_compat_audit_db_item
WHERE legacy_compat_audit_run_id = '$AUDIT_RUN_ID'
  AND object_group = 'view';
SQL
  )"

  DB_FUNCTION_HIT_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT COUNT(*)
FROM cx22073jw.access_legacy_compat_audit_db_item
WHERE legacy_compat_audit_run_id = '$AUDIT_RUN_ID'
  AND object_group = 'function';
SQL
  )"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
UPDATE cx22073jw.access_legacy_compat_audit_run
   SET db_hit_count          = $DB_HIT_COUNT,
       file_hit_count        = $FILE_HIT_COUNT,
       db_view_hit_count     = $DB_VIEW_HIT_COUNT,
       db_function_hit_count = $DB_FUNCTION_HIT_COUNT,
       run_status            = CASE
                                 WHEN ($DB_HIT_COUNT + $FILE_HIT_COUNT) = 0 THEN 'pass'
                                 ELSE 'partial'
                               END,
       ended_at              = NOW(),
       updated_at            = NOW()
 WHERE legacy_compat_audit_run_id = '$AUDIT_RUN_ID';
SQL

  cat > "$SUMMARY_JSON" <<EOF
{
  "run_code": "$RUN_CODE",
  "base_path": "$BASE",
  "db_hit_count": $DB_HIT_COUNT,
  "file_hit_count": $FILE_HIT_COUNT,
  "db_view_hit_count": $DB_VIEW_HIT_COUNT,
  "db_function_hit_count": $DB_FUNCTION_HIT_COUNT
}
EOF

  echo "============================================================"
  echo "VERIFY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_legacy_compat_audit_latest_summary;

SELECT
  object_group,
  COUNT(*) AS hit_count
FROM cx22073jw.v_access_legacy_compat_audit_latest_db_items
GROUP BY object_group
ORDER BY object_group;

SELECT COUNT(*) AS file_hit_count
FROM cx22073jw.v_access_legacy_compat_audit_latest_file_items;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS LEGACY COMPAT AUDIT DONE"
  echo "db_hits     : $DB_HITS_TSV"
  echo "file_hits   : $FILE_HITS_TSV"
  echo "summary_json: $SUMMARY_JSON"
  echo "log_file    : $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
