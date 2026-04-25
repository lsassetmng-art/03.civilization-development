#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="${AIOD_BASE_URL:-http://127.0.0.1:8787/api/ai-operation-desk}"
HEALTH_URL="$BASE/health"

if ! command -v curl >/dev/null 2>&1; then
  printf '%s\n' 'curl is not installed or not in PATH.' >&2
  exit 1
fi

i=0
while [ "$i" -lt 30 ]; do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    printf '%s\n' 'API_READY=true'
    printf '%s\n' "HEALTH_URL=$HEALTH_URL"
    exit 0
  fi
  i=$((i + 1))
  sleep 1
done

printf '%s\n' 'API_READY=false' >&2
printf '%s\n' "HEALTH_URL=$HEALTH_URL" >&2
exit 1
