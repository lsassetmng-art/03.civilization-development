#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_BASE="$BASE/exports/access-legacy-retirement-plan"

RUN_TS="$(date +%Y%m%d_%H%M%S)"
RUN_CODE="access_legacy_retirement_plan_${RUN_TS}"
RUN_DIR="$LOGS_DIR/${RUN_TS}_access_legacy_retirement_plan_export"
EXPORT_ROOT="$EXPORTS_BASE/$RUN_TS"

LOG_FILE="$RUN_DIR/000_run.log"
MANIFEST_MD="$EXPORT_ROOT/000_manifest.md"
LEGACY_VIEWS_TSV="$EXPORT_ROOT/010_legacy_view_candidates.tsv"
BLOCKERS_TSV="$EXPORT_ROOT/020_blockers.tsv"
RETIRE_SQL="$EXPORT_ROOT/030_manual_retire_legacy_views.sql"
RESTORE_SQL="$EXPORT_ROOT/040_manual_restore_legacy_views.sql"
SUMMARY_JSON="$EXPORT_ROOT/050_summary.json"

mkdir -p "$RUN_DIR" "$EXPORT_ROOT"

{
  echo "============================================================"
  echo "ACCESS LEGACY RETIREMENT PLAN EXPORT START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "run_code     : $RUN_CODE"
  echo "run_dir      : $RUN_DIR"
  echo "export_root  : $EXPORT_ROOT"
  echo "============================================================"

  echo "============================================================"
  echo "PHASE 1: CREATE PLAN REGISTRY"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

CREATE TABLE IF NOT EXISTS cx22073jw.access_legacy_retirement_plan_run (
  legacy_retirement_plan_run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                      text NOT NULL UNIQUE,
  source_gate_run_code          text NOT NULL,
  readiness_status_snapshot     text NOT NULL CHECK (readiness_status_snapshot IN ('ready','blocked','error')),
  legacy_view_count             integer NOT NULL DEFAULT 0,
  planned_drop_count            integer NOT NULL DEFAULT 0,
  blocker_count                 integer NOT NULL DEFAULT 0,
  export_root_path              text NOT NULL,
  plan_status                   text NOT NULL CHECK (plan_status IN ('ready_for_manual_retirement','blocked','error')),
  actor_name                    text NOT NULL DEFAULT 'Zero',
  note_text                     text,
  created_at                    timestamptz NOT NULL DEFAULT NOW(),
  updated_at                    timestamptz NOT NULL DEFAULT NOW(),
  ended_at                      timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_legacy_retirement_plan_item (
  legacy_retirement_plan_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_retirement_plan_run_id  uuid NOT NULL REFERENCES cx22073jw.access_legacy_retirement_plan_run(legacy_retirement_plan_run_id) ON DELETE CASCADE,
  item_group                     text NOT NULL CHECK (item_group IN ('legacy_view_candidate','blocker')),
  object_name                    text NOT NULL,
  plan_action                    text NOT NULL,
  detail_text                    text NOT NULL,
  created_at                     timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_access_legacy_retirement_plan_run_created
  ON cx22073jw.access_legacy_retirement_plan_run (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_legacy_retirement_plan_item_run
  ON cx22073jw.access_legacy_retirement_plan_item (legacy_retirement_plan_run_id, item_group, object_name);

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
      WHERE tg.tgname = 'trg_access_legacy_retirement_plan_run_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_legacy_retirement_plan_run'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_legacy_retirement_plan_run_updated_at
        BEFORE UPDATE ON cx22073jw.access_legacy_retirement_plan_run
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_legacy_retirement_plan_latest_summary AS
SELECT
  run_code,
  source_gate_run_code,
  readiness_status_snapshot,
  legacy_view_count,
  planned_drop_count,
  blocker_count,
  export_root_path,
  plan_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_legacy_retirement_plan_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_legacy_retirement_plan_latest_items AS
SELECT
  r.run_code,
  i.item_group,
  i.object_name,
  i.plan_action,
  i.detail_text,
  i.created_at
FROM cx22073jw.access_legacy_retirement_plan_item i
JOIN cx22073jw.access_legacy_retirement_plan_run r
  ON r.legacy_retirement_plan_run_id = i.legacy_retirement_plan_run_id
WHERE r.legacy_retirement_plan_run_id = (
  SELECT legacy_retirement_plan_run_id
  FROM cx22073jw.access_legacy_retirement_plan_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.item_group, i.object_name;

COMMIT;
SQL

  SOURCE_GATE_RUN_CODE="$(
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

  if [ -z "${SOURCE_GATE_RUN_CODE:-}" ] || [ -z "${READINESS_STATUS:-}" ]; then
    echo "ERROR: latest cutover gate summary not found"
    exit 1
  fi

  echo "SOURCE_GATE_RUN_CODE=$SOURCE_GATE_RUN_CODE"
  echo "READINESS_STATUS=$READINESS_STATUS"

  PLAN_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.access_legacy_retirement_plan_run (
  run_code,
  source_gate_run_code,
  readiness_status_snapshot,
  export_root_path,
  plan_status,
  actor_name,
  note_text
)
VALUES (
  '$RUN_CODE',
  '$SOURCE_GATE_RUN_CODE',
  '$READINESS_STATUS',
  '$EXPORT_ROOT',
  CASE
    WHEN '$READINESS_STATUS' = 'ready' THEN 'ready_for_manual_retirement'
    WHEN '$READINESS_STATUS' = 'blocked' THEN 'blocked'
    ELSE 'error'
  END,
  'Zero',
  CASE
    WHEN '$READINESS_STATUS' = 'ready'
      THEN 'Latest cutover gate is ready. Manual retirement SQL generated.'
    WHEN '$READINESS_STATUS' = 'blocked'
      THEN 'Latest cutover gate is blocked. Export blockers first.'
    ELSE 'Gate status is error. Retirement plan export is informational only.'
  END
)
RETURNING legacy_retirement_plan_run_id;
SQL
  )"

  if [ -z "${PLAN_RUN_ID:-}" ]; then
    echo "ERROR: plan run was not created"
    exit 1
  fi

  echo "PLAN_RUN_ID=$PLAN_RUN_ID"

  echo "============================================================"
  echo "PHASE 2: EXPORT LEGACY VIEW CANDIDATES"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LEGACY_VIEWS_TSV"
SELECT
  table_schema,
  table_name,
  regexp_replace(table_name, '^v_access_', 'v_access_') AS mapped_access_alias
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name LIKE 'v_access_%'
ORDER BY table_name;
SQL

  echo "============================================================"
  echo "PHASE 3: EXPORT BLOCKERS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BLOCKERS_TSV"
SELECT
  blocker_group,
  blocker_identity,
  blocker_detail
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
ORDER BY blocker_group, blocker_identity, blocker_detail;
SQL

  LEGACY_VIEW_COUNT="$(awk 'END{print NR+0}' "$LEGACY_VIEWS_TSV")"
  BLOCKER_COUNT="$(awk 'END{print NR+0}' "$BLOCKERS_TSV")"

  cat > "$MANIFEST_MD" <<EOF
# ============================================================
# ACCESS LEGACY RETIREMENT PLAN MANIFEST
# ============================================================

run_code: $RUN_CODE
source_gate_run_code: $SOURCE_GATE_RUN_CODE
readiness_status_snapshot: $READINESS_STATUS
generated_at: $RUN_TS
export_root: $EXPORT_ROOT

files:
- 000_manifest.md
- 010_legacy_view_candidates.tsv
- 020_blockers.tsv
- 030_manual_retire_legacy_views.sql
- 040_manual_restore_legacy_views.sql
- 050_summary.json

notes:
- manual execution only
- no retirement executed by this step
- blocked status means keep legacy views for now
EOF

  cat > "$RETIRE_SQL" <<EOF
-- ============================================================
-- ACCESS LEGACY MANUAL RETIRE SQL
-- ============================================================
-- run_code: $RUN_CODE
-- source_gate_run_code: $SOURCE_GATE_RUN_CODE
-- readiness_status_snapshot: $READINESS_STATUS
-- generated_at: $RUN_TS
-- manual review required
-- ============================================================

EOF

  cat > "$RESTORE_SQL" <<EOF
-- ============================================================
-- ACCESS LEGACY MANUAL RESTORE SQL
-- ============================================================
-- run_code: $RUN_CODE
-- source_gate_run_code: $SOURCE_GATE_RUN_CODE
-- readiness_status_snapshot: $READINESS_STATUS
-- generated_at: $RUN_TS
-- manual review required
-- ============================================================

EOF

  if [ "$READINESS_STATUS" = "ready" ]; then
    while IFS=$'\t' read -r schema_name legacy_view_name mapped_access_alias; do
      [ -n "${legacy_view_name:-}" ] || continue

      esc_obj="$(printf "%s" "$schema_name.$legacy_view_name" | sed "s/'/''/g")"
      esc_detail="$(printf "mapped to %s.%s" "$schema_name" "$mapped_access_alias" | sed "s/'/''/g")"

      psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.access_legacy_retirement_plan_item (
  legacy_retirement_plan_run_id,
  item_group,
  object_name,
  plan_action,
  detail_text
)
VALUES (
  '$PLAN_RUN_ID',
  'legacy_view_candidate',
  '$esc_obj',
  'drop_legacy_view',
  '$esc_detail'
);
SQL

      cat >> "$RETIRE_SQL" <<EOF
DROP VIEW IF EXISTS ${schema_name}.${legacy_view_name};

EOF

      cat >> "$RESTORE_SQL" <<EOF
CREATE OR REPLACE VIEW ${schema_name}.${legacy_view_name} AS
SELECT *
FROM ${schema_name}.${mapped_access_alias};

EOF
    done < "$LEGACY_VIEWS_TSV"
  else
    while IFS=$'\t' read -r blocker_group blocker_identity blocker_detail; do
      [ -n "${blocker_identity:-}" ] || continue

      esc_obj="$(printf "%s" "$blocker_identity" | sed "s/'/''/g")"
      esc_detail="$(printf "%s: %s" "$blocker_group" "$blocker_detail" | sed "s/'/''/g")"

      psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.access_legacy_retirement_plan_item (
  legacy_retirement_plan_run_id,
  item_group,
  object_name,
  plan_action,
  detail_text
)
VALUES (
  '$PLAN_RUN_ID',
  'blocker',
  '$esc_obj',
  'keep_until_blockers_resolved',
  '$esc_detail'
);
SQL
    done < "$BLOCKERS_TSV"

    cat >> "$RETIRE_SQL" <<'EOF'
-- blocked:
-- legacy compatibility views must remain for now
-- resolve blockers first, then rerun the retirement plan export

EOF

    cat >> "$RESTORE_SQL" <<'EOF'
-- blocked:
-- restore script is informational only because retirement is not yet allowed

EOF
  fi

  PLANNED_DROP_COUNT="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT COUNT(*)
FROM cx22073jw.access_legacy_retirement_plan_item
WHERE legacy_retirement_plan_run_id = '$PLAN_RUN_ID'
  AND item_group = 'legacy_view_candidate';
SQL
  )"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
UPDATE cx22073jw.access_legacy_retirement_plan_run
   SET legacy_view_count  = $LEGACY_VIEW_COUNT,
       planned_drop_count = $PLANNED_DROP_COUNT,
       blocker_count      = $BLOCKER_COUNT,
       ended_at           = NOW(),
       updated_at         = NOW()
 WHERE legacy_retirement_plan_run_id = '$PLAN_RUN_ID';
SQL

  cat > "$SUMMARY_JSON" <<EOF
{
  "run_code": "$RUN_CODE",
  "source_gate_run_code": "$SOURCE_GATE_RUN_CODE",
  "readiness_status_snapshot": "$READINESS_STATUS",
  "legacy_view_count": $LEGACY_VIEW_COUNT,
  "planned_drop_count": $PLANNED_DROP_COUNT,
  "blocker_count": $BLOCKER_COUNT,
  "plan_status": "$( [ "$READINESS_STATUS" = "ready" ] && echo ready_for_manual_retirement || echo blocked )"
}
EOF

  echo "============================================================"
  echo "VERIFY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_legacy_retirement_plan_latest_summary;

SELECT
  item_group,
  COUNT(*) AS item_count
FROM cx22073jw.v_access_legacy_retirement_plan_latest_items
GROUP BY item_group
ORDER BY item_group;

TABLE cx22073jw.v_access_legacy_retirement_plan_latest_items;
SQL

  echo "============================================================"
  echo "ACCESS LEGACY RETIREMENT PLAN EXPORT DONE"
  echo "manifest   : $MANIFEST_MD"
  echo "candidates : $LEGACY_VIEWS_TSV"
  echo "blockers   : $BLOCKERS_TSV"
  echo "retire_sql : $RETIRE_SQL"
  echo "restore_sql: $RESTORE_SQL"
  echo "summary    : $SUMMARY_JSON"
  echo "log_file   : $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
