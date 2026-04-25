#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== WRAPPER FUNCTION COUNTS ==='
SELECT
  source_system,
  source_app,
  COUNT(*) AS total_areas,
  COUNT(*) FILTER (WHERE wrapper_function_exists) AS wrapper_function_count
FROM cx22073jw.v_exact_payload_wrapper_status
GROUP BY source_system, source_app
ORDER BY source_system, source_app;

\echo '=== STREAMWATCH WRAPPERS ==='
SELECT area_slug, target_function_name, table_exists, wrapper_function_exists
FROM cx22073jw.v_exact_payload_wrapper_status
WHERE source_system = 'StreamingOS'
  AND source_app = 'StreamWatch'
ORDER BY area_slug;

\echo '=== STATICART WRAPPERS ==='
SELECT area_slug, target_function_name, table_exists, wrapper_function_exists
FROM cx22073jw.v_exact_payload_wrapper_status
WHERE source_system = 'StaticArtOS'
ORDER BY area_slug;

\echo '=== STREAMSTUDIO WRAPPERS ==='
SELECT area_slug, target_function_name, table_exists, wrapper_function_exists
FROM cx22073jw.v_exact_payload_wrapper_status
WHERE source_app = 'StreamStudio'
ORDER BY area_slug;

\echo '=== VALIDATION FUNCTION CHECK ==='
SELECT *
FROM cx22073jw.fn_validate_area_payload_contracts(
  'streaming_category_tree_area',
  '{"subject_ref":"cat_root","state_code":"active","summary_label":"root"}'::jsonb,
  NULL,
  NULL,
  '{"category_node_id":"node_root","parent_node_id":"none","path_text":"root","depth_no":1}'::jsonb,
  NULL,
  '{"branch_rank":1,"path_popularity_score":99.5,"entry_surface_code":"home","tree_refresh_group":"daily"}'::jsonb
);

\echo '=== GENERIC UPSERT FUNCTION EXISTS ==='
SELECT p.proname
FROM pg_proc p
JOIN pg_namespace n
  ON n.oid = p.pronamespace
WHERE n.nspname = 'cx22073jw'
  AND p.proname IN (
    'fn_jsonb_missing_required_keys',
    'fn_validate_area_payload_contracts',
    'fn_apply_area_exact_upsert',
    'fn_generate_area_upsert_wrapper_sql',
    'fn_regenerate_applied_area_upsert_wrappers'
  )
ORDER BY p.proname;

\echo '=== ISSUE LOG SUMMARY ==='
TABLE cx22073jw.v_exact_payload_validation_issue_summary;
SQL
