#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="${AIOD_BASE_URL:-http://127.0.0.1:8787/api/ai-operation-desk}"

printf '%s\n' '--- unauthenticated execution request (expected reject in enforced/header_trusted) ---'
curl -s \
  -H 'content-type: application/json' \
  -X POST \
  -d '{"supported_app_code":"ERP","work_type_code":"ERP_EXECUTION_REQUEST","trigger_mode":"none","risk_class":"medium","priority_level":"normal","source_surface_type":"main_console"}' \
  "$BASE/execution-requests"

printf '\n%s\n' '--- authenticated execution request (expected pass) ---'
curl -s \
  -H 'content-type: application/json' \
  -H 'x-aiod-actor-id: hardening_demo_actor' \
  -X POST \
  -d '{"supported_app_code":"ERP","work_type_code":"ERP_EXECUTION_REQUEST","trigger_mode":"none","risk_class":"medium","priority_level":"normal","source_surface_type":"main_console"}' \
  "$BASE/execution-requests"

printf '\n%s\n' '--- authenticated notification save (expected pass) ---'
curl -s \
  -H 'content-type: application/json' \
  -H 'x-aiod-actor-id: hardening_demo_actor' \
  -X PUT \
  -d '{"user_id":"hardening_demo_actor","notify_review_pending":true,"notify_approval_pending":true,"notify_confirmation_required":true,"notify_execution_failed":true,"notify_retry_scheduled":true,"notify_completed_with_warning":true,"notify_completed_summary_available":true,"line_destination_ref":"line_hardening_demo","is_active":true}' \
  "$BASE/notification-rules"
printf '\n'
