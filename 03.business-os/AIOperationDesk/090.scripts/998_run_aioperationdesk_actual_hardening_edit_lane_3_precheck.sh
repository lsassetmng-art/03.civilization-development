#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/actual_hardening_edit_lane_3_precheck_$(date +%Y%m%d_%H%M%S)"
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

check_file "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_3.md"
check_file "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_3_RUNBOOK.md"
check_file "$APP_ROOT/020.backend/lib/aiod_request_context.js"
check_file "$APP_ROOT/020.backend/lib/aiod_hardening_post_write.js"
check_file "$APP_ROOT/090.scripts/996_run_aioperationdesk_runtime_evidence_digest.sh"
check_file "$APP_ROOT/090.scripts/997_generate_aioperationdesk_actual_hardening_terminal_handoff.sh"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_AHEL3_PRECHECK_REPORT
# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 3 PRECHECK
# ============================================================

status: generated
app: AIOPERATIONDESK
owner: Boss
prepared_by: Zero

scope:
- recommended strict auth default reflection
- provider evidence in hardened response
- runtime evidence digest
- terminal handoff generation
EOF_AHEL3_PRECHECK_REPORT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK ACTUAL HARDENING EDIT LANE 3 PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
