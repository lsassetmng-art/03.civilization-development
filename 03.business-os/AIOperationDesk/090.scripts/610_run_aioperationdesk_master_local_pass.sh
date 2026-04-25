#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/master_local_pass_$(date +%Y%m%d_%H%M%S)"
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

run_if_exists design_verify "$APP_ROOT/090.scripts/020_run_aioperationdesk_design_verification_from_dev.sh"
run_if_exists impl_verify "$APP_ROOT/090.scripts/140_verify_aioperationdesk_impl_all.sh"
run_if_exists final_precheck "$APP_ROOT/090.scripts/180_run_aioperationdesk_final_precheck.sh"
run_if_exists release_candidate_audit "$APP_ROOT/090.scripts/200_run_aioperationdesk_release_candidate_audit.sh"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK MASTER LOCAL PASS DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
