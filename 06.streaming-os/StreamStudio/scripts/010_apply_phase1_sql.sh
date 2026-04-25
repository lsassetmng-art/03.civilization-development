#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SQL_DIR="$BASE_DIR/sql"

if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "ERROR: PERSONA_DATABASE_URL is not exported"
  exit 1
fi

echo "============================================================"
echo "STREAM STUDIO PHASE1 APPLY"
echo "TARGET: PERSONA_DATABASE_URL"
echo "SQLDIR : $SQL_DIR"
echo "Reviewer: Sato (DB)"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
\i $SQL_DIR/001_stream_studio_phase1_core.sql
\i $SQL_DIR/002_stream_studio_phase1_seed.sql
SQL

echo "DONE"
