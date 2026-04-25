#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="${AIOD_BASE_URL:-http://127.0.0.1:8787/api/ai-operation-desk}"

printf '%s\n' '--- request intake (db_psql) ---'
curl -s \
  -H 'content-type: application/json' \
  -X POST \
  -d '{"request_channel":"text","request_text":"この項目を説明して","requested_start_at":null,"supported_app_code":"ERP","lane_type":"consult","requester_user_id":"dev_stub_user","source_surface_type":"erp_resident_surface","priority_level":"normal","resident_context_snapshot":{"current_screen_code":"ERP_VOUCHER_DETAIL","current_module_code":"ERP_ACCOUNTING","current_record_ref":"erp_record_demo_001","current_field_code":"field_demo","current_company_ref":"demo_company","latest_error_code":"ERP_REQUIRED_FIELD_MISSING","entered_value_json":{},"permission_context_json":{}}}' \
  "$BASE/requests"
printf '\n%s\n' '--- provisional voucher (db_psql) ---'
curl -s \
  -H 'content-type: application/json' \
  -X POST \
  -d '{"company_ref":"demo_company","voucher_type_code":"SALES_ESTIMATE","draft_reason_text":"temporary voucher draft","line_items":[{"item_code":"A","quantity":2,"unit_price":100},{"item_code":"B","quantity":1,"unit_price":200}],"currency_code":"JPY","requested_start_at":null,"requester_user_id":"dev_stub_user","source_surface_type":"erp_resident_surface"}' \
  "$BASE/erp/provisional-voucher"
printf '\n%s\n' '--- retry schedule (db_psql) ---'
curl -s \
  -H 'content-type: application/json' \
  -X POST \
  -d '{"work_order_id":"replace_me","failure_record_id":"replace_me","next_retry_at":"2026-04-22T10:00:00+09:00"}' \
  "$BASE/retries/schedule"
printf '\n'
