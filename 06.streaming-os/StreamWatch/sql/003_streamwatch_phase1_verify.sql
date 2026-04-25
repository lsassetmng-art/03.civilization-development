SELECT 'viewer_profile_records' AS table_name, count(*) AS row_count FROM streaming.viewer_profile_records
UNION ALL
SELECT 'viewer_progress_states' AS table_name, count(*) AS row_count FROM streaming.viewer_progress_states
UNION ALL
SELECT 'category_tree_nodes' AS table_name, count(*) AS row_count FROM streaming.category_tree_nodes
UNION ALL
SELECT 'cast_handoff_sessions' AS table_name, count(*) AS row_count FROM streaming.cast_handoff_sessions
ORDER BY table_name;

SELECT
  viewer_profile_id,
  display_name,
  restriction_mode,
  is_default_profile,
  is_active
FROM streaming.viewer_profile_records
ORDER BY display_name;

SELECT
  viewer_profile_id,
  target_type,
  position_seconds,
  duration_seconds,
  completion_ratio,
  continuity_state,
  last_device_mode
FROM streaming.viewer_progress_states
ORDER BY updated_at DESC;

SELECT
  category_node_id,
  parent_category_node_id,
  root_key,
  node_key,
  display_label,
  sort_order
FROM streaming.category_tree_nodes
ORDER BY root_key, sort_order;

SELECT
  handoff_session_id,
  viewer_profile_id,
  target_route_kind,
  target_route_label,
  claim_code,
  claim_state,
  expires_at
FROM streaming.cast_handoff_sessions
ORDER BY created_at DESC;
