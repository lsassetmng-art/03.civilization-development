\set ON_ERROR_STOP on

WITH checks AS (
  SELECT
    'hd_r2_family_no_business_professional_read' AS check_code,
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
        AND brain_domain_code IN ('business_operation','professional_basic')
        AND can_read_flag = true
    ) THEN 1 ELSE 0 END AS pass_flag,
    'HD-R2/R2S/R2G must not read business_operation/professional_basic' AS note

  UNION ALL
  SELECT
    'hd_r2_family_business_professional_explicit_deny',
    CASE WHEN (
      SELECT count(*)
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
        AND brain_domain_code IN ('business_operation','professional_basic')
        AND can_read_flag = false
        AND access_decision_code = 'deny_model_policy'
    ) >= 6 THEN 1 ELSE 0 END,
    'HD-R2/R2S/R2G business/professional rows must be deny_model_policy'

  UNION ALL
  SELECT
    'hd_r2_family_security_still_readable_safely',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
        AND brain_domain_code = 'security_crisis'
        AND can_read_flag = true
        AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R2/R2S/R2G should still read security_crisis for safe purposes'

  UNION ALL
  SELECT
    'hd_r2_family_focus_domain_clean',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.robot_brain_model_profile
      WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
        AND focus_domain_codes && ARRAY['business_operation','professional_basic']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R2/R2S/R2G focus_domain_codes should not include business/professional'

  UNION ALL
  SELECT
    'friend_lover_forbidden_domain_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE role_code IN ('Friend','Lover')
        AND brain_domain_code IN ('business_operation','professional_basic','security_crisis')
        AND can_read_flag = true
    ) THEN 1 ELSE 0 END,
    'Friend/Lover must not read business/professional/security domains'

  UNION ALL
  SELECT
    'high_risk_readable_has_safe_purpose',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE risk_class_code IN ('high','restricted')
        AND can_read_flag = true
        AND NOT (
          effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
        )
    ) THEN 1 ELSE 0 END,
    'High-risk readable brain data must be limited to safe purposes'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
      AND brain_domain_code IN ('business_operation','professional_basic')
      AND can_read_flag = true
  ) THEN 1 ELSE 0 END AS pass_flag

  UNION ALL
  SELECT CASE WHEN (
    SELECT count(*)
    FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
      AND brain_domain_code IN ('business_operation','professional_basic')
      AND can_read_flag = false
      AND access_decision_code = 'deny_model_policy'
  ) >= 6 THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
      AND brain_domain_code = 'security_crisis'
      AND can_read_flag = true
      AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.robot_brain_model_profile
    WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
      AND focus_domain_codes && ARRAY['business_operation','professional_basic']::text[]
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE role_code IN ('Friend','Lover')
      AND brain_domain_code IN ('business_operation','professional_basic','security_crisis')
      AND can_read_flag = true
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1
    WHERE risk_class_code IN ('high','restricted')
      AND can_read_flag = true
      AND NOT (
        effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
      )
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
  focus_domain_codes
FROM aiworker.robot_brain_model_profile
WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
ORDER BY model_code;

SELECT
  model_code,
  role_code,
  brain_domain_code,
  can_read_flag,
  access_decision_code,
  effective_use_purpose_codes
FROM aiworker.vw_robot_brain_effective_access_v1
WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
  AND brain_domain_code IN ('business_operation','professional_basic','security_crisis')
ORDER BY model_code, brain_domain_code;

SELECT
  'SOURCE_MISSING_REVIEW' AS section,
  count(*) AS missing_source_count
FROM cx22073jw.vw_brain_data_registry_v1
WHERE source_exists_flag = false;

SELECT
  brain_data_code,
  brain_domain_code,
  source_schema_name,
  source_object_name,
  source_record_code,
  source_title_ja
FROM cx22073jw.vw_brain_data_registry_v1
WHERE source_exists_flag = false
ORDER BY brain_domain_code, brain_data_code;
