#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/actual_hardening_edit_lane_1_precheck_$(date +%Y%m%d_%H%M%S)"
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

check_file "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_1.md"
check_file "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_1_RUNBOOK.md"
check_file "$APP_ROOT/020.backend/lib/aiod_file_evidence_writer.js"
check_file "$APP_ROOT/080.notifications/line_provider_http_impl.js"
check_file "$APP_ROOT/070.jobs/aiod_replay_executor.js"
check_file "$APP_ROOT/090.scripts/270_run_aioperationdesk_edge_hardened_local.sh"
check_file "$APP_ROOT/090.scripts/941_run_aioperationdesk_controlled_replay_live_probe.sh"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_AHEL1_REPORT
# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 1 PRECHECK
# ============================================================

status: generated
app: AIOPERATIONDESK
owner: Boss
prepared_by: Zero

scope:
- runtime evidence writer
- provider evidence file output
- replay evidence file output
- hardened runtime allow-write support
EOF_AHEL1_REPORT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK ACTUAL HARDENING EDIT LANE 1 PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
