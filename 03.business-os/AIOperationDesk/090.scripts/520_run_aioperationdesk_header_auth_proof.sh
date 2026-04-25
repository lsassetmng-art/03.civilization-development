#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="${AIOD_BASE_URL:-http://127.0.0.1:8787/api/ai-operation-desk}"

printf '%s\n' '--- health ---'
curl -s "$BASE/health"

printf '\n%s\n' '--- header trusted write without actor (expected reject under enforced/header_trusted) ---'
curl -s \
  -H 'content-type: application/json' \
  -X POST \
  -d '{"supported_app_code":"ERP","work_type_code":"ERP_EXECUTION_REQUEST","trigger_mode":"none","risk_class":"medium","priority_level":"normal","source_surface_type":"main_console"}' \
  "$BASE/execution-requests"

printf '\n%s\n' '--- header trusted write with actor (expected pass) ---'
curl -s \
  -H 'content-type: application/json' \
  -H 'x-aiod-actor-id: production_proof_actor' \
  -H 'x-aiod-actor-type: user' \
  -X POST \
  -d '{"supported_app_code":"ERP","work_type_code":"ERP_EXECUTION_REQUEST","trigger_mode":"none","risk_class":"medium","priority_level":"normal","source_surface_type":"main_console"}' \
  "$BASE/execution-requests"
printf '\n'
