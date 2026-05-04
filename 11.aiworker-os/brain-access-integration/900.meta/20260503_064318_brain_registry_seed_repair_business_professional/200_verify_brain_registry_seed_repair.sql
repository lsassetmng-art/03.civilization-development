\set ON_ERROR_STOP on

WITH checks AS (
  SELECT
    'cx_registry_has_business_operation' AS check_code,
    CASE WHEN EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code = 'business_operation_reference'
        AND brain_domain_code = 'business_operation'
        AND active_flag = true
    ) THEN 1 ELSE 0 END AS pass_flag,
    'CX registry has business_operation brain data row' AS note

  UNION ALL
  SELECT
    'cx_registry_has_professional_basic',
    CASE WHEN EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code = 'professional_basic_reference'
        AND brain_domain_code = 'professional_basic'
        AND active_flag = true
    ) THEN 1 ELSE 0 END,
    'CX registry has professional_basic brain data row'

  UNION ALL
  SELECT
    'hd_r1c_denies_business',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code = 'HD-R1C'
        AND brain_domain_code = 'business_operation'
        AND can_read_flag = false
        AND access_decision_code IN ('deny_model_policy','deny_role_policy','deny_depth','deny_no_allow_policy')
    ) THEN 1 ELSE 0 END,
    'HD-R1C must not read business_operation'

  UNION ALL
  SELECT
    'hd_r1c_denies_professional',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code = 'HD-R1C'
        AND brain_domain_code = 'professional_basic'
        AND can_read_flag = false
        AND access_decision_code IN ('deny_model_policy','deny_role_policy','deny_depth','deny_no_allow_policy')
    ) THEN 1 ELSE 0 END,
    'HD-R1C must not read professional_basic'

  UNION ALL
  SELECT
    'hd_r1c_denies_security',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code = 'HD-R1C'
        AND brain_domain_code = 'security_crisis'
        AND can_read_flag = false
    ) THEN 1 ELSE 0 END,
    'HD-R1C must not read security_crisis'

  UNION ALL
  SELECT
    'hd_r2_reads_security_safely',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
        AND brain_domain_code = 'security_crisis'
        AND can_read_flag = true
        AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R2/R2S/R2G can read security_crisis only for safe purposes'

  UNION ALL
  SELECT
    'hd_r5p_reads_business',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code = 'HD-R5P'
        AND brain_domain_code = 'business_operation'
        AND can_read_flag = true
    ) THEN 1 ELSE 0 END,
    'HD-R5P can read business_operation'

  UNION ALL
  SELECT
    'hd_r5_reads_professional',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code = 'HD-R5'
        AND brain_domain_code = 'professional_basic'
        AND can_read_flag = true
    ) THEN 1 ELSE 0 END,
    'HD-R5 can read professional_basic'

  UNION ALL
  SELECT
    'compact_context_has_business_for_manager',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_compact_context_v1
      WHERE model_code IN ('HD-R5','HD-R5P','BYD2-003')
        AND brain_domain_code = 'business_operation'
        AND readable_source_count > 0
    ) THEN 1 ELSE 0 END,
    'Compact context includes business_operation for manager/president/reviewer models'

  UNION ALL
  SELECT
    'compact_context_has_professional_for_manager',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_compact_context_v1
      WHERE model_code IN ('HD-R5','BYD2-003')
        AND brain_domain_code = 'professional_basic'
        AND readable_source_count > 0
    ) THEN 1 ELSE 0 END,
    'Compact context includes professional_basic for manager/reviewer models'
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
    WHERE brain_data_code = 'business_operation_reference'
      AND brain_domain_code = 'business_operation'
      AND active_flag = true
  ) THEN 1 ELSE 0 END AS pass_flag
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE brain_data_code = 'professional_basic_reference'
      AND brain_domain_code = 'professional_basic'
      AND active_flag = true
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE model_code = 'HD-R1C'
      AND brain_domain_code = 'business_operation'
      AND can_read_flag = false
      AND access_decision_code IN ('deny_model_policy','deny_role_policy','deny_depth','deny_no_allow_policy')
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE model_code = 'HD-R1C'
      AND brain_domain_code = 'professional_basic'
      AND can_read_flag = false
      AND access_decision_code IN ('deny_model_policy','deny_role_policy','deny_depth','deny_no_allow_policy')
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE model_code = 'HD-R1C'
      AND brain_domain_code = 'security_crisis'
      AND can_read_flag = false
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
      AND brain_domain_code = 'security_crisis'
      AND can_read_flag = true
      AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE model_code = 'HD-R5P'
      AND brain_domain_code = 'business_operation'
      AND can_read_flag = true
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE model_code = 'HD-R5'
      AND brain_domain_code = 'professional_basic'
      AND can_read_flag = true
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_compact_context_v1
    WHERE model_code IN ('HD-R5','HD-R5P','BYD2-003')
      AND brain_domain_code = 'business_operation'
      AND readable_source_count > 0
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_compact_context_v1
    WHERE model_code IN ('HD-R5','BYD2-003')
      AND brain_domain_code = 'professional_basic'
      AND readable_source_count > 0
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
  can_read_flag,
  access_decision_code,
  effective_use_purpose_codes
FROM aiworker.vw_robot_brain_effective_access_v1
WHERE model_code IN ('HD-R1C','HD-R5','HD-R5P','BYD2-003')
  AND brain_domain_code IN ('business_operation','professional_basic','security_crisis')
ORDER BY model_code, brain_domain_code;

SELECT
  model_code,
  role_code,
  brain_domain_code,
  readable_source_count,
  existing_source_count,
  left(replace(safety_boundaries_ja, E'\n', ' / '), 180) AS safety_boundary_preview
FROM aiworker.vw_robot_brain_compact_context_v1
WHERE brain_domain_code IN ('business_operation','professional_basic')
ORDER BY model_code, brain_domain_code;
