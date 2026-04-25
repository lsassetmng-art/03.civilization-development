#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/walkthrough_mock_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FULL LOCAL MOCK WALKTHROUGH START'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'

sh "$APP_ROOT/090.scripts/020_run_aioperationdesk_design_verification_from_dev.sh" \
  > "$OUT_DIR/010_design_verification.log" 2>&1

sh "$APP_ROOT/090.scripts/140_verify_aioperationdesk_impl_all.sh" \
  > "$OUT_DIR/020_impl_verify.log" 2>&1

sh "$APP_ROOT/090.scripts/100_run_aioperationdesk_local_mock_stack.sh" \
  > "$OUT_DIR/030_mock_stack_start.log" 2>&1

sleep 2

sh "$APP_ROOT/090.scripts/130_smoke_test_aioperationdesk_local_stack.sh" \
  > "$OUT_DIR/040_smoke_test.log" 2>&1

sh "$APP_ROOT/090.scripts/120_stop_aioperationdesk_local_stack.sh" \
  > "$OUT_DIR/050_stack_stop.log" 2>&1

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FULL LOCAL MOCK WALKTHROUGH DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
