#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

NEW_STATUS="${1:-confirmed_applied}"
EXECUTOR_NAME="${2:-Zero}"
CONFIRM_NOTE="${3:-bulk confirm from access_bulk_confirm_all_pending.sh}"
BATCH_CODE="${4:-}"

case "$NEW_STATUS" in
  confirmed_applied|confirmed_skipped|confirmed_failed)
    ;;
  *)
    echo "ERROR: unsupported status -> $NEW_STATUS"
    echo "allowed: confirmed_applied | confirmed_skipped | confirmed_failed"
    exit 1
    ;;
esac

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

PENDING_REQUESTS="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL
SELECT DISTINCT i.request_code
FROM cx22073jw.access_manual_apply_receipt_item i
JOIN cx22073jw.access_manual_apply_receipt_batch b
  ON b.manual_apply_receipt_batch_id = i.manual_apply_receipt_batch_id
WHERE b.batch_code = '$BATCH_CODE'
  AND i.receipt_status = 'pending_confirmation'
ORDER BY i.request_code;
SQL
)"

echo "============================================================"
echo "ACCESS BULK CONFIRM ALL PENDING"
echo "============================================================"
echo "batch_code : $BATCH_CODE"
echo "new_status : $NEW_STATUS"
echo "executor   : $EXECUTOR_NAME"
echo "============================================================"

if [ -z "${PENDING_REQUESTS:-}" ]; then
  echo "NO_PENDING_REQUESTS"
  exit 0
fi

ESC_EXECUTOR="$(printf "%s" "$EXECUTOR_NAME" | sed "s/'/''/g")"
ESC_NOTE="$(printf "%s" "$CONFIRM_NOTE" | sed "s/'/''/g")"
ESC_BATCH="$(printf "%s" "$BATCH_CODE" | sed "s/'/''/g")"

updated_total=0

while IFS= read -r request_code; do
  [ -n "${request_code:-}" ] || continue
  ESC_REQUEST="$(printf "%s" "$request_code" | sed "s/'/''/g")"

  echo "confirming request_code=$request_code"

  updated_count="$(
  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | tr -d '[:space:]'
SELECT cx22073jw.fn_confirm_access_manual_apply_receipt_items(
  '$ESC_BATCH',
  '$ESC_REQUEST',
  '$NEW_STATUS',
  '$ESC_EXECUTOR',
  '$ESC_NOTE'
);
SQL
  )"

  case "${updated_count:-}" in
    ''|*[!0-9]*) updated_count=0 ;;
  esac

  updated_total=$((updated_total + updated_count))
done <<EOF_ACCESS_BULK_PENDING
$PENDING_REQUESTS
EOF_ACCESS_BULK_PENDING

echo "updated_total=$updated_total"

echo "[latest pending summary]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_manual_apply_receipt_latest_pending_summary;
SQL

echo "============================================================"
echo "ACCESS BULK CONFIRM ALL PENDING DONE"
echo "============================================================"
