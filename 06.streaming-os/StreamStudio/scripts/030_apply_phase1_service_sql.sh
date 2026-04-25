#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$HOME/03.civilization-development/06.streaming-os/StreamStudio"

psql "$PERSONA_DATABASE_URL" <<SQL
\i '$ROOT/sql/004_stream_studio_phase1_service_functions.sql'
SQL

printf '%s
' '============================================================'
printf '%s
' 'STREAM STUDIO PHASE1 SERVICE SQL APPLY DONE'
printf '%s
' "ROOT=$ROOT"
printf '%s
' '============================================================'
