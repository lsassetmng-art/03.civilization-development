\set ON_ERROR_STOP on

SELECT
  '01_lane09_unit_count' AS section,
  count(*) AS lane09_unit_count,
  count(DISTINCT brain_domain_code) AS domain_count
FROM cx22073jw.brain_detail_expansion_unit
WHERE pack_code = 'lane09_detail_breadth'
  AND active_flag = true;

SELECT
  '02_lane09_axis_count' AS section,
  detail_axis_code,
  count(*) AS unit_count
FROM cx22073jw.brain_detail_expansion_unit
WHERE pack_code = 'lane09_detail_breadth'
  AND active_flag = true
GROUP BY detail_axis_code
ORDER BY detail_axis_code;

SELECT
  '03_breadth_candidate_count' AS section,
  count(*) AS candidate_count
FROM cx22073jw.brain_domain_breadth_candidate_catalog
WHERE active_flag = true;

SELECT
  '04_runtime_material_v2_lane09_count' AS section,
  model_code,
  brain_domain_code,
  count(*) AS lane09_material_count
FROM aiworker.vw_robot_readable_brain_runtime_material_v2
WHERE unit_code LIKE 'lane09_%'
GROUP BY model_code, brain_domain_code
ORDER BY model_code, brain_domain_code
LIMIT 80;

SELECT
  '05_selector_source_kind_byd2003_review' AS section,
  material_source_kind,
  count(*) AS selected_count,
  min(overall_rank) AS min_overall_rank,
  max(overall_rank) AS max_overall_rank
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'BYD2-003',
  'review',
  ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
  20,
  80
)
GROUP BY material_source_kind
ORDER BY min_overall_rank, material_source_kind;

SELECT
  '06_selector_source_kind_hd_r5p' AS section,
  material_source_kind,
  count(*) AS selected_count,
  min(overall_rank) AS min_overall_rank,
  max(overall_rank) AS max_overall_rank
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'HD-R5P',
  'executive_planning',
  ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[],
  20,
  80
)
GROUP BY material_source_kind
ORDER BY min_overall_rank, material_source_kind;

SELECT
  '07_selector_source_kind_hd_r1c' AS section,
  material_source_kind,
  count(*) AS selected_count,
  min(overall_rank) AS min_overall_rank,
  max(overall_rank) AS max_overall_rank
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'HD-R1C',
  'smalltalk',
  ARRAY['culture_region','food_nutrition','hobby_entertainment','season_calendar']::text[],
  20,
  80
)
GROUP BY material_source_kind
ORDER BY min_overall_rank, material_source_kind;

WITH checks AS (
  SELECT
    'lane09_units_inserted' AS check_code,
    CASE WHEN (
      SELECT count(*)
      FROM cx22073jw.brain_detail_expansion_unit
      WHERE pack_code = 'lane09_detail_breadth'
        AND active_flag = true
    ) >= 50 THEN 1 ELSE 0 END AS pass_flag,
    'Lane09 detail units inserted' AS note

  UNION ALL
  SELECT
    'lane09_domains_broad',
    CASE WHEN (
      SELECT count(DISTINCT brain_domain_code)
      FROM cx22073jw.brain_detail_expansion_unit
      WHERE pack_code = 'lane09_detail_breadth'
        AND active_flag = true
    ) >= 14 THEN 1 ELSE 0 END,
    'Lane09 covers broad existing domains'

  UNION ALL
  SELECT
    'breadth_candidates_inserted',
    CASE WHEN (
      SELECT count(*)
      FROM cx22073jw.brain_domain_breadth_candidate_catalog
      WHERE active_flag = true
    ) >= 8 THEN 1 ELSE 0 END,
    'Breadth candidate domains inserted'

  UNION ALL
  SELECT
    'runtime_material_v2_exists',
    CASE WHEN to_regclass('aiworker.vw_robot_readable_brain_runtime_material_v2') IS NOT NULL THEN 1 ELSE 0 END,
    'Runtime material v2 exists'

  UNION ALL
  SELECT
    'selector_has_lane09_byd2003',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'BYD2-003',
        'review',
        ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
        20,
        80
      )
      WHERE unit_code LIKE 'lane09_%'
    ) THEN 1 ELSE 0 END,
    'BYD2-003 review can select lane09 detail'

  UNION ALL
  SELECT
    'selector_has_lane09_hd_r5p',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'HD-R5P',
        'executive_planning',
        ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[],
        20,
        80
      )
      WHERE unit_code LIKE 'lane09_%'
    ) THEN 1 ELSE 0 END,
    'HD-R5P executive can select lane09 detail'

  UNION ALL
  SELECT
    'selector_has_lane09_hd_r1c_smalltalk',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'HD-R1C',
        'smalltalk',
        ARRAY['culture_region','food_nutrition','hobby_entertainment','season_calendar']::text[],
        20,
        80
      )
      WHERE unit_code LIKE 'lane09_%'
    ) THEN 1 ELSE 0 END,
    'HD-R1C smalltalk can select safe lane09 detail'

  UNION ALL
  SELECT
    'hd_r1c_forbidden_still_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'HD-R1C',
        'smalltalk',
        ARRAY['culture_region','food_nutrition','hobby_entertainment','season_calendar']::text[],
        20,
        80
      )
      WHERE brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')
    ) THEN 1 ELSE 0 END,
    'HD-R1C forbidden domains remain denied'

  UNION ALL
  SELECT
    'hd_r2_business_professional_still_zero',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'HD-R2',
        'risk_check',
        ARRAY['security_crisis','robot_aiworker','city_art_game']::text[],
        20,
        80
      )
      WHERE brain_domain_code IN ('business_operation','professional_basic')
    ) THEN 1 ELSE 0 END,
    'HD-R2 business/professional remains denied'

  UNION ALL
  SELECT
    'selector_keeps_srcmat_lane05_pack05',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'BYD2-003',
        'review',
        ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
        20,
        80
      )
      WHERE material_source_kind = 'source_registry'
    )
    AND EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'BYD2-003',
        'review',
        ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
        20,
        80
      )
      WHERE material_source_kind = 'lane05_fillup'
    )
    AND EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'BYD2-003',
        'review',
        ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
        20,
        80
      )
      WHERE material_source_kind = 'pack05_full_load'
    )
    THEN 1 ELSE 0 END,
    'Selector still keeps srcmat/lane05/pack05 buckets'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN (SELECT count(*) FROM cx22073jw.brain_detail_expansion_unit WHERE pack_code='lane09_detail_breadth' AND active_flag=true) >= 50 THEN 1 ELSE 0 END AS pass_flag
  UNION ALL SELECT CASE WHEN (SELECT count(DISTINCT brain_domain_code) FROM cx22073jw.brain_detail_expansion_unit WHERE pack_code='lane09_detail_breadth' AND active_flag=true) >= 14 THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN (SELECT count(*) FROM cx22073jw.brain_domain_breadth_candidate_catalog WHERE active_flag=true) >= 8 THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN to_regclass('aiworker.vw_robot_readable_brain_runtime_material_v2') IS NOT NULL THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('BYD2-003','review',ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],20,80) WHERE unit_code LIKE 'lane09_%') THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('HD-R5P','executive_planning',ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[],20,80) WHERE unit_code LIKE 'lane09_%') THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('HD-R1C','smalltalk',ARRAY['culture_region','food_nutrition','hobby_entertainment','season_calendar']::text[],20,80) WHERE unit_code LIKE 'lane09_%') THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('HD-R1C','smalltalk',ARRAY['culture_region','food_nutrition','hobby_entertainment','season_calendar']::text[],20,80) WHERE brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('HD-R2','risk_check',ARRAY['security_crisis','robot_aiworker','city_art_game']::text[],20,80) WHERE brain_domain_code IN ('business_operation','professional_basic')) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('BYD2-003','review',ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],20,80) WHERE material_source_kind='source_registry')
    AND EXISTS (SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('BYD2-003','review',ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],20,80) WHERE material_source_kind='lane05_fillup')
    AND EXISTS (SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('BYD2-003','review',ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],20,80) WHERE material_source_kind='pack05_full_load')
    THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;
