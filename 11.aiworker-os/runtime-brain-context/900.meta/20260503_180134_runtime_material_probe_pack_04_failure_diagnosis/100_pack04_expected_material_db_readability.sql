\set ON_ERROR_STOP on

WITH expected AS (
  SELECT * FROM (VALUES
    ('HD-R5P','executive_planning','pack04_robot_001_president_policy_frame'),
    ('HD-R5P','executive_planning','pack04_biz_001_president_priority_matrix'),
    ('HD-R5P','executive_planning','pack04_civ_001_president_history_lesson'),

    ('HD-R5','business_planning','pack04_robot_002_manager_broad_breakdown'),
    ('HD-R5','business_planning','pack04_biz_002_manager_risk_gate'),

    ('HD-R3','reference','pack04_robot_003_worker_deliverable_focus'),
    ('HD-R3','reference','pack04_biz_003_worker_report_format'),

    ('HD-R1C','smalltalk','pack04_lovers_001_warm_greeting'),
    ('HD-R1C','smalltalk','pack04_lovers_002_after_work_care'),
    ('HD-R1C','smalltalk','pack04_lovers_007_mood_repair'),
    ('HD-R1C','smalltalk','pack04_lovers_008_no_personal_data_pull'),

    ('HD-R1A','smalltalk','pack04_lovers_003_boundaries_in_affection'),
    ('HD-R1A','smalltalk','pack04_lovers_006_yandere_business_safe'),
    ('HD-R1A','smalltalk','pack04_lovers_010_exit_with_care'),

    ('SERIES:LoVerS','smalltalk','pack04_lovers_003_boundaries_in_affection'),
    ('SERIES:LoVerS','smalltalk','pack04_lovers_006_yandere_business_safe'),

    ('MG-NORN-001','worldbuilding','pack04_megami_001_urd_past_results'),
    ('MG-NORN-001','worldbuilding','pack04_megami_002_urd_cool_tone'),

    ('MG-NORN-002','health_life_review','pack04_megami_003_verdandi_current_context'),
    ('MG-NORN-002','health_life_review','pack04_megami_004_verdandi_innocent_tone'),
    ('MG-NORN-002','health_life_review','pack04_robot_009_megami_time_axis'),

    ('MG-NORN-003','business_planning','pack04_megami_005_skuld_future_blueprint'),
    ('MG-NORN-003','business_planning','pack04_megami_006_skuld_energy_tone'),
    ('MG-NORN-003','business_planning','pack04_robot_009_megami_time_axis'),

    ('BYD2-003','review','pack04_beyond_001_integrated_review_lens'),
    ('BYD2-003','review','pack04_beyond_002_consistency_matrix'),
    ('BYD2-003','review','pack04_beyond_003_regression_guard'),
    ('BYD2-003','review','pack04_beyond_004_evidence_weighting'),

    ('HD-R2','risk_check','pack04_robot_007_security_safe_reference'),
    ('HD-R2','risk_check','pack04_sec_001_security_role_stopline')
  ) AS t(model_code, purpose_code, unit_code)
),
joined AS (
  SELECT
    e.model_code,
    e.purpose_code,
    e.unit_code,
    m.brain_domain_code,
    m.effective_use_purpose_codes,
    m.unit_title_ja,
    CASE
      WHEN m.unit_code IS NOT NULL THEN 'YES'
      ELSE 'NO'
    END AS db_readable_for_model,
    CASE
      WHEN m.unit_code IS NOT NULL
       AND m.effective_use_purpose_codes && ARRAY[e.purpose_code]::text[]
      THEN 'YES'
      ELSE 'NO'
    END AS db_readable_for_purpose
  FROM expected e
  LEFT JOIN aiworker.vw_robot_readable_brain_knowledge_material_v1 m
    ON m.model_code = e.model_code
   AND m.unit_code = e.unit_code
)
SELECT
  '01_expected_material_db_readability' AS section,
  *
FROM joined
ORDER BY model_code, purpose_code, unit_code;

SELECT
  '02_expected_summary' AS section,
  model_code,
  purpose_code,
  count(*) AS expected_count,
  count(*) FILTER (WHERE db_readable_for_model = 'YES') AS readable_for_model_count,
  count(*) FILTER (WHERE db_readable_for_purpose = 'YES') AS readable_for_purpose_count
FROM (
  WITH expected AS (
    SELECT * FROM (VALUES
      ('HD-R5P','executive_planning','pack04_robot_001_president_policy_frame'),
      ('HD-R5P','executive_planning','pack04_biz_001_president_priority_matrix'),
      ('HD-R5P','executive_planning','pack04_civ_001_president_history_lesson'),
      ('HD-R5','business_planning','pack04_robot_002_manager_broad_breakdown'),
      ('HD-R5','business_planning','pack04_biz_002_manager_risk_gate'),
      ('HD-R3','reference','pack04_robot_003_worker_deliverable_focus'),
      ('HD-R3','reference','pack04_biz_003_worker_report_format'),
      ('HD-R1C','smalltalk','pack04_lovers_001_warm_greeting'),
      ('HD-R1C','smalltalk','pack04_lovers_002_after_work_care'),
      ('HD-R1C','smalltalk','pack04_lovers_007_mood_repair'),
      ('HD-R1C','smalltalk','pack04_lovers_008_no_personal_data_pull'),
      ('HD-R1A','smalltalk','pack04_lovers_003_boundaries_in_affection'),
      ('HD-R1A','smalltalk','pack04_lovers_006_yandere_business_safe'),
      ('HD-R1A','smalltalk','pack04_lovers_010_exit_with_care'),
      ('SERIES:LoVerS','smalltalk','pack04_lovers_003_boundaries_in_affection'),
      ('SERIES:LoVerS','smalltalk','pack04_lovers_006_yandere_business_safe'),
      ('MG-NORN-001','worldbuilding','pack04_megami_001_urd_past_results'),
      ('MG-NORN-001','worldbuilding','pack04_megami_002_urd_cool_tone'),
      ('MG-NORN-002','health_life_review','pack04_megami_003_verdandi_current_context'),
      ('MG-NORN-002','health_life_review','pack04_megami_004_verdandi_innocent_tone'),
      ('MG-NORN-002','health_life_review','pack04_robot_009_megami_time_axis'),
      ('MG-NORN-003','business_planning','pack04_megami_005_skuld_future_blueprint'),
      ('MG-NORN-003','business_planning','pack04_megami_006_skuld_energy_tone'),
      ('MG-NORN-003','business_planning','pack04_robot_009_megami_time_axis'),
      ('BYD2-003','review','pack04_beyond_001_integrated_review_lens'),
      ('BYD2-003','review','pack04_beyond_002_consistency_matrix'),
      ('BYD2-003','review','pack04_beyond_003_regression_guard'),
      ('BYD2-003','review','pack04_beyond_004_evidence_weighting'),
      ('HD-R2','risk_check','pack04_robot_007_security_safe_reference'),
      ('HD-R2','risk_check','pack04_sec_001_security_role_stopline')
    ) AS t(model_code, purpose_code, unit_code)
  )
  SELECT
    e.model_code,
    e.purpose_code,
    e.unit_code,
    CASE WHEN m.unit_code IS NOT NULL THEN 'YES' ELSE 'NO' END AS db_readable_for_model,
    CASE WHEN m.unit_code IS NOT NULL AND m.effective_use_purpose_codes && ARRAY[e.purpose_code]::text[] THEN 'YES' ELSE 'NO' END AS db_readable_for_purpose
  FROM expected e
  LEFT JOIN aiworker.vw_robot_readable_brain_knowledge_material_v1 m
    ON m.model_code = e.model_code
   AND m.unit_code = e.unit_code
) s
GROUP BY model_code, purpose_code
ORDER BY model_code, purpose_code;

SELECT
  '03_pack04_domain_counts_by_probe_model' AS section,
  model_code,
  role_code,
  brain_domain_code,
  count(*) FILTER (WHERE unit_code LIKE 'pack04_%') AS pack04_count,
  count(*) AS all_material_count
FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
WHERE model_code IN (
  'HD-R5P','HD-R5','HD-R3','HD-R1C','HD-R1A','SERIES:LoVerS',
  'MG-NORN-001','MG-NORN-002','MG-NORN-003','BYD2-003','HD-R2'
)
GROUP BY model_code, role_code, brain_domain_code
ORDER BY model_code, brain_domain_code;

SELECT
  '04_policy_rows_relevant' AS section,
  model_code,
  brain_domain_code,
  policy_code,
  allowed_use_purpose_codes,
  active_flag,
  safety_note_ja
FROM aiworker.robot_brain_model_domain_policy
WHERE model_code IN ('HD-R5P','HD-R5','HD-R3','HD-R1C','HD-R1A','MG-NORN-001','MG-NORN-002','MG-NORN-003','BYD2-003','HD-R2')
  AND brain_domain_code IN ('robot_aiworker','business_operation','professional_basic','civilization_foundation_history','health_life_metrics','hobby_entertainment','culture_region','security_crisis')
ORDER BY model_code, brain_domain_code;
