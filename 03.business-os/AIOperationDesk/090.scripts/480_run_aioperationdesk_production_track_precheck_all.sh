#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/production_track_precheck_all_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

sh "$APP_ROOT/090.scripts/420_run_aioperationdesk_production_track_precheck.sh" \
  > "$OUT_DIR/010_production_track_precheck.log" 2>&1

sh "$APP_ROOT/090.scripts/440_run_aioperationdesk_provider_http_precheck.sh" \
  > "$OUT_DIR/020_provider_http_precheck.log" 2>&1

sh "$APP_ROOT/090.scripts/450_run_aioperationdesk_replay_executor_dry_run.sh" \
  > "$OUT_DIR/030_replay_executor_dry_run.log" 2>&1 || true

sh "$APP_ROOT/090.scripts/470_run_aioperationdesk_cleanup_executor_dry_run.sh" \
  > "$OUT_DIR/040_cleanup_executor_dry_run.log" 2>&1 || true

sh "$APP_ROOT/090.scripts/430_verify_aioperationdesk_production_track_bundle.sh" \
  > "$OUT_DIR/050_bundle1_verify.log" 2>&1

sh "$APP_ROOT/090.scripts/460_verify_aioperationdesk_production_track_bundle_2.sh" \
  > "$OUT_DIR/060_bundle2_verify.log" 2>&1

sh "$APP_ROOT/090.scripts/500_verify_aioperationdesk_production_track_bundle_3.sh" \
  > "$OUT_DIR/070_bundle3_verify.log" 2>&1

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PRODUCTION TRACK PRECHECK ALL DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
