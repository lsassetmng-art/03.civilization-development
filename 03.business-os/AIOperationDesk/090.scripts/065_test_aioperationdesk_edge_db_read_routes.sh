#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="${AIOD_BASE_URL:-http://127.0.0.1:8787/api/ai-operation-desk}"

printf '%s\n' '--- health ---'
curl -s "$BASE/health"
printf '\n%s\n' '--- supported apps ---'
curl -s "$BASE/supported-apps"
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
printf '\n'
