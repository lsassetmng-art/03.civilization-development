#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

RUN_TS="$(date +%Y%m%d_%H%M%S)"
PACKAGE_CODE="staticart_final_handoff_${RUN_TS}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_staticart_final_handoff_package_runner.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW STATICART FINAL HANDOFF PACKAGE RUNNER START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "package_code : $PACKAGE_CODE"
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
      AND table_name = 'v_staticart_handoff_export_batch_summary'
  ) THEN
    RAISE EXCEPTION 'v_staticart_handoff_export_batch_summary is required before final handoff package';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_staticart_delivery_closeout_summary'
  ) THEN
    RAISE EXCEPTION 'v_staticart_delivery_closeout_summary is required before final handoff package';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'staticart_final_handoff_package',
    'StaticArt Final Handoff Package',
    'normal',
    'integration',
    'Final package metadata and integrity artifacts for StaticArt handoff'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.staticart_final_handoff_package (
  final_package_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_code                text NOT NULL UNIQUE,
  export_code                 text NOT NULL,
  export_root_path            text NOT NULL,
  overall_status              text NOT NULL CHECK (overall_status IN ('pass','partial','blocked')),
  release_code                text,
  release_status              text,
  closeout_run_code           text,
  file_index_path             text,
  sha256_manifest_path        text,
  db_summary_json_path        text,
  package_manifest_json_path  text,
  file_count                  integer NOT NULL DEFAULT 0,
  actor_name                  text NOT NULL DEFAULT 'Zero',
  note_text                   text,
  created_at                  timestamptz NOT NULL DEFAULT NOW(),
  updated_at                  timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.staticart_final_handoff_package_item (
  final_package_item_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  final_package_id            uuid NOT NULL REFERENCES cx22073jw.staticart_final_handoff_package(final_package_id) ON DELETE CASCADE,
  relative_path               text NOT NULL,
  file_size_bytes             bigint NOT NULL DEFAULT 0,
  sha256_hex                  text,
  created_at                  timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (final_package_id, relative_path)
);

CREATE INDEX IF NOT EXISTS ix_staticart_final_handoff_package_created
  ON cx22073jw.staticart_final_handoff_package (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_staticart_final_handoff_package_item_package
  ON cx22073jw.staticart_final_handoff_package_item (final_package_id, relative_path);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class c
      ON c.oid = tg.tgrelid
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE tg.tgname = 'trg_staticart_final_handoff_package_updated_at'
      AND n.nspname = 'cx22073jw'
      AND c.relname = 'staticart_final_handoff_package'
  ) THEN
    EXECUTE '
      CREATE TRIGGER trg_staticart_final_handoff_package_updated_at
      BEFORE UPDATE ON cx22073jw.staticart_final_handoff_package
      FOR EACH ROW
      EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
    ';
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_final_handoff_package_summary AS
SELECT
  package_code,
  export_code,
  export_root_path,
  overall_status,
  release_code,
  release_status,
  closeout_run_code,
  file_count,
  file_index_path,
  sha256_manifest_path,
  db_summary_json_path,
  package_manifest_json_path,
  created_at
FROM cx22073jw.staticart_final_handoff_package
ORDER BY created_at DESC;

COMMIT;
SQL

  LATEST_EXPORT_ROOT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_staticart_handoff_export_batch_summary
LIMIT 1;
SQL
  )"

  EXPORT_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_code
FROM cx22073jw.v_staticart_handoff_export_batch_summary
LIMIT 1;
SQL
  )"

  RELEASE_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(release_code, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  RELEASE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(release_status, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  OVERALL_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(overall_status, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  CLOSEOUT_RUN_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(run_code, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  if [ -z "${LATEST_EXPORT_ROOT:-}" ] || [ ! -d "$LATEST_EXPORT_ROOT" ]; then
    echo "ERROR: latest export root not found"
    exit 1
  fi

  FILE_INDEX_PATH="$LATEST_EXPORT_ROOT/991_FILE_INDEX.tsv"
  SHA256_MANIFEST_PATH="$LATEST_EXPORT_ROOT/992_SHA256SUMS.txt"
  DB_SUMMARY_JSON_PATH="$LATEST_EXPORT_ROOT/993_DB_SUMMARY.json"
  PACKAGE_MANIFEST_JSON_PATH="$LATEST_EXPORT_ROOT/994_PACKAGE_MANIFEST.json"

  (
    cd "$LATEST_EXPORT_ROOT"
    find . -maxdepth 1 -type f | LC_ALL=C sort | while read -r f; do
      rel="${f#./}"
      size="$(wc -c < "$rel" | tr -d '[:space:]')"
      printf '%s\t%s\n' "$rel" "$size"
    done > "$FILE_INDEX_PATH"
  )

  (
    cd "$LATEST_EXPORT_ROOT"
    find . -maxdepth 1 -type f | LC_ALL=C sort | while read -r f; do
      rel="${f#./}"
      sha256sum "$rel"
    done > "$SHA256_MANIFEST_PATH"
  )

  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL > "$DB_SUMMARY_JSON_PATH"
SELECT jsonb_pretty(
  jsonb_build_object(
    'closeout_summary', (
      SELECT to_jsonb(x)
      FROM (
        SELECT *
        FROM cx22073jw.v_staticart_delivery_closeout_summary
        LIMIT 1
      ) x
    ),
    'release_summary', (
      SELECT to_jsonb(x)
      FROM (
        SELECT *
        FROM cx22073jw.v_staticart_fixed_contract_release_summary
        LIMIT 1
      ) x
    ),
    'export_summary', (
      SELECT to_jsonb(x)
      FROM (
        SELECT *
        FROM cx22073jw.v_staticart_handoff_export_batch_summary
        LIMIT 1
      ) x
    )
  )
);
SQL

  FILE_COUNT="$(
    wc -l < "$FILE_INDEX_PATH" | tr -d '[:space:]'
  )"

  cat > "$PACKAGE_MANIFEST_JSON_PATH" <<EOM
{
  "package_code": "$PACKAGE_CODE",
  "export_code": "$EXPORT_CODE",
  "release_code": "$RELEASE_CODE",
  "release_status": "$RELEASE_STATUS",
  "overall_status": "$OVERALL_STATUS",
  "closeout_run_code": "$CLOSEOUT_RUN_CODE",
  "export_root_path": "$LATEST_EXPORT_ROOT",
  "file_count": $FILE_COUNT,
  "file_index_path": "$FILE_INDEX_PATH",
  "sha256_manifest_path": "$SHA256_MANIFEST_PATH",
  "db_summary_json_path": "$DB_SUMMARY_JSON_PATH",
  "generated_at": "$RUN_TS"
}
EOM

  FINAL_PACKAGE_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.staticart_final_handoff_package (
  package_code,
  export_code,
  export_root_path,
  overall_status,
  release_code,
  release_status,
  closeout_run_code,
  file_index_path,
  sha256_manifest_path,
  db_summary_json_path,
  package_manifest_json_path,
  file_count,
  actor_name,
  note_text
)
VALUES (
  '$PACKAGE_CODE',
  '$EXPORT_CODE',
  '$LATEST_EXPORT_ROOT',
  '$OVERALL_STATUS',
  '$RELEASE_CODE',
  '$RELEASE_STATUS',
  '$CLOSEOUT_RUN_CODE',
  '$FILE_INDEX_PATH',
  '$SHA256_MANIFEST_PATH',
  '$DB_SUMMARY_JSON_PATH',
  '$PACKAGE_MANIFEST_JSON_PATH',
  $FILE_COUNT,
  'Zero',
  'Final handoff package created from latest export root.'
)
RETURNING final_package_id;
SQL
  )"

  echo "FINAL_PACKAGE_ID=$FINAL_PACKAGE_ID"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
DELETE FROM cx22073jw.staticart_final_handoff_package_item
WHERE final_package_id = '$FINAL_PACKAGE_ID';
SQL

  while IFS=$'\t' read -r REL_PATH SIZE_BYTES; do
    [ -n "${REL_PATH:-}" ] || continue

    SHA_HEX="$(
      awk -v file="$REL_PATH" '$2 == file {print $1}' "$SHA256_MANIFEST_PATH" | head -n 1
    )"

    psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.staticart_final_handoff_package_item (
  final_package_id,
  relative_path,
  file_size_bytes,
  sha256_hex
)
VALUES (
  '$FINAL_PACKAGE_ID',
  '$REL_PATH',
  $SIZE_BYTES,
  '$SHA_HEX'
);
SQL
  done < "$FILE_INDEX_PATH"

  echo "============================================================"
  echo "FINAL PACKAGE FILES"
  echo "============================================================"
  ls -l "$LATEST_EXPORT_ROOT"

  echo "============================================================"
  echo "PACKAGE MANIFEST PREVIEW"
  echo "============================================================"
  sed -n '1,220p' "$PACKAGE_MANIFEST_JSON_PATH"

  echo "============================================================"
  echo "LATEST FINAL PACKAGE SUMMARY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_staticart_final_handoff_package_summary;
SQL

  echo "============================================================"
  echo "CX22073JW STATICART FINAL HANDOFF PACKAGE RUNNER DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
