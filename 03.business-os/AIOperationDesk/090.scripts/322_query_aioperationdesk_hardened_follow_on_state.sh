#!/data/data/com.termux/files/usr/bin/sh
set -eu

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
select
  notification_event_id,
  work_order_id,
  notification_type,
  destination_type,
  destination_ref,
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
order by created_at desc
limit 20;
SQL
