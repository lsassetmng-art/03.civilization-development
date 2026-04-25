#!/data/data/com.termux/files/usr/bin/bash
set -eu

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

OUT_DIR="/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/docs/verification/20260425_070545_worker_rental_post_apply_snapshot"
SQL_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/CasualChatWorker/backend/worker-rental-api/sql/20260425_070545_worker_rental_post_apply_readonly_snapshot.sql"
mkdir -p "$OUT_DIR"

STDOUT_FILE="$OUT_DIR/010_snapshot_stdout.log"
STDERR_FILE="$OUT_DIR/011_snapshot_stderr.log"
SUMMARY_FILE="$OUT_DIR/000_snapshot_summary.md"

echo '============================================================'
echo 'WorkerRentalCore post-apply readonly snapshot'
echo 'DB env: PERSONA_DATABASE_URL'
echo 'Operation: SELECT only'
echo '============================================================'

set +e
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE" > "$STDOUT_FILE" 2> "$STDERR_FILE"
SNAPSHOT_EXIT="$?"
set -e

SERVICE_OK=0
TICKET_OK=0
PRICE_OK=0
TABLE_OK=0
VIEW_OK=0

if grep -q 'CasualChatWorker' "$STDOUT_FILE" && grep -q 'casual_chat_worker' "$STDOUT_FILE"; then
  SERVICE_OK=1
fi

if grep -q 'shortest_contract_duration' "$STDOUT_FILE" && grep -q 'free_ticket_minutes_each' "$STDOUT_FILE"; then
  TICKET_OK=1
fi

if grep -q '500' "$STDOUT_FILE" && grep -q '1000' "$STDOUT_FILE" && grep -q '1500' "$STDOUT_FILE" && grep -q '2000' "$STDOUT_FILE"; then
  PRICE_OK=1
fi

if grep -q 'table_count' "$STDOUT_FILE"; then
  TABLE_OK=1
fi

if grep -q 'view_count' "$STDOUT_FILE"; then
  VIEW_OK=1
fi

if [ "$SNAPSHOT_EXIT" -eq 0 ] && [ "$SERVICE_OK" -eq 1 ] && [ "$TICKET_OK" -eq 1 ] && [ "$PRICE_OK" -eq 1 ] && [ "$TABLE_OK" -eq 1 ] && [ "$VIEW_OK" -eq 1 ]; then
  SNAPSHOT_STATUS="PASS"
else
  SNAPSHOT_STATUS="FAIL"
fi

cat > "$SUMMARY_FILE" <<MD_SUMMARY
# WorkerRentalCore Post-Apply Readonly Snapshot Summary

status: ${SNAPSHOT_STATUS}
generated_at: $(date +%Y%m%d_%H%M%S)

operation:
- SELECT only
- no DB mutation
- env: PERSONA_DATABASE_URL

exit:
- snapshot_exit: ${SNAPSHOT_EXIT}

checks:
- service_ok: ${SERVICE_OK}
- ticket_ok: ${TICKET_OK}
- price_ok: ${PRICE_OK}
- table_ok: ${TABLE_OK}
- view_ok: ${VIEW_OK}

files:
- stdout: ${STDOUT_FILE}
- stderr: ${STDERR_FILE}
- summary: ${SUMMARY_FILE}

MD_SUMMARY

echo '============================================================'
echo "SNAPSHOT_STATUS=$SNAPSHOT_STATUS"
echo "SUMMARY_FILE=$SUMMARY_FILE"
echo '============================================================'
echo '[SNAPSHOT STDOUT]'
cat "$STDOUT_FILE"
echo '============================================================'
echo '[SNAPSHOT STDERR]'
cat "$STDERR_FILE"
echo '============================================================'
echo '[SUMMARY]'
cat "$SUMMARY_FILE"
echo '============================================================'

if [ "$SNAPSHOT_STATUS" = "PASS" ]; then
  exit 0
else
  exit 1
fi
