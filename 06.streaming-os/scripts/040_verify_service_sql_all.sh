#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$HOME/03.civilization-development/06.streaming-os"

"$ROOT/StreamStudio/scripts/040_verify_phase1_service_sql.sh"
"$ROOT/StreamWatch/scripts/040_verify_phase1_service_sql.sh"
