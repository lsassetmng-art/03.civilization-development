\set ON_ERROR_STOP on

SELECT
  '01_pack02_count' AS section,
  count(*) AS pack02_count,
  count(*) FILTER (WHERE active_flag = true) AS active_count
FROM cx22073jw.brain_knowledge_unit
WHERE unit_code LIKE 'pack02_%';

SELECT
  '02_pack02_by_domain' AS section,
  brain_domain_code,
  count(*) AS unit_count
FROM cx22073jw.brain_knowledge_unit
WHERE unit_code LIKE 'pack02_%'
  AND active_flag = true
GROUP BY brain_domain_code
ORDER BY brain_domain_code;

SELECT
  '03_total_knowledge_units' AS section,
  count(*) AS total_count,
  count(*) FILTER (WHERE active_flag = true) AS active_count
FROM cx22073jw.brain_knowledge_unit;

SELECT
  '04_pack02_registry_source' AS section,
  count(*) AS registry_count,
  count(*) FILTER (WHERE source_exists_flag = true) AS source_exists_count,
  count(*) FILTER (WHERE source_exists_flag = false) AS source_missing_count
FROM cx22073jw.vw_brain_data_registry_v1
WHERE brain_data_code LIKE 'pack02_%';

SELECT
  '05_pack02_readable_by_model' AS section,
  model_code,
  role_code,
  count(*) AS readable_pack02_material_count,
  string_agg(DISTINCT brain_domain_code, ', ' ORDER BY brain_domain_code) AS readable_domains
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE unit_code LIKE 'pack02_%'
GROUP BY model_code, role_code
ORDER BY model_code, role_code;

WITH checks AS (
  SELECT
    'pack02_min_45' AS check_code,
    CASE WHEN (SELECT count(*) FROM cx22073jw.brain_knowledge_unit WHERE unit_code LIKE 'pack02_%' AND active_flag = true) >= 45 THEN 1 ELSE 0 END AS pass_flag,
    'Pack 02 has at least 45 active units' AS note

  UNION ALL
  SELECT
    'pack02_registry_source_all_exists',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code LIKE 'pack02_%'
        AND source_exists_flag = false
    ) THEN 1 ELSE 0 END,
    'Pack 02 registry source exists'

  UNION ALL
  SELECT
    'hd_r5_business_pack02_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R5'
        AND unit_code LIKE 'pack02_biz_%'
        AND brain_domain_code = 'business_operation'
        AND effective_use_purpose_codes && ARRAY['business_planning','review','design_reference']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R5 can read Pack 02 business materials'

  UNION ALL
  SELECT
    'hd_r5_professional_pack02_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R5'
        AND unit_code LIKE 'pack02_pro_%'
        AND brain_domain_code = 'professional_basic'
        AND effective_use_purpose_codes && ARRAY['review','risk_check']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R5 can read Pack 02 professional materials'

  UNION ALL
  SELECT
    'hd_r5p_civ_pack02_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R5P'
        AND unit_code LIKE 'pack02_civ_%'
        AND brain_domain_code = 'civilization_foundation_history'
        AND effective_use_purpose_codes && ARRAY['executive_planning','review','risk_check']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R5P can read Pack 02 civilization foundation materials'

  UNION ALL
  SELECT
    'byd2003_pack02_review_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'BYD2-003'
        AND unit_code LIKE 'pack02_%'
        AND effective_use_purpose_codes && ARRAY['review']::text[]
        AND brain_domain_code IN ('business_operation','professional_basic','civilization_foundation_history','robot_aiworker')
    ) THEN 1 ELSE 0 END,
    'BYD2-003 can read Pack 02 review materials'

  UNION ALL
  SELECT
    'hd_r2_security_pack02_exists',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R2'
        AND unit_code LIKE 'pack02_sec_%'
        AND brain_domain_code = 'security_crisis'
        AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
        AND safety_boundary_ja LIKE '%現実の攻撃%'
    ) THEN 1 ELSE 0 END,
    'HD-R2 can read Pack 02 security materials for safe purposes'

  UNION ALL
  SELECT
    'hd_r1c_forbidden_pack02_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R1C'
        AND unit_code LIKE 'pack02_%'
        AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history')
    ) THEN 1 ELSE 0 END,
    'HD-R1C does not read forbidden Pack 02 materials'

  UNION ALL
  SELECT
    'security_family_business_professional_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
        AND unit_code LIKE 'pack02_%'
        AND brain_domain_code IN ('business_operation','professional_basic')
    ) THEN 1 ELSE 0 END,
    'HD-R2/R2S/R2G do not read Pack 02 business/professional materials'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN (SELECT count(*) FROM cx22073jw.brain_knowledge_unit WHERE unit_code LIKE 'pack02_%' AND active_flag = true) >= 45 THEN 1 ELSE 0 END AS pass_flag
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
    WHERE brain_data_code LIKE 'pack02_%'
      AND source_exists_flag = false
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R5'
      AND unit_code LIKE 'pack02_biz_%'
      AND brain_domain_code = 'business_operation'
      AND effective_use_purpose_codes && ARRAY['business_planning','review','design_reference']::text[]
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R5'
      AND unit_code LIKE 'pack02_pro_%'
      AND brain_domain_code = 'professional_basic'
      AND effective_use_purpose_codes && ARRAY['review','risk_check']::text[]
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R5P'
      AND unit_code LIKE 'pack02_civ_%'
      AND brain_domain_code = 'civilization_foundation_history'
      AND effective_use_purpose_codes && ARRAY['executive_planning','review','risk_check']::text[]
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'BYD2-003'
      AND unit_code LIKE 'pack02_%'
      AND effective_use_purpose_codes && ARRAY['review']::text[]
      AND brain_domain_code IN ('business_operation','professional_basic','civilization_foundation_history','robot_aiworker')
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R2'
      AND unit_code LIKE 'pack02_sec_%'
      AND brain_domain_code = 'security_crisis'
      AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
      AND safety_boundary_ja LIKE '%現実の攻撃%'
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code = 'HD-R1C'
      AND unit_code LIKE 'pack02_%'
      AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history')
  ) THEN 1 ELSE 0 END
  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
    WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
      AND unit_code LIKE 'pack02_%'
      AND brain_domain_code IN ('business_operation','professional_basic')
  ) THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;

SELECT
  '06_hd_r5_pack02_preview' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  unit_title_ja,
  left(unit_summary_ja, 90) AS summary_preview
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE model_code = 'HD-R5'
  AND unit_code LIKE 'pack02_%'
ORDER BY brain_domain_code, unit_code
LIMIT 24;

SELECT
  '07_hd_r2_pack02_security_preview' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  unit_title_ja,
  left(safety_boundary_ja, 100) AS safety_preview
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE model_code = 'HD-R2'
  AND unit_code LIKE 'pack02_sec_%'
ORDER BY unit_code;

SELECT
  '08_runtime_material_query_probe' AS section,
  model_code,
  brain_domain_code,
  count(*) AS material_count
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE model_code IN ('HD-R5','HD-R5P','BYD2-003','HD-R2')
  AND unit_code LIKE 'pack02_%'
GROUP BY model_code, brain_domain_code
ORDER BY model_code, brain_domain_code;
