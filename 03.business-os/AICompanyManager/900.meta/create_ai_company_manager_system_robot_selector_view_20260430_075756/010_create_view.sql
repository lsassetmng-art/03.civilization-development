\pset pager off
\echo '============================================================'
\echo 'Create business.vw_ai_company_manager_system_robot_selector_options'
\echo '============================================================'

BEGIN;

CREATE OR REPLACE VIEW business.vw_ai_company_manager_system_robot_selector_options AS
SELECT
  NULL::uuid AS company_robot_entitlement_id,
  c.company_id,
  rp.robot_pool_id,
  rp.aiworker_model_code,
  COALESCE(rp.display_name, rp.aiworker_model_code) AS display_name,
  (COALESCE(rp.display_name, rp.aiworker_model_code) || ' / ' || rp.aiworker_model_code) AS selector_label,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  'AICompanyManager'::text AS app_code,
  'system_unlimited'::text AS entitlement_scope_code,
  0::integer AS contracted_quantity,
  0::integer AS usable_quantity,
  'unlimited_system_use'::text AS assignment_mode_code,
  'active'::text AS status_code,
  array_remove(ARRAY[
    NULLIF(rp.placement_role_code_1, ''),
    NULLIF(rp.placement_role_code_2, ''),
    NULLIF(rp.placement_role_code_3, '')
  ], NULL::text) AS recommended_role_codes,
  COALESCE(rp.updated_at, now()) AS updated_at
FROM business.aicm_company c
CROSS JOIN business.robot_pool rp
WHERE c.company_status = 'active'
  AND array_length(array_remove(ARRAY[
    NULLIF(rp.placement_role_code_1, ''),
    NULLIF(rp.placement_role_code_2, ''),
    NULLIF(rp.placement_role_code_3, '')
  ], NULL::text), 1) IS NOT NULL;

COMMENT ON VIEW business.vw_ai_company_manager_system_robot_selector_options IS
'AICompanyManager system-use robot selector. Does not consume company_robot_entitlement quantity. Used for President/Manager/Leader/Worker unlimited system allocation.';

COMMIT;

\echo 'CREATE_VIEW_DONE'
