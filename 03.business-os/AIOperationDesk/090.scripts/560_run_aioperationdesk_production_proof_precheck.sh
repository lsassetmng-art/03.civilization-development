#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/production_proof_precheck_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

sh "$APP_ROOT/090.scripts/430_verify_aioperationdesk_production_track_bundle.sh" \
  > "$OUT_DIR/010_production_track_bundle1_verify.log" 2>&1

sh "$APP_ROOT/090.scripts/460_verify_aioperationdesk_production_track_bundle_2.sh" \
  > "$OUT_DIR/020_production_track_bundle2_verify.log" 2>&1

sh "$APP_ROOT/090.scripts/500_verify_aioperationdesk_production_track_bundle_3.sh" \
  > "$OUT_DIR/030_production_track_bundle3_verify.log" 2>&1

sh "$APP_ROOT/090.scripts/510_run_aioperationdesk_provider_env_probe.sh" \
  > "$OUT_DIR/040_provider_env_probe.log" 2>&1

sh "$APP_ROOT/090.scripts/450_run_aioperationdesk_replay_executor_dry_run.sh" \
  > "$OUT_DIR/050_replay_dry_run.log" 2>&1 || true

sh "$APP_ROOT/090.scripts/470_run_aioperationdesk_cleanup_executor_dry_run.sh" \
  > "$OUT_DIR/060_cleanup_dry_run.log" 2>&1 || true

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK PRODUCTION PROOF PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
