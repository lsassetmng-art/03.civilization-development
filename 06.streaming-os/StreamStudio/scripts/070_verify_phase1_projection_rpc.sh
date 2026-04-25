set -eu

echo "============================================================"
echo "VERIFY STREAMSTUDIO PHASE1 PROJECTION / RPC"
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
  and p.proname like 'fn_streamstudio_%'
order by p.proname;

select streaming.fn_streamstudio_dashboard();
select streaming.fn_streamstudio_projects(3);
select streaming.fn_streamstudio_upload_queue(3);
SQL

echo "============================================================"
echo "DONE"
echo "============================================================"
