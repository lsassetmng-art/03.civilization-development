#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/final_precheck_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FINAL PRECHECK START'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'

sh "$APP_ROOT/090.scripts/020_run_aioperationdesk_design_verification_from_dev.sh" \
  > "$OUT_DIR/010_design_verification.log" 2>&1

sh "$APP_ROOT/090.scripts/140_verify_aioperationdesk_impl_all.sh" \
  > "$OUT_DIR/020_impl_verify.log" 2>&1

if [ -n "${PERSONA_DATABASE_URL:-}" ]; then
  sh "$APP_ROOT/010.database/010030_verify_aioperationdesk_db.sh" \
    > "$OUT_DIR/030_db_verify.log" 2>&1 || true
else
  printf '%s\n' 'PERSONA_DATABASE_URL not set, skipped DB verify.' \
    > "$OUT_DIR/030_db_verify.log"
fi

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK FINAL PRECHECK DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
