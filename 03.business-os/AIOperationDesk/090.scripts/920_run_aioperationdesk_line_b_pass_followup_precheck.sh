#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/line_b_pass_followup_precheck_$(date +%Y%m%d_%H%M%S)"
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

check_file "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_IMPLEMENTATION.md"
check_file "$APP_ROOT/000.docs/LINE_B_PASS_FOLLOWUP_RUNBOOK.md"
check_file "$APP_ROOT/020.backend/lib/aiod_auth_mode_policy.js"
check_file "$APP_ROOT/080.notifications/line_provider_live_evidence.js"
check_file "$APP_ROOT/070.jobs/aiod_replay_live_evidence.js"
check_file "$APP_ROOT/080.notifications/line_provider_http_impl.js"
check_file "$APP_ROOT/070.jobs/aiod_replay_executor.js"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_FOLLOWUP_REPORT
# ============================================================
# AI OPERATION DESK LINE B PASS FOLLOWUP PRECHECK
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- strict auth mode policy
- provider live evidence helper
- replay live evidence helper
- followup implementation bindings
EOF_FOLLOWUP_REPORT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK LINE B PASS FOLLOWUP PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
