#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$HOME/03.civilization-development/06.streaming-os/StreamWatch"

psql "$PERSONA_DATABASE_URL" <<SQL
\i '$ROOT/sql/005_streamwatch_phase1_service_verify.sql'
SQL
