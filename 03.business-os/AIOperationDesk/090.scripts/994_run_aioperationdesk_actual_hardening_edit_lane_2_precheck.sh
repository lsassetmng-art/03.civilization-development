#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/actual_hardening_edit_lane_2_precheck_$(date +%Y%m%d_%H%M%S)"
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

check_file "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_2.md"
check_file "$APP_ROOT/000.docs/ACTUAL_HARDENING_EDIT_LANE_2_RUNBOOK.md"
check_file "$APP_ROOT/090.scripts/990_run_aioperationdesk_controlled_live_hardening_with_runtime_evidence.sh"
check_file "$APP_ROOT/090.scripts/991_review_aioperationdesk_runtime_evidence.sh"
check_file "$APP_ROOT/090.scripts/992_generate_aioperationdesk_runtime_evidence_handoff_bundle.sh"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_AHEL2_PRECHECK_REPORT
# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 2 PRECHECK
# ============================================================

status: generated
app: AIOPERATIONDESK
owner: Boss
prepared_by: Zero

scope:
- controlled live hardening with runtime evidence
- runtime evidence review
- runtime evidence handoff bundle
EOF_AHEL2_PRECHECK_REPORT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK ACTUAL HARDENING EDIT LANE 2 PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
