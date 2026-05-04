-- ============================================================
-- BusinessOS AIWorker screen filter
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Change type: add-only / replace function and view only
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

DO $$
BEGIN
  IF to_regclass('business.company_robot_placement') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.company_robot_placement';
  END IF;

  IF to_regclass('business.robot_pool') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.robot_pool';
  END IF;
END $$;

-- Keep/rebuild display view with stable column order.
CREATE OR REPLACE VIEW business.vw_aicm_company_robot_assignment_display AS
SELECT
  p.company_robot_placement_id,
  p.company_id,
  p.target_level_code,
  p.target_id,
  p.app_code,
  p.role_code,
  p.internal_nickname,
  p.internal_nickname || '@' || p.role_code AS display_label,
  p.aiworker_model_code,
  COALESCE(rp.display_name, p.aiworker_model_code) AS model_display_name,
  COALESCE(rp.display_name, p.aiworker_model_code) || ' / ' || p.aiworker_model_code AS selector_label,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  p.placement_quantity,
  p.status_code,
  p.created_at,
  p.updated_at,
  p.metadata_jsonb
FROM business.company_robot_placement p
LEFT JOIN business.robot_pool rp
  ON rp.robot_pool_id = p.robot_pool_id
WHERE p.app_code = 'AICompanyManager';

CREATE OR REPLACE VIEW business.vw_aicm_company_robot_active_assignment_display AS
SELECT *
FROM business.vw_aicm_company_robot_assignment_display
WHERE status_code = 'active';

CREATE OR REPLACE FUNCTION business.fn_aicm_company_robot_placements_filtered(
  p_company_id uuid,
  p_role_code text DEFAULT NULL,
  p_target_level_code text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_status_code text DEFAULT 'active'
)
RETURNS TABLE (
  company_robot_placement_id uuid,
  company_id uuid,
  target_level_code text,
  target_id uuid,
  app_code text,
  role_code text,
  internal_nickname text,
  display_label text,
  aiworker_model_code text,
  model_display_name text,
  selector_label text,
  aiworker_series_code text,
  manufacturer_code text,
  placement_quantity integer,
  status_code text,
  created_at timestamptz,
  updated_at timestamptz,
  metadata_jsonb jsonb
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    v.company_robot_placement_id,
    v.company_id,
    v.target_level_code,
    v.target_id,
    v.app_code,
    v.role_code,
    v.internal_nickname,
    v.display_label,
    v.aiworker_model_code,
    v.model_display_name,
    v.selector_label,
    v.aiworker_series_code,
    v.manufacturer_code,
    v.placement_quantity,
    v.status_code,
    v.created_at,
    v.updated_at,
    v.metadata_jsonb
  FROM business.vw_aicm_company_robot_assignment_display v
  WHERE v.company_id = p_company_id
    AND (
      p_role_code IS NULL
      OR btrim(p_role_code) = ''
      OR v.role_code = btrim(p_role_code)
    )
    AND (
      p_target_level_code IS NULL
      OR btrim(p_target_level_code) = ''
      OR v.target_level_code = btrim(p_target_level_code)
    )
    AND (
      p_target_id IS NULL
      OR v.target_id = p_target_id
    )
    AND (
      p_status_code IS NULL
      OR btrim(p_status_code) = ''
      OR v.status_code = btrim(p_status_code)
    )
  ORDER BY v.updated_at DESC, v.created_at DESC;
$$;

CREATE OR REPLACE VIEW business.vw_aicm_screen_robot_route_definition AS
SELECT *
FROM (
  VALUES
    ('company_settings_president', 'AI企業設定', 'company', 'President', 'HD-R5', '社長AI'),
    ('department_detail_manager', '部門詳細', 'department', 'Manager', 'HD-R4', '部門長AI'),
    ('section_detail_leader', '課詳細', 'section', 'Leader', 'HD-R4', '課長AI'),
    ('section_worker_placement', 'Worker配置', 'section', 'Worker', 'HD-R3', 'ワーカーAI')
) AS t(
  route_code,
  screen_label,
  target_level_code,
  role_code,
  default_model_code,
  default_internal_nickname
);

COMMIT;
