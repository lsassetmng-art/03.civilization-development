#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_list_pending_requests.sh" <<'ACCESS_LIST_PENDING_CMD'
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
ACCESS_LIST_PENDING_CMD
chmod +x "$TOOLS_DIR/access_list_pending_requests.sh"

cat > "$TOOLS_DIR/access_bulk_confirm_all_pending.sh" <<'ACCESS_BULK_CONFIRM_CMD'
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
ACCESS_BULK_CONFIRM_CMD
chmod +x "$TOOLS_DIR/access_bulk_confirm_all_pending.sh"

cat > "$TOOLS_DIR/access_bulk_apply_cycle.sh" <<'ACCESS_BULK_CYCLE_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

STATUS_VALUE="${1:-confirmed_applied}"
EXECUTOR_NAME="${2:-Zero}"
NOTE_TEXT="${3:-bulk cycle from access_bulk_apply_cycle.sh}"
BATCH_CODE="${4:-}"

BULK_CONFIRM_CMD="$TOOLS_DIR/access_bulk_confirm_all_pending.sh"
REVERIFY_CMD="$TOOLS_DIR/access_reverify_confirmed.sh"
EXPORT_CMD="$TOOLS_DIR/access_export_current_bundle.sh"
STATUS_CMD="$TOOLS_DIR/access_status.sh"

echo "============================================================"
echo "ACCESS BULK APPLY CYCLE START"
echo "============================================================"

if [ ! -x "$BULK_CONFIRM_CMD" ]; then
  echo "ERROR: missing command -> $BULK_CONFIRM_CMD"
  exit 1
fi

"$BULK_CONFIRM_CMD" "$STATUS_VALUE" "$EXECUTOR_NAME" "$NOTE_TEXT" "${BATCH_CODE:-}"

if [ "$STATUS_VALUE" = "confirmed_applied" ]; then
  if [ -x "$REVERIFY_CMD" ]; then
    "$REVERIFY_CMD" "${BATCH_CODE:-}" "$EXECUTOR_NAME"
  else
    echo "WARN: missing reverify cmd -> $REVERIFY_CMD"
  fi

  if [ -x "$EXPORT_CMD" ]; then
    "$EXPORT_CMD"
  else
    echo "WARN: missing export cmd -> $EXPORT_CMD"
  fi
fi

if [ -x "$STATUS_CMD" ]; then
  "$STATUS_CMD"
fi

echo "============================================================"
echo "ACCESS BULK APPLY CYCLE DONE"
echo "============================================================"
ACCESS_BULK_CYCLE_CMD
chmod +x "$TOOLS_DIR/access_bulk_apply_cycle.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_bulk_confirm_all_pending.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_108'

batch_commands:
- ./access_list_pending_requests.sh
- ./access_bulk_confirm_all_pending.sh [STATUS] [EXECUTOR_NAME] [NOTE] [BATCH_CODE]
- ./access_bulk_apply_cycle.sh [STATUS] [EXECUTOR_NAME] [NOTE] [BATCH_CODE]

recommended_bulk_flow:
1. ./access_list_pending_requests.sh
2. ./access_bulk_apply_cycle.sh confirmed_applied
README_APPEND_108
  fi
else
  cat > "$README_FILE" <<'README_NEW_108'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

batch_commands:
- ./access_list_pending_requests.sh
- ./access_bulk_confirm_all_pending.sh [STATUS] [EXECUTOR_NAME] [NOTE] [BATCH_CODE]
- ./access_bulk_apply_cycle.sh [STATUS] [EXECUTOR_NAME] [NOTE] [BATCH_CODE]
README_NEW_108
fi

echo "============================================================"
echo "ACCESS BATCH OPERATION PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
