#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== PROFILE SUMMARY ==='
TABLE cx22073jw.v_system_to_cx_knowledge_transfer_profile_summary;

\echo '=== BLOCKS ==='
TABLE cx22073jw.v_staticart_exact_knowledge_transfer_blocks;

\echo '=== ROOT FIELDS ==='
SELECT field_code, field_type_text, field_role_text, fixed_value_text, allowed_values
FROM cx22073jw.v_staticart_exact_knowledge_transfer_fields
WHERE block_code = 'knowledge_pack_root'
ORDER BY sort_order;

\echo '=== MINIMUM FIRST SEND SET ==='
SELECT item_text, sort_order
FROM cx22073jw.v_staticart_exact_knowledge_transfer_rules
WHERE rule_group_code = 'minimum_first_send_set'
ORDER BY sort_order;

\echo '=== RECOMMENDED PAYLOAD GROUPING ==='
SELECT item_text, sort_order
FROM cx22073jw.v_staticart_exact_knowledge_transfer_rules
WHERE rule_group_code = 'recommended_payload_grouping'
ORDER BY sort_order;

\echo '=== DO NOT SEND AS CANONICAL ==='
SELECT item_text, sort_order
FROM cx22073jw.v_staticart_exact_knowledge_transfer_rules
WHERE rule_group_code = 'do_not_send_as_canonical'
ORDER BY sort_order;

\echo '=== FIELD COUNTS BY BLOCK ==='
SELECT block_code, COUNT(*) AS field_count
FROM cx22073jw.v_staticart_exact_knowledge_transfer_fields
GROUP BY block_code
ORDER BY block_code;
SQL
