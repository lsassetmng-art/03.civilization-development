\set ON_ERROR_STOP on

SELECT
  '01_pack03_count' AS section,
  count(*) AS pack03_count,
  count(*) FILTER (WHERE active_flag = true) AS active_count
FROM cx22073jw.brain_knowledge_unit
WHERE unit_code LIKE 'pack03_%';

SELECT
  '02_pack03_by_domain' AS section,
  brain_domain_code,
  count(*) AS unit_count
FROM cx22073jw.brain_knowledge_unit
WHERE unit_code LIKE 'pack03_%'
  AND active_flag = true
GROUP BY brain_domain_code
ORDER BY brain_domain_code;

SELECT
  '03_total_knowledge_units' AS section,
  count(*) AS total_count,
  count(*) FILTER (WHERE active_flag = true) AS active_count
FROM cx22073jw.brain_knowledge_unit;

SELECT
  '04_pack03_registry_source' AS section,
  count(*) AS registry_count,
  count(*) FILTER (WHERE source_exists_flag = true) AS source_exists_count,
  count(*) FILTER (WHERE source_exists_flag = false) AS source_missing_count
FROM cx22073jw.vw_brain_data_registry_v1
WHERE brain_data_code LIKE 'pack03_%';

SELECT
  '05_pack03_readable_by_model' AS section,
  model_code,
  role_code,
  count(*) AS readable_pack03_material_count,
  string_agg(DISTINCT brain_domain_code, ', ' ORDER BY brain_domain_code) AS readable_domains
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE unit_code LIKE 'pack03_%'
GROUP BY model_code, role_code
ORDER BY model_code, role_code;

WITH checks AS (
  SELECT
    'pack03_min_40' AS check_code,
    CASE WHEN (SELECT count(*) FROM cx22073jw.brain_knowledge_unit WHERE unit_code LIKE 'pack03_%' AND active_flag = true) >= 40 THEN 1 ELSE 0 END AS pass_flag,
    'Pack 03 has at least 40 active units' AS note

  UNION ALL
  SELECT
    'pack03_registry_source_all_exists',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code LIKE 'pack03_%'
        AND source_exists_flag = false
    ) THEN 1 ELSE 0 END,
    'Pack 03 registry source exists'

  UNION ALL
  SELECT
    'mg_norn_002_health_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'MG-NORN-002'
        AND unit_code LIKE 'pack03_health_%'
        AND brain_domain_code = 'health_life_metrics'
        AND effective_use_purpose_codes && ARRAY['health_life_review','reference','review']::text[]
    ) THEN 1 ELSE 0 END,
    'MG-NORN-002 can read Pack 03 health/life materials'

  UNION ALL
  SELECT
    'hd_r3_exam_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R3'
        AND unit_code LIKE 'pack03_exam_%'
        AND brain_domain_code = 'exam_learning'
        AND effective_use_purpose_codes && ARRAY['exam_practice','education','review']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R3 can read Pack 03 exam materials'

  UNION ALL
  SELECT
    'byd2003_exam_review_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'BYD2-003'
        AND unit_code LIKE 'pack03_exam_%'
        AND brain_domain_code = 'exam_learning'
        AND effective_use_purpose_codes && ARRAY['review','education','exam_practice']::text[]
    ) THEN 1 ELSE 0 END,
    'BYD2-003 can read Pack 03 exam/review materials'

  UNION ALL
  SELECT
    'mg_norn_001_history_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'MG-NORN-001'
        AND unit_code LIKE 'pack03_history_%'
        AND brain_domain_code = 'history_worldview'
    ) THEN 1 ELSE 0 END,
    'MG-NORN-001 can read Pack 03 history materials'

  UNION ALL
  SELECT
    'mg_norn_003_city_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'MG-NORN-003'
        AND unit_code LIKE 'pack03_city_%'
        AND brain_domain_code = 'city_art_game'
        AND effective_use_purpose_codes && ARRAY['worldbuilding','design_reference','review']::text[]
    ) THEN 1 ELSE 0 END,
    'MG-NORN-003 can read Pack 03 city/art/game materials'

  UNION ALL
  SELECT
    'hd_r1c_smalltalk_culture_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R1C'
        AND unit_code LIKE 'pack03_culture_%'
        AND brain_domain_code = 'culture_region'
        AND effective_use_purpose_codes && ARRAY['smalltalk','reference']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R1C can read safe Pack 03 culture smalltalk materials'

  UNION ALL
  SELECT
    'hd_r1c_forbidden_pack03_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R1C'
        AND unit_code LIKE 'pack03_%'
        AND brain_domain_code IN ('health_life_metrics','exam_learning','history_worldview','city_art_game','security_crisis','business_operation','professional_basic')
    ) THEN 1 ELSE 0 END,
    'HD-R1C does not read forbidden Pack 03 materials'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN (SELECT count(*) FROM cx22073jw.brain_knowledge_unit WHERE unit_code LIKE 'pack03_%' AND active_flag = true) >= 40 THEN 1 ELSE 0 END AS pass_flag
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE brain_data_code LIKE 'pack03_%'
      AND source_exists_flag = false
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'MG-NORN-002'
      AND unit_code LIKE 'pack03_health_%'
      AND brain_domain_code = 'health_life_metrics'
      AND effective_use_purpose_codes && ARRAY['health_life_review','reference','review']::text[]
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R3'
      AND unit_code LIKE 'pack03_exam_%'
      AND brain_domain_code = 'exam_learning'
      AND effective_use_purpose_codes && ARRAY['exam_practice','education','review']::text[]
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'BYD2-003'
      AND unit_code LIKE 'pack03_exam_%'
      AND brain_domain_code = 'exam_learning'
      AND effective_use_purpose_codes && ARRAY['review','education','exam_practice']::text[]
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'MG-NORN-001'
      AND unit_code LIKE 'pack03_history_%'
      AND brain_domain_code = 'history_worldview'
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'MG-NORN-003'
      AND unit_code LIKE 'pack03_city_%'
      AND brain_domain_code = 'city_art_game'
      AND effective_use_purpose_codes && ARRAY['worldbuilding','design_reference','review']::text[]
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R1C'
      AND unit_code LIKE 'pack03_culture_%'
      AND brain_domain_code = 'culture_region'
      AND effective_use_purpose_codes && ARRAY['smalltalk','reference']::text[]
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R1C'
      AND unit_code LIKE 'pack03_%'
      AND brain_domain_code IN ('health_life_metrics','exam_learning','history_worldview','city_art_game','security_crisis','business_operation','professional_basic')
  ) THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;

SELECT
  '06_mg_norn_002_health_preview' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  unit_title_ja,
  left(unit_summary_ja, 90) AS summary_preview
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE model_code = 'MG-NORN-002'
  AND unit_code LIKE 'pack03_health_%'
ORDER BY unit_code;

SELECT
  '07_hd_r3_exam_preview' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  unit_title_ja,
  left(safety_boundary_ja, 100) AS safety_preview
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE model_code = 'HD-R3'
  AND unit_code LIKE 'pack03_exam_%'
ORDER BY unit_code;

SELECT
  '08_mg_norn_003_city_preview' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  unit_title_ja,
  left(unit_summary_ja, 100) AS summary_preview
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE model_code = 'MG-NORN-003'
  AND unit_code LIKE 'pack03_city_%'
ORDER BY unit_code;
