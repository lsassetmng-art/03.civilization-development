#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/production_implementation_precheck_4_$(date +%Y%m%d_%H%M%S)"
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

check_file "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_4.md"
check_file "$APP_ROOT/000.docs/PRODUCTION_IMPLEMENTATION_LANE_4_RUNBOOK.md"
check_file "$APP_ROOT/000.docs/PRODUCTION_LIVE_PROOF_POLICY.md"
check_file "$APP_ROOT/090.scripts/850_run_aioperationdesk_strict_hardened_live_stack.sh"
check_file "$APP_ROOT/090.scripts/851_stop_aioperationdesk_strict_hardened_live_stack.sh"
check_file "$APP_ROOT/090.scripts/852_run_aioperationdesk_provider_live_readiness_probe.sh"
check_file "$APP_ROOT/090.scripts/853_test_aioperationdesk_strict_auth_provider_live_proof.sh"

cat > "$OUT_DIR/000_REPORT.md" <<EOF_IMPL4_REPORT
# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 4 PRECHECK
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- strict hardened live stack
- provider live readiness probe
- strict auth + provider live proof
EOF_IMPL4_REPORT

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PRODUCTION IMPLEMENTATION LANE 4 PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
