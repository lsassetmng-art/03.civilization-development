#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== COMMON COLUMN COUNT ==='
SELECT COUNT(*) AS common_column_count
FROM cx22073jw.projection_common_column_contract_master
WHERE profile_code = 'phase1_common_columns_v1';

\echo '=== PAYLOAD CONTRACT COUNT ==='
SELECT COUNT(*) AS payload_contract_count
FROM cx22073jw.area_payload_contract_registry;

\echo '=== SNAPSHOT COUNT ==='
SELECT COUNT(*) AS snapshot_count
FROM cx22073jw.area_exact_contract_snapshot;

\echo '=== STREAMWATCH EXACT CONTRACTS ==='
SELECT area_slug, payload_column_name, required_keys
FROM cx22073jw.v_exact_contract_area_payloads
WHERE source_system = 'StreamingOS'
  AND source_app = 'StreamWatch'
ORDER BY area_slug, payload_column_name;

\echo '=== STATICART EXACT CONTRACTS ==='
SELECT area_slug, payload_column_name, required_keys
FROM cx22073jw.v_exact_contract_area_payloads
WHERE source_system = 'StaticArtOS'
ORDER BY area_slug, payload_column_name;

\echo '=== STREAMSTUDIO EXACT CONTRACTS ==='
SELECT area_slug, payload_column_name, required_keys
FROM cx22073jw.v_exact_contract_area_payloads
WHERE source_app = 'StreamStudio'
ORDER BY area_slug, payload_column_name;

\echo '=== SNAPSHOT STATUS ==='
SELECT source_system, source_app, area_slug, payload_contract_count, contract_status
FROM cx22073jw.v_exact_contract_snapshot_summary
ORDER BY source_system, source_app, area_slug;

\echo '=== SAMPLE SNAPSHOT DIGESTS ==='
SELECT area_slug, contract_digest, payload_contract_count
FROM cx22073jw.v_exact_contract_snapshot_summary
WHERE area_slug IN (
  'streaming_view_history_area',
  'streaming_category_tree_area',
  'streaming_continue_watching_area',
  'streaming_progress_resume_area',
  'static_art_asset_area',
  'asset_metadata_localization_area',
  'streaming_publish_setting_area',
  'streaming_connector_audit_area'
)
ORDER BY area_slug;
SQL
