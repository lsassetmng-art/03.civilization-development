#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
DDL_FILE="$APP_ROOT/010.database/110020_AIOPERATIONDESK_DDL_EXACT.sql"

if [ ! -f "$DDL_FILE" ]; then
  printf '%s\n' "DDL file not found: $DDL_FILE" >&2
  exit 1
fi

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$DDL_FILE"

printf '%s\n' '============================================================'
printf '%s\n' 'AI OPERATION DESK DDL APPLY DONE'
printf '%s\n' "DDL_FILE=$DDL_FILE"
printf '%s\n' '============================================================'
