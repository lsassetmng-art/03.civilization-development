#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/production_implementation_precheck_3_$(date +%Y%m%d_%H%M%S)"
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

check_file "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_3.md"
check_file "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_3_RUNBOOK.md"
check_file "$APP_ROOT/080.notifications/line_provider_http_impl.js"
check_file "$APP_ROOT/090.scripts/840_run_aioperationdesk_strict_hardened_mock_stack.sh"
check_file "$APP_ROOT/090.scripts/841_stop_aioperationdesk_strict_hardened_mock_stack.sh"
check_file "$APP_ROOT/090.scripts/842_test_aioperationdesk_strict_auth_provider_dry_run.sh"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_IMPL3_REPORT
# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 3 PRECHECK
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- provider http dry_run/live split
- strict hardened mock stack runner
- strict auth + provider dry-run proof script
EOF_IMPL3_REPORT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PRODUCTION IMPLEMENTATION LANE 3 PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
