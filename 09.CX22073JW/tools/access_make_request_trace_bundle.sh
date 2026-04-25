#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

REQUEST_CODE="${1:-}"
BATCH_CODE="${2:-}"

if [ -z "$REQUEST_CODE" ]; then
  echo "USAGE: access_make_request_trace_bundle.sh REQUEST_CODE [BATCH_CODE]"
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

SAFE_REQUEST="$(printf '%s' "$REQUEST_CODE" | tr -c 'A-Za-z0-9._-' '_')"
OUT_DIR="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/logs/$(date +%Y%m%d_%H%M%S)_access_request_trace_${SAFE_REQUEST}"
MANIFEST_MD="$OUT_DIR/000_manifest.md"
SUMMARY_MD="$OUT_DIR/010_request_trace_summary.md"
RECEIPT_BATCH_TSV="$OUT_DIR/020_receipt_batch.tsv"
RECEIPT_ITEMS_TSV="$OUT_DIR/021_receipt_items.tsv"
CONFIRMATION_LOG_TSV="$OUT_DIR/030_confirmation_log.tsv"
REVERIFY_ITEMS_TSV="$OUT_DIR/040_confirmed_only_reverify_items.tsv"
STATUS_SUMMARY_TSV="$OUT_DIR/050_status_summary.tsv"

mkdir -p "$OUT_DIR"

ESC_REQUEST="$(printf "%s" "$REQUEST_CODE" | sed "s/'/''/g")"
ESC_BATCH="$(printf "%s" "$BATCH_CODE" | sed "s/'/''/g")"

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<SQL > "$RECEIPT_BATCH_TSV"
SELECT
  batch_code,
  source_handoff_run_code,
  source_export_root_path,
  requested_item_count,
  seeded_item_count,
  batch_status,
  note_text,
  created_at,
  ended_at
FROM cx22073jw.access_manual_apply_receipt_batch
WHERE batch_code = '$ESC_BATCH';
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<SQL > "$RECEIPT_ITEMS_TSV"
SELECT
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
  AND i.request_code = '$ESC_REQUEST'
ORDER BY i.logical_view_name, i.created_at;
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
  AND l.request_code = '$ESC_REQUEST'
ORDER BY l.created_at DESC, l.logical_view_name;
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
  AND request_code = '$ESC_REQUEST'
ORDER BY logical_view_name, created_at;
SQL

psql "$PERSONA_DATABASE_URL" -XqAt -F $'\t' -v ON_ERROR_STOP=1 <<SQL > "$STATUS_SUMMARY_TSV"
SELECT
  i.receipt_status,
  COUNT(*) AS item_count
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.batch_code = '$ESC_BATCH'
  AND i.request_code = '$ESC_REQUEST'
GROUP BY i.receipt_status
ORDER BY i.receipt_status;
SQL

ITEM_COUNT="$(awk 'END{print NR+0}' "$RECEIPT_ITEMS_TSV")"
CONFIRM_COUNT="$(awk 'END{print NR+0}' "$CONFIRMATION_LOG_TSV")"
REVERIFY_COUNT="$(awk 'END{print NR+0}' "$REVERIFY_ITEMS_TSV")"

cat > "$MANIFEST_MD" <<EOF_REQUEST_MANIFEST
# ============================================================
# ACCESS REQUEST TRACE BUNDLE MANIFEST
# ============================================================

generated_at: $(date '+%Y-%m-%d %H:%M:%S')
request_code: $REQUEST_CODE
batch_code: $BATCH_CODE
out_dir: $OUT_DIR

included_files:
- 000_manifest.md
- 010_request_trace_summary.md
- 020_receipt_batch.tsv
- 021_receipt_items.tsv
- 030_confirmation_log.tsv
- 040_confirmed_only_reverify_items.tsv
- 050_status_summary.tsv
EOF_REQUEST_MANIFEST

cat > "$SUMMARY_MD" <<EOF_REQUEST_SUMMARY
# ============================================================
# ACCESS REQUEST TRACE SUMMARY
# ============================================================

request_code: $REQUEST_CODE
batch_code: $BATCH_CODE

counts:
- receipt_items: $ITEM_COUNT
- confirmation_log_rows: $CONFIRM_COUNT
- confirmed_only_reverify_rows: $REVERIFY_COUNT

note:
This bundle is intended for request-level investigation and handoff.
EOF_REQUEST_SUMMARY

echo "============================================================"
echo "ACCESS REQUEST TRACE BUNDLE CREATED"
echo "============================================================"
echo "out_dir     : $OUT_DIR"
echo "manifest_md : $MANIFEST_MD"
echo "summary_md  : $SUMMARY_MD"
echo "============================================================"
sed -n '1,120p' "$SUMMARY_MD"
