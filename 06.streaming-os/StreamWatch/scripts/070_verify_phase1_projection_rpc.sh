set -eu

echo "============================================================"
echo "VERIFY STREAMWATCH PHASE1 PROJECTION / RPC"
echo "DB_ENV = PERSONA_DATABASE_URL"
echo "============================================================"

if [ -z "${PERSONA_DATABASE_URL:-}" ]; then
  echo "ERROR: PERSONA_DATABASE_URL is not set"
  exit 1
fi

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
select
  n.nspname as schema_name,
  p.proname as function_name
from pg_proc p
join pg_namespace n
  on n.oid = p.pronamespace
where n.nspname = 'streaming'
  and p.proname like 'fn_streamwatch_%'
order by p.proname;

select streaming.fn_streamwatch_profile_bootstrap(null);
select streaming.fn_streamwatch_home(null, 3);
select streaming.fn_streamwatch_category_tree(5);
select streaming.fn_streamwatch_library(null, 3);
SQL

echo "============================================================"
echo "DONE"
echo "============================================================"
