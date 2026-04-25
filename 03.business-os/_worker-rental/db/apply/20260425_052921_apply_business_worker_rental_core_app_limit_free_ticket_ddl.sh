#!/data/data/com.termux/files/usr/bin/bash
set -eu

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

MIGRATION_FILE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql"
VERIFY_SQL="/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/${RUN_TS}_worker_rental_core_app_limit_apply_result"
mkdir -p "$OUT_DIR"

echo '============================================================'
echo 'BusinessOS WorkerRentalCore DB APPLY START'
echo 'reviewer: 佐藤（DB担当）レビュー対象'
echo 'env: PERSONA_DATABASE_URL'
echo 'schema: business'
echo 'generic unit support: minute / hour / day / month / year'
echo 'generic max duration: 2 years'
echo 'CasualChatWorker max duration: 120 minutes'
echo 'monthly free ticket rule: app shortest contract duration'
echo '============================================================'

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$MIGRATION_FILE" > "$OUT_DIR/001_apply.log" 2>&1

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$VERIFY_SQL" > "$OUT_DIR/002_verify.log" 2>&1

echo '============================================================'
echo 'BusinessOS WorkerRentalCore DB APPLY DONE'
echo "OUT_DIR=$OUT_DIR"
echo '============================================================'
echo '[APPLY LOG TAIL]'
tail -80 "$OUT_DIR/001_apply.log"
echo '============================================================'
echo '[VERIFY LOG]'
cat "$OUT_DIR/002_verify.log"
echo '============================================================'
