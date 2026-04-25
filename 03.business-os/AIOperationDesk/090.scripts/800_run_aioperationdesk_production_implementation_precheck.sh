#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/production_implementation_precheck_$(date +%Y%m%d_%H%M%S)"
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

check_file "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_1.md"
check_file "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_1_RUNBOOK.md"
check_file "$APP_ROOT/020.backend/lib/aiod_header_auth_strict.js"
check_file "$APP_ROOT/080.notifications/line_provider_http_payload_builder.js"
check_file "$APP_ROOT/080.notifications/line_provider_http_response_normalizer.js"
check_file "$APP_ROOT/080.notifications/line_provider_http_impl.js"
check_file "$APP_ROOT/070.jobs/aiod_replay_live_guard.js"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_IMPL1_REPORT
# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 1 PRECHECK
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- strict auth implementation anchor
- provider http implementation anchors
- replay live guard anchor
EOF_IMPL1_REPORT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PRODUCTION IMPLEMENTATION LANE 1 PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
