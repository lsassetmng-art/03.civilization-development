\set ON_ERROR_STOP on

SELECT
  '01_registry_source_summary' AS section,
  count(*) AS total_registry_count,
  count(*) FILTER (WHERE source_exists_flag = true) AS existing_source_count,
  count(*) FILTER (WHERE source_exists_flag = false) AS missing_source_count
FROM cx22073jw.vw_brain_data_registry_v1;

SELECT
  '02_robot_aiworker_registry_rows' AS section,
  brain_data_code,
  brain_domain_code,
  source_schema_name,
  source_object_name,
  source_record_code,
  source_exists_flag,
  source_title_ja
FROM cx22073jw.vw_brain_data_registry_v1
WHERE brain_data_code IN (
  'robot_aiworker_series_reference',
  'robot_aiworker_model_reference'
)
ORDER BY brain_data_code;

WITH checks AS (
  SELECT
    'robot_aiworker_series_source_exists' AS check_code,
    CASE WHEN EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code = 'robot_aiworker_series_reference'
        AND source_exists_flag = true
    ) THEN 1 ELSE 0 END AS pass_flag,
    'robot_aiworker_series_reference points to an existing source object' AS note

  UNION ALL
  SELECT
    'robot_aiworker_model_source_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code = 'robot_aiworker_model_reference'
        AND source_exists_flag = true
    ) THEN 1 ELSE 0 END,
    'robot_aiworker_model_reference points to an existing source object'

  UNION ALL
  SELECT
    'all_registry_sources_exist',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE source_exists_flag = false
    ) THEN 1 ELSE 0 END,
    'All CX brain registry source objects exist'

  UNION ALL
  SELECT
    'robot_aiworker_compact_context_existing_source',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_compact_context_v1
      WHERE brain_domain_code = 'robot_aiworker'
        AND existing_source_count > 0
    ) THEN 1 ELSE 0 END,
    'Compact context has existing robot_aiworker source count'

  UNION ALL
  SELECT
    'hd_r1c_forbidden_still_denied',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code = 'HD-R1C'
        AND brain_domain_code IN ('business_operation','professional_basic','security_crisis')
        AND can_read_flag = true
    ) THEN 1 ELSE 0 END,
    'HD-R1C forbidden domains remain denied'

  UNION ALL
  SELECT
    'hd_r2_family_security_still_safe',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
        AND brain_domain_code = 'security_crisis'
        AND can_read_flag = true
        AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R2/R2S/R2G still read security_crisis for safe purposes'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE brain_data_code = 'robot_aiworker_series_reference'
      AND source_exists_flag = true
  ) THEN 1 ELSE 0 END AS pass_flag

  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE brain_data_code = 'robot_aiworker_model_reference'
      AND source_exists_flag = true
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE source_exists_flag = false
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_compact_context_v1
    WHERE brain_domain_code = 'robot_aiworker'
      AND existing_source_count > 0
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE model_code = 'HD-R1C'
      AND brain_domain_code IN ('business_operation','professional_basic','security_crisis')
      AND can_read_flag = true
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
      AND brain_domain_code = 'security_crisis'
      AND can_read_flag = true
      AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
  ) THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;

SELECT
  model_code,
  role_code,
  brain_domain_code,
  readable_source_count,
  existing_source_count
FROM aiworker.vw_robot_brain_compact_context_v1
WHERE brain_domain_code = 'robot_aiworker'
ORDER BY model_code, role_code;
