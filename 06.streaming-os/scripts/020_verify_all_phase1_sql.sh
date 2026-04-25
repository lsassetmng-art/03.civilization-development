#!/data/data/com.termux/files/usr/bin/bash
set -eu
ROOT="$HOME/03.civilization-development/06.streaming-os"

echo "============================================================"
echo "STREAMING OS VERIFY ALL PHASE1 SQL"
echo "ROOT = $ROOT"
echo "DB   = PERSONA_DATABASE_URL"
echo "============================================================"

"$ROOT/StreamStudio/scripts/020_verify_phase1_sql.sh"
"$ROOT/StreamWatch/scripts/020_verify_watch_phase1_sql.sh"

echo "DONE: verify all phase1 sql"
