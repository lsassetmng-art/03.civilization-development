\set ON_ERROR_STOP on
\pset format aligned
\pset null '(null)'

BEGIN;

SELECT 'before_counts' AS section,
  (SELECT count(*) FROM business.aicm_leader_middle_work_item WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid) AS middle_count,
  (SELECT count(*) FROM business.aicm_leader_deliverable_requirement WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid) AS requirement_count,
  (SELECT count(*) FROM business.aicm_worker_work_unit WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid) AS worker_unit_count;

WITH input_request AS (
  SELECT
    '00000000-0000-4000-8000-000000000001'::uuid AS owner_civilization_id,
    '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid AS aicm_user_company_id,
    'r8z_v1'::text AS auto_decomposition_version,
    'AICompanyManager.rollback_smoke'::text AS source_app_ref,
    1::int AS max_count
), target_major AS (
  SELECT m.*
  FROM business.aicm_manager_major_work_item m
  JOIN input_request r
    ON r.owner_civilization_id = m.owner_civilization_id
   AND r.aicm_user_company_id = m.aicm_user_company_id
  WHERE m.decomposition_status_code = 'assigned_to_leader'
    AND m.handoff_status_code = 'handed_off'
    AND NOT EXISTS (
      SELECT 1
      FROM business.aicm_leader_middle_work_item existing
      WHERE existing.aicm_manager_major_work_item_id = m.aicm_manager_major_work_item_id
        AND existing.owner_civilization_id = m.owner_civilization_id
        AND existing.aicm_user_company_id = m.aicm_user_company_id
        AND existing.breakdown_status_code <> 'archived'
    )
  ORDER BY m.updated_at, m.display_order, m.created_at
  LIMIT 1
), selected_worker AS (
  SELECT DISTINCT ON (tm.aicm_manager_major_work_item_id)
    tm.aicm_manager_major_work_item_id,
    p.aiworker_model_code,
    COALESCE(NULLIF(p.internal_nickname, ''), p.aiworker_model_code, '未割当') AS worker_label
  FROM target_major tm
  LEFT JOIN business.aicm_user_company_worker_placement p
    ON p.owner_civilization_id = tm.owner_civilization_id
   AND p.aicm_user_company_id = tm.aicm_user_company_id
   AND p.role_code = 'Worker'
   AND p.status_code = 'active'
  ORDER BY
    tm.aicm_manager_major_work_item_id,
    CASE
      WHEN p.aicm_user_company_section_id IS NOT NULL AND p.aicm_user_company_section_id = tm.aicm_user_company_section_id THEN 1
      WHEN p.aicm_user_company_department_id IS NOT NULL AND p.aicm_user_company_department_id = tm.aicm_user_company_department_id THEN 2
      WHEN p.target_level_code = 'company' THEN 3
      ELSE 9
    END,
    p.created_at
), inserted_middle AS (
  INSERT INTO business.aicm_leader_middle_work_item (
    owner_civilization_id, aicm_user_company_id, aicm_manager_major_work_item_id,
    aicm_user_company_department_id, aicm_user_company_section_id,
    middle_item_name, middle_item_description, leader_robot_label,
    breakdown_status_code, handoff_status_code, priority_code, due_date,
    reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb
  )
  SELECT
    tm.owner_civilization_id, tm.aicm_user_company_id, tm.aicm_manager_major_work_item_id,
    tm.aicm_user_company_department_id, tm.aicm_user_company_section_id,
    tm.major_item_name, tm.major_item_description,
    COALESCE(NULLIF(tm.assigned_leader_label, ''), '自動割当'),
    'worker_units_created', 'handed_off', tm.priority_code, tm.due_date,
    tm.reference_files_text, tm.supplemental_materials_text, tm.applicable_rules_text,
    'R8Z rollback smoke auto-generated from Manager大項目', '', tm.display_order,
    jsonb_build_object(
      'auto_decomposition_version', (SELECT auto_decomposition_version FROM input_request),
      'auto_decomposition_source', 'manager_major',
      'source_app_ref', (SELECT source_app_ref FROM input_request),
      'source_manager_major_work_item_id', tm.aicm_manager_major_work_item_id::text
    )
  FROM target_major tm
  RETURNING *
), inserted_requirement AS (
  INSERT INTO business.aicm_leader_deliverable_requirement (
    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id,
    deliverable_name, deliverable_type_code, deliverable_description,
    required_quality_text, acceptance_criteria_text, review_required_flag, requirement_status_code,
    priority_code, due_date, reference_files_text, supplemental_materials_text, applicable_rules_text, note, handoff_link, display_order, metadata_jsonb
  )
  SELECT
    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id,
    im.middle_item_name || ' 成果物', 'operation', im.middle_item_description,
    '会社共通ルールと該当業務ルールに従い、後続Workerが実行可能な成果物にする',
    '大項目の目的を満たし、レビュー可能な作業結果が作成されていること',
    true, 'ready_for_worker', im.priority_code, im.due_date,
    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,
    'R8Z rollback smoke auto-generated deliverable requirement', '', im.display_order,
    jsonb_build_object(
      'auto_decomposition_version', (SELECT auto_decomposition_version FROM input_request),
      'source_leader_middle_work_item_id', im.aicm_leader_middle_work_item_id::text,
      'source_manager_major_work_item_id', im.aicm_manager_major_work_item_id::text
    )
  FROM inserted_middle im
  RETURNING *
), inserted_worker_unit AS (
  INSERT INTO business.aicm_worker_work_unit (
    owner_civilization_id, aicm_user_company_id, aicm_leader_middle_work_item_id, aicm_leader_deliverable_requirement_id,
    work_unit_name, work_unit_description, work_type_code,
    assigned_worker_label, worker_model_code, work_status_code, review_status_code,
    priority_code, due_date, input_context_text, expected_output_text, result_summary_text, handoff_link,
    reference_files_text, supplemental_materials_text, applicable_rules_text, note, display_order, metadata_jsonb
  )
  SELECT
    im.owner_civilization_id, im.aicm_user_company_id, im.aicm_leader_middle_work_item_id, ir.aicm_leader_deliverable_requirement_id,
    im.middle_item_name || ' 作業', im.middle_item_description, 'operation',
    COALESCE(sw.worker_label, '未割当'), COALESCE(sw.aiworker_model_code, ''), 'todo', 'required',
    im.priority_code, im.due_date,
    'Manager大項目: ' || im.middle_item_name || E'\n' || im.middle_item_description,
    '指定された大項目について、実行可能な成果物または作業結果を作成する',
    '', '',
    im.reference_files_text, im.supplemental_materials_text, im.applicable_rules_text,
    CASE WHEN sw.aiworker_model_code IS NULL THEN 'Worker未割当。配置後に再割当対象。' ELSE 'R8Z rollback smoke auto-generated worker work unit' END,
    im.display_order,
    jsonb_build_object(
      'auto_decomposition_version', (SELECT auto_decomposition_version FROM input_request),
      'source_leader_middle_work_item_id', im.aicm_leader_middle_work_item_id::text,
      'source_deliverable_requirement_id', ir.aicm_leader_deliverable_requirement_id::text,
      'source_manager_major_work_item_id', im.aicm_manager_major_work_item_id::text
    )
  FROM inserted_middle im
  JOIN inserted_requirement ir
    ON ir.aicm_leader_middle_work_item_id = im.aicm_leader_middle_work_item_id
  LEFT JOIN selected_worker sw
    ON sw.aicm_manager_major_work_item_id = im.aicm_manager_major_work_item_id
  RETURNING *
), updated_manager AS (
  UPDATE business.aicm_manager_major_work_item m
  SET decomposition_status_code = 'decomposed',
      handoff_status_code = 'completed',
      metadata_jsonb = COALESCE(m.metadata_jsonb, '{}'::jsonb) || jsonb_build_object(
        'auto_decomposition_version', (SELECT auto_decomposition_version FROM input_request),
        'auto_decomposition_completed_at', now()::text
      ),
      updated_at = now()
  FROM inserted_middle im
  WHERE m.aicm_manager_major_work_item_id = im.aicm_manager_major_work_item_id
  RETURNING m.*
)
SELECT 'rollback_smoke_result' AS section,
  (SELECT count(*) FROM target_major) AS target_major_count,
  (SELECT count(*) FROM inserted_middle) AS inserted_middle_count,
  (SELECT count(*) FROM inserted_requirement) AS inserted_requirement_count,
  (SELECT count(*) FROM inserted_worker_unit) AS inserted_worker_unit_count,
  (SELECT count(*) FROM updated_manager) AS updated_manager_count,
  COALESCE((SELECT major_item_name FROM updated_manager LIMIT 1), '(none)') AS target_major_name;

ROLLBACK;

SELECT 'after_rollback_counts' AS section,
  (SELECT count(*) FROM business.aicm_leader_middle_work_item WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid AND metadata_jsonb->>'auto_decomposition_version' = 'r8z_v1') AS r8z_middle_count,
  (SELECT count(*) FROM business.aicm_leader_deliverable_requirement WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid AND metadata_jsonb->>'auto_decomposition_version' = 'r8z_v1') AS r8z_requirement_count,
  (SELECT count(*) FROM business.aicm_worker_work_unit WHERE owner_civilization_id = '00000000-0000-4000-8000-000000000001'::uuid AND aicm_user_company_id = '8b9be487-7b74-4517-9b59-6c84a82ae6aa'::uuid AND metadata_jsonb->>'auto_decomposition_version' = 'r8z_v1') AS r8z_worker_unit_count;
