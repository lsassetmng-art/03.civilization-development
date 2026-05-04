\set ON_ERROR_STOP on

SELECT
  'selector_function_exists' AS check_code,
  CASE
    WHEN to_regprocedure('aiworker.fn_robot_brain_runtime_material_select_v1(text,text,text[],integer,integer)') IS NOT NULL
    THEN 'PASS'
    ELSE 'FAIL'
  END AS result,
  'Lane06 selector function exists' AS note;

SELECT
  'selector_smoke_count' AS check_code,
  count(*) AS selected_count
FROM aiworker.fn_robot_brain_runtime_material_select_v1(
  'BYD2-003',
  'review',
  ARRAY['history_worldview','civilization_foundation_history','education_learning','exam_learning']::text[],
  8,
  56
);

SELECT
  'selector_source_kind_smoke' AS section,
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
ORDER BY material_source_kind;
