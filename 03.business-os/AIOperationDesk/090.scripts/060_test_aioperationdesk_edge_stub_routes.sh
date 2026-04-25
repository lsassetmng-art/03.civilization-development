#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="${AIOD_BASE_URL:-http://127.0.0.1:8787/api/ai-operation-desk}"

printf '%s\n' '--- health ---'
curl -s "$BASE/health"
printf '\n%s\n' '--- queue ---'
curl -s "$BASE/queue"
printf '\n%s\n' '--- review inbox ---'
curl -s "$BASE/review-inbox"
printf '\n%s\n' '--- approval inbox ---'
curl -s "$BASE/approval-inbox"
printf '\n%s\n' '--- failures ---'
curl -s "$BASE/failures"
printf '\n%s\n' '--- summary batches ---'
curl -s "$BASE/summary-batches"
printf '\n%s\n' '--- compile request ---'
curl -s \
  -H 'content-type: application/json' \
  -X POST \
  -d '{"request_channel":"text","request_text":"この項目を説明して","supported_app_code":"ERP","lane_type":"consult","priority_level":"normal","source_surface_type":"erp_resident_surface","resident_context_snapshot":{"current_screen_code":"ERP_VOUCHER_DETAIL","current_module_code":"ERP_ACCOUNTING","current_record_ref":"erp_record_demo_001","current_field_code":"field_demo","current_company_ref":"demo_company","latest_error_code":null,"entered_value_json":{},"permission_context_json":{}},"attachments":[]}' \
  "$BASE/requests"
printf '\n'
