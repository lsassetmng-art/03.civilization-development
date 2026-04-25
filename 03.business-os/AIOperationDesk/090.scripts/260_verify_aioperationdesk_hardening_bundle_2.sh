#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/RUNTIME_ENV_EXACT.md" \
  "$APP_ROOT/000.docs/AUTH_PERMISSION_PROVIDER_EXACT.md" \
  "$APP_ROOT/020.backend/lib/aiod_auth_contract.js" \
  "$APP_ROOT/020.backend/lib/aiod_permission_contract.js" \
  "$APP_ROOT/040.integrations/line/LINE_PROVIDER_CONTRACT_EXACT.md" \
  "$APP_ROOT/080.notifications/line_provider_contract.js" \
  "$APP_ROOT/090.scripts/250_run_aioperationdesk_auth_provider_precheck.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
