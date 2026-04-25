#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/090.scripts/1000_run_aioperationdesk_final_implementation_tightening_precheck.sh" \
  "$APP_ROOT/090.scripts/1020_test_aioperationdesk_keyed_auth_live_proof.sh" \
  "$APP_ROOT/090.scripts/1030_run_aioperationdesk_final_implementation_digest.sh" \
  "$APP_ROOT/090.scripts/1040_generate_aioperationdesk_final_implementation_handoff.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
