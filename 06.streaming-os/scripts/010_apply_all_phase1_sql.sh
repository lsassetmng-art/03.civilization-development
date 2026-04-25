#!/data/data/com.termux/files/usr/bin/bash
set -eu
ROOT="$HOME/03.civilization-development/06.streaming-os"

echo "============================================================"
echo "STREAMING OS APPLY ALL PHASE1 SQL"
echo "ROOT = $ROOT"
echo "DB   = PERSONA_DATABASE_URL"
echo "============================================================"

"$ROOT/StreamStudio/scripts/010_apply_phase1_sql.sh"
"$ROOT/StreamWatch/scripts/010_apply_watch_phase1_sql.sh"

echo "DONE: apply all phase1 sql"
