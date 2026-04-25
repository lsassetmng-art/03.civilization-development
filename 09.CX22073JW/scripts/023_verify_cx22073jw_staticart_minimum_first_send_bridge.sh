#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== AREA BINDINGS ==='
TABLE cx22073jw.v_staticart_minimum_first_send_area_bindings;

\echo '=== FIELD BINDINGS ==='
SELECT block_code, area_slug, field_code, target_slot_type, target_slot_name
FROM cx22073jw.v_staticart_minimum_first_send_field_bindings
ORDER BY block_code, area_slug, sort_order;

\echo '=== CONTRACT COVERAGE ==='
TABLE cx22073jw.v_staticart_minimum_first_send_contract_coverage;

\echo '=== PAYLOAD CONTRACT OPTIONAL KEYS CHECK ==='
SELECT
  car.area_slug,
  apcr.payload_column_name,
  apcr.required_keys,
  apcr.optional_keys
FROM cx22073jw.area_payload_contract_registry apcr
JOIN cx22073jw.candidate_area_registry car
  ON car.candidate_area_id = apcr.candidate_area_id
WHERE (car.area_slug, apcr.payload_column_name) IN (
  ('static_art_asset_area','projection_payload'),
  ('asset_metadata_localization_area','index_payload'),
  ('exhibition_projection_area','projection_payload'),
  ('asset_rights_policy_area','policy_context_payload')
)
ORDER BY car.area_slug, apcr.payload_column_name;

\echo '=== MISSING CONTRACT KEYS ONLY ==='
SELECT block_code, area_slug, target_payload_column_name, missing_contract_keys
FROM cx22073jw.v_staticart_minimum_first_send_contract_coverage
WHERE cardinality(missing_contract_keys) > 0
ORDER BY block_code, area_slug;
SQL
