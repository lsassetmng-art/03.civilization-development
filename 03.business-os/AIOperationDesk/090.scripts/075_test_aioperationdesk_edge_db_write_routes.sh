#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="${AIOD_BASE_URL:-http://127.0.0.1:8787/api/ai-operation-desk}"

printf '%s\n' '--- execution request (db_psql) ---'
curl -s \
  -H 'content-type: application/json' \
  -X POST \
  -d '{"supported_app_code":"ERP","work_type_code":"ERP_EXECUTION_REQUEST","trigger_mode":"none","risk_class":"medium","priority_level":"normal","source_surface_type":"main_console","requester_user_id":"dev_stub_user","review_reason_code":"RR004_EXECUTION_REQUEST_PRECHECK"}' \
  "$BASE/execution-requests"
printf '\n%s\n' '--- review decide (db_psql) ---'
curl -s \
  -H 'content-type: application/json' \
  -X POST \
  -d '{"review_request_id":"replace_me","decision":"approved","reviewer_user_id":"dev_stub_reviewer"}' \
  "$BASE/reviews/decide"
printf '\n%s\n' '--- approval decide (db_psql) ---'
curl -s \
  -H 'content-type: application/json' \
  -X POST \
  -d '{"approval_request_id":"replace_me","decision":"approved","approver_user_id":"dev_stub_approver"}' \
  "$BASE/approvals/decide"
printf '\n%s\n' '--- notification rules save (db_psql) ---'
curl -s \
  -H 'content-type: application/json' \
  -X PUT \
  -d '{"user_id":"dev_stub_user","notify_review_pending":true,"notify_approval_pending":true,"notify_confirmation_required":true,"notify_execution_failed":true,"notify_retry_scheduled":true,"notify_completed_with_warning":true,"notify_completed_summary_available":true,"line_destination_ref":"line_demo_destination","is_active":true}' \
  "$BASE/notification-rules"
printf '\n'
