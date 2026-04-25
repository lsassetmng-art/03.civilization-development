#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/hardening_precheck_$(date +%Y%m%d_%H%M%S)"
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

check_file "$APP_ROOT/000.docs/HARDENING_ROADMAP.md"
check_file "$APP_ROOT/000.docs/HARDENING_ENTRY_CHECKLIST.md"
check_file "$APP_ROOT/020.backend/lib/aiod_env.js"
check_file "$APP_ROOT/020.backend/lib/aiod_auth_stub.js"
check_file "$APP_ROOT/020.backend/lib/aiod_permission_stub.js"
check_file "$APP_ROOT/040.integrations/line/README.md"
check_file "$APP_ROOT/080.notifications/line_provider_stub.js"
check_file "$APP_ROOT/070.jobs/aiod_retention_jobs_stub.js"

cat > "$OUT_DIR/000_REPORT.md" <<EOF
# ============================================================
# AI OPERATION DESK HARDENING PRECHECK REPORT
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- hardening entry skeleton presence check

output:
- see 000_CHECKLIST.txt
EOF

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK HARDENING PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
