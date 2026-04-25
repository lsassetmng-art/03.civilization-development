#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
BASE="${AIOD_BASE_URL:-http://127.0.0.1:8787/api/ai-operation-desk}"
MODE_FILE="$APP_ROOT/900.meta/local_run/strict_hardened_live_mode.txt"

sh "$APP_ROOT/090.scripts/845_wait_aioperationdesk_api_ready.sh"

STACK_MODE="UNKNOWN"
PROVIDER_EXECUTION_MODE="UNKNOWN"

if [ -f "$MODE_FILE" ]; then
  STACK_MODE="$(sed -n 's/^STACK_MODE=//p' "$MODE_FILE" | tail -n 1)"
  PROVIDER_EXECUTION_MODE="$(sed -n 's/^AIOD_LINE_HTTP_EXECUTION_MODE=//p' "$MODE_FILE" | tail -n 1)"
fi

printf '%s\n' "STACK_MODE=$STACK_MODE"
printf '%s\n' "PROVIDER_EXECUTION_MODE=$PROVIDER_EXECUTION_MODE"

printf '%s\n' '--- strict proof without required headers (expected reject) ---'
curl -s \
  -H 'content-type: application/json' \
  -X POST \
  -d '{"supported_app_code":"ERP","work_type_code":"ERP_EXECUTION_REQUEST","trigger_mode":"none","risk_class":"medium","priority_level":"normal","source_surface_type":"main_console"}' \
  "$BASE/execution-requests"

printf '\n%s\n' '--- strict proof with required headers (expected pass) ---'
curl -s \
  -H 'content-type: application/json' \
  -H 'x-aiod-actor-id: live_demo_actor' \
  -H 'x-aiod-actor-type: user' \
  -H 'x-aiod-company-ref: demo_company' \
  -X POST \
  -d '{"supported_app_code":"ERP","work_type_code":"ERP_EXECUTION_REQUEST","trigger_mode":"none","risk_class":"medium","priority_level":"normal","source_surface_type":"main_console"}' \
  "$BASE/execution-requests"

printf '\n%s\n' '--- strict proof provisional voucher (expected pass) ---'
curl -s \
  -H 'content-type: application/json' \
  -H 'x-aiod-actor-id: live_demo_actor' \
  -H 'x-aiod-actor-type: user' \
  -H 'x-aiod-company-ref: demo_company' \
  -X POST \
  -d '{"company_ref":"demo_company","voucher_type_code":"SALES_ESTIMATE","draft_reason_text":"strict provider proof","line_items":[{"item_code":"A","quantity":2,"unit_price":100}],"currency_code":"JPY","source_surface_type":"erp_resident_surface"}' \
  "$BASE/erp/provisional-voucher"
printf '\n'
