#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

RUN_TS="$(date +%Y%m%d_%H%M%S)"
RUN_CODE="staticart_resume_pack_${RUN_TS}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_staticart_resume_pack_runner.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW STATICART RESUME PACK RUNNER START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "run_code     : $RUN_CODE"
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
      AND table_name = 'v_staticart_delivery_master_status'
  ) THEN
    RAISE EXCEPTION 'v_staticart_delivery_master_status is required before resume pack runner';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'staticart_resume_pack',
    'StaticArt Resume Pack',
    'normal',
    'integration',
    'Final reentry index and resume context pack for StaticArt delivery'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.staticart_resume_pack_run (
  resume_pack_run_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                  text NOT NULL UNIQUE,
  certificate_code          text,
  certificate_status        text,
  release_code              text,
  release_status            text,
  export_code               text,
  export_status             text,
  package_code              text,
  package_status            text,
  closeout_run_code         text,
  export_root_path          text NOT NULL,
  operations_index_md_path  text,
  resume_context_json_path  text,
  file_count                integer NOT NULL DEFAULT 0,
  actor_name                text NOT NULL DEFAULT 'Zero',
  note_text                 text,
  created_at                timestamptz NOT NULL DEFAULT NOW(),
  updated_at                timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_staticart_resume_pack_run_created
  ON cx22073jw.staticart_resume_pack_run (created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class c
      ON c.oid = tg.tgrelid
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE tg.tgname = 'trg_staticart_resume_pack_run_updated_at'
      AND n.nspname = 'cx22073jw'
      AND c.relname = 'staticart_resume_pack_run'
  ) THEN
    EXECUTE '
      CREATE TRIGGER trg_staticart_resume_pack_run_updated_at
      BEFORE UPDATE ON cx22073jw.staticart_resume_pack_run
      FOR EACH ROW
      EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
    ';
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_resume_pack_summary AS
SELECT
  run_code,
  certificate_code,
  certificate_status,
  release_code,
  release_status,
  export_code,
  export_status,
  package_code,
  package_status,
  closeout_run_code,
  export_root_path,
  operations_index_md_path,
  resume_context_json_path,
  file_count,
  note_text,
  created_at
FROM cx22073jw.staticart_resume_pack_run
ORDER BY created_at DESC;

COMMIT;
SQL

  EXPORT_ROOT_PATH="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  if [ -z "${EXPORT_ROOT_PATH:-}" ] || [ ! -d "$EXPORT_ROOT_PATH" ]; then
    echo "ERROR: export root path not found"
    exit 1
  fi

  OPERATIONS_INDEX_MD_PATH="$EXPORT_ROOT_PATH/997_OPERATIONS_INDEX.md"
  RESUME_CONTEXT_JSON_PATH="$EXPORT_ROOT_PATH/998_RESUME_CONTEXT.json"

  CERTIFICATE_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(certificate_code, '')
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  CERTIFICATE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(certificate_status, '')
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  RELEASE_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(release_code, '')
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  RELEASE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(release_status, '')
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  EXPORT_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(export_code, '')
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  EXPORT_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(export_status, '')
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  PACKAGE_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(package_code, '')
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  PACKAGE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(package_status, '')
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  CLOSEOUT_RUN_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(closeout_run_code, '')
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  FILE_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(file_count::text, '0')
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  NOTE_TEXT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(note_text, '')
FROM cx22073jw.v_staticart_delivery_master_status
LIMIT 1;
SQL
  )"

  cat > "$OPERATIONS_INDEX_MD_PATH" <<EOM
# ============================================================
# STATICART OPERATIONS INDEX
# ============================================================

generated_at: $RUN_TS
run_code: $RUN_CODE

## 1. Master Status

- certificate_code: $CERTIFICATE_CODE
- certificate_status: $CERTIFICATE_STATUS
- release_code: $RELEASE_CODE
- release_status: $RELEASE_STATUS
- export_code: $EXPORT_CODE
- export_status: $EXPORT_STATUS
- package_code: $PACKAGE_CODE
- package_status: $PACKAGE_STATUS
- closeout_run_code: $CLOSEOUT_RUN_CODE

## 2. Core Files

- 000_README.md
- 010_manifest.json
- 020_release_summary.json
- 030_targets.jsonl
- 040_payload_contracts.jsonl
- 050_top_level_contracts.jsonl
- 060_blocked_targets.jsonl
- 070_targets.tsv
- 080_payload_contracts.tsv
- 090_top_level_contracts.tsv
- 991_FILE_INDEX.tsv
- 992_SHA256SUMS.txt
- 993_DB_SUMMARY.json
- 994_PACKAGE_MANIFEST.json
- 995_FINAL_COMPLETION_CERTIFICATE.md
- 996_HANDOFF_REENTRY_INDEX.md
- 997_OPERATIONS_INDEX.md
- 998_RESUME_CONTEXT.json
- 999_FINAL_DELIVERY_CLOSEOUT.md

## 3. Recommended Restart Order

1. 995_FINAL_COMPLETION_CERTIFICATE.md
2. 996_HANDOFF_REENTRY_INDEX.md
3. 999_FINAL_DELIVERY_CLOSEOUT.md
4. 994_PACKAGE_MANIFEST.json
5. 010_manifest.json
6. 020_release_summary.json
7. 030_targets.jsonl
8. 040_payload_contracts.jsonl
9. 050_top_level_contracts.jsonl

## 4. DB-side Anchors

- cx22073jw.v_staticart_delivery_master_status
- cx22073jw.v_staticart_resume_pack_summary
- cx22073jw.v_staticart_final_handoff_package_summary
- cx22073jw.v_staticart_delivery_closeout_summary
- cx22073jw.v_staticart_handoff_export_batch_summary
- cx22073jw.v_staticart_fixed_contract_release_summary

## 5. Note

$NOTE_TEXT
EOM

  cat > "$RESUME_CONTEXT_JSON_PATH" <<EOM
{
  "run_code": "$RUN_CODE",
  "generated_at": "$RUN_TS",
  "certificate_code": "$CERTIFICATE_CODE",
  "certificate_status": "$CERTIFICATE_STATUS",
  "release_code": "$RELEASE_CODE",
  "release_status": "$RELEASE_STATUS",
  "export_code": "$EXPORT_CODE",
  "export_status": "$EXPORT_STATUS",
  "package_code": "$PACKAGE_CODE",
  "package_status": "$PACKAGE_STATUS",
  "closeout_run_code": "$CLOSEOUT_RUN_CODE",
  "export_root_path": "$EXPORT_ROOT_PATH",
  "file_count": $FILE_COUNT,
  "recommended_restart_order": [
    "995_FINAL_COMPLETION_CERTIFICATE.md",
    "996_HANDOFF_REENTRY_INDEX.md",
    "999_FINAL_DELIVERY_CLOSEOUT.md",
    "994_PACKAGE_MANIFEST.json",
    "010_manifest.json",
    "020_release_summary.json",
    "030_targets.jsonl",
    "040_payload_contracts.jsonl",
    "050_top_level_contracts.jsonl"
  ],
  "db_side_anchors": [
    "cx22073jw.v_staticart_delivery_master_status",
    "cx22073jw.v_staticart_resume_pack_summary",
    "cx22073jw.v_staticart_final_handoff_package_summary",
    "cx22073jw.v_staticart_delivery_closeout_summary",
    "cx22073jw.v_staticart_handoff_export_batch_summary",
    "cx22073jw.v_staticart_fixed_contract_release_summary"
  ],
  "note_text": "$NOTE_TEXT"
}
EOM

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.staticart_resume_pack_run (
  run_code,
  certificate_code,
  certificate_status,
  release_code,
  release_status,
  export_code,
  export_status,
  package_code,
  package_status,
  closeout_run_code,
  export_root_path,
  operations_index_md_path,
  resume_context_json_path,
  file_count,
  actor_name,
  note_text
)
VALUES (
  '$RUN_CODE',
  '$CERTIFICATE_CODE',
  '$CERTIFICATE_STATUS',
  '$RELEASE_CODE',
  '$RELEASE_STATUS',
  '$EXPORT_CODE',
  '$EXPORT_STATUS',
  '$PACKAGE_CODE',
  '$PACKAGE_STATUS',
  '$CLOSEOUT_RUN_CODE',
  '$EXPORT_ROOT_PATH',
  '$OPERATIONS_INDEX_MD_PATH',
  '$RESUME_CONTEXT_JSON_PATH',
  $FILE_COUNT,
  'Zero',
  '$NOTE_TEXT'
);
SQL

  echo "============================================================"
  echo "RESUME PACK FILES"
  echo "============================================================"
  ls -l "$OPERATIONS_INDEX_MD_PATH" "$RESUME_CONTEXT_JSON_PATH"

  echo "============================================================"
  echo "OPERATIONS INDEX PREVIEW"
  echo "============================================================"
  sed -n '1,240p' "$OPERATIONS_INDEX_MD_PATH"

  echo "============================================================"
  echo "RESUME CONTEXT PREVIEW"
  echo "============================================================"
  sed -n '1,240p' "$RESUME_CONTEXT_JSON_PATH"

  echo "============================================================"
  echo "LATEST RESUME PACK SUMMARY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_staticart_resume_pack_summary;
SQL

  echo "============================================================"
  echo "CX22073JW STATICART RESUME PACK RUNNER DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
