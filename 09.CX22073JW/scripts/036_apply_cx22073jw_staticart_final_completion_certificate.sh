#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

RUN_TS="$(date +%Y%m%d_%H%M%S)"
CERT_CODE="staticart_final_completion_${RUN_TS}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_staticart_final_completion_certificate.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW STATICART FINAL COMPLETION CERTIFICATE START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "cert_code    : $CERT_CODE"
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
      AND table_name = 'v_staticart_final_handoff_package_summary'
  ) THEN
    RAISE EXCEPTION 'v_staticart_final_handoff_package_summary is required before final completion certificate';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_staticart_delivery_closeout_summary'
  ) THEN
    RAISE EXCEPTION 'v_staticart_delivery_closeout_summary is required before final completion certificate';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'staticart_final_completion_certificate',
    'StaticArt Final Completion Certificate',
    'normal',
    'integration',
    'Final completion certificate and reentry index for StaticArt delivery package'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.staticart_final_completion_certificate (
  final_completion_certificate_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code               text NOT NULL UNIQUE,
  overall_status                 text NOT NULL CHECK (overall_status IN ('pass','partial','blocked')),
  release_code                   text,
  release_status                 text,
  export_code                    text,
  export_status                  text,
  package_code                   text,
  package_status                 text,
  closeout_run_code              text,
  export_root_path               text,
  certificate_md_path            text,
  reentry_index_md_path          text,
  total_target_count             integer NOT NULL DEFAULT 0,
  released_target_count          integer NOT NULL DEFAULT 0,
  blocked_target_count           integer NOT NULL DEFAULT 0,
  file_count                     integer NOT NULL DEFAULT 0,
  actor_name                     text NOT NULL DEFAULT 'Zero',
  note_text                      text,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  updated_at                     timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_staticart_final_completion_certificate_created
  ON cx22073jw.staticart_final_completion_certificate (created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class c
      ON c.oid = tg.tgrelid
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE tg.tgname = 'trg_staticart_final_completion_certificate_updated_at'
      AND n.nspname = 'cx22073jw'
      AND c.relname = 'staticart_final_completion_certificate'
  ) THEN
    EXECUTE '
      CREATE TRIGGER trg_staticart_final_completion_certificate_updated_at
      BEFORE UPDATE ON cx22073jw.staticart_final_completion_certificate
      FOR EACH ROW
      EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
    ';
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_delivery_master_status AS
SELECT
  c.certificate_code,
  c.overall_status AS certificate_status,
  c.release_code,
  c.release_status,
  c.export_code,
  c.export_status,
  c.package_code,
  c.package_status,
  c.closeout_run_code,
  c.export_root_path,
  c.total_target_count,
  c.released_target_count,
  c.blocked_target_count,
  c.file_count,
  c.note_text,
  c.created_at
FROM cx22073jw.staticart_final_completion_certificate c
ORDER BY c.created_at DESC;

COMMIT;
SQL

  EXPORT_ROOT_PATH="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT export_root_path
FROM cx22073jw.v_staticart_final_handoff_package_summary
LIMIT 1;
SQL
  )"

  if [ -z "${EXPORT_ROOT_PATH:-}" ] || [ ! -d "$EXPORT_ROOT_PATH" ]; then
    echo "ERROR: latest export root not found"
    exit 1
  fi

  CERT_MD_PATH="$EXPORT_ROOT_PATH/995_FINAL_COMPLETION_CERTIFICATE.md"
  REENTRY_MD_PATH="$EXPORT_ROOT_PATH/996_HANDOFF_REENTRY_INDEX.md"

  RELEASE_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(release_code, '')
FROM cx22073jw.v_staticart_final_handoff_package_summary
LIMIT 1;
SQL
  )"

  PACKAGE_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(package_code, '')
FROM cx22073jw.v_staticart_final_handoff_package_summary
LIMIT 1;
SQL
  )"

  RELEASE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(release_status, '')
FROM cx22073jw.v_staticart_final_handoff_package_summary
LIMIT 1;
SQL
  )"

  EXPORT_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(export_code, '')
FROM cx22073jw.v_staticart_final_handoff_package_summary
LIMIT 1;
SQL
  )"

  PACKAGE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(overall_status, '')
FROM cx22073jw.v_staticart_final_handoff_package_summary
LIMIT 1;
SQL
  )"

  EXPORT_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(export_status, '')
FROM cx22073jw.v_staticart_handoff_export_batch_summary
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

  CLOSEOUT_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(overall_status, '')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  TOTAL_TARGET_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(total_target_count::text, '0')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  RELEASED_TARGET_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(released_target_count::text, '0')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  BLOCKED_TARGET_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(blocked_target_count::text, '0')
FROM cx22073jw.v_staticart_delivery_closeout_summary
LIMIT 1;
SQL
  )"

  FILE_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(file_count::text, '0')
FROM cx22073jw.v_staticart_final_handoff_package_summary
LIMIT 1;
SQL
  )"

  OVERALL_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | head -n 1
SELECT CASE
  WHEN '$RELEASE_STATUS' = 'released'
   AND '$EXPORT_STATUS' = 'done'
   AND '$PACKAGE_STATUS' = 'pass'
   AND '$CLOSEOUT_STATUS' IN ('pass','partial')
   AND '$BLOCKED_TARGET_COUNT' = '0'
  THEN 'pass'
  WHEN '$EXPORT_STATUS' = 'done'
   AND '$PACKAGE_STATUS' <> ''
  THEN 'partial'
  ELSE 'blocked'
END;
SQL
  )"

  NOTE_TEXT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | head -n 1
SELECT CASE
  WHEN '$OVERALL_STATUS' = 'pass'
  THEN 'All delivery artifacts are present and blocked targets are zero.'
  WHEN '$OVERALL_STATUS' = 'partial'
  THEN 'Delivery artifacts are present, but some release conditions remain partial or blocked.'
  ELSE 'Delivery package is not yet in a final pass state.'
END;
SQL
  )"

  cat > "$CERT_MD_PATH" <<EOC
# ============================================================
# STATICART FINAL COMPLETION CERTIFICATE
# ============================================================

certificate_code: $CERT_CODE
generated_at: $RUN_TS
overall_status: $OVERALL_STATUS

## 1. Delivery Status

- release_code: $RELEASE_CODE
- release_status: $RELEASE_STATUS
- export_code: $EXPORT_CODE
- export_status: $EXPORT_STATUS
- package_code: $PACKAGE_CODE
- package_status: $PACKAGE_STATUS
- closeout_run_code: $CLOSEOUT_RUN_CODE
- closeout_status: $CLOSEOUT_STATUS

## 2. Counts

- total_target_count: $TOTAL_TARGET_COUNT
- released_target_count: $RELEASED_TARGET_COUNT
- blocked_target_count: $BLOCKED_TARGET_COUNT
- file_count: $FILE_COUNT

## 3. Export Root

$EXPORT_ROOT_PATH

## 4. Certificate Note

$NOTE_TEXT
EOC

  cat > "$REENTRY_MD_PATH" <<EOR
# ============================================================
# STATICART HANDOFF REENTRY INDEX
# ============================================================

certificate_code: $CERT_CODE
export_root_path: $EXPORT_ROOT_PATH

## 1. Primary Files

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
- 999_FINAL_DELIVERY_CLOSEOUT.md

## 2. Recommended Reentry Order

1. 995_FINAL_COMPLETION_CERTIFICATE.md
2. 999_FINAL_DELIVERY_CLOSEOUT.md
3. 994_PACKAGE_MANIFEST.json
4. 010_manifest.json
5. 020_release_summary.json
6. 030_targets.jsonl
7. 040_payload_contracts.jsonl
8. 050_top_level_contracts.jsonl

## 3. DB-side Summary Anchors

- cx22073jw.v_staticart_delivery_master_status
- cx22073jw.v_staticart_final_handoff_package_summary
- cx22073jw.v_staticart_delivery_closeout_summary
- cx22073jw.v_staticart_handoff_export_batch_summary
- cx22073jw.v_staticart_fixed_contract_release_summary
EOR

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.staticart_final_completion_certificate (
  certificate_code,
  overall_status,
  release_code,
  release_status,
  export_code,
  export_status,
  package_code,
  package_status,
  closeout_run_code,
  export_root_path,
  certificate_md_path,
  reentry_index_md_path,
  total_target_count,
  released_target_count,
  blocked_target_count,
  file_count,
  actor_name,
  note_text
)
VALUES (
  '$CERT_CODE',
  '$OVERALL_STATUS',
  '$RELEASE_CODE',
  '$RELEASE_STATUS',
  '$EXPORT_CODE',
  '$EXPORT_STATUS',
  '$PACKAGE_CODE',
  '$PACKAGE_STATUS',
  '$CLOSEOUT_RUN_CODE',
  '$EXPORT_ROOT_PATH',
  '$CERT_MD_PATH',
  '$REENTRY_MD_PATH',
  $TOTAL_TARGET_COUNT,
  $RELEASED_TARGET_COUNT,
  $BLOCKED_TARGET_COUNT,
  $FILE_COUNT,
  'Zero',
  '$NOTE_TEXT'
);
SQL

  echo "============================================================"
  echo "FINAL CERTIFICATE FILES"
  echo "============================================================"
  ls -l "$CERT_MD_PATH" "$REENTRY_MD_PATH"

  echo "============================================================"
  echo "FINAL CERTIFICATE PREVIEW"
  echo "============================================================"
  sed -n '1,220p' "$CERT_MD_PATH"

  echo "============================================================"
  echo "REENTRY INDEX PREVIEW"
  echo "============================================================"
  sed -n '1,220p' "$REENTRY_MD_PATH"

  echo "============================================================"
  echo "LATEST DELIVERY MASTER STATUS"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_staticart_delivery_master_status;
SQL

  echo "============================================================"
  echo "CX22073JW STATICART FINAL COMPLETION CERTIFICATE DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
