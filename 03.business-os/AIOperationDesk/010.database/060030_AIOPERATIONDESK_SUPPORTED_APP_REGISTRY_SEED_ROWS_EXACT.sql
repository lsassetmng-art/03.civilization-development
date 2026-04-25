-- ============================================================
-- AI OPERATION DESK SUPPORTED APP REGISTRY SEED ROWS EXACT
-- ============================================================

insert into business.aiod_supported_app_registry (
  app_code,
  app_name,
  app_category,
  app_summary,
  app_purpose,
  support_status,
  resident_surface_supported,
  help_mode_supported,
  operation_qa_supported,
  execution_supported
) values
  ('ERP', 'ERP', 'erp', 'ERP governed resident support target', 'ERP consult / draft / execution bridge support target', 'supported', true, true, true, true),
  ('CIVILIZATION_BUILDER', 'CivilizationOS Builder', 'builder', 'CivilizationOS Builder resident support target', 'Builder-family guided help and governed execution bridge target', 'supported', true, true, true, true),
  ('PERSONA_BUILDER', 'PersonaOS Builder', 'builder', 'PersonaOS Builder resident support target', 'Builder-family guided help and governed execution bridge target', 'supported', true, true, true, true),
  ('BUSINESS_BUILDER', 'BusinessOS Builder', 'builder', 'BusinessOS Builder resident support target', 'Builder-family guided help and governed execution bridge target', 'supported', true, true, true, true),
  ('LIFE_BUILDER', 'LifeOS Builder', 'builder', 'LifeOS Builder resident support target', 'Builder-family guided help and governed execution bridge target', 'supported', true, true, true, true),
  ('GAME_BUILDER', 'GameOS Builder', 'builder', 'GameOS Builder resident support target', 'Builder-family guided help and governed execution bridge target', 'supported', true, true, true, true),
  ('STREAMING_BUILDER', 'StreamingOS Builder', 'builder', 'StreamingOS Builder resident support target', 'Builder-family guided help and governed execution bridge target', 'supported', true, true, true, true),
  ('STATICART_BUILDER', 'StaticArtOS Builder', 'builder', 'StaticArtOS Builder resident support target', 'Builder-family guided help and governed execution bridge target', 'supported', true, true, true, true)
on conflict (app_code) do update
set
  app_name = excluded.app_name,
  app_category = excluded.app_category,
  app_summary = excluded.app_summary,
  app_purpose = excluded.app_purpose,
  support_status = excluded.support_status,
  resident_surface_supported = excluded.resident_surface_supported,
  help_mode_supported = excluded.help_mode_supported,
  operation_qa_supported = excluded.operation_qa_supported,
  execution_supported = excluded.execution_supported,
  updated_at = now();

with erp as (
  select supported_app_id from business.aiod_supported_app_registry where app_code = 'ERP'
)
insert into business.aiod_supported_app_task_type (
  supported_app_id,
  task_code,
  task_name,
  lane_type,
  draft_capable,
  review_required_default,
  approval_required_default,
  is_active
)
select erp.supported_app_id, v.task_code, v.task_name, v.lane_type, v.draft_capable, v.review_required_default, v.approval_required_default, true
from erp
cross join (
  values
    ('ERP_SCREEN_EXPLANATION', 'ERP Screen Explanation', 'consult', false, false, false),
    ('ERP_FIELD_EXPLANATION', 'ERP Field Explanation', 'consult', false, false, false),
    ('ERP_OPERATION_QA', 'ERP Operation QA', 'consult', false, false, false),
    ('ERP_FAILURE_RESPONSE', 'ERP Failure Response Guidance', 'consult', false, false, false),
    ('ERP_PROVISIONAL_VOUCHER_DRAFT', 'ERP Provisional Voucher Draft', 'draft', true, true, false),
    ('ERP_EXECUTION_REQUEST', 'ERP Execution Request', 'execution', false, true, false)
) as v(task_code, task_name, lane_type, draft_capable, review_required_default, approval_required_default)
on conflict (supported_app_id, task_code) do update
set
  task_name = excluded.task_name,
  lane_type = excluded.lane_type,
  draft_capable = excluded.draft_capable,
  review_required_default = excluded.review_required_default,
  approval_required_default = excluded.approval_required_default,
  is_active = excluded.is_active,
  updated_at = now();

with builders as (
  select supported_app_id from business.aiod_supported_app_registry where app_category = 'builder'
)
insert into business.aiod_supported_app_task_type (
  supported_app_id,
  task_code,
  task_name,
  lane_type,
  draft_capable,
  review_required_default,
  approval_required_default,
  is_active
)
select b.supported_app_id, v.task_code, v.task_name, v.lane_type, v.draft_capable, v.review_required_default, v.approval_required_default, true
from builders b
cross join (
  values
    ('BUILDER_SCREEN_EXPLANATION', 'Builder Screen Explanation', 'consult', false, false, false),
    ('BUILDER_FIELD_EXPLANATION', 'Builder Field Explanation', 'consult', false, false, false),
    ('BUILDER_OPERATION_QA', 'Builder Operation QA', 'consult', false, false, false),
    ('BUILDER_DRAFT_ASSIST', 'Builder Draft Assist', 'draft', true, true, false),
    ('BUILDER_EXECUTION_REQUEST', 'Builder Execution Request', 'execution', false, true, false)
) as v(task_code, task_name, lane_type, draft_capable, review_required_default, approval_required_default)
on conflict (supported_app_id, task_code) do update
set
  task_name = excluded.task_name,
  lane_type = excluded.lane_type,
  draft_capable = excluded.draft_capable,
  review_required_default = excluded.review_required_default,
  approval_required_default = excluded.approval_required_default,
  is_active = excluded.is_active,
  updated_at = now();

with erp as (
  select supported_app_id from business.aiod_supported_app_registry where app_code = 'ERP'
)
insert into business.aiod_supported_app_qa_scope (
  supported_app_id,
  qa_scope_code,
  qa_scope_name,
  is_enabled
)
select erp.supported_app_id, v.qa_scope_code, v.qa_scope_name, true
from erp
cross join (
  values
    ('APP_OVERVIEW', 'App Overview'),
    ('FIELD_EXPLANATION', 'Field Explanation'),
    ('OPERATION_QA', 'Operation QA'),
    ('ERROR_QA', 'Error QA'),
    ('CONSULT_GUIDE', 'Consult Guide')
) as v(qa_scope_code, qa_scope_name)
on conflict (supported_app_id, qa_scope_code) do update
set
  qa_scope_name = excluded.qa_scope_name,
  is_enabled = excluded.is_enabled,
  updated_at = now();

with builders as (
  select supported_app_id from business.aiod_supported_app_registry where app_category = 'builder'
)
insert into business.aiod_supported_app_qa_scope (
  supported_app_id,
  qa_scope_code,
  qa_scope_name,
  is_enabled
)
select b.supported_app_id, v.qa_scope_code, v.qa_scope_name, true
from builders b
cross join (
  values
    ('APP_OVERVIEW', 'App Overview'),
    ('SCREEN_EXPLANATION', 'Screen Explanation'),
    ('FIELD_EXPLANATION', 'Field Explanation'),
    ('OPERATION_QA', 'Operation QA')
) as v(qa_scope_code, qa_scope_name)
on conflict (supported_app_id, qa_scope_code) do update
set
  qa_scope_name = excluded.qa_scope_name,
  is_enabled = excluded.is_enabled,
  updated_at = now();

with registry as (
  select supported_app_id, app_code, app_category from business.aiod_supported_app_registry
  where app_code = 'ERP' or app_category = 'builder'
)
insert into business.aiod_supported_app_write_surface (
  supported_app_id,
  write_surface_type,
  write_surface_name,
  route_code,
  is_enabled
)
select r.supported_app_id, v.write_surface_type, v.write_surface_name, v.route_code, true
from registry r
cross join lateral (
  values
    ('command_row', 'Command Row', r.app_code || '_COMMAND_ROW'),
    ('draft_row', 'Draft Row', r.app_code || '_DRAFT_ROW'),
    ('staging_row', 'Staging Row', r.app_code || '_STAGING_ROW'),
    ('official_intake_table', 'Official Intake Table', r.app_code || '_OFFICIAL_INTAKE'),
    ('controlled_function', 'Controlled Function', r.app_code || '_CONTROLLED_FUNCTION')
) as v(write_surface_type, write_surface_name, route_code)
on conflict (supported_app_id, route_code) do update
set
  write_surface_type = excluded.write_surface_type,
  write_surface_name = excluded.write_surface_name,
  is_enabled = excluded.is_enabled,
  updated_at = now();
