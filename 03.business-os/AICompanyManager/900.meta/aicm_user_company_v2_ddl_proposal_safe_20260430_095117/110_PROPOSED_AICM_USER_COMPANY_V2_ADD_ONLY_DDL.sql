-- ============================================================
-- AICompanyManager user-company v2 add-only DDL proposal
-- DO NOT APPLY WITHOUT SATO(DB REVIEW)
--
-- Purpose:
--   Separate BusinessOS user/CivilizationID ownership from
--   AICompanyManager app-registered company hierarchy.
--
-- DB_ENV:
--   PERSONA_DATABASE_URL
--
-- Add-only:
--   No DROP
--   No DELETE
--   No destructive ALTER
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. User-owned AICompanyManager company
-- ============================================================

CREATE TABLE IF NOT EXISTS business.aicm_user_company (
  aicm_user_company_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_civilization_id uuid NOT NULL,

  company_name text NOT NULL,
  business_domain text NOT NULL DEFAULT '',
  company_status text NOT NULL DEFAULT 'active',

  company_common_rules_text text NOT NULL DEFAULT '',
  president_policy_instruction_text text NOT NULL DEFAULT '',

  selected_flag boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 100,

  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT aicm_user_company_status_chk
    CHECK (company_status IN ('active', 'inactive', 'archived')),

  CONSTRAINT aicm_user_company_name_not_blank_chk
    CHECK (length(trim(company_name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_owner
  ON business.aicm_user_company(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_owner_status
  ON business.aicm_user_company(owner_civilization_id, company_status);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_owner_selected
  ON business.aicm_user_company(owner_civilization_id, selected_flag)
  WHERE selected_flag = true;

COMMENT ON TABLE business.aicm_user_company IS
'AICompanyManager user-owned app company. Not ERP company master. Ownership root is owner_civilization_id.';

-- ============================================================
-- 2. Department
-- ============================================================

CREATE TABLE IF NOT EXISTS business.aicm_user_company_department (
  aicm_user_company_department_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_civilization_id uuid NOT NULL,

  aicm_user_company_id uuid NOT NULL
    REFERENCES business.aicm_user_company(aicm_user_company_id)
    ON DELETE RESTRICT,

  department_name text NOT NULL,
  purpose text NOT NULL DEFAULT '',
  department_status text NOT NULL DEFAULT 'active',
  display_order integer NOT NULL DEFAULT 100,

  manager_robot_pool_id uuid NULL,
  manager_aiworker_model_code text NOT NULL DEFAULT '',
  manager_internal_nickname text NOT NULL DEFAULT '',

  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT aicm_user_company_department_status_chk
    CHECK (department_status IN ('active', 'inactive', 'archived')),

  CONSTRAINT aicm_user_company_department_name_not_blank_chk
    CHECK (length(trim(department_name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_department_owner
  ON business.aicm_user_company_department(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_department_company
  ON business.aicm_user_company_department(aicm_user_company_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_department_company_status
  ON business.aicm_user_company_department(aicm_user_company_id, department_status);

COMMENT ON TABLE business.aicm_user_company_department IS
'Department under AICompanyManager user-owned company.';

-- ============================================================
-- 3. Section / 課
-- ============================================================

CREATE TABLE IF NOT EXISTS business.aicm_user_company_section (
  aicm_user_company_section_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_civilization_id uuid NOT NULL,

  aicm_user_company_id uuid NOT NULL
    REFERENCES business.aicm_user_company(aicm_user_company_id)
    ON DELETE RESTRICT,

  aicm_user_company_department_id uuid NOT NULL
    REFERENCES business.aicm_user_company_department(aicm_user_company_department_id)
    ON DELETE RESTRICT,

  parent_section_id uuid NULL,

  section_name text NOT NULL,
  purpose text NOT NULL DEFAULT '',
  section_status text NOT NULL DEFAULT 'active',
  display_order integer NOT NULL DEFAULT 100,

  leader_robot_pool_id uuid NULL,
  leader_aiworker_model_code text NOT NULL DEFAULT '',
  leader_internal_nickname text NOT NULL DEFAULT '',

  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT aicm_user_company_section_status_chk
    CHECK (section_status IN ('active', 'inactive', 'archived')),

  CONSTRAINT aicm_user_company_section_name_not_blank_chk
    CHECK (length(trim(section_name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_section_owner
  ON business.aicm_user_company_section(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_section_company
  ON business.aicm_user_company_section(aicm_user_company_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_section_department
  ON business.aicm_user_company_section(aicm_user_company_department_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_section_parent
  ON business.aicm_user_company_section(parent_section_id);

COMMENT ON TABLE business.aicm_user_company_section IS
'Section under AICompanyManager department. User-facing label is 課.';

-- ============================================================
-- 4. Worker placement
-- ============================================================

CREATE TABLE IF NOT EXISTS business.aicm_user_company_worker_placement (
  aicm_user_company_worker_placement_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_civilization_id uuid NOT NULL,

  aicm_user_company_id uuid NOT NULL
    REFERENCES business.aicm_user_company(aicm_user_company_id)
    ON DELETE RESTRICT,

  aicm_user_company_department_id uuid NULL
    REFERENCES business.aicm_user_company_department(aicm_user_company_department_id)
    ON DELETE RESTRICT,

  aicm_user_company_section_id uuid NULL
    REFERENCES business.aicm_user_company_section(aicm_user_company_section_id)
    ON DELETE RESTRICT,

  target_level_code text NOT NULL,
  target_id uuid NULL,

  app_code text NOT NULL DEFAULT 'AICompanyManager',

  role_code text NOT NULL,
  robot_pool_id uuid NULL,
  aiworker_model_code text NOT NULL,
  internal_nickname text NOT NULL DEFAULT '',

  placement_quantity integer NOT NULL DEFAULT 1,
  placement_mode_code text NOT NULL DEFAULT 'unlimited_system_use',
  status_code text NOT NULL DEFAULT 'active',

  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT aicm_user_company_worker_target_level_chk
    CHECK (target_level_code IN ('company', 'department', 'section')),

  CONSTRAINT aicm_user_company_worker_role_chk
    CHECK (role_code IN ('President', 'Manager', 'Leader', 'Worker', 'Helper', 'Advisor', 'Specialist')),

  CONSTRAINT aicm_user_company_worker_status_chk
    CHECK (status_code IN ('active', 'inactive', 'archived')),

  CONSTRAINT aicm_user_company_worker_quantity_chk
    CHECK (placement_quantity > 0),

  CONSTRAINT aicm_user_company_worker_model_not_blank_chk
    CHECK (length(trim(aiworker_model_code)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_worker_owner
  ON business.aicm_user_company_worker_placement(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_worker_company
  ON business.aicm_user_company_worker_placement(aicm_user_company_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_worker_department
  ON business.aicm_user_company_worker_placement(aicm_user_company_department_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_worker_section
  ON business.aicm_user_company_worker_placement(aicm_user_company_section_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_worker_target
  ON business.aicm_user_company_worker_placement(target_level_code, target_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_worker_role
  ON business.aicm_user_company_worker_placement(role_code, status_code);

COMMENT ON TABLE business.aicm_user_company_worker_placement IS
'AICompanyManager worker/robot placement under user-owned company hierarchy. Does not represent robot ownership.';

-- ============================================================
-- 5. Worker placement event
-- ============================================================

CREATE TABLE IF NOT EXISTS business.aicm_user_company_worker_placement_event (
  aicm_user_company_worker_placement_event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_civilization_id uuid NOT NULL,
  aicm_user_company_id uuid NOT NULL,

  aicm_user_company_worker_placement_id uuid NULL
    REFERENCES business.aicm_user_company_worker_placement(aicm_user_company_worker_placement_id)
    ON DELETE RESTRICT,

  event_type_code text NOT NULL,
  event_note text NOT NULL DEFAULT '',

  before_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  after_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,

  actor_type_code text NOT NULL DEFAULT 'system',
  actor_id text NOT NULL DEFAULT '',

  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT aicm_user_company_worker_event_type_chk
    CHECK (event_type_code IN ('created', 'updated', 'status_changed', 'archived', 'restored')),

  CONSTRAINT aicm_user_company_worker_event_actor_type_chk
    CHECK (actor_type_code IN ('user', 'system', 'aiworker', 'api'))
);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_worker_event_owner
  ON business.aicm_user_company_worker_placement_event(owner_civilization_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_worker_event_company
  ON business.aicm_user_company_worker_placement_event(aicm_user_company_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_worker_event_placement
  ON business.aicm_user_company_worker_placement_event(aicm_user_company_worker_placement_id);

COMMENT ON TABLE business.aicm_user_company_worker_placement_event IS
'Audit/event table for AICompanyManager user-company worker placement.';

-- ============================================================
-- 6. Display views
-- ============================================================

CREATE OR REPLACE VIEW business.vw_aicm_user_company_tree AS
SELECT
  c.owner_civilization_id,
  c.aicm_user_company_id,
  c.company_name,
  c.business_domain,
  c.company_status,
  d.aicm_user_company_department_id,
  d.department_name,
  d.department_status,
  s.aicm_user_company_section_id,
  s.section_name,
  s.section_status
FROM business.aicm_user_company c
LEFT JOIN business.aicm_user_company_department d
  ON d.aicm_user_company_id = c.aicm_user_company_id
LEFT JOIN business.aicm_user_company_section s
  ON s.aicm_user_company_department_id = d.aicm_user_company_department_id;

CREATE OR REPLACE VIEW business.vw_aicm_user_company_worker_placement_display AS
SELECT
  p.owner_civilization_id,
  p.aicm_user_company_id,
  c.company_name,
  p.aicm_user_company_department_id,
  d.department_name,
  p.aicm_user_company_section_id,
  s.section_name,
  p.aicm_user_company_worker_placement_id,
  p.target_level_code,
  p.target_id,
  p.app_code,
  p.role_code,
  p.robot_pool_id,
  p.aiworker_model_code,
  p.internal_nickname,
  CASE
    WHEN length(trim(p.internal_nickname)) > 0 THEN p.internal_nickname || '@' || p.role_code
    ELSE p.aiworker_model_code || '@' || p.role_code
  END AS display_label,
  p.placement_quantity,
  p.placement_mode_code,
  p.status_code,
  p.created_at,
  p.updated_at
FROM business.aicm_user_company_worker_placement p
JOIN business.aicm_user_company c
  ON c.aicm_user_company_id = p.aicm_user_company_id
LEFT JOIN business.aicm_user_company_department d
  ON d.aicm_user_company_department_id = p.aicm_user_company_department_id
LEFT JOIN business.aicm_user_company_section s
  ON s.aicm_user_company_section_id = p.aicm_user_company_section_id;
