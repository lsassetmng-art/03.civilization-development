#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
SEED_FILE="$APP_ROOT/010.database/060030_AIOPERATIONDESK_SUPPORTED_APP_REGISTRY_SEED_ROWS_EXACT.sql"

if [ ! -f "$SEED_FILE" ]; then
  printf '%s\n' "Seed file not found: $SEED_FILE" >&2
  exit 1
fi

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SEED_FILE"

printf '%s\n' '============================================================'
printf '%s\n' 'AI OPERATION DESK SEED APPLY DONE'
printf '%s\n' "SEED_FILE=$SEED_FILE"
printf '%s\n' '============================================================'
