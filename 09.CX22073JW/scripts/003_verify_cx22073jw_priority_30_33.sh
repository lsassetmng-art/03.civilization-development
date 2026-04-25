#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== FOUNDATION DOMAIN CHECK ==='
SELECT domain_code, domain_family, layer_code, is_active
FROM cx22073jw.foundation_domain_master
WHERE domain_code IN (
  'published_knowledge_catalog_quality',
  'compatibility_restriction',
  'common_template_fragment',
  'seasonal_annual_event_timing'
)
ORDER BY domain_code;

\echo '=== OBJECT COUNTS ==='
SELECT 'published_catalog' AS area, COUNT(*) AS cnt
FROM cx22073jw.published_knowledge_catalog
UNION ALL
SELECT 'quality_metric', COUNT(*) FROM cx22073jw.published_knowledge_quality_metric
UNION ALL
SELECT 'compatibility_profile', COUNT(*) FROM cx22073jw.compatibility_profile_master
UNION ALL
SELECT 'compatibility_rule', COUNT(*) FROM cx22073jw.compatibility_rule
UNION ALL
SELECT 'restriction_rule', COUNT(*) FROM cx22073jw.restriction_rule
UNION ALL
SELECT 'template_fragment_registry', COUNT(*) FROM cx22073jw.template_fragment_registry
UNION ALL
SELECT 'template_fragment_binding', COUNT(*) FROM cx22073jw.template_fragment_binding
UNION ALL
SELECT 'seasonal_event_master', COUNT(*) FROM cx22073jw.seasonal_event_master
UNION ALL
SELECT 'seasonal_event_content_link', COUNT(*) FROM cx22073jw.seasonal_event_content_link
ORDER BY area;

\echo '=== COMPATIBILITY MATRIX ==='
TABLE cx22073jw.v_compatibility_restriction_matrix;

\echo '=== RESTRICTIONS ==='
SELECT target_object_type, target_object_id, restriction_code, restriction_scope, restriction_status
FROM cx22073jw.restriction_rule
ORDER BY target_object_type, target_object_id, restriction_code;

\echo '=== SEASONAL WINDOW CHECKS ==='
SELECT
  cx22073jw.fn_is_date_in_seasonal_window('spring_new_life_jp', DATE '2026-04-10') AS spring_true,
  cx22073jw.fn_is_date_in_seasonal_window('year_end_global', DATE '2026-04-10') AS year_end_false;

\echo '=== TEMPLATE FRAGMENT FUNCTION CHECK ==='
SELECT * FROM cx22073jw.fn_get_template_fragments('published_knowledge_card_template');

\echo '=== PUBLICATION READINESS FUNCTION CHECK ==='
SELECT * FROM cx22073jw.fn_article_publication_readiness('published_knowledge_quality_policy');
SQL
