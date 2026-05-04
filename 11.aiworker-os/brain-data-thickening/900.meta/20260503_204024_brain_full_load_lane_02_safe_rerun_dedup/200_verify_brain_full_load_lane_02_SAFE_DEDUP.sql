\set ON_ERROR_STOP on

SELECT
  '01_inventory_count' AS section,
  count(*) AS cx_object_count,
  count(*) FILTER (WHERE internal_brain_management_flag = false) AS external_source_candidate_count
FROM cx22073jw.vw_brain_source_object_inventory_v1;

SELECT
  '02_ingestion_summary' AS section,
  object_code,
  source_object_name,
  brain_domain_code,
  source_object_exists_flag,
  object_registry_count,
  row_registry_count,
  registry_source_exists_count,
  registry_source_missing_count
FROM cx22073jw.vw_brain_source_object_ingestion_summary_v1
ORDER BY source_object_exists_flag DESC, brain_domain_code, object_code;

SELECT
  '03_backlog_preview' AS section,
  source_object_kind,
  source_object_name,
  estimated_row_count,
  backlog_status
FROM cx22073jw.vw_brain_source_object_discovery_backlog_v1
ORDER BY source_object_kind, source_object_name
LIMIT 80;

SELECT
  '04_coverage_after_lane02' AS section,
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

WITH checks AS (
  SELECT
    'inventory_view_exists' AS check_code,
    CASE WHEN to_regclass('cx22073jw.vw_brain_source_object_inventory_v1') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag,
    'source inventory view exists' AS note

  UNION ALL
  SELECT
    'catalog_table_exists',
    CASE WHEN to_regclass('cx22073jw.brain_source_object_ingestion_catalog') IS NOT NULL THEN 1 ELSE 0 END,
    'source object ingestion catalog table exists'

  UNION ALL
  SELECT
    'summary_view_exists',
    CASE WHEN to_regclass('cx22073jw.vw_brain_source_object_ingestion_summary_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'source ingestion summary view exists'

  UNION ALL
  SELECT
    'catalog_min_12',
    CASE WHEN (SELECT count(*) FROM cx22073jw.brain_source_object_ingestion_catalog WHERE active_flag = true) >= 12 THEN 1 ELSE 0 END,
    'catalog has known source object mappings'

  UNION ALL
  SELECT
    'existing_source_object_registered',
    CASE WHEN EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_source_object_ingestion_summary_v1
      WHERE source_object_exists_flag = true
        AND object_registry_count > 0
    ) THEN 1 ELSE 0 END,
    'at least one existing source object was registered'

  UNION ALL
  SELECT
    'registered_source_objects_not_missing',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code LIKE 'srcobj:%'
        AND source_exists_flag = false
    ) THEN 1 ELSE 0 END,
    'registered source object rows point to existing objects'

  UNION ALL
  SELECT
    'row_level_ingestion_has_rows',
    CASE WHEN EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code LIKE 'srcrow:%'
    ) THEN 1 ELSE 0 END,
    'row-level ingestion registered at least one row'

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
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN to_regclass('cx22073jw.vw_brain_source_object_inventory_v1') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag
  UNION ALL SELECT CASE WHEN to_regclass('cx22073jw.brain_source_object_ingestion_catalog') IS NOT NULL THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN to_regclass('cx22073jw.vw_brain_source_object_ingestion_summary_v1') IS NOT NULL THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN (SELECT count(*) FROM cx22073jw.brain_source_object_ingestion_catalog WHERE active_flag = true) >= 12 THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_source_object_ingestion_summary_v1
    WHERE source_object_exists_flag = true
      AND object_registry_count > 0
  ) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE brain_data_code LIKE 'srcobj:%'
      AND source_exists_flag = false
  ) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE brain_data_code LIKE 'srcrow:%'
  ) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R1C'
      AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')
  ) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
      AND brain_domain_code IN ('business_operation','professional_basic')
  ) THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;
