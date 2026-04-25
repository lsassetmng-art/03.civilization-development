#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/hardening_precheck_all_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

sh "$APP_ROOT/090.scripts/230_run_aioperationdesk_hardening_precheck.sh" \
  > "$OUT_DIR/010_hardening_entry_precheck.log" 2>&1

sh "$APP_ROOT/090.scripts/250_run_aioperationdesk_auth_provider_precheck.sh" \
  > "$OUT_DIR/020_auth_provider_precheck.log" 2>&1

sh "$APP_ROOT/090.scripts/372_run_aioperationdesk_retention_precheck.sh" \
  > "$OUT_DIR/030_retention_precheck.log" 2>&1

sh "$APP_ROOT/090.scripts/390_verify_aioperationdesk_hardening_all.sh" \
  > "$OUT_DIR/040_hardening_verify_all.log" 2>&1

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK HARDENING PRECHECK ALL DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' '============================================================'
find "$OUT_DIR" -maxdepth 1 -type f | sort
