#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

RUN_TS="${RUN_TS:-$(date +%Y%m%d_%H%M%S)}"
RELEASE_CODE="${1:-${RELEASE_CODE:-staticart_minimum_first_send_fixed_v1}}"
EXPORT_CODE="${EXPORT_CODE:-staticart_handoff_${RUN_TS}}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_BASE="$BASE/exports/staticart-handoff"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_staticart_handoff_manifest_export_runner.log"
EXPORT_ROOT="$EXPORTS_BASE/$RELEASE_CODE/$RUN_TS"

README_FILE="$EXPORT_ROOT/000_README.md"
MANIFEST_FILE="$EXPORT_ROOT/010_manifest.json"
RELEASE_SUMMARY_FILE="$EXPORT_ROOT/020_release_summary.json"
TARGETS_JSONL="$EXPORT_ROOT/030_targets.jsonl"
PAYLOAD_JSONL="$EXPORT_ROOT/040_payload_contracts.jsonl"
TOPLEVEL_JSONL="$EXPORT_ROOT/050_top_level_contracts.jsonl"
BLOCKED_JSONL="$EXPORT_ROOT/060_blocked_targets.jsonl"
TARGETS_TSV="$EXPORT_ROOT/070_targets.tsv"
PAYLOAD_TSV="$EXPORT_ROOT/080_payload_contracts.tsv"
TOPLEVEL_TSV="$EXPORT_ROOT/090_top_level_contracts.tsv"

mkdir -p "$LOGS_DIR" "$EXPORT_ROOT"

{
  echo "============================================================"
  echo "CX22073JW STATICART HANDOFF MANIFEST EXPORT RUNNER START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "release_code : $RELEASE_CODE"
  echo "export_code  : $EXPORT_CODE"
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
      AND table_name = 'v_staticart_fixed_contract_release_summary'
  ) THEN
    RAISE EXCEPTION 'v_staticart_fixed_contract_release_summary is required before handoff export runner apply';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_staticart_fixed_contract_release_targets'
  ) THEN
    RAISE EXCEPTION 'v_staticart_fixed_contract_release_targets is required before handoff export runner apply';
  END IF;
END;
$$;

INSERT INTO cx22073jw.foundation_domain_master (
  domain_code, domain_name, layer_code, domain_family, description
) VALUES
  (
    'staticart_handoff_manifest_export',
    'StaticArt Handoff Manifest Export',
    'normal',
    'integration',
    'Handoff manifest and export runner for StaticArt fixed contract release'
  )
ON CONFLICT (domain_code) DO UPDATE
SET domain_name   = EXCLUDED.domain_name,
    layer_code    = EXCLUDED.layer_code,
    domain_family = EXCLUDED.domain_family,
    description   = EXCLUDED.description,
    updated_at    = NOW();

CREATE TABLE IF NOT EXISTS cx22073jw.staticart_handoff_export_batch (
  export_batch_id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  export_code                    text NOT NULL UNIQUE,
  release_code                   text NOT NULL,
  export_status                  text NOT NULL CHECK (export_status IN ('running','done','failed','partial')),
  export_root_path               text NOT NULL,
  readme_file_path               text,
  manifest_file_path             text,
  release_summary_file_path      text,
  targets_jsonl_file_path        text,
  payload_contract_jsonl_path    text,
  top_level_contract_jsonl_path  text,
  blocked_target_jsonl_path      text,
  targets_tsv_file_path          text,
  payload_tsv_file_path          text,
  top_level_tsv_file_path        text,
  total_target_count             integer NOT NULL DEFAULT 0,
  released_target_count          integer NOT NULL DEFAULT 0,
  blocked_target_count           integer NOT NULL DEFAULT 0,
  actor_name                     text NOT NULL DEFAULT 'Zero',
  note_text                      text,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  updated_at                     timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.staticart_handoff_export_item (
  export_item_id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  export_batch_id                uuid NOT NULL REFERENCES cx22073jw.staticart_handoff_export_batch(export_batch_id) ON DELETE CASCADE,
  area_slug                      text NOT NULL,
  block_code                     text NOT NULL,
  contract_level                 text NOT NULL CHECK (contract_level IN ('top_level','payload')),
  target_payload_column_name     text,
  target_status_code             text NOT NULL CHECK (target_status_code IN ('released','blocked')),
  export_status                  text NOT NULL CHECK (export_status IN ('exported','skipped')),
  sort_order                     integer NOT NULL DEFAULT 100,
  created_at                     timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_staticart_handoff_export_batch_release
  ON cx22073jw.staticart_handoff_export_batch (release_code, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_staticart_handoff_export_item_batch
  ON cx22073jw.staticart_handoff_export_item (export_batch_id, sort_order);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class c
      ON c.oid = tg.tgrelid
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE tg.tgname = 'trg_staticart_handoff_export_batch_updated_at'
      AND n.nspname = 'cx22073jw'
      AND c.relname = 'staticart_handoff_export_batch'
  ) THEN
    EXECUTE '
      CREATE TRIGGER trg_staticart_handoff_export_batch_updated_at
      BEFORE UPDATE ON cx22073jw.staticart_handoff_export_batch
      FOR EACH ROW
      EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
    ';
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_handoff_export_batch_summary AS
SELECT
  export_code,
  release_code,
  export_status,
  export_root_path,
  total_target_count,
  released_target_count,
  blocked_target_count,
  created_at
FROM cx22073jw.staticart_handoff_export_batch
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW cx22073jw.v_staticart_handoff_export_item_summary AS
SELECT
  b.export_code,
  i.block_code,
  i.area_slug,
  i.contract_level,
  i.target_payload_column_name,
  i.target_status_code,
  i.export_status,
  i.sort_order
FROM cx22073jw.staticart_handoff_export_item i
JOIN cx22073jw.staticart_handoff_export_batch b
  ON b.export_batch_id = i.export_batch_id
ORDER BY b.created_at DESC, i.sort_order, i.area_slug, i.contract_level;

COMMIT;
SQL

  HAS_RELEASE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT CASE
  WHEN EXISTS (
    SELECT 1
    FROM cx22073jw.v_staticart_fixed_contract_release_summary
    WHERE release_code = '$RELEASE_CODE'
  )
  THEN 'yes'
  ELSE 'no'
END;
SQL
  )"

  echo "HAS_RELEASE=$HAS_RELEASE"

  if [ "$HAS_RELEASE" != "yes" ]; then
    echo "ERROR: fixed contract release not found -> $RELEASE_CODE"
    exit 1
  fi

  EXPORT_BATCH_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.staticart_handoff_export_batch (
  export_code,
  release_code,
  export_status,
  export_root_path,
  actor_name,
  note_text
)
VALUES (
  '$EXPORT_CODE',
  '$RELEASE_CODE',
  'running',
  '$EXPORT_ROOT',
  'Zero',
  'StaticArt handoff export batch started.'
)
RETURNING export_batch_id;
SQL
  )"

  echo "EXPORT_BATCH_ID=$EXPORT_BATCH_ID"

  cat > "$README_FILE" <<EORD
# ============================================================
# STATICART HANDOFF EXPORT
# ============================================================

export_code: $EXPORT_CODE
release_code: $RELEASE_CODE
generated_at: $RUN_TS
base_path: $EXPORT_ROOT

files:
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

notes:
- source is cx22073jw fixed contract release views
- this export is knowledge handoff / implementation reference only
- canonical ownership remains StaticArtOS
EORD

  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL > "$MANIFEST_FILE"
SELECT jsonb_pretty(
  jsonb_build_object(
    'export_code', '$EXPORT_CODE',
    'release_code', r.release_code,
    'release_status', r.release_status,
    'source_system', 'StaticArtOS',
    'target_system', 'CX22073JW',
    'generated_at', '$RUN_TS',
    'export_root_path', '$EXPORT_ROOT',
    'counts', jsonb_build_object(
      'total_target_count', r.total_target_count,
      'released_target_count', r.released_target_count,
      'blocked_target_count', r.blocked_target_count
    ),
    'files', jsonb_build_object(
      'readme', '$README_FILE',
      'manifest', '$MANIFEST_FILE',
      'release_summary', '$RELEASE_SUMMARY_FILE',
      'targets_jsonl', '$TARGETS_JSONL',
      'payload_contracts_jsonl', '$PAYLOAD_JSONL',
      'top_level_contracts_jsonl', '$TOPLEVEL_JSONL',
      'blocked_targets_jsonl', '$BLOCKED_JSONL',
      'targets_tsv', '$TARGETS_TSV',
      'payload_tsv', '$PAYLOAD_TSV',
      'top_level_tsv', '$TOPLEVEL_TSV'
    )
  )
)
FROM cx22073jw.v_staticart_fixed_contract_release_summary r
WHERE r.release_code = '$RELEASE_CODE'
LIMIT 1;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL > "$RELEASE_SUMMARY_FILE"
SELECT jsonb_pretty(to_jsonb(x))
FROM (
  SELECT *
  FROM cx22073jw.v_staticart_fixed_contract_release_summary
  WHERE release_code = '$RELEASE_CODE'
  LIMIT 1
) x;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL > "$TARGETS_JSONL"
SELECT jsonb_build_object(
  'release_code', release_code,
  'block_code', block_code,
  'area_slug', area_slug,
  'contract_level', contract_level,
  'target_payload_column_name', target_payload_column_name,
  'target_table_name', target_table_name,
  'target_function_name', target_function_name,
  'key_count', key_count,
  'missing_key_count', missing_key_count,
  'target_status_code', target_status_code,
  'contract_digest', contract_digest,
  'sort_order', sort_order,
  'detail_json', detail_json
)::text
FROM cx22073jw.v_staticart_fixed_contract_release_targets
WHERE release_code = '$RELEASE_CODE'
ORDER BY sort_order, area_slug, contract_level, COALESCE(target_payload_column_name, '');
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL > "$PAYLOAD_JSONL"
SELECT jsonb_build_object(
  'release_code', release_code,
  'block_code', block_code,
  'area_slug', area_slug,
  'target_payload_column_name', target_payload_column_name,
  'target_table_name', target_table_name,
  'target_function_name', target_function_name,
  'required_keys', COALESCE(to_jsonb(required_keys), '[]'::jsonb),
  'optional_keys', COALESCE(to_jsonb(optional_keys), '[]'::jsonb),
  'target_status_code', target_status_code
)::text
FROM cx22073jw.v_staticart_fixed_contract_release_export_payload
WHERE release_code = '$RELEASE_CODE'
ORDER BY area_slug, target_payload_column_name;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL > "$TOPLEVEL_JSONL"
SELECT jsonb_build_object(
  'release_code', release_code,
  'block_code', block_code,
  'area_slug', area_slug,
  'target_table_name', target_table_name,
  'target_function_name', target_function_name,
  'top_level_keys', COALESCE(to_jsonb(top_level_keys), '[]'::jsonb),
  'target_status_code', target_status_code
)::text
FROM cx22073jw.v_staticart_fixed_contract_release_export_top_level
WHERE release_code = '$RELEASE_CODE'
ORDER BY area_slug;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL > "$BLOCKED_JSONL"
SELECT jsonb_build_object(
  'release_code', release_code,
  'block_code', block_code,
  'area_slug', area_slug,
  'contract_level', contract_level,
  'target_payload_column_name', target_payload_column_name,
  'target_status_code', target_status_code,
  'detail_json', detail_json
)::text
FROM cx22073jw.v_staticart_fixed_contract_release_targets
WHERE release_code = '$RELEASE_CODE'
  AND target_status_code = 'blocked'
ORDER BY sort_order, area_slug, contract_level, COALESCE(target_payload_column_name, '');
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<SQL > "$TARGETS_TSV"
SELECT
  release_code,
  block_code,
  area_slug,
  contract_level,
  COALESCE(target_payload_column_name, ''),
  COALESCE(target_table_name, ''),
  COALESCE(target_function_name, ''),
  key_count,
  missing_key_count,
  target_status_code
FROM cx22073jw.v_staticart_fixed_contract_release_targets
WHERE release_code = '$RELEASE_CODE'
ORDER BY sort_order, area_slug, contract_level, COALESCE(target_payload_column_name, '');
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<SQL > "$PAYLOAD_TSV"
SELECT
  release_code,
  block_code,
  area_slug,
  COALESCE(target_payload_column_name, ''),
  COALESCE(target_table_name, ''),
  COALESCE(target_function_name, ''),
  COALESCE(array_to_string(required_keys, '|'), ''),
  COALESCE(array_to_string(optional_keys, '|'), ''),
  target_status_code
FROM cx22073jw.v_staticart_fixed_contract_release_export_payload
WHERE release_code = '$RELEASE_CODE'
ORDER BY area_slug, target_payload_column_name;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<SQL > "$TOPLEVEL_TSV"
SELECT
  release_code,
  block_code,
  area_slug,
  COALESCE(target_table_name, ''),
  COALESCE(target_function_name, ''),
  COALESCE(array_to_string(top_level_keys, '|'), ''),
  target_status_code
FROM cx22073jw.v_staticart_fixed_contract_release_export_top_level
WHERE release_code = '$RELEASE_CODE'
ORDER BY area_slug;
SQL

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
DELETE FROM cx22073jw.staticart_handoff_export_item
WHERE export_batch_id = '$EXPORT_BATCH_ID';

INSERT INTO cx22073jw.staticart_handoff_export_item (
  export_batch_id,
  area_slug,
  block_code,
  contract_level,
  target_payload_column_name,
  target_status_code,
  export_status,
  sort_order
)
SELECT
  '$EXPORT_BATCH_ID',
  area_slug,
  block_code,
  contract_level,
  target_payload_column_name,
  target_status_code,
  'exported',
  ROW_NUMBER() OVER (
    ORDER BY sort_order, area_slug, contract_level, COALESCE(target_payload_column_name, '')
  )::integer
FROM cx22073jw.v_staticart_fixed_contract_release_targets
WHERE release_code = '$RELEASE_CODE';

UPDATE cx22073jw.staticart_handoff_export_batch b
   SET readme_file_path              = '$README_FILE',
       manifest_file_path            = '$MANIFEST_FILE',
       release_summary_file_path     = '$RELEASE_SUMMARY_FILE',
       targets_jsonl_file_path       = '$TARGETS_JSONL',
       payload_contract_jsonl_path   = '$PAYLOAD_JSONL',
       top_level_contract_jsonl_path = '$TOPLEVEL_JSONL',
       blocked_target_jsonl_path     = '$BLOCKED_JSONL',
       targets_tsv_file_path         = '$TARGETS_TSV',
       payload_tsv_file_path         = '$PAYLOAD_TSV',
       top_level_tsv_file_path       = '$TOPLEVEL_TSV',
       total_target_count            = COALESCE((
                                        SELECT total_target_count
                                        FROM cx22073jw.v_staticart_fixed_contract_release_summary
                                        WHERE release_code = '$RELEASE_CODE'
                                        LIMIT 1
                                      ), 0),
       released_target_count         = COALESCE((
                                        SELECT released_target_count
                                        FROM cx22073jw.v_staticart_fixed_contract_release_summary
                                        WHERE release_code = '$RELEASE_CODE'
                                        LIMIT 1
                                      ), 0),
       blocked_target_count          = COALESCE((
                                        SELECT blocked_target_count
                                        FROM cx22073jw.v_staticart_fixed_contract_release_summary
                                        WHERE release_code = '$RELEASE_CODE'
                                        LIMIT 1
                                      ), 0),
       export_status                 = 'done',
       note_text                     = 'StaticArt handoff export batch completed successfully.',
       updated_at                    = NOW()
 WHERE b.export_batch_id = '$EXPORT_BATCH_ID';
SQL

  echo "============================================================"
  echo "EXPORTED FILES"
  echo "============================================================"
  ls -l "$EXPORT_ROOT"

  echo "============================================================"
  echo "MANIFEST PREVIEW"
  echo "============================================================"
  sed -n '1,220p' "$MANIFEST_FILE"

  echo "============================================================"
  echo "LATEST EXPORT BATCH SUMMARY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT *
FROM cx22073jw.v_staticart_handoff_export_batch_summary
WHERE export_code = '$EXPORT_CODE';

SELECT
  export_code,
  COUNT(*) AS item_count,
  COUNT(*) FILTER (WHERE target_status_code = 'released') AS released_item_count,
  COUNT(*) FILTER (WHERE target_status_code = 'blocked') AS blocked_item_count
FROM cx22073jw.v_staticart_handoff_export_item_summary
WHERE export_code = '$EXPORT_CODE'
GROUP BY export_code;
SQL

  echo "============================================================"
  echo "CX22073JW STATICART HANDOFF MANIFEST EXPORT RUNNER DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
