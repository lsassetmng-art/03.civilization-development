\set ON_ERROR_STOP on

SELECT
  '01_failed_checks' AS section,
  check_code,
  result,
  note
FROM (
  WITH checks AS (
    SELECT
      'selection_policy_table_exists' AS check_code,
      CASE WHEN to_regclass('aiworker.brain_runtime_selection_policy_catalog') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS result,
      'selection policy table exists' AS note

    UNION ALL
    SELECT
      'scoring_base_view_exists',
      CASE WHEN to_regclass('aiworker.vw_robot_brain_runtime_material_scoring_base_v1') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END,
      'scoring base view exists'

    UNION ALL
    SELECT
      'selection_function_exists',
      CASE WHEN to_regprocedure('aiworker.fn_robot_brain_runtime_material_select_v1(text,text,text[],integer,integer)') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END,
      'selection function exists'

    UNION ALL
    SELECT
      'smoke_board_exists',
      CASE WHEN to_regclass('aiworker.vw_brain_runtime_selection_smoke_board_v1') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END,
      'selection smoke board exists'

    UNION ALL
    SELECT
      'all_smoke_cases_pass',
      CASE WHEN NOT EXISTS (
        SELECT 1
        FROM aiworker.vw_brain_runtime_selection_smoke_board_v1
        WHERE smoke_result_code <> 'PASS'
      ) THEN 'PASS' ELSE 'FAIL' END,
      'all runtime selection smoke cases pass'

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
      ) THEN 'PASS' ELSE 'FAIL' END,
      'selection can include Lane05 fill-up materials'

    UNION ALL
    SELECT
      'selection_has_srcmat',
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
      ) THEN 'PASS' ELSE 'FAIL' END,
      'selection can include source-registry materials'

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
      ) THEN 'PASS' ELSE 'FAIL' END,
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
      ) THEN 'PASS' ELSE 'FAIL' END,
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
      ) THEN 'PASS' ELSE 'FAIL' END,
      'domain rank limit is enforced'
  )
  SELECT * FROM checks
) x
WHERE result = 'FAIL'
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
  selected_domains,
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
  '04_source_kind_counts_byd2003_review' AS section,
  material_source_kind,
  count(*) AS selected_count
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'BYD2-003',
  'review',
  ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
  20,
  80
)
GROUP BY material_source_kind
ORDER BY selected_count DESC, material_source_kind;

SELECT
  '05_lane05_counts_hd_r5p' AS section,
  material_source_kind,
  brain_domain_code,
  count(*) AS selected_count
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'HD-R5P',
  'executive_planning',
  ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[],
  20,
  80
)
GROUP BY material_source_kind, brain_domain_code
ORDER BY brain_domain_code, material_source_kind;

SELECT
  '06_forbidden_probe_hd_r1c' AS section,
  brain_domain_code,
  count(*) AS selected_count
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'HD-R1C',
  'smalltalk',
  ARRAY['culture_region','food_nutrition','hobby_entertainment','season_calendar']::text[],
  20,
  80
)
GROUP BY brain_domain_code
ORDER BY brain_domain_code;

SELECT
  '07_forbidden_probe_hd_r2' AS section,
  brain_domain_code,
  count(*) AS selected_count
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'HD-R2',
  'risk_check',
  ARRAY['security_crisis','robot_aiworker','city_art_game']::text[],
  20,
  80
)
GROUP BY brain_domain_code
ORDER BY brain_domain_code;

SELECT
  '08_selection_preview_failed_related' AS section,
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
LIMIT 80;
