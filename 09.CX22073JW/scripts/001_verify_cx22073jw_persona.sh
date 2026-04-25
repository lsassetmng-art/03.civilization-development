#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
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
WHERE n.nspname = 'cx22073jw'
ORDER BY object_type;

\echo '=== FOUNDATION DOMAINS ==='
SELECT domain_code, layer_code, domain_family, is_active
FROM cx22073jw.foundation_domain_master
ORDER BY domain_code;

\echo '=== SECRET CATEGORIES ==='
SELECT category_code, category_name
FROM cx22073jw.secret_asset_category_master
ORDER BY category_code;

\echo '=== SECRET POLICY CHECKS ==='
SELECT * FROM cx22073jw.fn_can_access_secret(
  'triple',
  'triple_root',
  'default_selector',
  'protected_index_support_zone',
  'protected_index_support'
);

SELECT * FROM cx22073jw.fn_can_access_secret(
  'triple',
  'triple_viewer',
  'protected_template_selector',
  'protected_template_zone',
  'protected_template'
);

\echo '=== PRIORITY 26-29 COUNTS ==='
TABLE cx22073jw.v_priority_26_29_readiness;

\echo '=== UNIT CONVERSION CHECK ==='
SELECT
  cx22073jw.fn_convert_unit(2.5, 'kg', 'g') AS kg_to_g,
  cx22073jw.fn_convert_unit(180, 'cm', 'm') AS cm_to_m;
SQL
