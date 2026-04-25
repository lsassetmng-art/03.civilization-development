#!/data/data/com.termux/files/usr/bin/bash
set -eu

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SQL_DIR="$BASE_DIR/sql"

if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "ERROR: PERSONA_DATABASE_URL is not exported"
  exit 1
fi

echo "============================================================"
echo "STREAM STUDIO PHASE1 VERIFY"
echo "TARGET: PERSONA_DATABASE_URL"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_DIR/003_stream_studio_phase1_verify.sql"

echo "DONE"
