#!/data/data/com.termux/files/usr/bin/bash
set -eu

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

VERIFY_SQL="/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/${RUN_TS}_worker_rental_core_app_limit_verify_only_result"
mkdir -p "$OUT_DIR"

echo '============================================================'
echo 'BusinessOS WorkerRentalCore DB VERIFY ONLY START'
echo 'env: PERSONA_DATABASE_URL'
echo 'schema: business'
echo '============================================================'

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$VERIFY_SQL" > "$OUT_DIR/verify.log" 2>&1

echo '============================================================'
echo 'BusinessOS WorkerRentalCore DB VERIFY ONLY DONE'
echo "OUT_DIR=$OUT_DIR"
echo '============================================================'
cat "$OUT_DIR/verify.log"
echo '============================================================'
