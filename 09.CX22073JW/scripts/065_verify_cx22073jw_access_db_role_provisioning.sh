#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST DB ROLE PROVISION BATCH SUMMARY ==='
TABLE cx22073jw.v_access_db_role_provision_latest_batch_summary;

\echo '=== LATEST DB ROLE PROVISION ITEMS ==='
TABLE cx22073jw.v_access_db_role_provision_latest_items;

\echo '=== DB ROLE REGISTRY SUMMARY ==='
SELECT
  role_code,
  domain_code,
  expected_db_role_name,
  role_status,
  role_exists_flag
FROM cx22073jw.v_access_db_role_registry_summary
ORDER BY domain_code, role_code;

\echo '=== ROLE EXISTENCE COUNTS ==='
SELECT
  domain_code,
  COUNT(*) AS total_roles,
  COUNT(*) FILTER (WHERE role_exists_flag) AS existing_roles,
  COUNT(*) FILTER (WHERE NOT role_exists_flag) AS missing_roles
FROM cx22073jw.v_access_db_role_registry_summary
GROUP BY domain_code
ORDER BY domain_code;
SQL
