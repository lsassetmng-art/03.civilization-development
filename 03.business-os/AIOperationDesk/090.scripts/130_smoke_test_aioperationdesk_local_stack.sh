#!/data/data/com.termux/files/usr/bin/sh
set -eu

EDGE_BASE="${AIOD_BASE_URL:-http://127.0.0.1:8787/api/ai-operation-desk}"
WEB_BASE="${AIOD_WEB_BASE_URL:-http://127.0.0.1:8087}"

printf '%s\n' '--- edge health ---'
curl -s "$EDGE_BASE/health"
printf '\n%s\n' '--- supported apps ---'
curl -s "$EDGE_BASE/supported-apps"
printf '\n%s\n' '--- queue ---'
curl -s "$EDGE_BASE/queue"
printf '\n%s\n' '--- review inbox ---'
curl -s "$EDGE_BASE/review-inbox"
printf '\n%s\n' '--- approval inbox ---'
curl -s "$EDGE_BASE/approval-inbox"
printf '\n%s\n' '--- failures ---'
curl -s "$EDGE_BASE/failures"
printf '\n%s\n' '--- summary batches ---'
curl -s "$EDGE_BASE/summary-batches"
printf '\n%s\n' '--- web home head ---'
curl -s "$WEB_BASE/" | sed -n '1,20p'
printf '\n%s\n' '--- web main console head ---'
curl -s "$WEB_BASE/console/main_console.html" | sed -n '1,20p'
printf '\n%s\n' '--- web erp resident head ---'
curl -s "$WEB_BASE/resident/erp_resident.html" | sed -n '1,20p'
printf '\n'
