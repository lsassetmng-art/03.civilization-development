#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="${AIOD_BASE_URL:-http://127.0.0.1:8787/api/ai-operation-desk}"

printf '%s\n' '--- authenticated execution request with provider follow-on ---'
curl -s \
  -H 'content-type: application/json' \
  -H 'x-aiod-actor-id: provider_follow_on_actor' \
  -X POST \
  -d '{"supported_app_code":"ERP","work_type_code":"ERP_EXECUTION_REQUEST","trigger_mode":"none","risk_class":"medium","priority_level":"normal","source_surface_type":"main_console"}' \
  "$BASE/execution-requests"

printf '\n%s\n' '--- authenticated provisional voucher with provider follow-on ---'
curl -s \
  -H 'content-type: application/json' \
  -H 'x-aiod-actor-id: provider_follow_on_actor' \
  -X POST \
  -d '{"company_ref":"demo_company","voucher_type_code":"SALES_ESTIMATE","draft_reason_text":"provider follow-on provisional voucher","line_items":[{"item_code":"A","quantity":2,"unit_price":100}],"currency_code":"JPY","source_surface_type":"erp_resident_surface"}' \
  "$BASE/erp/provisional-voucher"
printf '\n'
