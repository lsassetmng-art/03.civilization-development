#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/master_verify_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

run_if_exists() {
  NAME="$1"
  SCRIPT_PATH="$2"
  LOG="$OUT_DIR/$NAME.log"

  if [ -f "$SCRIPT_PATH" ]; then
    sh "$SCRIPT_PATH" >"$LOG" 2>&1
    printf 'PASS\t%s\t%s\n' "$NAME" "$LOG" >> "$OUT_DIR/000_STEPS.tsv"
  else
    printf 'SKIP\t%s\tmissing:%s\n' "$NAME" "$SCRIPT_PATH" >> "$OUT_DIR/000_STEPS.tsv"
  fi
}

: > "$OUT_DIR/000_STEPS.tsv"

run_if_exists verify_impl_all "$APP_ROOT/090.scripts/140_verify_aioperationdesk_impl_all.sh"
run_if_exists verify_hardening_all "$APP_ROOT/090.scripts/390_verify_aioperationdesk_hardening_all.sh"
run_if_exists verify_production_track_b1 "$APP_ROOT/090.scripts/430_verify_aioperationdesk_production_track_bundle.sh"
run_if_exists verify_production_track_b2 "$APP_ROOT/090.scripts/460_verify_aioperationdesk_production_track_bundle_2.sh"
run_if_exists verify_production_track_b3 "$APP_ROOT/090.scripts/500_verify_aioperationdesk_production_track_bundle_3.sh"
run_if_exists verify_production_proof_b1 "$APP_ROOT/090.scripts/550_verify_aioperationdesk_production_proof_bundle_1.sh"
run_if_exists verify_production_proof_closeout "$APP_ROOT/090.scripts/590_verify_aioperationdesk_production_proof_closeout_bundle.sh"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK MASTER VERIFY DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
