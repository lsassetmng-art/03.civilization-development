#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/master_hardening_pass_$(date +%Y%m%d_%H%M%S)"
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

run_if_exists hardening_precheck_all "$APP_ROOT/090.scripts/400_run_aioperationdesk_hardening_precheck_all.sh"
run_if_exists hardening_handoff_bundle "$APP_ROOT/090.scripts/410_generate_aioperationdesk_hardening_handoff_bundle.sh"
run_if_exists provider_follow_on_query "$APP_ROOT/090.scripts/351_query_aioperationdesk_provider_follow_on_state.sh"
run_if_exists retention_precheck "$APP_ROOT/090.scripts/372_run_aioperationdesk_retention_precheck.sh"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK MASTER HARDENING PASS DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
