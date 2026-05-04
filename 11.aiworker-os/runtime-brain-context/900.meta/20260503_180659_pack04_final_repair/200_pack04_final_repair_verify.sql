\set ON_ERROR_STOP on

WITH checks AS (
  SELECT
    'mg_norn_001_robot_policy_worldbuilding' AS check_code,
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.robot_brain_model_domain_policy
      WHERE model_code = 'MG-NORN-001'
        AND brain_domain_code = 'robot_aiworker'
        AND policy_code = 'allow'
        AND allowed_use_purpose_codes && ARRAY['worldbuilding']::text[]
        AND active_flag = true
    ) THEN 1 ELSE 0 END AS pass_flag,
    'MG-NORN-001 robot_aiworker worldbuilding policy exists' AS note

  UNION ALL
  SELECT
    'mg_norn_001_robot_material_worldbuilding',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'MG-NORN-001'
        AND brain_domain_code = 'robot_aiworker'
        AND unit_code IN ('pack04_robot_009_megami_time_axis','pack04_megami_007_norn_cross_review')
        AND effective_use_purpose_codes && ARRAY['worldbuilding']::text[]
    ) THEN 1 ELSE 0 END,
    'MG-NORN-001 can read NORN common robot material for worldbuilding'

  UNION ALL
  SELECT
    'mg_norn_003_skuld_material_still_readable',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'MG-NORN-003'
        AND unit_code = 'pack04_megami_005_skuld_future_blueprint'
        AND effective_use_purpose_codes && ARRAY['business_planning']::text[]
    ) THEN 1 ELSE 0 END,
    'MG-NORN-003 still reads Skuld future blueprint material'

  UNION ALL
  SELECT
    'hd_r1c_forbidden_still_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R1C'
        AND unit_code LIKE 'pack04_%'
        AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')
    ) THEN 1 ELSE 0 END,
    'HD-R1C forbidden Pack04 domains remain denied'

  UNION ALL
  SELECT
    'hd_r2_business_professional_still_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
        AND unit_code LIKE 'pack04_%'
        AND brain_domain_code IN ('business_operation','professional_basic')
    ) THEN 1 ELSE 0 END,
    'HD-R2/R2S/R2G business/professional Pack04 remains denied'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.robot_brain_model_domain_policy
    WHERE model_code = 'MG-NORN-001'
      AND brain_domain_code = 'robot_aiworker'
      AND policy_code = 'allow'
      AND allowed_use_purpose_codes && ARRAY['worldbuilding']::text[]
      AND active_flag = true
  ) THEN 1 ELSE 0 END AS pass_flag

  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'MG-NORN-001'
      AND brain_domain_code = 'robot_aiworker'
      AND unit_code IN ('pack04_robot_009_megami_time_axis','pack04_megami_007_norn_cross_review')
      AND effective_use_purpose_codes && ARRAY['worldbuilding']::text[]
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'MG-NORN-003'
      AND unit_code = 'pack04_megami_005_skuld_future_blueprint'
      AND effective_use_purpose_codes && ARRAY['business_planning']::text[]
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R1C'
      AND unit_code LIKE 'pack04_%'
      AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
      AND unit_code LIKE 'pack04_%'
      AND brain_domain_code IN ('business_operation','professional_basic')
  ) THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;

SELECT
  'MG_NORN_REPAIR_PREVIEW' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  effective_use_purpose_codes,
  unit_title_ja
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE model_code IN ('MG-NORN-001','MG-NORN-003')
  AND unit_code IN (
    'pack04_robot_009_megami_time_axis',
    'pack04_megami_007_norn_cross_review',
    'pack04_megami_001_urd_past_results',
    'pack04_megami_005_skuld_future_blueprint'
  )
ORDER BY model_code, brain_domain_code, unit_code;
