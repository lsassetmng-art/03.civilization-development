#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/walkthrough_db_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  printf '%s\n' 'PERSONA_DATABASE_URL is not set.' >&2
  exit 1
fi

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FULL LOCAL DB WALKTHROUGH START'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'

sh "$APP_ROOT/090.scripts/020_run_aioperationdesk_design_verification_from_dev.sh" \
  > "$OUT_DIR/010_design_verification.log" 2>&1

sh "$APP_ROOT/090.scripts/140_verify_aioperationdesk_impl_all.sh" \
  > "$OUT_DIR/020_impl_verify.log" 2>&1

sh "$APP_ROOT/090.scripts/010_run_aioperationdesk_db_bootstrap.sh" \
  > "$OUT_DIR/030_db_bootstrap.log" 2>&1

sh "$APP_ROOT/090.scripts/110_run_aioperationdesk_local_db_stack.sh" \
  > "$OUT_DIR/040_db_stack_start.log" 2>&1

sleep 2

sh "$APP_ROOT/090.scripts/130_smoke_test_aioperationdesk_local_stack.sh" \
  > "$OUT_DIR/050_smoke_test.log" 2>&1

sh "$APP_ROOT/090.scripts/065_test_aioperationdesk_edge_db_read_routes.sh" \
  > "$OUT_DIR/060_db_read_routes.log" 2>&1

sh "$APP_ROOT/090.scripts/076_query_aioperationdesk_db_recent_write_state.sh" \
  > "$OUT_DIR/070_db_recent_write_state.log" 2>&1 || true

sh "$APP_ROOT/090.scripts/078_query_aioperationdesk_db_recent_request_state.sh" \
  > "$OUT_DIR/080_db_recent_request_state.log" 2>&1 || true

sh "$APP_ROOT/090.scripts/120_stop_aioperationdesk_local_stack.sh" \
  > "$OUT_DIR/090_stack_stop.log" 2>&1

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FULL LOCAL DB WALKTHROUGH DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
