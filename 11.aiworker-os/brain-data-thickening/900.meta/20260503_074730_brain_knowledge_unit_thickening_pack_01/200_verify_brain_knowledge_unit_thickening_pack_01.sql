\set ON_ERROR_STOP on

SELECT
  '01_knowledge_unit_total' AS section,
  count(*) AS total_count,
  count(*) FILTER (WHERE active_flag = true) AS active_count
FROM cx22073jw.brain_knowledge_unit;

SELECT
  '02_knowledge_unit_by_domain' AS section,
  brain_domain_code,
  count(*) AS unit_count
FROM cx22073jw.brain_knowledge_unit
WHERE active_flag = true
GROUP BY brain_domain_code
ORDER BY brain_domain_code;

SELECT
  '03_registry_brain_knowledge_source' AS section,
  count(*) AS registry_count,
  count(*) FILTER (WHERE source_exists_flag = true) AS source_exists_count,
  count(*) FILTER (WHERE source_exists_flag = false) AS source_missing_count
FROM cx22073jw.vw_brain_data_registry_v1
WHERE source_schema_name = 'cx22073jw'
  AND source_object_name = 'brain_knowledge_unit';

SELECT
  '04_readable_material_by_model' AS section,
  model_code,
  role_code,
  count(*) AS readable_material_count,
  string_agg(DISTINCT brain_domain_code, ', ' ORDER BY brain_domain_code) AS readable_domains
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
GROUP BY model_code, role_code
ORDER BY model_code, role_code;

WITH checks AS (
  SELECT
    'knowledge_unit_min_30' AS check_code,
    CASE WHEN (SELECT count(*) FROM cx22073jw.brain_knowledge_unit WHERE active_flag = true) >= 30 THEN 1 ELSE 0 END AS pass_flag,
    'brain_knowledge_unit has at least 30 active rows' AS note

  UNION ALL
  SELECT
    'registry_source_all_exists',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE source_schema_name = 'cx22073jw'
        AND source_object_name = 'brain_knowledge_unit'
        AND source_exists_flag = false
    ) THEN 1 ELSE 0 END,
    'brain_knowledge_unit registry rows point to existing source object'

  UNION ALL
  SELECT
    'hd_r1c_smalltalk_material_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R1C'
        AND effective_use_purpose_codes && ARRAY['smalltalk']::text[]
        AND brain_domain_code IN ('food_nutrition','season_calendar','culture_region','hobby_entertainment')
    ) THEN 1 ELSE 0 END,
    'HD-R1C has smalltalk brain materials'

  UNION ALL
  SELECT
    'hd_r1c_forbidden_material_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R1C'
        AND brain_domain_code IN ('business_operation','professional_basic','security_crisis')
    ) THEN 1 ELSE 0 END,
    'HD-R1C does not read business/professional/security materials'

  UNION ALL
  SELECT
    'hd_r5_business_material_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R5'
        AND brain_domain_code = 'business_operation'
        AND effective_use_purpose_codes && ARRAY['business_planning','review','design_reference']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R5 has business operation material'

  UNION ALL
  SELECT
    'hd_r2_security_safe_material_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R2'
        AND brain_domain_code = 'security_crisis'
        AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
        AND safety_boundary_ja LIKE '%現実の攻撃%'
    ) THEN 1 ELSE 0 END,
    'HD-R2 has safe security_crisis material'

  UNION ALL
  SELECT
    'byd2003_review_material_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'BYD2-003'
        AND effective_use_purpose_codes && ARRAY['review']::text[]
        AND brain_domain_code IN ('business_operation','professional_basic','civilization_foundation_history','education_learning')
    ) THEN 1 ELSE 0 END,
    'BYD2-003 has review materials'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN (SELECT count(*) FROM cx22073jw.brain_knowledge_unit WHERE active_flag = true) >= 30 THEN 1 ELSE 0 END AS pass_flag
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE source_schema_name = 'cx22073jw'
      AND source_object_name = 'brain_knowledge_unit'
      AND source_exists_flag = false
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R1C'
      AND effective_use_purpose_codes && ARRAY['smalltalk']::text[]
      AND brain_domain_code IN ('food_nutrition','season_calendar','culture_region','hobby_entertainment')
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R1C'
      AND brain_domain_code IN ('business_operation','professional_basic','security_crisis')
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R5'
      AND brain_domain_code = 'business_operation'
      AND effective_use_purpose_codes && ARRAY['business_planning','review','design_reference']::text[]
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R2'
      AND brain_domain_code = 'security_crisis'
      AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
      AND safety_boundary_ja LIKE '%現実の攻撃%'
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'BYD2-003'
      AND effective_use_purpose_codes && ARRAY['review']::text[]
      AND brain_domain_code IN ('business_operation','professional_basic','civilization_foundation_history','education_learning')
  ) THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;

SELECT
  '05_hd_r1c_material_preview' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  unit_title_ja,
  left(unit_summary_ja, 80) AS summary_preview
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE model_code = 'HD-R1C'
ORDER BY brain_domain_code, unit_code
LIMIT 20;

SELECT
  '06_hd_r2_security_preview' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  unit_title_ja,
  left(safety_boundary_ja, 100) AS safety_preview
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE model_code = 'HD-R2'
  AND brain_domain_code = 'security_crisis'
ORDER BY unit_code;
