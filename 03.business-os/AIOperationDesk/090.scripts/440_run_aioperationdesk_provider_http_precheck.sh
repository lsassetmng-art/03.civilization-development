#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/provider_http_precheck_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

check_file() {
  FILE="$1"
  if [ -f "$FILE" ]; then
    printf 'OK\t%s\n' "$FILE" >> "$OUT_DIR/000_CHECKLIST.txt"
  else
    printf 'NG\t%s\n' "$FILE" >> "$OUT_DIR/000_CHECKLIST.txt"
  fi
}

: > "$OUT_DIR/000_CHECKLIST.txt"

check_file "$APP_ROOT/000.docs/PROVIDER_HTTP_EXECUTION_POLICY.md"
check_file "$APP_ROOT/020.backend/lib/aiod_safe_log.js"
check_file "$APP_ROOT/080.notifications/line_provider_http_adapter.js"
check_file "$APP_ROOT/080.notifications/line_provider_contract.js"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_PROVIDER_PRECHECK
# ============================================================
# AI OPERATION DESK PROVIDER HTTP PRECHECK REPORT
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- provider http skeleton presence
- safe logging helper presence
- provider contract refresh presence
EOF_PROVIDER_PRECHECK

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PROVIDER HTTP PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
