\set ON_ERROR_STOP on

WITH checks AS (
  SELECT
    'view_exists_cx_registry' AS check_code,
    CASE WHEN to_regclass('cx22073jw.vw_brain_data_registry_v1') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag,
    'CX registry view exists' AS note

  UNION ALL
  SELECT
    'view_exists_effective_access',
    CASE WHEN to_regclass('aiworker.vw_robot_brain_effective_access_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'AIWorker effective access view exists'

  UNION ALL
  SELECT
    'view_exists_readable_registry',
    CASE WHEN to_regclass('aiworker.vw_robot_readable_brain_source_registry_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'AIWorker readable source registry view exists'

  UNION ALL
  SELECT
    'view_exists_compact_context',
    CASE WHEN to_regclass('aiworker.vw_robot_brain_compact_context_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'AIWorker compact context view exists'

  UNION ALL
  SELECT
    'cx_registry_has_rows',
    CASE WHEN EXISTS (SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1) THEN 1 ELSE 0 END,
    'CX brain registry has rows'

  UNION ALL
  SELECT
    'effective_access_has_rows',
    CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1) THEN 1 ELSE 0 END,
    'AIWorker effective access has rows'

  UNION ALL
  SELECT
    'compact_context_has_rows',
    CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_brain_compact_context_v1) THEN 1 ELSE 0 END,
    'Compact context has rows'

  UNION ALL
  SELECT
    'hd_r1c_denies_business',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code = 'HD-R1C'
        AND brain_domain_code = 'business_operation'
        AND can_read_flag = false
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
    'hd_r5p_reads_civilization_foundation',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code = 'HD-R5P'
        AND brain_domain_code = 'civilization_foundation_history'
        AND can_read_flag = true
    ) THEN 1 ELSE 0 END,
    'HD-R5P can read civilization foundation history'

  UNION ALL
  SELECT
    'byd2003_reads_review_domains',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_effective_access_v1
      WHERE model_code = 'BYD2-003'
        AND brain_domain_code IN ('professional_basic','civilization_foundation_history','business_operation')
        AND can_read_flag = true
    ) THEN 1 ELSE 0 END,
    'BYD2-003 can read advanced review domains'

  UNION ALL
  SELECT
    'compact_context_contains_safety_boundary',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_brain_compact_context_v1
      WHERE safety_boundaries_ja IS NOT NULL
        AND length(safety_boundaries_ja) > 0
    ) THEN 1 ELSE 0 END,
    'Compact context includes safety boundaries'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM (
  WITH checks AS (
    SELECT CASE WHEN to_regclass('cx22073jw.vw_brain_data_registry_v1') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag
    UNION ALL SELECT CASE WHEN to_regclass('aiworker.vw_robot_brain_effective_access_v1') IS NOT NULL THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN to_regclass('aiworker.vw_robot_readable_brain_source_registry_v1') IS NOT NULL THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN to_regclass('aiworker.vw_robot_brain_compact_context_v1') IS NOT NULL THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1) THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1) THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_brain_compact_context_v1) THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1 WHERE model_code='HD-R1C' AND brain_domain_code='business_operation' AND can_read_flag=false) THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1 WHERE model_code='HD-R1C' AND brain_domain_code='professional_basic' AND can_read_flag=false) THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1 WHERE model_code='HD-R1C' AND brain_domain_code='security_crisis' AND can_read_flag=false) THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1 WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G') AND brain_domain_code='security_crisis' AND can_read_flag=true AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]) THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1 WHERE model_code='HD-R5P' AND brain_domain_code='civilization_foundation_history' AND can_read_flag=true) THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_brain_effective_access_v1 WHERE model_code='BYD2-003' AND brain_domain_code IN ('professional_basic','civilization_foundation_history','business_operation') AND can_read_flag=true) THEN 1 ELSE 0 END
    UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_brain_compact_context_v1 WHERE safety_boundaries_ja IS NOT NULL AND length(safety_boundaries_ja) > 0) THEN 1 ELSE 0 END
  )
  SELECT pass_flag FROM checks
) s;

SELECT
  model_code,
  role_code,
  count(*) AS candidate_count,
  count(*) FILTER (WHERE can_read_flag = true) AS readable_count,
  count(*) FILTER (WHERE can_read_flag = false) AS denied_count
FROM aiworker.vw_robot_brain_effective_access_v1
GROUP BY model_code, role_code
ORDER BY model_code, role_code;

SELECT
  model_code,
  role_code,
  brain_domain_code,
  readable_source_count,
  existing_source_count,
  left(replace(safety_boundaries_ja, E'\n', ' / '), 160) AS safety_boundary_preview
FROM aiworker.vw_robot_brain_compact_context_v1
ORDER BY model_code, brain_domain_code
LIMIT 120;
