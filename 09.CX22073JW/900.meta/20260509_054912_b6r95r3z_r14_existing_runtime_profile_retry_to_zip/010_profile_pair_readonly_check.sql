\set ON_ERROR_STOP on
SET default_transaction_read_only = on;

SELECT
  '01_readonly_guard' AS section,
  current_setting('transaction_read_only') AS transaction_read_only;

SELECT
  '02_target_profile_pair' AS section,
  'ai_company_manager' AS app_surface_code,
  'byd2_003_asic_leader3' AS model_code,
  count(*) AS match_count
FROM aiworker.vw_app_aiworker_runtime_control_profile_v1
WHERE app_surface_code = 'ai_company_manager'
  AND model_code = 'byd2_003_asic_leader3';

SELECT
  '03_target_profile_detail' AS section,
  to_jsonb(t) AS row_json
FROM aiworker.vw_app_aiworker_runtime_control_profile_v1 t
WHERE app_surface_code = 'ai_company_manager'
  AND model_code = 'byd2_003_asic_leader3'
LIMIT 5;
