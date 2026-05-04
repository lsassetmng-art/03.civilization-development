\set ON_ERROR_STOP on

SELECT
  '01_full_load_scope_count' AS section,
  count(*) AS scope_count
FROM cx22073jw.brain_full_load_scope_catalog
WHERE active_flag = true;

SELECT
  '02_pack05_count' AS section,
  count(*) AS pack05_count,
  count(*) FILTER (WHERE active_flag = true) AS active_count
FROM cx22073jw.brain_knowledge_unit
WHERE unit_code LIKE 'pack05_%';

SELECT
  '03_pack05_by_domain' AS section,
  brain_domain_code,
  count(*) AS unit_count
FROM cx22073jw.brain_knowledge_unit
WHERE unit_code LIKE 'pack05_%'
  AND active_flag = true
GROUP BY brain_domain_code
ORDER BY brain_domain_code;

SELECT
  '04_full_load_coverage' AS section,
  brain_domain_code,
  active_unit_count,
  target_min_unit_count,
  pack02_count,
  pack03_count,
  pack04_count,
  pack05_count,
  registry_count,
  source_missing_count,
  readable_model_count,
  full_load_status
FROM cx22073jw.vw_brain_full_load_coverage_v1
ORDER BY full_load_priority, brain_domain_code;

WITH checks AS (
  SELECT
    'scope_has_14_domains' AS check_code,
    CASE WHEN (SELECT count(*) FROM cx22073jw.brain_full_load_scope_catalog WHERE active_flag = true) >= 14 THEN 1 ELSE 0 END AS pass_flag,
    'full-load scope has all major brain domains' AS note

  UNION ALL
  SELECT
    'pack05_min_28',
    CASE WHEN (SELECT count(*) FROM cx22073jw.brain_knowledge_unit WHERE unit_code LIKE 'pack05_%' AND active_flag = true) >= 28 THEN 1 ELSE 0 END,
    'Pack05 has at least 28 active units'

  UNION ALL
  SELECT
    'pack05_all_scope_domains',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.brain_full_load_scope_catalog s
      WHERE s.active_flag = true
        AND NOT EXISTS (
          SELECT 1
          FROM cx22073jw.brain_knowledge_unit u
          WHERE u.brain_domain_code = s.brain_domain_code
            AND u.unit_code LIKE 'pack05_%'
            AND u.active_flag = true
        )
    ) THEN 1 ELSE 0 END,
    'Pack05 has at least one unit for every full-load domain'

  UNION ALL
  SELECT
    'pack05_registry_source_all_exists',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code LIKE 'pack05_%'
        AND source_exists_flag = false
    ) THEN 1 ELSE 0 END,
    'Pack05 registry source exists'

  UNION ALL
  SELECT
    'coverage_view_exists',
    CASE WHEN to_regclass('cx22073jw.vw_brain_full_load_coverage_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'Full-load coverage view exists'

  UNION ALL
  SELECT
    'no_scope_domain_empty',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_full_load_coverage_v1
      WHERE active_unit_count = 0
    ) THEN 1 ELSE 0 END,
    'Every full-load domain has at least one active brain knowledge unit'

  UNION ALL
  SELECT
    'hd_r1c_forbidden_still_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R1C'
        AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')
    ) THEN 1 ELSE 0 END,
    'HD-R1C forbidden domains remain denied'

  UNION ALL
  SELECT
    'hd_r2_business_professional_still_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
        AND brain_domain_code IN ('business_operation','professional_basic')
    ) THEN 1 ELSE 0 END,
    'HD-R2/R2S/R2G business/professional remains denied'

  UNION ALL
  SELECT
    'runtime_readable_material_has_pack05',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE unit_code LIKE 'pack05_%'
    ) THEN 1 ELSE 0 END,
    'AIWorker readable material view includes Pack05'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN (SELECT count(*) FROM cx22073jw.brain_full_load_scope_catalog WHERE active_flag = true) >= 14 THEN 1 ELSE 0 END AS pass_flag
  UNION ALL
  SELECT CASE WHEN (SELECT count(*) FROM cx22073jw.brain_knowledge_unit WHERE unit_code LIKE 'pack05_%' AND active_flag = true) >= 28 THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1
    FROM cx22073jw.brain_full_load_scope_catalog s
    WHERE s.active_flag = true
      AND NOT EXISTS (
        SELECT 1
        FROM cx22073jw.brain_knowledge_unit u
        WHERE u.brain_domain_code = s.brain_domain_code
          AND u.unit_code LIKE 'pack05_%'
          AND u.active_flag = true
      )
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE brain_data_code LIKE 'pack05_%'
      AND source_exists_flag = false
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN to_regclass('cx22073jw.vw_brain_full_load_coverage_v1') IS NOT NULL THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_full_load_coverage_v1
    WHERE active_unit_count = 0
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R1C'
      AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
      AND brain_domain_code IN ('business_operation','professional_basic')
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE unit_code LIKE 'pack05_%'
  ) THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;

SELECT
  '05_pack05_readable_preview' AS section,
  model_code,
  role_code,
  brain_domain_code,
  count(*) AS readable_pack05_count,
  string_agg(unit_code, ', ' ORDER BY unit_code) AS unit_codes
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE unit_code LIKE 'pack05_%'
GROUP BY model_code, role_code, brain_domain_code
ORDER BY model_code, brain_domain_code
LIMIT 80;
