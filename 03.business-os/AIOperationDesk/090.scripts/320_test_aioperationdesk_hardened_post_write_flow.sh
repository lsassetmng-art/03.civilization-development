#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="${AIOD_BASE_URL:-http://127.0.0.1:8787/api/ai-operation-desk}"

printf '%s\n' '--- authenticated execution request with hardening ---'
curl -s \
  -H 'content-type: application/json' \
  -H 'x-aiod-actor-id: hardening_demo_actor' \
  -X POST \
  -d '{"supported_app_code":"ERP","work_type_code":"ERP_EXECUTION_REQUEST","trigger_mode":"none","risk_class":"medium","priority_level":"normal","source_surface_type":"main_console"}' \
  "$BASE/execution-requests"

printf '\n%s\n' '--- authenticated retry schedule with hardening ---'
curl -s \
  -H 'content-type: application/json' \
  -H 'x-aiod-actor-id: hardening_demo_actor' \
  -X POST \
  -d '{"retry_plan_id":"retry_stub_demo","next_retry_at":"2026-04-22T10:00:00+09:00"}' \
  "$BASE/retries/schedule"
printf '\n'
