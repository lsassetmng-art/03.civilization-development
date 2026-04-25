#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

for FILE in \
  "$APP_ROOT/000.docs/HARDENING_ROADMAP.md" \
  "$APP_ROOT/000.docs/HARDENING_ENTRY_CHECKLIST.md" \
  "$APP_ROOT/020.backend/lib/aiod_env.js" \
  "$APP_ROOT/020.backend/lib/aiod_auth_stub.js" \
  "$APP_ROOT/020.backend/lib/aiod_permission_stub.js" \
  "$APP_ROOT/040.integrations/line/README.md" \
  "$APP_ROOT/080.notifications/line_provider_stub.js" \
  "$APP_ROOT/070.jobs/aiod_retention_jobs_stub.js" \
  "$APP_ROOT/090.scripts/230_run_aioperationdesk_hardening_precheck.sh"
do
  if [ ! -f "$FILE" ]; then
    printf '%s\n' "NG $FILE" >&2
    exit 1
  fi
  printf '%s\n' "OK $FILE"
done
