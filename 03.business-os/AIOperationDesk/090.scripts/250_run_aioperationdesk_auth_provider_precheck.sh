#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/auth_provider_precheck_$(date +%Y%m%d_%H%M%S)"
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

check_file "$APP_ROOT/000.docs/RUNTIME_ENV_EXACT.md"
check_file "$APP_ROOT/000.docs/AUTH_PERMISSION_PROVIDER_EXACT.md"
check_file "$APP_ROOT/020.backend/lib/aiod_env.js"
check_file "$APP_ROOT/020.backend/lib/aiod_auth_contract.js"
check_file "$APP_ROOT/020.backend/lib/aiod_permission_contract.js"
check_file "$APP_ROOT/040.integrations/line/LINE_PROVIDER_CONTRACT_EXACT.md"
check_file "$APP_ROOT/080.notifications/line_provider_contract.js"

cat > "$OUT_DIR/000_REPORT.md" <<EOF
# ============================================================
# AI OPERATION DESK AUTH PROVIDER PRECHECK REPORT
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- auth contract presence
- permission contract presence
- provider contract presence
- runtime env exact presence
EOF

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK AUTH PROVIDER PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
