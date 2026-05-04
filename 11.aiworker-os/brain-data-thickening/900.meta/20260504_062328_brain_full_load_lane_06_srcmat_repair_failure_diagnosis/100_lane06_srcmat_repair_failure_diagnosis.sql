\set ON_ERROR_STOP on

SELECT
  '01_failed_checks_recomputed' AS section,
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM (
  SELECT
    'selection_has_srcmat' AS check_code,
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'BYD2-003',
        'review',
        ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
        20,
        80
      )
      WHERE unit_code LIKE 'srcmat_%'
    ) THEN 1 ELSE 0 END AS pass_flag,
    'selection can include source-registry materials' AS note

  UNION ALL
  SELECT
    'selection_has_lane05',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'HD-R5P',
        'executive_planning',
        ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[],
        20,
        80
      )
      WHERE unit_code LIKE 'lane05_%'
    ) THEN 1 ELSE 0 END,
    'selection still includes Lane05 fill-up materials'

  UNION ALL
  SELECT
    'all_smoke_cases_pass',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_brain_runtime_selection_smoke_board_v1
      WHERE smoke_result_code <> 'PASS'
    ) THEN 1 ELSE 0 END,
    'all runtime selection smoke cases pass'

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
    'HD-R1C forbidden domains remain denied through selector'

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
    'HD-R2 business/professional remains denied through selector'

  UNION ALL
  SELECT
    'domain_limit_enforced',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'BYD2-003',
        'review',
        ARRAY['business_operation','professional_basic','robot_aiworker']::text[],
        5,
        30
      )
      WHERE domain_rank > 5
    ) THEN 1 ELSE 0 END,
    'domain rank limit is enforced'
) x
WHERE pass_flag <> 1
ORDER BY check_code;

SELECT
  '02_smoke_board_failed' AS section,
  smoke_case_code,
  model_code,
  use_purpose_code,
  selected_count,
  min_result_count,
  max_domain_rank,
  limit_per_domain,
  max_overall_rank,
  total_limit,
  forbidden_hit_count,
  smoke_result_code,
  selected_source_kinds
FROM aiworker.vw_brain_runtime_selection_smoke_board_v1
WHERE smoke_result_code <> 'PASS'
ORDER BY smoke_case_code;

SELECT
  '03_smoke_board_all' AS section,
  smoke_case_code,
  model_code,
  use_purpose_code,
  selected_count,
  min_result_count,
  max_domain_rank,
  limit_per_domain,
  max_overall_rank,
  total_limit,
  forbidden_hit_count,
  smoke_result_code,
  selected_source_kinds
FROM aiworker.vw_brain_runtime_selection_smoke_board_v1
ORDER BY smoke_case_code;

SELECT
  '04_byd2003_review_source_kind' AS section,
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
  '05_hd_r5p_executive_source_kind' AS section,
  material_source_kind,
  brain_domain_code,
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
GROUP BY material_source_kind, brain_domain_code
ORDER BY brain_domain_code, min_overall_rank, material_source_kind;

SELECT
  '06_available_srcmat_by_byd2003_before_selector' AS section,
  model_code,
  brain_domain_code,
  count(*) AS available_srcmat_count
FROM aiworker.vw_robot_brain_runtime_material_scoring_base_v1
WHERE model_code = 'BYD2-003'
  AND material_source_kind = 'source_registry'
  AND brain_domain_code IN ('history_worldview','civilization_foundation_history','education_learning','exam_learning')
GROUP BY model_code, brain_domain_code
ORDER BY brain_domain_code;

SELECT
  '07_available_lane05_by_hd_r5p_before_selector' AS section,
  model_code,
  brain_domain_code,
  count(*) AS available_lane05_count
FROM aiworker.vw_robot_brain_runtime_material_scoring_base_v1
WHERE model_code = 'HD-R5P'
  AND material_source_kind = 'lane05_fillup'
  AND brain_domain_code IN ('business_operation','civilization_foundation_history','robot_aiworker')
GROUP BY model_code, brain_domain_code
ORDER BY brain_domain_code;

SELECT
  '08_selection_preview_byd2003' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  material_source_kind,
  selection_score,
  domain_rank,
  overall_rank,
  left(unit_title_ja, 90) AS title_preview
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'BYD2-003',
  'review',
  ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
  20,
  80
)
ORDER BY overall_rank
LIMIT 100;

SELECT
  '09_selection_preview_hd_r5p' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  material_source_kind,
  selection_score,
  domain_rank,
  overall_rank,
  left(unit_title_ja, 90) AS title_preview
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'HD-R5P',
  'executive_planning',
  ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[],
  20,
  80
)
ORDER BY overall_rank
LIMIT 100;
