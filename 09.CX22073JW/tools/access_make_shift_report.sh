#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
OUT_DIR="$BASE/logs/$(date +%Y%m%d_%H%M%S)_access_shift_report"
REPORT_MD="$OUT_DIR/000_access_shift_report.md"
BASELINE_TSV="$OUT_DIR/010_baseline_blockers.tsv"
LEGACY_TSV="$OUT_DIR/020_legacy_blockers.tsv"
MANUAL_TSV="$OUT_DIR/030_manual_pending.tsv"
REVERIFY_TSV="$OUT_DIR/040_reverify_blockers.tsv"

mkdir -p "$OUT_DIR"

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$BASELINE_TSV"
SELECT
  check_group,
  check_code,
  observed_value,
  expected_rule,
  check_status,
  detail_text
FROM cx22073jw.v_access_baseline_health_latest_items
WHERE severity = 'blocker'
  AND check_status = 'fail'
ORDER BY check_group, check_code;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$LEGACY_TSV"
SELECT
  blocker_group,
  blocker_identity,
  blocker_detail
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
ORDER BY blocker_group, blocker_identity;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$MANUAL_TSV"
SELECT
  request_code,
  logical_view_name,
  expected_db_role_name,
  receipt_status,
  manual_executor_name,
  manual_apply_note
FROM cx22073jw.v_access_manual_apply_receipt_latest_items
WHERE receipt_status IN ('pending_confirmation','confirmed_failed')
ORDER BY request_code, logical_view_name;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$REVERIFY_TSV"
SELECT
  request_code,
  logical_view_name,
  expected_db_role_name,
  verification_status,
  result_note
FROM cx22073jw.v_access_post_apply_verification_latest_confirmed_only_items
WHERE verification_status IN ('not_yet_applied','precheck_fail')
ORDER BY request_code, logical_view_name;
SQL

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

BASELINE_COUNT="$(awk 'END{print NR+0}' "$BASELINE_TSV")"
LEGACY_COUNT="$(awk 'END{print NR+0}' "$LEGACY_TSV")"
MANUAL_COUNT="$(awk 'END{print NR+0}' "$MANUAL_TSV")"
REVERIFY_COUNT="$(awk 'END{print NR+0}' "$REVERIFY_TSV")"

cat > "$REPORT_MD" <<SHIFT_REPORT_MD
# ============================================================
# ACCESS SHIFT REPORT
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
core_status: $CORE_STATUS
legacy_status: $LEGACY_STATUS
operations_status: $OPERATIONS_STATUS

open_counts:
- baseline_blockers: $BASELINE_COUNT
- legacy_blockers: $LEGACY_COUNT
- manual_pending_or_failed: $MANUAL_COUNT
- reverify_blockers: $REVERIFY_COUNT

artifacts:
- 010_baseline_blockers.tsv
- 020_legacy_blockers.tsv
- 030_manual_pending.tsv
- 040_reverify_blockers.tsv

note:
Use this report for operator handoff and next-shift review.
SHIFT_REPORT_MD

echo "============================================================"
echo "ACCESS SHIFT REPORT CREATED"
echo "============================================================"
echo "out_dir   : $OUT_DIR"
echo "report_md : $REPORT_MD"
echo "============================================================"
sed -n '1,120p' "$REPORT_MD"
