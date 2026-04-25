#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== SAMPLE REGISTRY ==='
TABLE cx22073jw.v_staticart_knowledge_pack_sample_registry_summary;

\echo '=== LATEST RUN SUMMARY ==='
SELECT
  sample_code,
  run_status,
  total_area_count,
  preflight_pass_count,
  preflight_fail_count,
  wrapper_applied_count,
  wrapper_skipped_count,
  note_text
FROM cx22073jw.v_staticart_knowledge_pack_run_latest
LIMIT 1;

\echo '=== LATEST RUN ITEMS ==='
TABLE cx22073jw.v_staticart_knowledge_pack_run_item_latest;

\echo '=== PREFLIGHT FAILURES ONLY ==='
SELECT
  area_slug,
  preflight_status,
  missing_detail_json,
  wrapper_apply_status,
  error_text
FROM cx22073jw.v_staticart_knowledge_pack_run_item_latest
WHERE preflight_status = 'fail'
ORDER BY area_slug;

\echo '=== WRAPPER APPLIED ONLY ==='
SELECT
  area_slug,
  wrapper_apply_status,
  result_row_id
FROM cx22073jw.v_staticart_knowledge_pack_run_item_latest
WHERE wrapper_apply_status = 'applied'
ORDER BY area_slug;

\echo '=== BUNDLE PREVIEW: STATIC_ART_ASSET_AREA ==='
SELECT *
FROM cx22073jw.fn_build_staticart_minimum_first_send_bundle(
  'staticart_minimum_first_send_sample_001',
  'static_art_asset_area'
);

\echo '=== BUNDLE PREVIEW: ASSET_METADATA_LOCALIZATION_AREA ==='
SELECT *
FROM cx22073jw.fn_build_staticart_minimum_first_send_bundle(
  'staticart_minimum_first_send_sample_001',
  'asset_metadata_localization_area'
);

\echo '=== BUNDLE PREVIEW: EXHIBITION_PROJECTION_AREA ==='
SELECT *
FROM cx22073jw.fn_build_staticart_minimum_first_send_bundle(
  'staticart_minimum_first_send_sample_001',
  'exhibition_projection_area'
);

\echo '=== BUNDLE PREVIEW: ASSET_RIGHTS_POLICY_AREA ==='
SELECT *
FROM cx22073jw.fn_build_staticart_minimum_first_send_bundle(
  'staticart_minimum_first_send_sample_001',
  'asset_rights_policy_area'
);
SQL
