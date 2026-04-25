#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
OUT_DIR="$APP_ROOT/900.meta/notification_replay_review_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUT_DIR"

psql "$PERSONA_DATABASE_URL" -X -A -t -v ON_ERROR_STOP=1 -c "
with q as (
  select
    notification_event_id,
    work_order_id,
    notification_type,
    delivery_status,
    created_at
  from business.aiod_notification_event
  where delivery_status in ('failed', 'pending')
  order by created_at desc
  limit 100
)
select coalesce(json_agg(q), '[]'::json)::text
from q;
" > "$OUT_DIR/000_notification_replay_candidates.json"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK NOTIFICATION REPLAY REVIEW DONE'
printf '%s\n' "OUT_DIR=$OUT_DIR"
printf '%s\n' "JSON=$OUT_DIR/000_notification_replay_candidates.json"
printf '%s\n' '============================================================'
sed -n '1,120p' "$OUT_DIR/000_notification_replay_candidates.json"
