-- ============================================================
-- AI OPERATION DESK DDL EXACT
-- ============================================================

create schema if not exists business;

create extension if not exists pgcrypto;

create table if not exists business.aiod_supported_app_registry (
  supported_app_id uuid primary key default gen_random_uuid(),
  app_code text not null,
  app_name text not null,
  app_category text not null,
  app_summary text not null,
  app_purpose text not null,
  support_status text not null check (support_status in ('planned','supported','disabled','archived')),
  resident_surface_supported boolean not null default false,
  help_mode_supported boolean not null default true,
  operation_qa_supported boolean not null default true,
  execution_supported boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_code)
);

create table if not exists business.aiod_supported_app_task_type (
  supported_app_task_type_id uuid primary key default gen_random_uuid(),
  supported_app_id uuid not null references business.aiod_supported_app_registry(supported_app_id) on delete cascade,
  task_code text not null,
  task_name text not null,
  lane_type text not null check (lane_type in ('consult','draft','execution')),
  draft_capable boolean not null default false,
  review_required_default boolean not null default false,
  approval_required_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supported_app_id, task_code)
);

create table if not exists business.aiod_supported_app_qa_scope (
  supported_app_qa_scope_id uuid primary key default gen_random_uuid(),
  supported_app_id uuid not null references business.aiod_supported_app_registry(supported_app_id) on delete cascade,
  qa_scope_code text not null,
  qa_scope_name text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supported_app_id, qa_scope_code)
);

create table if not exists business.aiod_supported_app_write_surface (
  supported_app_write_surface_id uuid primary key default gen_random_uuid(),
  supported_app_id uuid not null references business.aiod_supported_app_registry(supported_app_id) on delete cascade,
  write_surface_type text not null check (write_surface_type in ('command_row','draft_row','staging_row','official_intake_table','controlled_function')),
  write_surface_name text not null,
  route_code text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supported_app_id, route_code)
);

create table if not exists business.aiod_operation_request (
  operation_request_id uuid primary key default gen_random_uuid(),
  request_channel text not null check (request_channel in ('text','voice')),
  request_text text not null,
  voice_transcript text null,
  requested_start_at timestamptz null,
  supported_app_id uuid null references business.aiod_supported_app_registry(supported_app_id) on delete set null,
  lane_type text null check (lane_type in ('consult','draft','execution')),
  requester_user_id text not null,
  source_surface_type text not null check (source_surface_type in ('main_console','erp_resident_surface','builder_resident_surface','app_help_surface','pocketsecretary_exception')),
  priority_level text not null default 'normal' check (priority_level in ('normal','high','urgent')),
  request_status text not null default 'received' check (request_status in ('received','parsed','compiled','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists business.aiod_operation_request_attachment (
  operation_request_attachment_id uuid primary key default gen_random_uuid(),
  operation_request_id uuid not null references business.aiod_operation_request(operation_request_id) on delete cascade,
  attachment_type text not null default 'file',
  storage_ref text not null,
  original_name text not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists business.aiod_resident_context_snapshot (
  resident_context_snapshot_id uuid primary key default gen_random_uuid(),
  source_surface_type text not null check (source_surface_type in ('erp_resident_surface','builder_resident_surface')),
  supported_app_id uuid not null references business.aiod_supported_app_registry(supported_app_id) on delete cascade,
  current_screen_code text null,
  current_module_code text null,
  current_record_ref text null,
  current_field_code text null,
  current_company_ref text null,
  latest_error_code text null,
  entered_value_json jsonb not null default '{}'::jsonb,
  permission_context_json jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create table if not exists business.aiod_work_order (
  work_order_id uuid primary key default gen_random_uuid(),
  operation_request_id uuid not null references business.aiod_operation_request(operation_request_id) on delete cascade,
  supported_app_id uuid not null references business.aiod_supported_app_registry(supported_app_id) on delete restrict,
  lane_type text not null check (lane_type in ('consult','draft','execution')),
  work_type_code text not null,
  risk_class text not null check (risk_class in ('low','medium','high','privileged')),
  review_required boolean not null default false,
  approval_required boolean not null default false,
  execution_mode text not null check (execution_mode in ('immediate','scheduled','trigger_wait')),
  trigger_mode text not null check (trigger_mode in ('none','time','explicit_click','retry','pocketsecretary_exception')),
  scheduled_at timestamptz null,
  work_order_status text not null check (work_order_status in ('draft','waiting_trigger','preflight','review_pending','approval_pending','ready','running','completed','failed','retry_waiting','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists business.aiod_work_order_step (
  work_order_step_id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references business.aiod_work_order(work_order_id) on delete cascade,
  step_order integer not null,
  step_code text not null,
  step_name text not null,
  step_type text not null check (step_type in ('explain','qa','draft_prepare','draft_write','review_prepare','approval_prepare','execute_bridge','notify','summarize')),
  write_surface_type text null check (write_surface_type in ('command_row','draft_row','staging_row','official_intake_table','controlled_function')),
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  unique (work_order_id, step_order)
);

create table if not exists business.aiod_work_order_target_binding (
  work_order_target_binding_id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references business.aiod_work_order(work_order_id) on delete cascade,
  binding_type text not null check (binding_type in ('company','customer','record','voucher','builder_asset','screen','module')),
  target_ref text not null,
  target_label text null,
  created_at timestamptz not null default now()
);

create table if not exists business.aiod_work_order_output_binding (
  work_order_output_binding_id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references business.aiod_work_order(work_order_id) on delete cascade,
  output_type text not null check (output_type in ('explanation','qa_answer','draft_document','provisional_voucher','review_package','approval_package','retry_package','summary_digest')),
  destination_type text not null check (destination_type in ('app_surface','queue','review','approval','summary')),
  destination_ref text null,
  created_at timestamptz not null default now()
);

create table if not exists business.aiod_review_request (
  review_request_id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references business.aiod_work_order(work_order_id) on delete cascade,
  review_reason_code text not null,
  reviewer_user_id text null,
  review_status text not null check (review_status in ('pending','approved','returned','rejected')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz null
);

create table if not exists business.aiod_approval_request (
  approval_request_id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references business.aiod_work_order(work_order_id) on delete cascade,
  approval_reason_code text not null,
  approver_user_id text null,
  approval_status text not null check (approval_status in ('pending','approved','returned','rejected')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz null
);

create table if not exists business.aiod_execution_job (
  execution_job_id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references business.aiod_work_order(work_order_id) on delete cascade,
  job_status text not null check (job_status in ('queued','running','succeeded','failed','cancelled')),
  started_at timestamptz null,
  ended_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists business.aiod_execution_step_run (
  execution_step_run_id uuid primary key default gen_random_uuid(),
  execution_job_id uuid not null references business.aiod_execution_job(execution_job_id) on delete cascade,
  work_order_step_id uuid not null references business.aiod_work_order_step(work_order_step_id) on delete cascade,
  step_status text not null check (step_status in ('queued','running','succeeded','failed','skipped')),
  write_surface_type text null check (write_surface_type in ('command_row','draft_row','staging_row','official_intake_table','controlled_function')),
  result_ref text null,
  started_at timestamptz null,
  ended_at timestamptz null
);

create table if not exists business.aiod_failure_record (
  failure_record_id uuid primary key default gen_random_uuid(),
  execution_job_id uuid not null references business.aiod_execution_job(execution_job_id) on delete cascade,
  execution_step_run_id uuid null references business.aiod_execution_step_run(execution_step_run_id) on delete set null,
  failure_code text not null,
  failure_summary text not null,
  retryable_flag boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists business.aiod_retry_plan (
  retry_plan_id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references business.aiod_work_order(work_order_id) on delete cascade,
  failure_record_id uuid not null references business.aiod_failure_record(failure_record_id) on delete cascade,
  retry_status text not null check (retry_status in ('proposed','scheduled','executed','stopped')),
  next_retry_at timestamptz null,
  retry_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists business.aiod_audit_trace (
  audit_trace_id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references business.aiod_work_order(work_order_id) on delete cascade,
  event_type text not null,
  event_summary text not null,
  actor_type text not null,
  actor_ref text null,
  created_at timestamptz not null default now()
);

create table if not exists business.aiod_notification_rule (
  notification_rule_id uuid primary key default gen_random_uuid(),
  user_id text not null,
  notify_review_pending boolean not null default true,
  notify_approval_pending boolean not null default true,
  notify_confirmation_required boolean not null default true,
  notify_execution_failed boolean not null default true,
  notify_retry_scheduled boolean not null default true,
  notify_completed_with_warning boolean not null default true,
  notify_completed_summary_available boolean not null default true,
  line_destination_ref text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists business.aiod_notification_event (
  notification_event_id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references business.aiod_work_order(work_order_id) on delete cascade,
  notification_type text not null check (notification_type in ('review_pending','approval_pending','confirmation_required','execution_failed','retry_scheduled','completed_with_warning','completed_summary_available')),
  destination_type text not null check (destination_type in ('line','push','app')),
  destination_ref text null,
  delivery_status text not null check (delivery_status in ('pending','sent','failed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists business.aiod_summary_batch (
  summary_batch_id uuid primary key default gen_random_uuid(),
  batch_type text not null check (batch_type in ('execution_summary','review_summary','failure_summary','output_summary','audit_digest')),
  batch_window_start_at timestamptz not null,
  batch_window_end_at timestamptz not null,
  batch_status text not null check (batch_status in ('prepared','generated','sent','failed')),
  created_at timestamptz not null default now()
);

create table if not exists business.aiod_summary_batch_item (
  summary_batch_item_id uuid primary key default gen_random_uuid(),
  summary_batch_id uuid not null references business.aiod_summary_batch(summary_batch_id) on delete cascade,
  work_order_id uuid not null references business.aiod_work_order(work_order_id) on delete cascade,
  item_summary text not null,
  severity_level text not null check (severity_level in ('info','warning','critical')),
  created_at timestamptz not null default now()
);

create index if not exists idx_aiod_supported_app_registry_support_status
  on business.aiod_supported_app_registry (support_status);

create index if not exists idx_aiod_supported_app_task_type_supported_app_id
  on business.aiod_supported_app_task_type (supported_app_id);

create index if not exists idx_aiod_supported_app_qa_scope_supported_app_id
  on business.aiod_supported_app_qa_scope (supported_app_id);

create index if not exists idx_aiod_supported_app_write_surface_supported_app_id
  on business.aiod_supported_app_write_surface (supported_app_id);

create index if not exists idx_aiod_operation_request_supported_app_id
  on business.aiod_operation_request (supported_app_id);

create index if not exists idx_aiod_operation_request_request_status
  on business.aiod_operation_request (request_status);

create index if not exists idx_aiod_operation_request_requested_start_at
  on business.aiod_operation_request (requested_start_at);

create index if not exists idx_aiod_resident_context_snapshot_supported_app_id
  on business.aiod_resident_context_snapshot (supported_app_id);

create index if not exists idx_aiod_resident_context_snapshot_captured_at
  on business.aiod_resident_context_snapshot (captured_at);

create index if not exists idx_aiod_work_order_supported_app_id
  on business.aiod_work_order (supported_app_id);

create index if not exists idx_aiod_work_order_status
  on business.aiod_work_order (work_order_status);

create index if not exists idx_aiod_work_order_scheduled_at
  on business.aiod_work_order (scheduled_at);

create index if not exists idx_aiod_work_order_risk_class
  on business.aiod_work_order (risk_class);

create index if not exists idx_aiod_work_order_step_work_order_id
  on business.aiod_work_order_step (work_order_id);

create index if not exists idx_aiod_work_order_target_binding_work_order_id
  on business.aiod_work_order_target_binding (work_order_id);

create index if not exists idx_aiod_work_order_output_binding_work_order_id
  on business.aiod_work_order_output_binding (work_order_id);

create index if not exists idx_aiod_review_request_work_order_id
  on business.aiod_review_request (work_order_id);

create index if not exists idx_aiod_review_request_review_status
  on business.aiod_review_request (review_status);

create index if not exists idx_aiod_approval_request_work_order_id
  on business.aiod_approval_request (work_order_id);

create index if not exists idx_aiod_approval_request_approval_status
  on business.aiod_approval_request (approval_status);

create index if not exists idx_aiod_execution_job_work_order_id
  on business.aiod_execution_job (work_order_id);

create index if not exists idx_aiod_execution_job_job_status
  on business.aiod_execution_job (job_status);

create index if not exists idx_aiod_execution_step_run_execution_job_id
  on business.aiod_execution_step_run (execution_job_id);

create index if not exists idx_aiod_failure_record_execution_job_id
  on business.aiod_failure_record (execution_job_id);

create index if not exists idx_aiod_retry_plan_work_order_id
  on business.aiod_retry_plan (work_order_id);

create index if not exists idx_aiod_retry_plan_retry_status_next_retry_at
  on business.aiod_retry_plan (retry_status, next_retry_at);

create index if not exists idx_aiod_audit_trace_work_order_id
  on business.aiod_audit_trace (work_order_id);

create index if not exists idx_aiod_audit_trace_created_at
  on business.aiod_audit_trace (created_at);

create index if not exists idx_aiod_notification_event_work_order_id
  on business.aiod_notification_event (work_order_id);

create index if not exists idx_aiod_notification_event_delivery_status
  on business.aiod_notification_event (delivery_status);

create index if not exists idx_aiod_summary_batch_batch_type_window_end
  on business.aiod_summary_batch (batch_type, batch_window_end_at);

create index if not exists idx_aiod_summary_batch_item_summary_batch_id
  on business.aiod_summary_batch_item (summary_batch_id);
