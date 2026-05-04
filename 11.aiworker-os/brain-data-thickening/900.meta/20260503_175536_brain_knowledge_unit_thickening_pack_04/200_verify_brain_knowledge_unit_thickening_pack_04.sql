\set ON_ERROR_STOP on

SELECT
  '01_pack04_count' AS section,
  count(*) AS pack04_count,
  count(*) FILTER (WHERE active_flag = true) AS active_count
FROM cx22073jw.brain_knowledge_unit
WHERE unit_code LIKE 'pack04_%';

SELECT
  '02_pack04_by_domain' AS section,
  brain_domain_code,
  count(*) AS unit_count
FROM cx22073jw.brain_knowledge_unit
WHERE unit_code LIKE 'pack04_%'
  AND active_flag = true
GROUP BY brain_domain_code
ORDER BY brain_domain_code;

SELECT
  '03_total_knowledge_units' AS section,
  count(*) AS total_count,
  count(*) FILTER (WHERE active_flag = true) AS active_count
FROM cx22073jw.brain_knowledge_unit;

SELECT
  '04_pack04_registry_source' AS section,
  count(*) AS registry_count,
  count(*) FILTER (WHERE source_exists_flag = true) AS source_exists_count,
  count(*) FILTER (WHERE source_exists_flag = false) AS source_missing_count
FROM cx22073jw.vw_brain_data_registry_v1
WHERE brain_data_code LIKE 'pack04_%';

SELECT
  '05_pack04_readable_by_model' AS section,
  model_code,
  role_code,
  count(*) AS readable_pack04_material_count,
  string_agg(DISTINCT brain_domain_code, ', ' ORDER BY brain_domain_code) AS readable_domains
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE unit_code LIKE 'pack04_%'
GROUP BY model_code, role_code
ORDER BY model_code, role_code;

WITH checks AS (
  SELECT
    'pack04_min_40' AS check_code,
    CASE WHEN (SELECT count(*) FROM cx22073jw.brain_knowledge_unit WHERE unit_code LIKE 'pack04_%' AND active_flag = true) >= 40 THEN 1 ELSE 0 END AS pass_flag,
    'Pack 04 has at least 40 active units' AS note

  UNION ALL
  SELECT
    'pack04_registry_source_all_exists',
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1
      WHERE brain_data_code LIKE 'pack04_%'
        AND source_exists_flag = false
    ) THEN 1 ELSE 0 END,
    'Pack 04 registry source exists'

  UNION ALL
  SELECT
    'hd_r5p_president_material_exists',
    CASE WHEN EXISTS (
      SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R5P'
        AND unit_code IN ('pack04_robot_001_president_policy_frame','pack04_biz_001_president_priority_matrix','pack04_civ_001_president_history_lesson')
    ) THEN 1 ELSE 0 END,
    'HD-R5P can read President materials'

  UNION ALL
  SELECT
    'hd_r5_manager_material_exists',
    CASE WHEN EXISTS (
      SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R5'
        AND unit_code IN ('pack04_robot_002_manager_broad_breakdown','pack04_biz_002_manager_risk_gate','pack04_pro_002_manager_compliance_check')
    ) THEN 1 ELSE 0 END,
    'HD-R5 can read Manager materials'

  UNION ALL
  SELECT
    'hd_r3_worker_material_exists',
    CASE WHEN EXISTS (
      SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R3'
        AND unit_code IN ('pack04_robot_003_worker_deliverable_focus','pack04_biz_003_worker_report_format')
    ) THEN 1 ELSE 0 END,
    'HD-R3 can read Worker materials'

  UNION ALL
  SELECT
    'hd_r1c_friend_material_exists',
    CASE WHEN EXISTS (
      SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R1C'
        AND unit_code IN ('pack04_lovers_001_warm_greeting','pack04_lovers_002_after_work_care','pack04_lovers_007_mood_repair')
        AND effective_use_purpose_codes && ARRAY['smalltalk']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R1C can read safe Friend/smalltalk materials'

  UNION ALL
  SELECT
    'hd_r1a_lover_material_exists',
    CASE WHEN EXISTS (
      SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R1A'
        AND unit_code IN ('pack04_lovers_003_boundaries_in_affection','pack04_lovers_006_yandere_business_safe','pack04_lovers_010_exit_with_care')
        AND effective_use_purpose_codes && ARRAY['smalltalk']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R1A can read safe Lover materials'

  UNION ALL
  SELECT
    'series_lovers_material_exists',
    CASE WHEN EXISTS (
      SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'SERIES:LoVerS'
        AND unit_code LIKE 'pack04_lovers_%'
        AND effective_use_purpose_codes && ARRAY['smalltalk']::text[]
    ) THEN 1 ELSE 0 END,
    'SERIES:LoVerS can read safe Lover series materials'

  UNION ALL
  SELECT
    'megami_norn_material_exists',
    CASE WHEN
      EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'MG-NORN-001' AND unit_code IN ('pack04_megami_001_urd_past_results','pack04_megami_002_urd_cool_tone'))
      AND EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'MG-NORN-002' AND unit_code IN ('pack04_megami_003_verdandi_current_context','pack04_megami_004_verdandi_innocent_tone'))
      AND EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'MG-NORN-003' AND unit_code IN ('pack04_megami_005_skuld_future_blueprint','pack04_megami_006_skuld_energy_tone'))
    THEN 1 ELSE 0 END,
    'NORN 3 sisters can read their differentiated materials'

  UNION ALL
  SELECT
    'byd2003_beyond_material_exists',
    CASE WHEN EXISTS (
      SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'BYD2-003'
        AND unit_code LIKE 'pack04_beyond_%'
        AND effective_use_purpose_codes && ARRAY['review','risk_check','design_reference']::text[]
    ) THEN 1 ELSE 0 END,
    'BYD2-003 can read Beyond review materials'

  UNION ALL
  SELECT
    'hd_r2_security_material_exists',
    CASE WHEN EXISTS (
      SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R2'
        AND unit_code IN ('pack04_robot_007_security_safe_reference','pack04_sec_001_security_role_stopline')
        AND brain_domain_code IN ('robot_aiworker','security_crisis')
        AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]
    ) THEN 1 ELSE 0 END,
    'HD-R2 can read security/safety materials'

  UNION ALL
  SELECT
    'hd_r1c_forbidden_pack04_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code = 'HD-R1C'
        AND unit_code LIKE 'pack04_%'
        AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')
    ) THEN 1 ELSE 0 END,
    'HD-R1C does not read forbidden Pack 04 materials'

  UNION ALL
  SELECT
    'security_family_business_professional_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
      WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G')
        AND unit_code LIKE 'pack04_%'
        AND brain_domain_code IN ('business_operation','professional_basic')
    ) THEN 1 ELSE 0 END,
    'HD-R2/R2S/R2G do not read Pack 04 business/professional materials'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN (SELECT count(*) FROM cx22073jw.brain_knowledge_unit WHERE unit_code LIKE 'pack04_%' AND active_flag = true) >= 40 THEN 1 ELSE 0 END AS pass_flag
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM cx22073jw.vw_brain_data_registry_v1 WHERE brain_data_code LIKE 'pack04_%' AND source_exists_flag = false) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'HD-R5P' AND unit_code IN ('pack04_robot_001_president_policy_frame','pack04_biz_001_president_priority_matrix','pack04_civ_001_president_history_lesson')) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'HD-R5' AND unit_code IN ('pack04_robot_002_manager_broad_breakdown','pack04_biz_002_manager_risk_gate','pack04_pro_002_manager_compliance_check')) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'HD-R3' AND unit_code IN ('pack04_robot_003_worker_deliverable_focus','pack04_biz_003_worker_report_format')) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'HD-R1C' AND unit_code IN ('pack04_lovers_001_warm_greeting','pack04_lovers_002_after_work_care','pack04_lovers_007_mood_repair') AND effective_use_purpose_codes && ARRAY['smalltalk']::text[]) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'HD-R1A' AND unit_code IN ('pack04_lovers_003_boundaries_in_affection','pack04_lovers_006_yandere_business_safe','pack04_lovers_010_exit_with_care') AND effective_use_purpose_codes && ARRAY['smalltalk']::text[]) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'SERIES:LoVerS' AND unit_code LIKE 'pack04_lovers_%' AND effective_use_purpose_codes && ARRAY['smalltalk']::text[]) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'MG-NORN-001' AND unit_code IN ('pack04_megami_001_urd_past_results','pack04_megami_002_urd_cool_tone')) AND EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'MG-NORN-002' AND unit_code IN ('pack04_megami_003_verdandi_current_context','pack04_megami_004_verdandi_innocent_tone')) AND EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'MG-NORN-003' AND unit_code IN ('pack04_megami_005_skuld_future_blueprint','pack04_megami_006_skuld_energy_tone')) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'BYD2-003' AND unit_code LIKE 'pack04_beyond_%' AND effective_use_purpose_codes && ARRAY['review','risk_check','design_reference']::text[]) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'HD-R2' AND unit_code IN ('pack04_robot_007_security_safe_reference','pack04_sec_001_security_role_stopline') AND brain_domain_code IN ('robot_aiworker','security_crisis') AND effective_use_purpose_codes && ARRAY['risk_check','design_reference','safety_training','review']::text[]) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code = 'HD-R1C' AND unit_code LIKE 'pack04_%' AND brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM aiworker.vw_robot_readable_brain_knowledge_material_v1 WHERE model_code IN ('HD-R2','HD-R2S','HD-R2G') AND unit_code LIKE 'pack04_%' AND brain_domain_code IN ('business_operation','professional_basic')) THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;

SELECT
  '06_pack04_key_preview' AS section,
  model_code,
  role_code,
  brain_domain_code,
  unit_code,
  unit_title_ja,
  left(unit_summary_ja, 90) AS summary_preview
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE unit_code LIKE 'pack04_%'
  AND model_code IN ('HD-R5P','HD-R5','HD-R3','HD-R1C','HD-R1A','HD-R2','BYD2-003','MG-NORN-001','MG-NORN-002','MG-NORN-003','SERIES:LoVerS')
ORDER BY model_code, brain_domain_code, unit_code
LIMIT 120;
