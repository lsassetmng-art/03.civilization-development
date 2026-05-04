\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 0. Guard
-- ============================================================

DO $$
BEGIN
  IF to_regclass('cx22073jw.vw_brain_data_registry_v1') IS NULL THEN
    RAISE EXCEPTION 'Required view missing: cx22073jw.vw_brain_data_registry_v1';
  END IF;

  IF to_regclass('aiworker.vw_robot_readable_brain_source_registry_v1') IS NULL THEN
    RAISE EXCEPTION 'Required view missing: aiworker.vw_robot_readable_brain_source_registry_v1';
  END IF;

  IF to_regclass('cx22073jw.vw_brain_knowledge_unit_runtime_material_v1') IS NULL THEN
    RAISE EXCEPTION 'Required view missing: cx22073jw.vw_brain_knowledge_unit_runtime_material_v1';
  END IF;
END $$;

-- ============================================================
-- 1. Runtime material adapter
-- Same column contract as existing material view.
-- Includes:
-- - brain_knowledge_unit materials
-- - source_registry materials from srcobj:/srcrow: and other existing CX source registry rows
-- ============================================================

CREATE OR REPLACE VIEW aiworker.vw_robot_readable_brain_runtime_material_v1 AS
SELECT
  a.profile_source_type,
  a.model_code,
  a.series_code,
  a.role_code,
  a.brain_data_code,
  a.brain_domain_code,
  a.brain_domain_label_ja,
  a.depth_code,
  a.data_depth_level,
  a.risk_class_code,
  a.granularity_code,
  a.effective_use_purpose_codes,
  a.access_decision_code,
  a.source_exists_flag,
  u.unit_code,
  u.unit_title_ja,
  u.unit_summary_ja,
  u.unit_detail_ja,
  u.practical_use_ja,
  u.example_prompt_ja,
  u.safety_boundary_ja,
  u.tags
FROM aiworker.vw_robot_readable_brain_source_registry_v1 a
JOIN cx22073jw.vw_brain_knowledge_unit_runtime_material_v1 u
  ON a.source_schema_name = 'cx22073jw'
 AND a.source_object_name = 'brain_knowledge_unit'
 AND a.source_record_code = u.unit_code

UNION ALL

SELECT
  a.profile_source_type,
  a.model_code,
  a.series_code,
  a.role_code,
  a.brain_data_code,
  a.brain_domain_code,
  a.brain_domain_label_ja,
  a.depth_code,
  a.data_depth_level,
  a.risk_class_code,
  a.granularity_code,
  a.effective_use_purpose_codes,
  a.access_decision_code,
  a.source_exists_flag,
  'srcmat_' || lower(regexp_replace(a.brain_data_code, '[^a-zA-Z0-9]+', '_', 'g')) AS unit_code,
  COALESCE(r.source_title_ja, 'CX source: ' || a.source_object_name) AS unit_title_ja,
  left(
    'CX source registry material. domain=' || a.brain_domain_code
    || ' / source=' || a.source_schema_name || '.' || a.source_object_name
    || ' / record=' || COALESCE(a.source_record_code, '-'),
    500
  ) AS unit_summary_ja,
  left(
    'このmaterialは既存CX sourceをbrain_data_registry経由でruntime material化したもの。'
    || ' brain_data_code=' || a.brain_data_code
    || ' / domain=' || a.brain_domain_code
    || ' / depth=' || a.depth_code
    || ' / risk=' || a.risk_class_code
    || ' / source=' || a.source_schema_name || '.' || a.source_object_name
    || ' / source_record=' || COALESCE(a.source_record_code, '-')
    || ' / allowed_purpose=' || array_to_string(a.effective_use_purpose_codes, ','),
    2000
  ) AS unit_detail_ja,
  left(
    'AIWorkerOSの読取制御後、既存CX sourceを参照材料・レビュー材料・世界観材料として安全境界つきで使う。',
    500
  ) AS practical_use_ja,
  'このCX source materialを安全境界に従って参照材料として要約して。' AS example_prompt_ja,
  COALESCE(r.safety_boundary_ja, 'CX source registry material. AIWorkerOSの読取制御と用途制限に従って扱う。') AS safety_boundary_ja,
  ARRAY[
    'source_registry_material',
    a.source_schema_name,
    a.source_object_name,
    a.brain_domain_code,
    a.risk_class_code
  ]::text[] AS tags
FROM aiworker.vw_robot_readable_brain_source_registry_v1 a
JOIN cx22073jw.vw_brain_data_registry_v1 r
  ON r.brain_data_code = a.brain_data_code
WHERE a.source_exists_flag = true
  AND NOT (
    a.source_schema_name = 'cx22073jw'
    AND a.source_object_name = 'brain_knowledge_unit'
  );

-- ============================================================
-- 2. Backward-compatible legacy material view
-- Existing runtime provider can keep reading this view.
-- Column order is unchanged.
-- ============================================================

CREATE OR REPLACE VIEW aiworker.vw_robot_readable_brain_knowledge_material_v1 AS
SELECT
  profile_source_type,
  model_code,
  series_code,
  role_code,
  brain_data_code,
  brain_domain_code,
  brain_domain_label_ja,
  depth_code,
  data_depth_level,
  risk_class_code,
  granularity_code,
  effective_use_purpose_codes,
  access_decision_code,
  source_exists_flag,
  unit_code,
  unit_title_ja,
  unit_summary_ja,
  unit_detail_ja,
  practical_use_ja,
  example_prompt_ja,
  safety_boundary_ja,
  tags
FROM aiworker.vw_robot_readable_brain_runtime_material_v1;

-- ============================================================
-- 3. Runtime material adapter coverage view
-- ============================================================

CREATE OR REPLACE VIEW aiworker.vw_robot_readable_brain_runtime_material_coverage_v1 AS
SELECT
  model_code,
  role_code,
  brain_domain_code,
  brain_domain_label_ja,
  count(*) AS runtime_material_count,
  count(*) FILTER (WHERE unit_code LIKE 'pack%') AS pack_material_count,
  count(*) FILTER (WHERE unit_code LIKE 'srcmat_%') AS source_registry_material_count,
  count(DISTINCT source_exists_flag) AS source_exists_flag_kind_count,
  string_agg(DISTINCT risk_class_code, ', ' ORDER BY risk_class_code) AS risk_classes,
  string_agg(DISTINCT depth_code, ', ' ORDER BY depth_code) AS depths
FROM aiworker.vw_robot_readable_brain_runtime_material_v1
GROUP BY model_code, role_code, brain_domain_code, brain_domain_label_ja;

COMMIT;
