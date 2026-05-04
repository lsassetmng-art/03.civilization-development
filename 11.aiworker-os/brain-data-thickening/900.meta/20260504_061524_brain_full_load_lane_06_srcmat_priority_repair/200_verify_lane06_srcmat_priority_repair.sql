\set ON_ERROR_STOP on

SELECT
  '01_srcmat_selection_count' AS section,
  count(*) AS srcmat_selected_count
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'BYD2-003',
  'review',
  ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
  20,
  80
)
WHERE unit_code LIKE 'srcmat_%';

SELECT
  '02_lane05_selection_count' AS section,
  count(*) AS lane05_selected_count
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'HD-R5P',
  'executive_planning',
  ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[],
  20,
  80
)
WHERE unit_code LIKE 'lane05_%';

SELECT
  '03_source_kind_counts_byd2003_review' AS section,
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
  '04_smoke_board' AS section,
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
  '05_selection_preview_srcmat' AS section,
  model_code,
  brain_domain_code,
  unit_code,
  material_source_kind,
  selection_score,
  domain_rank,
  overall_rank,
  left(unit_title_ja, 100) AS title_preview
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'BYD2-003',
  'review',
  ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
  20,
  80
)
WHERE unit_code LIKE 'srcmat_%'
ORDER BY overall_rank
LIMIT 40;

WITH checks AS (
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

  UNION ALL
  SELECT
    'selection_function_exists',
    CASE WHEN to_regprocedure('aiworker.fn_robot_brain_runtime_material_select_v1(text,text,text[],integer,integer)') IS NOT NULL THEN 1 ELSE 0 END,
    'selection function exists'

  UNION ALL
  SELECT
    'scoring_base_view_exists',
    CASE WHEN to_regclass('aiworker.vw_robot_brain_runtime_material_scoring_base_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'scoring base view exists'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN EXISTS (
    SELECT 1
    FROM aiworker.fn_robot_brain_runtime_material_select_v1(
      'BYD2-003',
      'review',
      ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
      20,
      80
    )
    WHERE unit_code LIKE 'srcmat_%'
  ) THEN 1 ELSE 0 END AS pass_flag

  UNION ALL
  SELECT CASE WHEN EXISTS (
    SELECT 1
    FROM aiworker.fn_robot_brain_runtime_material_select_v1(
      'HD-R5P',
      'executive_planning',
      ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[],
      20,
      80
    )
    WHERE unit_code LIKE 'lane05_%'
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1
    FROM aiworker.vw_brain_runtime_selection_smoke_board_v1
    WHERE smoke_result_code <> 'PASS'
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1
    FROM aiworker.fn_robot_brain_runtime_material_select_v1(
      'HD-R1C',
      'smalltalk',
      ARRAY['culture_region','food_nutrition','hobby_entertainment','season_calendar']::text[],
      20,
      80
    )
    WHERE brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1
    FROM aiworker.fn_robot_brain_runtime_material_select_v1(
      'HD-R2',
      'risk_check',
      ARRAY['security_crisis','robot_aiworker','city_art_game']::text[],
      20,
      80
    )
    WHERE brain_domain_code IN ('business_operation','professional_basic')
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1
    FROM aiworker.fn_robot_brain_runtime_material_select_v1(
      'BYD2-003',
      'review',
      ARRAY['business_operation','professional_basic','robot_aiworker']::text[],
      5,
      30
    )
    WHERE domain_rank > 5
  ) THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN to_regprocedure('aiworker.fn_robot_brain_runtime_material_select_v1(text,text,text[],integer,integer)') IS NOT NULL THEN 1 ELSE 0 END

  UNION ALL
  SELECT CASE WHEN to_regclass('aiworker.vw_robot_brain_runtime_material_scoring_base_v1') IS NOT NULL THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;
