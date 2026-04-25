#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/provider_env_probe_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

cat > "$OUT_DIR/000_provider_env_probe.txt" <<EOF_PROVIDER_PROBE
AIOD_LINE_PROVIDER_MODE=${AIOD_LINE_PROVIDER_MODE:-unset}
AIOD_LINE_PUSH_ENDPOINT_PRESENT=$( [ -n "${AIOD_LINE_PUSH_ENDPOINT:-}" ] && printf '%s' 'true' || printf '%s' 'false' )
AIOD_LINE_CHANNEL_ACCESS_TOKEN_PRESENT=$( [ -n "${AIOD_LINE_CHANNEL_ACCESS_TOKEN:-}" ] && printf '%s' 'true' || printf '%s' 'false' )
AIOD_LINE_CHANNEL_SECRET_PRESENT=$( [ -n "${AIOD_LINE_CHANNEL_SECRET:-}" ] && printf '%s' 'true' || printf '%s' 'false' )
AIOD_NOTIFICATION_SIGNING_KEY_PRESENT=$( [ -n "${AIOD_NOTIFICATION_SIGNING_KEY:-}" ] && printf '%s' 'true' || printf '%s' 'false' )
EOF_PROVIDER_PROBE

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PROVIDER ENV PROBE DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
sed -n '1,120p' "$OUT_DIR/000_provider_env_probe.txt"
