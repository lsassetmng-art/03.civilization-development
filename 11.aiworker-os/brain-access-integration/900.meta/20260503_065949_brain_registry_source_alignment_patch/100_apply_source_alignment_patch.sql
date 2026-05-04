\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- Determine best existing AIWorker source objects.
-- We avoid AICM entirely.
-- ============================================================

WITH selected AS (
  SELECT
    CASE
      WHEN to_regclass('aiworker.robot_series_catalog') IS NOT NULL THEN 'robot_series_catalog'
      WHEN to_regclass('aiworker.robot_brain_series_profile') IS NOT NULL THEN 'robot_brain_series_profile'
      ELSE NULL
    END AS series_object_name,
    CASE
      WHEN to_regclass('aiworker.robot_model_catalog') IS NOT NULL THEN 'robot_model_catalog'
      WHEN to_regclass('aiworker.robot_brain_model_profile') IS NOT NULL THEN 'robot_brain_model_profile'
      ELSE NULL
    END AS model_object_name
),
series_update AS (
  UPDATE cx22073jw.brain_data_registry r
  SET
    source_schema_name = 'aiworker',
    source_object_name = selected.series_object_name,
    source_record_code = NULL,
    source_title_ja = 'AIWorkerシリーズ参照',
    updated_at = now()
  FROM selected
  WHERE r.brain_data_code = 'robot_aiworker_series_reference'
    AND selected.series_object_name IS NOT NULL
  RETURNING r.brain_data_code, r.source_schema_name, r.source_object_name
),
model_update AS (
  UPDATE cx22073jw.brain_data_registry r
  SET
    source_schema_name = 'aiworker',
    source_object_name = selected.model_object_name,
    source_record_code = NULL,
    source_title_ja = 'AIWorker機種参照',
    updated_at = now()
  FROM selected
  WHERE r.brain_data_code = 'robot_aiworker_model_reference'
    AND selected.model_object_name IS NOT NULL
  RETURNING r.brain_data_code, r.source_schema_name, r.source_object_name
)
SELECT
  'SOURCE_ALIGNMENT_APPLIED' AS result,
  (SELECT count(*) FROM series_update) AS series_update_count,
  (SELECT count(*) FROM model_update) AS model_update_count,
  (SELECT series_object_name FROM selected) AS selected_series_object,
  (SELECT model_object_name FROM selected) AS selected_model_object;

COMMIT;
