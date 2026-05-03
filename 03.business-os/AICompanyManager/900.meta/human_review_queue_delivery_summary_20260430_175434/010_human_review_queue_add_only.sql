\pset pager off

CREATE TABLE IF NOT EXISTS business.aicm_human_review_item (
  aicm_human_review_item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_civilization_id uuid NOT NULL,
  aicm_user_company_id uuid NOT NULL REFERENCES business.aicm_user_company(aicm_user_company_id),
  aicm_user_company_department_id uuid NULL REFERENCES business.aicm_user_company_department(aicm_user_company_department_id),
  aicm_user_company_section_id uuid NULL REFERENCES business.aicm_user_company_section(aicm_user_company_section_id),

  related_president_policy_id uuid NULL REFERENCES business.aicm_president_policy(aicm_president_policy_id),
  related_manager_major_work_item_id uuid NULL REFERENCES business.aicm_manager_major_work_item(aicm_manager_major_work_item_id),
  related_leader_middle_work_item_id uuid NULL REFERENCES business.aicm_leader_middle_work_item(aicm_leader_middle_work_item_id),
  related_deliverable_requirement_id uuid NULL REFERENCES business.aicm_leader_deliverable_requirement(aicm_leader_deliverable_requirement_id),
  related_worker_work_unit_id uuid NULL REFERENCES business.aicm_worker_work_unit(aicm_worker_work_unit_id),

  review_kind_code text NOT NULL DEFAULT 'delivery_summary',
  artifact_kind_code text NOT NULL DEFAULT 'design_doc',

  review_title text NOT NULL,
  delivery_summary_text text NOT NULL DEFAULT '',
  main_changes_text text NOT NULL DEFAULT '',
  ai_review_result_text text NOT NULL DEFAULT '',
  unresolved_issues_text text NOT NULL DEFAULT '',
  artifact_link text NOT NULL DEFAULT '',

  responsible_ai_label text NOT NULL DEFAULT '',
  requested_by_ai_label text NOT NULL DEFAULT '',

  human_review_status_code text NOT NULL DEFAULT 'pending',
  priority_code text NOT NULL DEFAULT 'normal',
  due_date date NULL,

  human_reviewer_label text NOT NULL DEFAULT '',
  human_review_note text NOT NULL DEFAULT '',
  requested_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz NULL,

  display_order integer NOT NULL DEFAULT 100,
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_aicm_human_review_title_not_blank CHECK (btrim(review_title) <> ''),
  CONSTRAINT chk_aicm_human_review_kind CHECK (
    review_kind_code IN (
      'design_delivery_summary',
      'implementation_delivery_summary',
      'exception_review',
      'final_delivery_summary',
      'delivery_summary'
    )
  ),
  CONSTRAINT chk_aicm_human_review_artifact_kind CHECK (
    artifact_kind_code IN (
      'design_doc',
      'implementation',
      'exception',
      'delivery_package',
      'handoff'
    )
  ),
  CONSTRAINT chk_aicm_human_review_status CHECK (
    human_review_status_code IN (
      'pending',
      'approved',
      'returned',
      'archived'
    )
  ),
  CONSTRAINT chk_aicm_human_review_priority CHECK (
    priority_code IN ('low', 'normal', 'high', 'urgent')
  )
);

CREATE INDEX IF NOT EXISTS idx_aicm_human_review_owner_company_status
  ON business.aicm_human_review_item(owner_civilization_id, aicm_user_company_id, human_review_status_code);

CREATE INDEX IF NOT EXISTS idx_aicm_human_review_department_section
  ON business.aicm_human_review_item(aicm_user_company_department_id, aicm_user_company_section_id);

CREATE INDEX IF NOT EXISTS idx_aicm_human_review_related_work_unit
  ON business.aicm_human_review_item(related_worker_work_unit_id);

CREATE OR REPLACE VIEW business.vw_aicm_human_review_wait_display AS
SELECT
  r.aicm_human_review_item_id,
  r.owner_civilization_id,
  r.aicm_user_company_id,
  c.company_name,
  r.aicm_user_company_department_id,
  d.department_name,
  r.aicm_user_company_section_id,
  s.section_name,

  r.related_president_policy_id,
  r.related_manager_major_work_item_id,
  r.related_leader_middle_work_item_id,
  r.related_deliverable_requirement_id,
  r.related_worker_work_unit_id,

  r.review_kind_code,
  CASE r.review_kind_code
    WHEN 'design_delivery_summary' THEN '設計書 納品サマリー'
    WHEN 'implementation_delivery_summary' THEN '実装 納品サマリー'
    WHEN 'exception_review' THEN '例外・人間判断'
    WHEN 'final_delivery_summary' THEN '最終納品サマリー'
    ELSE '納品サマリー'
  END AS review_kind_label,

  r.artifact_kind_code,
  CASE r.artifact_kind_code
    WHEN 'design_doc' THEN '設計書'
    WHEN 'implementation' THEN '実装'
    WHEN 'exception' THEN '例外'
    WHEN 'delivery_package' THEN '納品'
    WHEN 'handoff' THEN '引き継ぎ'
    ELSE r.artifact_kind_code
  END AS artifact_kind_label,

  r.review_title,
  r.delivery_summary_text,
  r.main_changes_text,
  r.ai_review_result_text,
  r.unresolved_issues_text,
  r.artifact_link,
  r.responsible_ai_label,
  r.requested_by_ai_label,
  r.human_review_status_code,
  CASE r.human_review_status_code
    WHEN 'pending' THEN '承認待ち'
    WHEN 'approved' THEN '承認済み'
    WHEN 'returned' THEN '差し戻し'
    WHEN 'archived' THEN 'アーカイブ'
    ELSE r.human_review_status_code
  END AS human_review_status_label,

  r.priority_code,
  r.due_date,
  r.human_reviewer_label,
  r.human_review_note,
  r.requested_at,
  r.reviewed_at,
  r.display_order,
  r.created_at,
  r.updated_at,
  r.metadata_jsonb
FROM business.aicm_human_review_item r
JOIN business.aicm_user_company c
  ON c.aicm_user_company_id = r.aicm_user_company_id
LEFT JOIN business.aicm_user_company_department d
  ON d.aicm_user_company_department_id = r.aicm_user_company_department_id
LEFT JOIN business.aicm_user_company_section s
  ON s.aicm_user_company_section_id = r.aicm_user_company_section_id
WHERE r.human_review_status_code IN ('pending', 'returned');

