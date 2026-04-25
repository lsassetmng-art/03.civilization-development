#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
\echo '=== QUEUE MASTER ==='
SELECT queue_code, queue_scope, target_release_wave, queue_status, owner_name, reviewer_name
FROM cx22073jw.official_prepare_queue_master
ORDER BY queue_code;

\echo '=== QUEUE SUMMARY ==='
TABLE cx22073jw.v_official_prepare_queue_summary;

\echo '=== PHASE1 ITEM COUNT ==='
SELECT COUNT(*) AS phase1_item_count
FROM cx22073jw.official_prepare_queue_item opqi
JOIN cx22073jw.official_prepare_queue_master opqm
  ON opqm.prepare_queue_id = opqi.prepare_queue_id
WHERE opqm.queue_code = 'phase1_candidate_prepare_queue';

\echo '=== TOP PRIORITY ITEMS ==='
SELECT source_system, source_app, area_name, priority_code, priority_rank, item_status, prepare_stage
FROM cx22073jw.v_official_prepare_queue_priority_order
WHERE priority_rank <= 20
ORDER BY priority_rank, source_system, source_app, area_name;

\echo '=== STREAMWATCH PHASE1 ITEMS ==='
SELECT area_name, priority_code, item_status, prepare_stage
FROM cx22073jw.v_official_prepare_queue_overview
WHERE source_system = 'StreamingOS'
  AND source_app = 'StreamWatch'
ORDER BY priority_rank, area_name;

\echo '=== STATUS UPDATE SAMPLE ==='
SELECT cx22073jw.fn_set_prepare_queue_item_status(
  'phase1_candidate_prepare_queue',
  'streaming_view_history_area',
  'scoping',
  'scope_lock',
  'Promoted to scoping sample.',
  'Zero'
) AS updated_item_id;

\echo '=== POST-UPDATE CHECK ==='
SELECT source_system, source_app, area_name, item_status, prepare_stage
FROM cx22073jw.v_official_prepare_queue_overview
WHERE area_slug = 'streaming_view_history_area';

\echo '=== ITEM LOG CHECK ==='
SELECT action_code, from_status, to_status, from_stage, to_stage, actor_name
FROM cx22073jw.official_prepare_queue_item_log l
JOIN cx22073jw.official_prepare_queue_item i
  ON i.prepare_queue_item_id = l.prepare_queue_item_id
JOIN cx22073jw.candidate_area_registry c
  ON c.candidate_area_id = i.candidate_area_id
WHERE c.area_slug = 'streaming_view_history_area'
ORDER BY l.created_at DESC
LIMIT 5;
SQL
