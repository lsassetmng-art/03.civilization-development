#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

LATEST_BATCH_CODE="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT batch_code
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;
SQL
)"

echo "============================================================"
echo "ACCESS LIST PENDING REQUESTS"
echo "============================================================"

if [ -z "${LATEST_BATCH_CODE:-}" ]; then
  echo "NO_LATEST_BATCH"
  exit 0
fi

echo "latest_batch_code : $LATEST_BATCH_CODE"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT
  request_code,
  COUNT(*) AS pending_item_count
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.batch_code = '$LATEST_BATCH_CODE'
  AND i.receipt_status = 'pending_confirmation'
GROUP BY request_code
ORDER BY request_code;
SQL

echo "============================================================"
echo "ACCESS LIST PENDING REQUESTS DONE"
echo "============================================================"
