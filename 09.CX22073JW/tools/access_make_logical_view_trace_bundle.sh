#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

LOGICAL_VIEW_NAME="${1:-}"
BATCH_CODE="${2:-}"

if [ -z "$LOGICAL_VIEW_NAME" ]; then
  echo "USAGE: access_make_logical_view_trace_bundle.sh LOGICAL_VIEW_NAME [BATCH_CODE]"
  exit 1
fi

if [ -z "${BATCH_CODE:-}" ]; then
  BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT batch_code
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;
SQL
  )"
fi

if [ -z "${BATCH_CODE:-}" ]; then
  echo "ERROR: latest access_manual_apply_receipt_batch not found"
  exit 1
fi

SAFE_VIEW="$(printf '%s' "$LOGICAL_VIEW_NAME" | tr -c 'A-Za-z0-9._-' '_')"
OUT_DIR="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/logs/$(date +%Y%m%d_%H%M%S)_access_logical_view_trace_${SAFE_VIEW}"
MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_logical_view_trace_summary.md"
RECEIPT_ITEMS_TSV="$OUT_DIR/020_receipt_items.tsv"
CONFIRMATION_LOG_TSV="$OUT_DIR/030_confirmation_log.tsv"
REVERIFY_ITEMS_TSV="$OUT_DIR/040_confirmed_only_reverify_items.tsv"
LEGACY_BLOCKERS_TSV="$OUT_DIR/050_legacy_blockers.tsv"

mkdir -p "$OUT_DIR"

ESC_VIEW="$(printf "%s" "$LOGICAL_VIEW_NAME" | sed "s/'/''/g")"
ESC_BATCH="$(printf "%s" "$BATCH_CODE" | sed "s/'/''/g")"

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<SQL > "$RECEIPT_ITEMS_TSV"
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
WHERE b.batch_code = '$ESC_BATCH'
  AND i.logical_view_name = '$ESC_VIEW'
ORDER BY i.request_code, i.created_at;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<SQL > "$CONFIRMATION_LOG_TSV"
SELECT
  b.batch_code,
  l.request_code,
  l.actual_view_code,
  l.logical_view_name,
  l.previous_receipt_status,
  l.new_receipt_status,
  l.executor_name,
  l.confirmation_note,
  l.created_at
FROM cx22073jw.access_manual_apply_confirmation_log l
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = l.manual_apply_receipt_batch_id
WHERE b.batch_code = '$ESC_BATCH'
  AND l.logical_view_name = '$ESC_VIEW'
ORDER BY l.created_at DESC, l.request_code;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<SQL > "$REVERIFY_ITEMS_TSV"
SELECT
  run_code,
  source_receipt_batch_code,
  request_code,
  target_domain_code,
  target_role_code,
  actual_view_code,
  logical_view_name,
  expected_db_role_name,
  role_exists_flag,
  view_exists_flag,
  select_grant_present_flag,
  verification_status,
  result_note,
  created_at
FROM cx22073jw.v_access_post_apply_verification_latest_confirmed_only_items
WHERE source_receipt_batch_code = '$ESC_BATCH'
  AND logical_view_name = '$ESC_VIEW'
ORDER BY request_code, created_at;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<SQL > "$LEGACY_BLOCKERS_TSV"
SELECT
  blocker_group,
  blocker_identity,
  blocker_detail,
  created_at
FROM cx22073jw.v_access_legacy_cutover_gate_latest_blockers
WHERE blocker_identity ILIKE '%' || '$ESC_VIEW' || '%'
   OR blocker_detail ILIKE '%' || '$ESC_VIEW' || '%'
ORDER BY blocker_group, blocker_identity, created_at;
SQL

ITEM_COUNT="$(awk 'END{print NR+0}' "$RECEIPT_ITEMS_TSV")"
CONFIRM_COUNT="$(awk 'END{print NR+0}' "$CONFIRMATION_LOG_TSV")"
REVERIFY_COUNT="$(awk 'END{print NR+0}' "$REVERIFY_ITEMS_TSV")"
LEGACY_COUNT="$(awk 'END{print NR+0}' "$LEGACY_BLOCKERS_TSV")"

cat > "$MANIFEST_MD" <<EOF_VIEW_MANIFEST
# ============================================================
# ACCESS LOGICAL VIEW TRACE BUNDLE MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
logical_view_name: $LOGICAL_VIEW_NAME
batch_code: $BATCH_CODE
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_logical_view_trace_summary.md
- 020_receipt_items.tsv
- 030_confirmation_log.tsv
- 040_confirmed_only_reverify_items.tsv
- 050_legacy_blockers.tsv
EOF_VIEW_MANIFEST

cat > "$SUMMARY_MD" <<EOF_VIEW_SUMMARY
# ============================================================
# ACCESS LOGICAL VIEW TRACE SUMMARY
# ============================================================

logical_view_name: $LOGICAL_VIEW_NAME
batch_code: $BATCH_CODE

counts:
- receipt_items: $ITEM_COUNT
- confirmation_log_rows: $CONFIRM_COUNT
- confirmed_only_reverify_rows: $REVERIFY_COUNT
- legacy_blocker_rows: $LEGACY_COUNT

note:
This bundle is intended for logical-view-level investigation and handoff.
EOF_VIEW_SUMMARY

echo "============================================================"
echo "ACCESS LOGICAL VIEW TRACE BUNDLE CREATED"
echo "============================================================"
echo "out_dir     : $OUT_DIR"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
