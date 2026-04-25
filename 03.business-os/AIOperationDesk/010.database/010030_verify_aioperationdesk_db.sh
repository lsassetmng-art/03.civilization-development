#!/data/data/com.termux/files/usr/bin/sh
set -eu

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
select
  table_name
from information_schema.tables
where table_schema = 'business'
  and table_name like 'aiod_%'
order by table_name;

select
  app_code,
  support_status,
  resident_surface_supported,
  help_mode_supported,
  operation_qa_supported,
  execution_supported
from business.aiod_supported_app_registry
order by app_code;
SQL
