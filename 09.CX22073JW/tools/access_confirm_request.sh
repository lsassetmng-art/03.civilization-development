#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

REQUEST_CODE="${1:-}"
NEW_STATUS="${2:-confirmed_applied}"
EXECUTOR_NAME="${3:-Zero}"
CONFIRM_NOTE="${4:-manual confirmation from access_confirm_request.sh}"
BATCH_CODE="${5:-}"

if [ -z "$REQUEST_CODE" ]; then
  echo "USAGE: access_confirm_request.sh REQUEST_CODE [confirmed_applied|confirmed_skipped|confirmed_failed] [EXECUTOR_NAME] [NOTE] [BATCH_CODE]"
  exit 1
fi

if [ -z "$BATCH_CODE" ]; then
  BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT batch_code
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;
SQL
  )"
fi

if [ -z "$BATCH_CODE" ]; then
  echo "ERROR: latest access_manual_apply_receipt_batch not found"
  exit 1
fi

ESC_NOTE="$(printf "%s" "$CONFIRM_NOTE" | sed "s/'/''/g")"
ESC_EXECUTOR="$(printf "%s" "$EXECUTOR_NAME" | sed "s/'/''/g")"
ESC_REQUEST="$(printf "%s" "$REQUEST_CODE" | sed "s/'/''/g")"
ESC_BATCH="$(printf "%s" "$BATCH_CODE" | sed "s/'/''/g")"

echo "============================================================"
echo "ACCESS CONFIRM REQUEST"
echo "batch_code   : $BATCH_CODE"
echo "request_code : $REQUEST_CODE"
echo "new_status   : $NEW_STATUS"
echo "executor     : $EXECUTOR_NAME"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT cx22073jw.fn_confirm_access_manual_apply_receipt_items(
  '$ESC_BATCH',
  '$ESC_REQUEST',
  '$NEW_STATUS',
  '$ESC_EXECUTOR',
  '$ESC_NOTE'
);
SQL

echo "============================================================"
echo "ACCESS CONFIRM REQUEST DONE"
echo "============================================================"
