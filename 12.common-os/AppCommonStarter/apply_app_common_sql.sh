#!/data/data/com.termux/files/usr/bin/bash
set -eu

DB_URL="${TARGET_DB_URL:-${DATABASE_URL:-}}"
if [ -z "$DB_URL" ]; then
  printf '%s\n' 'ERROR: TARGET_DB_URL or DATABASE_URL is required' >&2
  exit 1
fi

ROOT="/data/data/com.termux/files/home/03.civilization-development/12.common-os/AppCommonStarter"
SQL_FILE="$ROOT/sql/001_app_common_bootstrap.sql"

if [ ! -f "$SQL_FILE" ]; then
  printf '%s\n' "ERROR: SQL file not found: $SQL_FILE" >&2
  exit 1
fi

psql "$DB_URL" <<SQL
\set ON_ERROR_STOP on
\i $SQL_FILE
SQL
