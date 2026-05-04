\set ON_ERROR_STOP on

SELECT
  '01_lane05_latest_summary' AS section,
  brain_domain_code,
  target_min_unit_count,
  before_active_unit_count,
  after_active_unit_count,
  before_deficit_count,
  after_deficit_count,
  added_unit_count,
  target_status
FROM cx22073jw.vw_brain_full_load_lane05_latest_summary_v1
ORDER BY brain_domain_code;

SELECT
  '02_coverage_after_lane05' AS section,
  brain_domain_code,
  active_unit_count,
  target_min_unit_count,
  registry_count,
  source_object_registry_count,
  source_row_registry_count,
  source_missing_count,
  readable_model_count,
  full_load_status
FROM cx22073jw.vw_brain_full_load_coverage_v1
ORDER BY full_load_priority, brain_domain_code;

SELECT
  '03_lane05_by_domain' AS section,
  brain_domain_code,
  count(*) AS lane05_unit_count,
  count(*) FILTER (WHERE active_flag = true) AS active_lane05_count
FROM cx22073jw.brain_knowledge_unit
WHERE unit_code LIKE 'lane05_%'
GROUP BY brain_domain_code
ORDER BY brain_domain_code;

SELECT
  '04_runtime_lane05_preview' AS section,
  model_code,
  role_code,
  brain_domain_code,
  count(*) AS readable_lane05_count
FROM aiworker.vw_robot_readable_brain_runtime_material_v1
WHERE unit_code LIKE 'lane05_%'
GROUP BY model_code, role_code, brain_domain_code
ORDER BY model_code, brain_domain_code
LIMIT 120;

WITH checks AS (
  SELECT
    'fill_axis_table_exists' AS check_code,
    CASE WHEN to_regclass('cx22073jw.brain_full_load_fill_axis_catalog') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag,
    'fill axis catalog exists' AS note

  UNION ALL
  SELECT
    'lane05_summary_view_exists',
    CASE WHEN to_regclass('cx22073jw.vw_brain_full_load_lane05_latest_summary_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'Lane05 latest summary view exists'

  UNION ALL
  SELECT
    'all_domains_meet_target',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_full_load_coverage_v1
      WHERE active_unit_count < target_min_unit_count
    ) THEN 1 ELSE 0 END,
    'All full-load domains meet target_min_unit_count'

  UNION ALL
  SELECT
    'lane05_registry_source_all_exists',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code LIKE 'lane05_%'
        AND source_exists_flag = false
    ) THEN 1 ELSE 0 END,
    'Lane05 registry source exists'

  UNION ALL
  SELECT
    'runtime_material_has_lane05',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_runtime_material_v1
      WHERE unit_code LIKE 'lane05_%'
    ) THEN 1 ELSE 0 END,
    'runtime material view includes Lane05 units'

  UNION ALL
  SELECT
    'legacy_material_has_lane05',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE unit_code LIKE 'lane05_%'
    ) THEN 1 ELSE 0 END,
    'legacy material view includes Lane05 units'

  UNION ALL
  SELECT
    'hd_r1c_forbidden_still_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_runtime_material_v1
      WHERE model_code = 'HD-R1C'
        AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')
    ) THEN 1 ELSE 0 END,
    'HD-R1C forbidden domains remain denied'

  UNION ALL
  SELECT
    'hd_r2_business_professional_still_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_runtime_material_v1
      WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
        AND brain_domain_code IN ('business_operation','professional_basic')
    ) THEN 1 ELSE 0 END,
    'HD-R2/R2S/R2G business/professional remains denied'

  UNION ALL
  SELECT
    'lane05_safety_not_empty',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.brain_knowledge_unit
      WHERE unit_code LIKE 'lane05_%'
        AND COALESCE(safety_boundary_ja, '') = ''
    ) THEN 1 ELSE 0 END,
    'Lane05 units have safety boundary'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN to_regclass('cx22073jw.brain_full_load_fill_axis_catalog') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag
  UNION ALL SELECT CASE WHEN to_regclass('cx22073jw.vw_brain_full_load_lane05_latest_summary_v1') IS NOT NULL THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM cx22073jw.vw_brain_full_load_coverage_v1 WHERE active_unit_count < target_min_unit_count) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1 WHERE brain_data_code LIKE 'lane05_%' AND source_exists_flag = false) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_runtime_material_v1 WHERE unit_code LIKE 'lane05_%') THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE unit_code LIKE 'lane05_%') THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_runtime_material_v1 WHERE model_code = 'HD-R1C' AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_runtime_material_v1 WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G') AND brain_domain_code IN ('business_operation','professional_basic')) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM cx22073jw.brain_knowledge_unit WHERE unit_code LIKE 'lane05_%' AND COALESCE(safety_boundary_ja, '') = '') THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;
