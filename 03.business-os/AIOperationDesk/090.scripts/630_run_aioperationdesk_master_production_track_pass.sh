#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/master_production_track_pass_$(date +%Y%m%d_%H%M%S)"
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

run_if_exists prod_track_precheck "$APP_ROOT/090.scripts/480_run_aioperationdesk_production_track_precheck_all.sh"
run_if_exists prod_track_handoff "$APP_ROOT/090.scripts/490_generate_aioperationdesk_production_track_handoff_bundle.sh"
run_if_exists provider_http_precheck "$APP_ROOT/090.scripts/440_run_aioperationdesk_provider_http_precheck.sh"
run_if_exists replay_dry_run "$APP_ROOT/090.scripts/450_run_aioperationdesk_replay_executor_dry_run.sh"
run_if_exists cleanup_dry_run "$APP_ROOT/090.scripts/470_run_aioperationdesk_cleanup_executor_dry_run.sh"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK MASTER PRODUCTION TRACK PASS DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
