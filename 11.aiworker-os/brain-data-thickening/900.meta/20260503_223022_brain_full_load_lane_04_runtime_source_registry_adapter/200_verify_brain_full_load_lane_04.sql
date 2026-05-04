\set ON_ERROR_STOP on

SELECT
  '01_runtime_material_view_count' AS section,
  count(*) AS runtime_material_count,
  count(*) FILTER (WHERE unit_code LIKE 'pack%') AS pack_material_count,
  count(*) FILTER (WHERE unit_code LIKE 'srcmat_%') AS source_registry_material_count
FROM aiworker.vw_robot_readable_brain_runtime_material_v1;

SELECT
  '02_runtime_material_by_domain' AS section,
  brain_domain_code,
  count(*) AS runtime_material_count,
  count(*) FILTER (WHERE unit_code LIKE 'pack%') AS pack_material_count,
  count(*) FILTER (WHERE unit_code LIKE 'srcmat_%') AS source_registry_material_count,
  count(DISTINCT model_code) AS readable_model_count
FROM aiworker.vw_robot_readable_brain_runtime_material_v1
GROUP BY brain_domain_code
ORDER BY brain_domain_code;

SELECT
  '03_source_registry_material_preview' AS section,
  model_code,
  role_code,
  brain_domain_code,
  unit_code,
  unit_title_ja,
  left(unit_summary_ja, 160) AS summary_preview
FROM aiworker.vw_robot_readable_brain_runtime_material_v1
WHERE unit_code LIKE 'srcmat_%'
ORDER BY model_code, brain_domain_code, unit_code
LIMIT 80;

SELECT
  '04_legacy_view_compat_count' AS section,
  count(*) AS legacy_material_count,
  count(*) FILTER (WHERE unit_code LIKE 'srcmat_%') AS legacy_source_registry_material_count,
  count(*) FILTER (WHERE unit_code LIKE 'pack%') AS legacy_pack_material_count
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1;

SELECT
  '05_coverage_preview' AS section,
  model_code,
  role_code,
  brain_domain_code,
  runtime_material_count,
  pack_material_count,
  source_registry_material_count,
  risk_classes,
  depths
FROM aiworker.vw_robot_readable_brain_runtime_material_coverage_v1
ORDER BY model_code, brain_domain_code
LIMIT 120;

WITH checks AS (
  SELECT
    'runtime_material_view_exists' AS check_code,
    CASE WHEN to_regclass('aiworker.vw_robot_readable_brain_runtime_material_v1') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag,
    'runtime material adapter view exists' AS note

  UNION ALL
  SELECT
    'runtime_material_coverage_view_exists',
    CASE WHEN to_regclass('aiworker.vw_robot_readable_brain_runtime_material_coverage_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'runtime material coverage view exists'

  UNION ALL
  SELECT
    'legacy_view_has_srcmat',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE unit_code LIKE 'srcmat_%'
    ) THEN 1 ELSE 0 END,
    'legacy runtime material view includes source-registry materials'

  UNION ALL
  SELECT
    'legacy_view_keeps_pack',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE unit_code LIKE 'pack04_%'
         OR unit_code LIKE 'pack05_%'
    ) THEN 1 ELSE 0 END,
    'legacy runtime material view still includes pack materials'

  UNION ALL
  SELECT
    'runtime_view_has_srcmat',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_runtime_material_v1
      WHERE unit_code LIKE 'srcmat_%'
    ) THEN 1 ELSE 0 END,
    'runtime material adapter includes source-registry materials'

  UNION ALL
  SELECT
    'runtime_view_has_pack',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_runtime_material_v1
      WHERE unit_code LIKE 'pack04_%'
         OR unit_code LIKE 'pack05_%'
    ) THEN 1 ELSE 0 END,
    'runtime material adapter includes pack materials'

  UNION ALL
  SELECT
    'source_registry_materials_have_safety',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_runtime_material_v1
      WHERE unit_code LIKE 'srcmat_%'
        AND COALESCE(safety_boundary_ja, '') = ''
    ) THEN 1 ELSE 0 END,
    'source-registry materials have safety boundary'

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
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN to_regclass('aiworker.vw_robot_readable_brain_runtime_material_v1') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag
  UNION ALL SELECT CASE WHEN to_regclass('aiworker.vw_robot_readable_brain_runtime_material_coverage_v1') IS NOT NULL THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE unit_code LIKE 'srcmat_%') THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE unit_code LIKE 'pack04_%' OR unit_code LIKE 'pack05_%') THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_runtime_material_v1 WHERE unit_code LIKE 'srcmat_%') THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_runtime_material_v1 WHERE unit_code LIKE 'pack04_%' OR unit_code LIKE 'pack05_%') THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_runtime_material_v1 WHERE unit_code LIKE 'srcmat_%' AND COALESCE(safety_boundary_ja, '') = '') THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_runtime_material_v1 WHERE model_code = 'HD-R1C' AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_runtime_material_v1 WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G') AND brain_domain_code IN ('business_operation','professional_basic')) THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;
