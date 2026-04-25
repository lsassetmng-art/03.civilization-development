#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SQL_DIR="$BASE_DIR/sql"

: "${PERSONA_DATABASE_URL:?PERSONA_DATABASE_URL is required}"

echo "============================================================"
echo "STREAMWATCH PHASE1 SQL VERIFY"
echo "BASE_DIR = $BASE_DIR"
echo "SQL_DIR  = $SQL_DIR"
echo "DB_ENV   = PERSONA_DATABASE_URL"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_DIR/003_streamwatch_phase1_verify.sql"
