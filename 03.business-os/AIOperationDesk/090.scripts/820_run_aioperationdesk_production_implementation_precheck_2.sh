#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/production_implementation_precheck_2_$(date +%Y%m%d_%H%M%S)"
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

check_file "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_2.md"
check_file "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_2_RUNBOOK.md"
check_file "$APP_ROOT/020.backend/lib/aiod_request_context.js"
check_file "$APP_ROOT/020.backend/edge/routes/write_routes_hardened.js"
check_file "$APP_ROOT/080.notifications/line_provider_contract.js"
check_file "$APP_ROOT/070.jobs/aiod_replay_executor.js"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_IMPL2_REPORT
# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 2 PRECHECK
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- strict auth binding into request context
- hardened write binding refresh
- provider contract implementation binding
- replay live guard binding
EOF_IMPL2_REPORT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PRODUCTION IMPLEMENTATION LANE 2 PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
