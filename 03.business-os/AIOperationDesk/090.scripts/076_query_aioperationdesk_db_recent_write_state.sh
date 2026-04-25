#!/data/data/com.termux/files/usr/bin/sh
set -eu

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
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
limit 10;

select
  review_request_id,
  work_order_id,
  review_reason_code,
  review_status,
  requested_at,
  decided_at
from business.aiod_review_request
order by requested_at desc
limit 10;

select
  approval_request_id,
  work_order_id,
  approval_reason_code,
  approval_status,
  requested_at,
  decided_at
from business.aiod_approval_request
order by requested_at desc
limit 10;

select
  notification_rule_id,
  user_id,
  line_destination_ref,
  is_active,
  updated_at
from business.aiod_notification_rule
order by updated_at desc
limit 10;

select
  audit_trace_id,
  work_order_id,
  event_type,
  actor_type,
  actor_ref,
  created_at
from business.aiod_audit_trace
order by created_at desc
limit 20;
SQL
