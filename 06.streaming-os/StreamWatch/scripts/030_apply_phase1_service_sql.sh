#!/data/data/com.termux/files/usr/bin/bash
set -eu

ROOT="$HOME/03.civilization-development/06.streaming-os/StreamWatch"

psql "$PERSONA_DATABASE_URL" <<SQL
\i '$ROOT/sql/004_streamwatch_phase1_service_views_and_functions.sql'
SQL

printf '%s
' '============================================================'
printf '%s
' 'STREAMWATCH PHASE1 SERVICE SQL APPLY DONE'
printf '%s
' "ROOT=$ROOT"
printf '%s
' '============================================================'
