set -eu

SQL_FILE="$HOME/03.civilization-development/06.streaming-os/StreamWatch/sql/020_streamwatch_phase1_projection_rpc.sql"

echo "============================================================"
echo "APPLY STREAMWATCH PHASE1 PROJECTION / RPC"
echo "SQL_FILE = $SQL_FILE"
echo "DB_ENV   = PERSONA_DATABASE_URL"
echo "============================================================"

if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "ERROR: PERSONA_DATABASE_URL is not set"
  exit 1
fi

if [ ! -f "$SQL_FILE" ]; then
  echo "ERROR: SQL file not found -> $SQL_FILE"
  exit 1
fi

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
\i $SQL_FILE
SQL

echo "============================================================"
echo "DONE"
echo "============================================================"
