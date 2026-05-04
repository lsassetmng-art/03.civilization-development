#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/03.business-os/_aiworker"

node "${BASE}/tests/node_smoke_business_aiworker_aicm_connector.js"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT
  'business.fn_business_robot_selector_options_for_role' AS object_name,
  p.proname IS NOT NULL AS exists_flag
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'business'
  AND p.proname = 'fn_business_robot_selector_options_for_role'
LIMIT 1;

SELECT
  aiworker_model_code,
  selector_label,
  recommended_role_codes,
  sort_rank
FROM business.fn_business_robot_selector_options_for_role('President')
ORDER BY sort_rank, aiworker_model_code;

SELECT business.fn_aicm_robot_setting_preview(
  '00000000-0000-4000-8000-000000000001'::uuid,
  'HD-R5',
  'company',
  'President',
  'Zeus',
  NULL,
  'AICompanyManager'
) AS preview_json;
SQL

echo "VERIFY_SCRIPT_PASS=true"
