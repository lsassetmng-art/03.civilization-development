#!/data/data/com.termux/files/usr/bin/sh
set -eu

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
select
  operation_request_id,
  request_channel,
  request_text,
  lane_type,
  source_surface_type,
  request_status,
  created_at
from business.aiod_operation_request
order by created_at desc
limit 20;

select
  resident_context_snapshot_id,
  source_surface_type,
  current_screen_code,
  current_module_code,
  current_record_ref,
  current_field_code,
  current_company_ref,
  latest_error_code,
  captured_at
from business.aiod_resident_context_snapshot
order by captured_at desc
limit 20;

select
  work_order_id,
  lane_type,
  work_type_code,
  risk_class,
  review_required,
  approval_required,
  work_order_status,
  created_at
from business.aiod_work_order
order by created_at desc
limit 20;

select
  work_order_target_binding_id,
  work_order_id,
  binding_type,
  target_ref,
  target_label,
  created_at
from business.aiod_work_order_target_binding
order by created_at desc
limit 20;

select
  work_order_output_binding_id,
  work_order_id,
  output_type,
  destination_type,
  destination_ref,
  created_at
from business.aiod_work_order_output_binding
order by created_at desc
limit 20;

select
  retry_plan_id,
  work_order_id,
  failure_record_id,
  retry_status,
  next_retry_at,
  retry_count,
  created_at
from business.aiod_retry_plan
order by created_at desc
limit 20;
SQL
