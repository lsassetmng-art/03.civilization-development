\set ON_ERROR_STOP on

SELECT
  '01_rule_count' AS section,
  count(*) AS active_rule_count,
  count(*) FILTER (WHERE mapping_confidence_code = 'high') AS high_rule_count,
  count(*) FILTER (WHERE mapping_confidence_code = 'medium') AS medium_rule_count
FROM cx22073jw.brain_source_object_mapping_rule_catalog
WHERE active_flag = true;

SELECT
  '02_proposal_status' AS section,
  proposal_action_code,
  mapping_confidence_code,
  rule_code,
  brain_domain_code,
  object_count
FROM cx22073jw.vw_brain_source_object_lane03_mapping_status_v1
ORDER BY proposal_action_code, mapping_confidence_code, rule_code, brain_domain_code;

SELECT
  '03_remaining_backlog_preview' AS section,
  source_object_kind,
  source_object_name,
  proposal_action_code,
  mapping_confidence_code,
  rule_code,
  brain_domain_code
FROM cx22073jw.vw_brain_source_object_lane03_remaining_backlog_v1
ORDER BY proposal_action_code, mapping_confidence_code NULLS LAST, source_object_kind, source_object_name
LIMIT 120;

SELECT
  '04_ingestion_summary_after_lane03' AS section,
  object_code,
  source_object_name,
  brain_domain_code,
  source_object_exists_flag,
  object_registry_count,
  row_registry_count,
  registry_source_missing_count
FROM cx22073jw.vw_brain_source_object_ingestion_summary_v1
ORDER BY source_object_exists_flag DESC, brain_domain_code, source_object_name
LIMIT 160;

SELECT
  '05_coverage_after_lane03' AS section,
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
    'rule_table_exists' AS check_code,
    CASE WHEN to_regclass('cx22073jw.brain_source_object_mapping_rule_catalog') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag,
    'mapping rule table exists' AS note

  UNION ALL
  SELECT
    'proposal_view_exists',
    CASE WHEN to_regclass('cx22073jw.vw_brain_source_object_mapping_proposal_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'mapping proposal view exists'

  UNION ALL
  SELECT
    'lane03_status_view_exists',
    CASE WHEN to_regclass('cx22073jw.vw_brain_source_object_lane03_mapping_status_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'Lane03 mapping status view exists'

  UNION ALL
  SELECT
    'lane03_remaining_backlog_view_exists',
    CASE WHEN to_regclass('cx22073jw.vw_brain_source_object_lane03_remaining_backlog_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'Lane03 remaining backlog view exists'

  UNION ALL
  SELECT
    'rule_count_min_40',
    CASE WHEN (SELECT count(*) FROM cx22073jw.brain_source_object_mapping_rule_catalog WHERE active_flag = true) >= 40 THEN 1 ELSE 0 END,
    'mapping rules cover major domain keywords'

  UNION ALL
  SELECT
    'source_object_registry_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code LIKE 'srcobj:%'
        AND source_exists_flag = true
    ) THEN 1 ELSE 0 END,
    'source object registry rows exist'

  UNION ALL
  SELECT
    'source_row_registry_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code LIKE 'srcrow:%'
        AND source_exists_flag = true
    ) THEN 1 ELSE 0 END,
    'source row registry rows exist'

  UNION ALL
  SELECT
    'registered_source_objects_not_missing',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code LIKE 'srcobj:%'
        AND source_exists_flag = false
    ) THEN 1 ELSE 0 END,
    'registered source objects point to existing objects'

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
  SELECT CASE WHEN to_regclass('cx22073jw.brain_source_object_mapping_rule_catalog') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag
  UNION ALL SELECT CASE WHEN to_regclass('cx22073jw.vw_brain_source_object_mapping_proposal_v1') IS NOT NULL THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN to_regclass('cx22073jw.vw_brain_source_object_lane03_mapping_status_v1') IS NOT NULL THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN to_regclass('cx22073jw.vw_brain_source_object_lane03_remaining_backlog_v1') IS NOT NULL THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN (SELECT count(*) FROM cx22073jw.brain_source_object_mapping_rule_catalog WHERE active_flag = true) >= 40 THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE brain_data_code LIKE 'srcobj:%'
      AND source_exists_flag = true
  ) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE brain_data_code LIKE 'srcrow:%'
      AND source_exists_flag = true
  ) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE brain_data_code LIKE 'srcobj:%'
      AND source_exists_flag = false
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
