#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== SCHEMA CHECK ==='
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'cx22073jw';

\echo '=== OBJECT COUNTS ==='
SELECT 'tables' AS object_type, COUNT(*) AS cnt
FROM information_schema.tables
WHERE table_schema = 'cx22073jw'
UNION ALL
SELECT 'views' AS object_type, COUNT(*) AS cnt
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
UNION ALL
SELECT 'functions' AS object_type, COUNT(*) AS cnt
FROM pg_proc p
JOIN pg_namespace n
  ON n.oid = p.pronamespace
WHERE n.nspname = 'cx22073jw';

\echo '=== PRIVILEGE MATRIX SAMPLE ==='
SELECT
  ar.route_code,
  dd.domain_code,
  ap.privilege_code,
  ap.is_allowed
FROM cx22073jw.access_policy ap
JOIN cx22073jw.access_route ar
  ON ar.route_code = ap.route_code
JOIN cx22073jw.data_domain dd
  ON dd.domain_id = ap.domain_id
ORDER BY ar.route_code, dd.domain_code, ap.privilege_code;
SQL
