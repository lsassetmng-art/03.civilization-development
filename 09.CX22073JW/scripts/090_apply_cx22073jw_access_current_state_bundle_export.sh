#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_BASE="$BASE/exports/access-current-state-bundle"

RUN_TS="$(date +%Y%m%d_%H%M%S)"
RUN_CODE="access_current_state_bundle_${RUN_TS}"
RUN_DIR="$LOGS_DIR/${RUN_TS}_access_current_state_bundle_export"
EXPORT_ROOT="$EXPORTS_BASE/$RUN_TS"

LOG_FILE="$RUN_DIR/000_run.log"
MANIFEST_MD="$EXPORT_ROOT/000_manifest.md"
SUMMARY_JSON="$EXPORT_ROOT/010_summary.json"
BASELINE_SUMMARY_TSV="$EXPORT_ROOT/020_baseline_summary.tsv"
BASELINE_ITEMS_TSV="$EXPORT_ROOT/021_baseline_items.tsv"
LEGACY_GATE_SUMMARY_TSV="$EXPORT_ROOT/030_legacy_gate_summary.tsv"
LEGACY_GATE_BLOCKERS_TSV="$EXPORT_ROOT/031_legacy_gate_blockers.tsv"
RETIREMENT_PLAN_SUMMARY_TSV="$EXPORT_ROOT/040_retirement_plan_summary.tsv"
RETIREMENT_PLAN_ITEMS_TSV="$EXPORT_ROOT/041_retirement_plan_items.tsv"
MANUAL_PENDING_SUMMARY_TSV="$EXPORT_ROOT/050_manual_pending_summary.tsv"
MANUAL_RECEIPT_ITEMS_TSV="$EXPORT_ROOT/051_manual_receipt_items.tsv"
CONFIRMED_REVERIFY_SUMMARY_TSV="$EXPORT_ROOT/060_confirmed_reverify_summary.tsv"
CONFIRMED_REVERIFY_ITEMS_TSV="$EXPORT_ROOT/061_confirmed_reverify_items.tsv"
HANDOFF_MD="$EXPORT_ROOT/070_current_state_handoff.md"

mkdir -p "$RUN_DIR" "$EXPORT_ROOT"

{
  echo "============================================================"
  echo "ACCESS CURRENT STATE BUNDLE EXPORT START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "run_code     : $RUN_CODE"
  echo "run_dir      : $RUN_DIR"
  echo "export_root  : $EXPORT_ROOT"
  echo "============================================================"

  echo "============================================================"
  echo "PHASE 1: CREATE EXPORT REGISTRY"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

CREATE TABLE IF NOT EXISTS cx22073jw.access_current_state_bundle_export_run (
  current_state_bundle_export_run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                           text NOT NULL UNIQUE,
  export_root_path                   text NOT NULL,
  baseline_run_code                  text,
  legacy_gate_run_code               text,
  retirement_plan_run_code           text,
  manual_receipt_batch_code          text,
  confirmed_reverify_run_code        text,
  file_count                         integer NOT NULL DEFAULT 0,
  export_status                      text NOT NULL CHECK (export_status IN ('running','pass','partial','error')),
  actor_name                         text NOT NULL DEFAULT 'Zero',
  note_text                          text,
  created_at                         timestamptz NOT NULL DEFAULT NOW(),
  updated_at                         timestamptz NOT NULL DEFAULT NOW(),
  ended_at                           timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_current_state_bundle_export_file (
  current_state_bundle_export_file_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  current_state_bundle_export_run_id  uuid NOT NULL REFERENCES cx22073jw.access_current_state_bundle_export_run(current_state_bundle_export_run_id) ON DELETE CASCADE,
  file_role                           text NOT NULL,
  file_path                           text NOT NULL,
  created_at                          timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (current_state_bundle_export_run_id, file_role)
);

CREATE INDEX IF NOT EXISTS ix_access_current_state_bundle_export_run_created
  ON cx22073jw.access_current_state_bundle_export_run (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_current_state_bundle_export_file_run
  ON cx22073jw.access_current_state_bundle_export_file (current_state_bundle_export_run_id, file_role);

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
      WHERE tg.tgname = 'trg_access_current_state_bundle_export_run_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_current_state_bundle_export_run'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_current_state_bundle_export_run_updated_at
        BEFORE UPDATE ON cx22073jw.access_current_state_bundle_export_run
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_current_state_bundle_export_latest_summary AS
SELECT
  run_code,
  export_root_path,
  baseline_run_code,
  legacy_gate_run_code,
  retirement_plan_run_code,
  manual_receipt_batch_code,
  confirmed_reverify_run_code,
  file_count,
  export_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_current_state_bundle_export_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_current_state_bundle_export_latest_files AS
SELECT
  r.run_code,
  f.file_role,
  f.file_path,
  f.created_at
FROM cx22073jw.access_current_state_bundle_export_file f
JOIN cx22073jw.access_current_state_bundle_export_run r
  ON r.current_state_bundle_export_run_id = f.current_state_bundle_export_run_id
WHERE r.current_state_bundle_export_run_id = (
  SELECT current_state_bundle_export_run_id
  FROM cx22073jw.access_current_state_bundle_export_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY f.file_role;
COMMIT;
SQL

  BASELINE_RUN_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(run_code, '')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"

  LEGACY_GATE_RUN_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(run_code, '')
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  RETIREMENT_PLAN_RUN_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(run_code, '')
FROM cx22073jw.v_access_legacy_retirement_plan_latest_summary
LIMIT 1;
SQL
  )"

  MANUAL_RECEIPT_BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(batch_code, '')
FROM cx22073jw.v_access_manual_apply_receipt_latest_batch_summary
LIMIT 1;
SQL
  )"

  CONFIRMED_REVERIFY_RUN_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(run_code, '')
FROM cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary
LIMIT 1;
SQL
  )"

  EXPORT_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.access_current_state_bundle_export_run (
  run_code,
  export_root_path,
  baseline_run_code,
  legacy_gate_run_code,
  retirement_plan_run_code,
  manual_receipt_batch_code,
  confirmed_reverify_run_code,
  export_status,
  actor_name,
  note_text
)
VALUES (
  '$RUN_CODE',
  '$EXPORT_ROOT',
  '$BASELINE_RUN_CODE',
  '$LEGACY_GATE_RUN_CODE',
  '$RETIREMENT_PLAN_RUN_CODE',
  '$MANUAL_RECEIPT_BATCH_CODE',
  '$CONFIRMED_REVERIFY_RUN_CODE',
  'running',
  'Zero',
  'Current state bundle export.'
)
RETURNING current_state_bundle_export_run_id;
SQL
  )"

  if [ -z "${EXPORT_RUN_ID:-}" ]; then
    echo "ERROR: export run was not created"
    exit 1
  fi

  echo "EXPORT_RUN_ID=$EXPORT_RUN_ID"

  echo "============================================================"
  echo "PHASE 2: EXPORT TSV FILES"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BASELINE_SUMMARY_TSV"
SELECT *
FROM cx22073jw.v_access_baseline_health_latest_summary;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BASELINE_ITEMS_TSV"
SELECT *
FROM cx22073jw.v_access_baseline_health_latest_items;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LEGACY_GATE_SUMMARY_TSV"
SELECT *
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LEGACY_GATE_BLOCKERS_TSV"
SELECT *
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$RETIREMENT_PLAN_SUMMARY_TSV"
SELECT *
FROM cx22073jw.v_access_legacy_retirement_plan_latest_summary;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$RETIREMENT_PLAN_ITEMS_TSV"
SELECT *
FROM cx22073jw.v_access_legacy_retirement_plan_latest_items;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$MANUAL_PENDING_SUMMARY_TSV"
SELECT *
FROM cx22073jw.v_access_manual_apply_receipt_latest_pending_summary;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$MANUAL_RECEIPT_ITEMS_TSV"
SELECT
  b.batch_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.expected_db_role_name,
  i.receipt_status,
  i.manual_executor_name,
  i.manual_apply_note,
  i.created_at
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.manual_apply_receipt_batch_id = (
  SELECT manual_apply_receipt_batch_id
  FROM cx22073jw.access_manual_apply_receipt_batch
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$CONFIRMED_REVERIFY_SUMMARY_TSV"
SELECT *
FROM cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$CONFIRMED_REVERIFY_ITEMS_TSV"
SELECT *
FROM cx22073jw.v_access_post_apply_verification_latest_confirmed_only_items;
SQL

  echo "============================================================"
  echo "PHASE 3: BUILD MARKDOWN / JSON"
  echo "============================================================"

  CORE_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(core_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"

  LEGACY_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(legacy_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"

  OPERATIONS_STATUS="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(operations_status, 'unknown')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"

  CORE_BLOCKER_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(core_blocker_count::text, '0')
FROM cx22073jw.v_access_baseline_health_latest_summary
LIMIT 1;
SQL
  )"

  LEGACY_BLOCKER_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(blocker_count::text, '0')
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
  )"

  PENDING_CONFIRM_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(pending_confirmation_count::text, '0')
FROM cx22073jw.v_access_manual_apply_receipt_latest_pending_summary
LIMIT 1;
SQL
  )"

  CONFIRMED_APPLIED_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(confirmed_applied_count::text, '0')
FROM cx22073jw.v_access_manual_apply_receipt_latest_pending_summary
LIMIT 1;
SQL
  )"

  cat > "$MANIFEST_MD" <<EOF
# ============================================================
# ACCESS CURRENT STATE BUNDLE MANIFEST
# ============================================================

run_code: $RUN_CODE
generated_at: $RUN_TS
export_root: $EXPORT_ROOT

included_latest_sources:
- baseline_run_code: $BASELINE_RUN_CODE
- legacy_gate_run_code: $LEGACY_GATE_RUN_CODE
- retirement_plan_run_code: $RETIREMENT_PLAN_RUN_CODE
- manual_receipt_batch_code: $MANUAL_RECEIPT_BATCH_CODE
- confirmed_reverify_run_code: $CONFIRMED_REVERIFY_RUN_CODE

files:
- 000_manifest.md
- 010_summary.json
- 020_baseline_summary.tsv
- 021_baseline_items.tsv
- 030_legacy_gate_summary.tsv
- 031_legacy_gate_blockers.tsv
- 040_retirement_plan_summary.tsv
- 041_retirement_plan_items.tsv
- 050_manual_pending_summary.tsv
- 051_manual_receipt_items.tsv
- 060_confirmed_reverify_summary.tsv
- 061_confirmed_reverify_items.tsv
- 070_current_state_handoff.md
EOF

  cat > "$HANDOFF_MD" <<EOF
# ============================================================
# ACCESS CURRENT STATE HANDOFF
# ============================================================

status_snapshot:
- core_status: $CORE_STATUS
- legacy_status: $LEGACY_STATUS
- operations_status: $OPERATIONS_STATUS

key_counts:
- core_blocker_count: $CORE_BLOCKER_COUNT
- legacy_blocker_count: $LEGACY_BLOCKER_COUNT
- pending_confirmation_count: $PENDING_CONFIRM_COUNT
- confirmed_applied_count: $CONFIRMED_APPLIED_COUNT

source_runs:
- baseline_run_code: $BASELINE_RUN_CODE
- legacy_gate_run_code: $LEGACY_GATE_RUN_CODE
- retirement_plan_run_code: $RETIREMENT_PLAN_RUN_CODE
- manual_receipt_batch_code: $MANUAL_RECEIPT_BATCH_CODE
- confirmed_reverify_run_code: $CONFIRMED_REVERIFY_RUN_CODE

bundle_note:
This bundle is the portable snapshot of the current access state for review, handoff, or next-step planning.
EOF

  cat > "$SUMMARY_JSON" <<EOF
{
  "run_code": "$RUN_CODE",
  "baseline_run_code": "$BASELINE_RUN_CODE",
  "legacy_gate_run_code": "$LEGACY_GATE_RUN_CODE",
  "retirement_plan_run_code": "$RETIREMENT_PLAN_RUN_CODE",
  "manual_receipt_batch_code": "$MANUAL_RECEIPT_BATCH_CODE",
  "confirmed_reverify_run_code": "$CONFIRMED_REVERIFY_RUN_CODE",
  "core_status": "$CORE_STATUS",
  "legacy_status": "$LEGACY_STATUS",
  "operations_status": "$OPERATIONS_STATUS",
  "core_blocker_count": $CORE_BLOCKER_COUNT,
  "legacy_blocker_count": $LEGACY_BLOCKER_COUNT,
  "pending_confirmation_count": $PENDING_CONFIRM_COUNT,
  "confirmed_applied_count": $CONFIRMED_APPLIED_COUNT
}
EOF

  echo "============================================================"
  echo "PHASE 4: REGISTER FILES"
  echo "============================================================"

  for pair in \
    "manifest:$MANIFEST_MD" \
    "summary_json:$SUMMARY_JSON" \
    "baseline_summary_tsv:$BASELINE_SUMMARY_TSV" \
    "baseline_items_tsv:$BASELINE_ITEMS_TSV" \
    "legacy_gate_summary_tsv:$LEGACY_GATE_SUMMARY_TSV" \
    "legacy_gate_blockers_tsv:$LEGACY_GATE_BLOCKERS_TSV" \
    "retirement_plan_summary_tsv:$RETIREMENT_PLAN_SUMMARY_TSV" \
    "retirement_plan_items_tsv:$RETIREMENT_PLAN_ITEMS_TSV" \
    "manual_pending_summary_tsv:$MANUAL_PENDING_SUMMARY_TSV" \
    "manual_receipt_items_tsv:$MANUAL_RECEIPT_ITEMS_TSV" \
    "confirmed_reverify_summary_tsv:$CONFIRMED_REVERIFY_SUMMARY_TSV" \
    "confirmed_reverify_items_tsv:$CONFIRMED_REVERIFY_ITEMS_TSV" \
    "handoff_md:$HANDOFF_MD"
  do
    file_role="${pair%%:*}"
    file_path="${pair#*:}"

    esc_role="$(printf "%s" "$file_role" | sed "s/'/''/g")"
    esc_path="$(printf "%s" "$file_path" | sed "s/'/''/g")"

    psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.access_current_state_bundle_export_file (
  current_state_bundle_export_run_id,
  file_role,
  file_path
)
VALUES (
  '$EXPORT_RUN_ID',
  '$esc_role',
  '$esc_path'
);
SQL
  done

  FILE_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT COUNT(*)
FROM cx22073jw.access_current_state_bundle_export_file
WHERE current_state_bundle_export_run_id = '$EXPORT_RUN_ID';
SQL
  )"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
UPDATE cx22073jw.access_current_state_bundle_export_run
   SET file_count     = $FILE_COUNT,
       export_status  = CASE WHEN $FILE_COUNT > 0 THEN 'pass' ELSE 'error' END,
       ended_at       = NOW(),
       updated_at     = NOW()
 WHERE current_state_bundle_export_run_id = '$EXPORT_RUN_ID';
SQL

  echo "============================================================"
  echo "VERIFY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_current_state_bundle_export_latest_summary;
TABLE cx22073jw.v_access_current_state_bundle_export_latest_files;
SQL

  echo "============================================================"
  echo "ACCESS CURRENT STATE BUNDLE EXPORT DONE"
  echo "manifest   : $MANIFEST_MD"
  echo "summary    : $SUMMARY_JSON"
  echo "handoff_md : $HANDOFF_MD"
  echo "log_file   : $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
