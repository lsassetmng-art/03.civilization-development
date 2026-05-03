\pset pager off
BEGIN;

CREATE TABLE IF NOT EXISTS business.aicm_user_company_department_task_ledger (
  aicm_user_company_department_task_ledger_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_civilization_id uuid NOT NULL,
  aicm_user_company_id uuid NOT NULL,
  aicm_user_company_department_id uuid NOT NULL,
  aicm_user_company_section_id uuid NULL,

  deliverable_name text NOT NULL,
  task_name text NOT NULL,
  work_type_code text NOT NULL DEFAULT 'design',
  responsible_role_code text NOT NULL DEFAULT 'Manager',
  responsible_robot_label text NOT NULL DEFAULT '',
  task_status_code text NOT NULL DEFAULT 'todo',
  priority_code text NOT NULL DEFAULT 'normal',
  due_date date NULL,

  reference_files_text text NOT NULL DEFAULT '',
  supplemental_materials_text text NOT NULL DEFAULT '',
  applicable_rules_text text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  handoff_link text NOT NULL DEFAULT '',

  display_order integer NOT NULL DEFAULT 100,
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_task_ledger_owner_company
  ON business.aicm_user_company_department_task_ledger(owner_civilization_id, aicm_user_company_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_task_ledger_department
  ON business.aicm_user_company_department_task_ledger(owner_civilization_id, aicm_user_company_department_id);

CREATE INDEX IF NOT EXISTS idx_aicm_user_company_task_ledger_status
  ON business.aicm_user_company_department_task_ledger(owner_civilization_id, task_status_code, priority_code);

CREATE OR REPLACE VIEW business.vw_aicm_user_company_department_task_ledger_display AS
SELECT
  l.aicm_user_company_department_task_ledger_id,
  l.owner_civilization_id,
  l.aicm_user_company_id,
  c.company_name,
  c.business_domain,
  l.aicm_user_company_department_id,
  d.department_name,
  l.aicm_user_company_section_id,
  s.section_name,
  l.deliverable_name,
  l.task_name,
  l.work_type_code,
  l.responsible_role_code,
  l.responsible_robot_label,
  l.task_status_code,
  l.priority_code,
  l.due_date,
  l.reference_files_text,
  l.supplemental_materials_text,
  l.applicable_rules_text,
  l.note,
  l.handoff_link,
  l.display_order,
  l.metadata_jsonb,
  l.created_at,
  l.updated_at
FROM business.aicm_user_company_department_task_ledger l
LEFT JOIN business.aicm_user_company c
  ON c.aicm_user_company_id = l.aicm_user_company_id
LEFT JOIN business.aicm_user_company_department d
  ON d.aicm_user_company_department_id = l.aicm_user_company_department_id
LEFT JOIN business.aicm_user_company_section s
  ON s.aicm_user_company_section_id = l.aicm_user_company_section_id;

COMMIT;

SELECT
  'business.aicm_user_company_department_task_ledger' AS object_name,
  to_regclass('business.aicm_user_company_department_task_ledger') IS NOT NULL AS exists_flag
UNION ALL
SELECT
  'business.vw_aicm_user_company_department_task_ledger_display' AS object_name,
  to_regclass('business.vw_aicm_user_company_department_task_ledger_display') IS NOT NULL AS exists_flag;
