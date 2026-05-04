#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker"

node "${BASE}/tests/node_smoke_business_aiworker_selector_core.js"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  'business.vw_business_robot_selector_options' AS object_name,
  to_regclass('business.vw_business_robot_selector_options') IS NOT NULL AS exists_flag
UNION ALL
SELECT
  'business.vw_company_robot_selector_options' AS object_name,
  to_regclass('business.vw_company_robot_selector_options') IS NOT NULL AS exists_flag
UNION ALL
SELECT
  'business.vw_company_robot_placement_display' AS object_name,
  to_regclass('business.vw_company_robot_placement_display') IS NOT NULL AS exists_flag;

SELECT
  aiworker_model_code,
  selector_label,
  recommended_role_codes,
  visible_available_quantity
FROM business.vw_business_robot_selector_options
ORDER BY aiworker_model_code;
SQL

echo "VERIFY_SCRIPT_PASS=true"
