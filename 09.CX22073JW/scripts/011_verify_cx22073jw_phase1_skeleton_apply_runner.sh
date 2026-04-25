#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== LATEST BATCH SUMMARY ==='
TABLE cx22073jw.v_phase1_skeleton_apply_batch_summary;

\echo '=== APPLY TARGET STATUS COUNTS ==='
SELECT
  COUNT(*) AS total_targets,
  COUNT(*) FILTER (WHERE generation_status = 'applied') AS applied_targets,
  COUNT(*) FILTER (WHERE table_exists) AS table_exists_count,
  COUNT(*) FILTER (WHERE view_exists) AS view_exists_count
FROM cx22073jw.v_phase1_skeleton_apply_target_status;

\echo '=== MISSING TABLES OR VIEWS ==='
SELECT area_slug, target_table_name, table_exists, target_view_name, view_exists, generation_status
FROM cx22073jw.v_phase1_skeleton_apply_target_status
WHERE table_exists = false
   OR view_exists = false
ORDER BY area_slug;

\echo '=== STREAMWATCH APPLIED TARGETS ==='
SELECT area_slug, target_table_name, target_view_name, generation_status, table_exists, view_exists
FROM cx22073jw.v_phase1_skeleton_apply_target_status
WHERE source_system = 'StreamingOS'
  AND source_app = 'StreamWatch'
ORDER BY area_slug;

\echo '=== STATICART APPLIED TARGETS ==='
SELECT area_slug, target_table_name, target_view_name, generation_status, table_exists, view_exists
FROM cx22073jw.v_phase1_skeleton_apply_target_status
WHERE source_system = 'StaticArtOS'
ORDER BY area_slug;

\echo '=== STREAMSTUDIO APPLIED TARGETS ==='
SELECT area_slug, target_table_name, target_view_name, generation_status, table_exists, view_exists
FROM cx22073jw.v_phase1_skeleton_apply_target_status
WHERE source_app = 'StreamStudio'
ORDER BY area_slug;

\echo '=== ITEM LOG COUNTS ==='
SELECT apply_status, COUNT(*) AS cnt
FROM cx22073jw.phase1_skeleton_apply_item_log
GROUP BY apply_status
ORDER BY apply_status;

\echo '=== SAMPLE CREATED TABLES ==='
SELECT tablename
FROM pg_tables
WHERE schemaname = 'cx22073jw'
  AND tablename IN (
    'streaming_view_history_area',
    'streaming_category_tree_area',
    'streaming_continue_watching_area',
    'streaming_progress_resume_area',
    'static_art_asset_area',
    'asset_metadata_localization_area',
    'streaming_publish_setting_area',
    'streaming_connector_audit_area'
  )
ORDER BY tablename;

\echo '=== SAMPLE CREATED VIEWS ==='
SELECT viewname
FROM pg_views
WHERE schemaname = 'cx22073jw'
  AND viewname IN (
    'v_streaming_view_history_area_latest',
    'v_streaming_category_tree_area_latest',
    'v_streaming_continue_watching_area_latest',
    'v_streaming_progress_resume_area_latest',
    'v_static_art_asset_area_latest',
    'v_asset_metadata_localization_area_latest',
    'v_streaming_publish_setting_area_latest',
    'v_streaming_connector_audit_area_latest'
  )
ORDER BY viewname;
SQL
