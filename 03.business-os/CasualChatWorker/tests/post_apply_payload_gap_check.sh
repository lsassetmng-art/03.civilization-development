#!/data/data/com.termux/files/usr/bin/bash
set -eu

APP_NAME="CasualChatWorker"
IMPL_ROOT="/data/data/com.termux/files/home/03.civilization-development/03.business-os/${APP_NAME}"
OUT_DIR="${IMPL_ROOT}/docs/verification/$(date +%Y%m%d_%H%M%S)_post_apply_payload_gap_check"
mkdir -p "$OUT_DIR"

echo '============================================================' > "$OUT_DIR/README.txt"
echo 'CasualChatWorker Post-Apply Payload Gap Check' >> "$OUT_DIR/README.txt"
echo '============================================================' >> "$OUT_DIR/README.txt"
echo 'This script does not query DB yet.' >> "$OUT_DIR/README.txt"
echo 'After WorkerRentalCore DB apply and backend endpoint implementation, compare:' >> "$OUT_DIR/README.txt"
echo '- api-client/contracts/worker-rental-payload-contract.json' >> "$OUT_DIR/README.txt"
echo '- backend endpoint responses' >> "$OUT_DIR/README.txt"
echo '- business.v_worker_rental_service_catalog_active' >> "$OUT_DIR/README.txt"
echo '- business.v_worker_rental_monthly_free_ticket_rule' >> "$OUT_DIR/README.txt"
echo '- business.v_worker_rental_price_catalog_active' >> "$OUT_DIR/README.txt"

cat > "$OUT_DIR/expected_fields.txt" <<'FIELDS'
service catalog:
- app_code
- service_code
- service_name
- minimum_contract_unit_kind
- minimum_contract_unit_count
- app_max_contract_unit_kind
- app_max_contract_unit_count
- monthly_free_ticket_source_rule
- monthly_free_ticket_unit_kind
- monthly_free_ticket_unit_count

monthly free ticket:
- monthly_free_ticket_quantity
- free_ticket_minutes_each
- free_ticket_minutes_total

price catalog:
- rental_unit_kind
- rental_unit_count
- base_price_jpy
- currency_code

quote:
- quote_id
- app_code
- service_code
- rental_unit_kind
- rental_unit_count
- base_price_jpy
- applied_entitlement_count
- free_unit_count
- paid_unit_count
- final_price_jpy
FIELDS

echo "OUT_DIR=$OUT_DIR"
cat "$OUT_DIR/README.txt"
