#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/master_production_proof_pass_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

run_if_exists() {
  NAME="$1"
  SCRIPT_PATH="$2"
  LOG="$OUT_DIR/$NAME.log"

  if [ -f "$SCRIPT_PATH" ]; then
    sh "$SCRIPT_PATH" >"$LOG" 2>&1 || true
    printf 'DONE\t%s\t%s\n' "$NAME" "$LOG" >> "$OUT_DIR/000_STEPS.tsv"
  else
    printf 'SKIP\t%s\tmissing:%s\n' "$NAME" "$SCRIPT_PATH" >> "$OUT_DIR/000_STEPS.tsv"
  fi
}

: > "$OUT_DIR/000_STEPS.tsv"

run_if_exists proof_precheck "$APP_ROOT/090.scripts/560_run_aioperationdesk_production_proof_precheck.sh"
run_if_exists proof_audit "$APP_ROOT/090.scripts/570_run_aioperationdesk_production_proof_audit.sh"
run_if_exists proof_collect "$APP_ROOT/090.scripts/575_collect_aioperationdesk_production_proof_artifacts.sh"
run_if_exists proof_handoff "$APP_ROOT/090.scripts/580_generate_aioperationdesk_production_proof_handoff_bundle.sh"
run_if_exists provider_env_probe "$APP_ROOT/090.scripts/510_run_aioperationdesk_provider_env_probe.sh"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK MASTER PRODUCTION PROOF PASS DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
