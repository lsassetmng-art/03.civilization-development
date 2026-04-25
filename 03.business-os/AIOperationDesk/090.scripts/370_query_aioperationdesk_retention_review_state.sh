#!/data/data/com.termux/files/usr/bin/sh
set -eu

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL_RETENTION'
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
limit 50;

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
limit 50;

select
  summary_batch_id,
  batch_type,
  batch_window_start_at,
  batch_window_end_at,
  batch_status,
  created_at
from business.aiod_summary_batch
order by created_at desc
limit 50;
SQL_RETENTION
