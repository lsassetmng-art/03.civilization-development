#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
EXPORTS_BASE="$BASE/exports/ai-employee-activation-review"

RUN_TS="$(date +%Y%m%d_%H%M%S)"
EXPORT_RUN_CODE="access_activation_review_export_${RUN_TS}"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_activation_review_package_export.log"

EXPORT_ROOT="$EXPORTS_BASE/$RUN_TS"
mkdir -p "$LOGS_DIR" "$EXPORT_ROOT"

MANIFEST_MD="$EXPORT_ROOT/000_manifest.md"
REQUEST_SUMMARY_TSV="$EXPORT_ROOT/010_request_summary.tsv"
DECISION_MATRIX_TSV="$EXPORT_ROOT/020_decision_matrix.tsv"
APPLY_PLAN_SQL="$EXPORT_ROOT/030_apply_plan_skeleton.sql"
GATE_REJECTED_TSV="$EXPORT_ROOT/040_gate_or_rejected.tsv"
EXPORT_SUMMARY_JSON="$EXPORT_ROOT/050_export_summary.json"

{
  echo "============================================================"
  echo "CX22073JW ACCESS ACTIVATION REVIEW PACKAGE EXPORT START"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "export_run   : $EXPORT_RUN_CODE"
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
      AND table_name = 'v_access_activation_request_intersection_summary'
  ) THEN
    RAISE EXCEPTION 'v_access_activation_request_intersection_summary is required before activation review export';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.views
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'v_access_role_access_bundle_item_matrix'
  ) THEN
    RAISE EXCEPTION 'v_access_role_access_bundle_item_matrix is required before activation review export';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_activation_request'
  ) THEN
    RAISE EXCEPTION 'access_activation_request is required before activation review export';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_activation_request_view_decision'
  ) THEN
    RAISE EXCEPTION 'access_activation_request_view_decision is required before activation review export';
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
      'access_activation_review_export',
      'AI Employee Activation Review Export',
      'normal',
      'integration',
      'Activation review package export and apply plan skeleton for AI employees'
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

CREATE TABLE IF NOT EXISTS cx22073jw.access_activation_review_export_run (
  activation_review_export_run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_code                        text NOT NULL UNIQUE,
  export_root_path               text NOT NULL,
  manifest_md_path               text,
  request_summary_tsv_path       text,
  decision_matrix_tsv_path       text,
  apply_plan_sql_path            text,
  gate_rejected_tsv_path         text,
  export_summary_json_path       text,
  request_count                  integer NOT NULL DEFAULT 0,
  decision_count                 integer NOT NULL DEFAULT 0,
  allowed_count                  integer NOT NULL DEFAULT 0,
  gate_count                     integer NOT NULL DEFAULT 0,
  scope_count                    integer NOT NULL DEFAULT 0,
  rank_count                     integer NOT NULL DEFAULT 0,
  rejected_count                 integer NOT NULL DEFAULT 0,
  run_status                     text NOT NULL CHECK (run_status IN ('running','pass','partial','error')),
  actor_name                     text NOT NULL DEFAULT 'Zero',
  note_text                      text,
  created_at                     timestamptz NOT NULL DEFAULT NOW(),
  updated_at                     timestamptz NOT NULL DEFAULT NOW(),
  ended_at                       timestamptz
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_activation_review_export_item (
  activation_review_export_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_review_export_run_id uuid NOT NULL REFERENCES cx22073jw.access_activation_review_export_run(activation_review_export_run_id) ON DELETE CASCADE,
  request_code                    text NOT NULL,
  target_domain_code              text NOT NULL,
  target_role_code                text NOT NULL,
  actual_view_code                text NOT NULL,
  logical_view_name               text NOT NULL,
  decision_status                 text NOT NULL,
  gate_needed                     boolean NOT NULL DEFAULT false,
  decision_action_hint            text NOT NULL CHECK (
                                   decision_action_hint IN (
                                     'allow_apply_candidate',
                                     'gate_review_required',
                                     'scope_review_required',
                                     'rank_review_required',
                                     'reject_hold'
                                   )
                                 ),
  created_at                      timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_access_activation_review_export_run_created
  ON cx22073jw.access_activation_review_export_run (created_at DESC);

CREATE INDEX IF NOT EXISTS ix_access_activation_review_export_item_run
  ON cx22073jw.access_activation_review_export_item (activation_review_export_run_id, request_code, decision_status);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'cx22073jw'
      AND p.proname = 'fn_set_updated_at'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_activation_review_export_run_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_activation_review_export_run'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_activation_review_export_run_updated_at
        BEFORE UPDATE ON cx22073jw.access_activation_review_export_run
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE VIEW cx22073jw.v_access_activation_review_export_latest_summary AS
SELECT
  run_code,
  export_root_path,
  request_count,
  decision_count,
  allowed_count,
  gate_count,
  scope_count,
  rank_count,
  rejected_count,
  run_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_activation_review_export_run
ORDER BY created_at DESC
LIMIT 1;

CREATE OR REPLACE VIEW cx22073jw.v_access_activation_review_export_latest_items AS
SELECT
  r.run_code,
  i.request_code,
  i.target_domain_code,
  i.target_role_code,
  i.actual_view_code,
  i.logical_view_name,
  i.decision_status,
  i.gate_needed,
  i.decision_action_hint
FROM cx22073jw.access_activation_review_export_item i
JOIN cx22073jw.access_activation_review_export_run r
  ON r.activation_review_export_run_id = i.activation_review_export_run_id
WHERE r.activation_review_export_run_id = (
  SELECT activation_review_export_run_id
  FROM cx22073jw.access_activation_review_export_run
  ORDER BY created_at DESC
  LIMIT 1
)
ORDER BY i.request_code, i.logical_view_name;

COMMIT;
SQL

  EXPORT_RUN_ID="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
INSERT INTO cx22073jw.access_activation_review_export_run (
  run_code,
  export_root_path,
  run_status,
  actor_name,
  note_text
)
VALUES (
  '$EXPORT_RUN_CODE',
  '$EXPORT_ROOT',
  'running',
  'Zero',
  'Exporting evaluated activation requests for human review.'
)
RETURNING activation_review_export_run_id;
SQL
  )"

  echo "EXPORT_RUN_ID=$EXPORT_RUN_ID"

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$REQUEST_SUMMARY_TSV"
SELECT
  request_code,
  target_domain_code,
  target_role_code,
  COALESCE(requested_rank_code, ''),
  COALESCE(requested_app_scope, ''),
  request_status,
  total_decision_count,
  allowed_upper_bound_count,
  requires_gate_count,
  requires_scope_count,
  requires_rank_count,
  rejected_count
FROM cx22073jw.v_access_activation_request_intersection_summary
ORDER BY created_at DESC, request_code;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$DECISION_MATRIX_TSV"
SELECT
  r.request_code,
  r.target_domain_code,
  r.target_role_code,
  d.actual_view_code,
  d.logical_view_name,
  d.bundle_inclusion_mode,
  CASE WHEN d.gate_needed THEN 'true' ELSE 'false' END,
  d.decision_status,
  COALESCE(d.decision_note, '')
FROM cx22073jw.access_activation_request_view_decision d
JOIN cx22073jw.access_activation_request r
  ON r.activation_request_id = d.activation_request_id
ORDER BY r.created_at DESC, r.request_code, d.logical_view_name;
SQL

  psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$GATE_REJECTED_TSV"
SELECT
  r.request_code,
  r.target_domain_code,
  r.target_role_code,
  d.actual_view_code,
  d.logical_view_name,
  d.decision_status,
  COALESCE(d.decision_note, '')
FROM cx22073jw.access_activation_request_view_decision d
JOIN cx22073jw.access_activation_request r
  ON r.activation_request_id = d.activation_request_id
WHERE d.decision_status IN ('requires_gate','rejected')
ORDER BY r.created_at DESC, r.request_code, d.logical_view_name;
SQL

  cat > "$MANIFEST_MD" <<__MANIFEST__
# ============================================================
# ACCESS ACTIVATION REVIEW PACKAGE MANIFEST
# ============================================================

export_run_code: $EXPORT_RUN_CODE
generated_at: $RUN_TS
export_root: $EXPORT_ROOT

files:
- 000_manifest.md
- 010_request_summary.tsv
- 020_decision_matrix.tsv
- 030_apply_plan_skeleton.sql
- 040_gate_or_rejected.tsv
- 050_export_summary.json

notes:
- This package is for human review and governed apply planning
- No runtime GRANT or activation apply is executed in this step
- allowed_upper_bound means candidate only, not auto-approved
- requires_gate / rejected must not be auto-applied
__MANIFEST__

  cat > "$APPLY_PLAN_SQL" <<__APPLYPLAN__
-- ============================================================
-- ACCESS ACTIVATION APPLY PLAN SKELETON
-- ============================================================
-- generated_at: $RUN_TS
-- export_run_code: $EXPORT_RUN_CODE
-- caution:
--   this is a review skeleton only
--   do not auto-execute without governed approval
-- ============================================================

__APPLYPLAN__

  if [ -s "$DECISION_MATRIX_TSV" ]; then
    awk -F'\t' '
      {
        req=$1
        domain=$2
        role=$3
        actual=$4
        logical=$5
        inclusion=$6
        gate=$7
        status=$8

        if (status == "allowed_upper_bound") {
          print "-- ------------------------------------------------------------"
          print "-- request_code: " req
          print "-- domain_code : " domain
          print "-- role_code   : " role
          print "-- actual_view : " actual
          print "-- logical_view: " logical
          print "-- inclusion   : " inclusion
          print "-- gate_needed : " gate
          print "-- action_hint : allow_apply_candidate"
          print "-- example next controlled step:"
          print "-- INSERT INTO governed_apply_queue(...) VALUES (...);"
          print "-- REVIEW BEFORE APPLY"
          print ""
        }
        else if (status == "requires_gate") {
          print "-- ------------------------------------------------------------"
          print "-- request_code: " req
          print "-- domain_code : " domain
          print "-- role_code   : " role
          print "-- actual_view : " actual
          print "-- logical_view: " logical
          print "-- action_hint : gate_review_required"
          print "-- separate gate approval required before any apply planning"
          print ""
        }
      }
    ' "$DECISION_MATRIX_TSV" >> "$APPLY_PLAN_SQL"
  fi

  REQUEST_COUNT="$(wc -l < "$REQUEST_SUMMARY_TSV" | tr -d '[:space:]')"
  DECISION_COUNT="$(wc -l < "$DECISION_MATRIX_TSV" | tr -d '[:space:]')"
  ALLOWED_COUNT="$(awk -F'\t' '$8=="allowed_upper_bound"{c++} END{print c+0}' "$DECISION_MATRIX_TSV")"
  GATE_COUNT="$(awk -F'\t' '$8=="requires_gate"{c++} END{print c+0}' "$DECISION_MATRIX_TSV")"
  SCOPE_COUNT="$(awk -F'\t' '$8=="requires_scope_intersection"{c++} END{print c+0}' "$DECISION_MATRIX_TSV")"
  RANK_COUNT="$(awk -F'\t' '$8=="requires_rank_intersection"{c++} END{print c+0}' "$DECISION_MATRIX_TSV")"
  REJECTED_COUNT="$(awk -F'\t' '$8=="rejected"{c++} END{print c+0}' "$DECISION_MATRIX_TSV")"

  cat > "$EXPORT_SUMMARY_JSON" <<__SUMMARYJSON__
{
  "export_run_code": "$EXPORT_RUN_CODE",
  "generated_at": "$RUN_TS",
  "export_root": "$EXPORT_ROOT",
  "request_count": $REQUEST_COUNT,
  "decision_count": $DECISION_COUNT,
  "allowed_count": $ALLOWED_COUNT,
  "gate_count": $GATE_COUNT,
  "scope_count": $SCOPE_COUNT,
  "rank_count": $RANK_COUNT,
  "rejected_count": $REJECTED_COUNT,
  "notes": [
    "review package only",
    "allowed_upper_bound is not runtime approval",
    "gate and rejected items must not be auto-applied"
  ]
}
__SUMMARYJSON__

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO cx22073jw.access_activation_review_export_item (
  activation_review_export_run_id,
  request_code,
  target_domain_code,
  target_role_code,
  actual_view_code,
  logical_view_name,
  decision_status,
  gate_needed,
  decision_action_hint
)
SELECT
  '$EXPORT_RUN_ID',
  r.request_code,
  r.target_domain_code,
  r.target_role_code,
  d.actual_view_code,
  d.logical_view_name,
  d.decision_status,
  d.gate_needed,
  CASE
    WHEN d.decision_status = 'allowed_upper_bound' THEN 'allow_apply_candidate'
    WHEN d.decision_status = 'requires_gate' THEN 'gate_review_required'
    WHEN d.decision_status = 'requires_scope_intersection' THEN 'scope_review_required'
    WHEN d.decision_status = 'requires_rank_intersection' THEN 'rank_review_required'
    ELSE 'reject_hold'
  END AS decision_action_hint
FROM cx22073jw.access_activation_request_view_decision d
JOIN cx22073jw.access_activation_request r
  ON r.activation_request_id = d.activation_request_id;

UPDATE cx22073jw.access_activation_review_export_run
   SET manifest_md_path         = '$MANIFEST_MD',
       request_summary_tsv_path = '$REQUEST_SUMMARY_TSV',
       decision_matrix_tsv_path = '$DECISION_MATRIX_TSV',
       apply_plan_sql_path      = '$APPLY_PLAN_SQL',
       gate_rejected_tsv_path   = '$GATE_REJECTED_TSV',
       export_summary_json_path = '$EXPORT_SUMMARY_JSON',
       request_count            = $REQUEST_COUNT,
       decision_count           = $DECISION_COUNT,
       allowed_count            = $ALLOWED_COUNT,
       gate_count               = $GATE_COUNT,
       scope_count              = $SCOPE_COUNT,
       rank_count               = $RANK_COUNT,
       rejected_count           = $REJECTED_COUNT,
       run_status               = CASE
                                    WHEN $DECISION_COUNT > 0 THEN 'pass'
                                    ELSE 'error'
                                  END,
       note_text                = CASE
                                    WHEN $DECISION_COUNT > 0 THEN 'Activation review package export completed.'
                                    ELSE 'No evaluated activation decisions found.'
                                  END,
       ended_at                 = NOW(),
       updated_at               = NOW()
 WHERE activation_review_export_run_id = '$EXPORT_RUN_ID';
SQL

  echo "============================================================"
  echo "EXPORTED FILES"
  echo "============================================================"
  find "$EXPORT_ROOT" -maxdepth 1 -type f | LC_ALL=C sort

  echo "============================================================"
  echo "LATEST ACTIVATION REVIEW EXPORT SUMMARY"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_activation_review_export_latest_summary;

SELECT
  request_code,
  COUNT(*) AS exported_item_count
FROM cx22073jw.v_access_activation_review_export_latest_items
GROUP BY request_code
ORDER BY request_code;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS ACTIVATION REVIEW PACKAGE EXPORT DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
