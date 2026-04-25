#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"

"$APP_ROOT/010.database/010010_apply_aioperationdesk_ddl.sh"
"$APP_ROOT/010.database/010020_apply_aioperationdesk_seed.sh"
"$APP_ROOT/010.database/010030_verify_aioperationdesk_db.sh"
