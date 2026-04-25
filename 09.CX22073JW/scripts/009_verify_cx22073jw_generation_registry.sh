#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== PROFILE MASTER ==='
SELECT profile_code, profile_name, generation_scope, default_schema_name
FROM cx22073jw.generation_profile_master
ORDER BY profile_code;

\echo '=== GENERATION REGISTRY SUMMARY ==='
TABLE cx22073jw.v_generation_registry_summary;

\echo '=== TOP PRIORITY GENERATED ITEMS ==='
SELECT source_system, source_app, area_slug, object_family_code, target_table_name, generation_status
FROM cx22073jw.v_generation_registry_priority_order
LIMIT 20;

\echo '=== STREAMWATCH GENERATED TARGETS ==='
SELECT area_slug, target_table_name, target_view_name, target_function_name, generation_status
FROM cx22073jw.v_generation_registry_overview
WHERE source_system = 'StreamingOS'
  AND source_app = 'StreamWatch'
ORDER BY area_slug;

\echo '=== STATICART GENERATED TARGETS ==='
SELECT area_slug, target_table_name, generation_status
FROM cx22073jw.v_generation_registry_overview
WHERE source_system = 'StaticArtOS'
ORDER BY area_slug;

\echo '=== DDL CHECK SAMPLE ==='
SELECT
  car.area_slug,
  length(ogr.ddl_sql) AS ddl_length,
  left(ogr.ddl_sql, 500) AS ddl_preview
FROM cx22073jw.official_prepare_generation_registry ogr
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = ogr.candidate_area_id
WHERE car.area_slug IN (
  'streaming_view_history_area',
  'asset_metadata_localization_area',
  'streaming_publish_setting_area'
)
ORDER BY car.area_slug;

\echo '=== REBUILD SAMPLE FUNCTION ==='
SELECT length(cx22073jw.fn_build_generation_sql('streaming_view_history_area')) AS sample_sql_length;

\echo '=== REGENERATE COUNT ==='
SELECT cx22073jw.fn_regenerate_all_generation_sql() AS regenerated_rows;

\echo '=== LOG COUNTS ==='
SELECT action_code, COUNT(*) AS cnt
FROM cx22073jw.official_prepare_generation_registry_log
GROUP BY action_code
ORDER BY action_code;
SQL
