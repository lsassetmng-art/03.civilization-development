#!/data/data/com.termux/files/usr/bin/sh
set -eu

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
select
  notification_event_id,
  work_order_id,
  notification_type,
  delivery_status,
  created_at
from business.aiod_notification_event
order by created_at desc
limit 20;

select
  audit_trace_id,
  work_order_id,
  event_type,
  event_summary,
  actor_type,
  actor_ref,
  created_at
from business.aiod_audit_trace
where event_type in (
  'provider_delivery_result_backwritten',
  'post_write_runtime_audit',
  'execution_request_created',
  'provisional_voucher_created'
)
order by created_at desc
limit 30;
SQL
