\set ON_ERROR_STOP on

WITH checks AS (
  SELECT
    'selector_function_exists' AS check_code,
    CASE WHEN to_regprocedure('aiworker.fn_robot_brain_runtime_material_select_v1(text,text,text[],integer,integer)') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag,
    'AIWorker runtime selector function exists' AS note

  UNION ALL
  SELECT
    'runtime_material_view_exists',
    CASE WHEN to_regclass('aiworker.vw_robot_readable_brain_runtime_material_v1') IS NOT NULL THEN 1 ELSE 0 END,
    'Runtime material adapter view exists'

  UNION ALL
  SELECT
    'selection_smoke_board_pass',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM aiworker.vw_brain_runtime_selection_smoke_board_v1
      WHERE smoke_result_code <> 'PASS'
    ) THEN 1 ELSE 0 END,
    'Runtime selector smoke board has no failing cases'

  UNION ALL
  SELECT
    'selector_has_srcmat',
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
    ) THEN 1 ELSE 0 END,
    'Selector can return srcmat_ source registry materials'

  UNION ALL
  SELECT
    'selector_has_lane05',
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
    'Selector can return lane05_ fill-up materials'

  UNION ALL
  SELECT
    'selector_has_pack05',
    CASE WHEN EXISTS (
      SELECT 1
      FROM aiworker.fn_robot_brain_runtime_material_select_v1(
        'HD-R5P',
        'executive_planning',
        ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[],
        20,
        80
      )
      WHERE unit_code LIKE 'pack05_%'
    ) THEN 1 ELSE 0 END,
    'Selector can return pack05_ full-load materials'

  UNION ALL
  SELECT
    'hd_r1c_forbidden_zero',
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
    'hd_r2_business_professional_zero',
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
    'all_full_load_domains_meet_target',
    CASE WHEN NOT EXISTS (
      SELECT 1
      FROM cx22073jw.vw_brain_full_load_coverage_v1
      WHERE active_unit_count < target_min_unit_count
    ) THEN 1 ELSE 0 END,
    'All full-load domains meet target_min_unit_count'
)
SELECT
  check_code,
  CASE WHEN pass_flag = 1 THEN 'PASS' ELSE 'FAIL' END AS result,
  note
FROM checks
ORDER BY check_code;

WITH checks AS (
  SELECT CASE WHEN to_regprocedure('aiworker.fn_robot_brain_runtime_material_select_v1(text,text,text[],integer,integer)') IS NOT NULL THEN 1 ELSE 0 END AS pass_flag
  UNION ALL SELECT CASE WHEN to_regclass('aiworker.vw_robot_readable_brain_runtime_material_v1') IS NOT NULL THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM aiworker.vw_brain_runtime_selection_smoke_board_v1 WHERE smoke_result_code <> 'PASS') THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('BYD2-003','review',ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],20,80)
    WHERE unit_code LIKE 'srcmat_%'
  ) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('HD-R5P','executive_planning',ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[],20,80)
    WHERE unit_code LIKE 'lane05_%'
  ) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN EXISTS (
    SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('HD-R5P','executive_planning',ARRAY['business_operation','civilization_foundation_history','robot_aiworker']::text[],20,80)
    WHERE unit_code LIKE 'pack05_%'
  ) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('HD-R1C','smalltalk',ARRAY['culture_region','food_nutrition','hobby_entertainment','season_calendar']::text[],20,80)
    WHERE brain_domain_code IN ('business_operation','professional_basic','security_crisis','civilization_foundation_history','health_life_metrics','exam_learning')
  ) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM aiworker.fn_robot_brain_runtime_material_select_v1('HD-R2','risk_check',ARRAY['security_crisis','robot_aiworker','city_art_game']::text[],20,80)
    WHERE brain_domain_code IN ('business_operation','professional_basic')
  ) THEN 1 ELSE 0 END
  UNION ALL SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM cx22073jw.vw_brain_full_load_coverage_v1
    WHERE active_unit_count < target_min_unit_count
  ) THEN 1 ELSE 0 END
)
SELECT
  'SUMMARY' AS section,
  count(*) FILTER (WHERE pass_flag = 1) AS pass_count,
  count(*) FILTER (WHERE pass_flag <> 1) AS fail_count
FROM checks;
