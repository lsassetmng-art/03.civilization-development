#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/production_track_precheck_$(date +%Y%m%d_%H%M%S)"
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

check_file "$APP_ROOT/000.docs/PRODUCTION_TRACK_ROADMAP.md"
check_file "$APP_ROOT/000.docs/PRODUCTION_SECRET_ENV_POLICY.md"
check_file "$APP_ROOT/000.docs/PRODUCTION_TRACK_RUNBOOK.md"
check_file "$APP_ROOT/020.backend/lib/aiod_secret_contract.js"
check_file "$APP_ROOT/020.backend/lib/aiod_header_auth_adapter.js"
check_file "$APP_ROOT/080.notifications/line_provider_http_skeleton.js"
check_file "$APP_ROOT/070.jobs/aiod_cleanup_executor_stub.js"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_PRECHECK
# ============================================================
# AI OPERATION DESK PRODUCTION TRACK PRECHECK REPORT
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- production-track entry skeleton presence
- secret / auth adapter / provider http / cleanup executor presence
EOF_PRECHECK

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PRODUCTION TRACK PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
