BEGIN;

INSERT INTO streaming.viewer_profile_records (
  viewer_profile_id,
  actor_civilization_id,
  display_name,
  preferred_language_code,
  subtitle_default_code,
  restriction_mode,
  is_default_profile
)
VALUES
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Boss','ja','ja','standard',true),
  ('22222222-2222-2222-2222-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Kid','ja','ja','family_safe',false)
ON CONFLICT (viewer_profile_id) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  preferred_language_code = EXCLUDED.preferred_language_code,
  subtitle_default_code = EXCLUDED.subtitle_default_code,
  restriction_mode = EXCLUDED.restriction_mode,
  is_default_profile = EXCLUDED.is_default_profile,
  updated_at = now();

INSERT INTO streaming.category_tree_nodes (
  category_node_id,
  parent_category_node_id,
  root_key,
  node_key,
  display_label,
  sort_order
)
VALUES
  ('30000000-0000-0000-0000-000000000001',NULL,'entertainment','entertainment','Entertainment',10),
  ('30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','entertainment','movies','Movies',20),
  ('30000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001','entertainment','live-events','Live Events',30),
  ('30000000-0000-0000-0000-000000000004',NULL,'education','education','Education',40)
ON CONFLICT (category_node_id) DO UPDATE
SET
  parent_category_node_id = EXCLUDED.parent_category_node_id,
  root_key = EXCLUDED.root_key,
  node_key = EXCLUDED.node_key,
  display_label = EXCLUDED.display_label,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

INSERT INTO streaming.viewer_progress_states (
  progress_state_id,
  actor_civilization_id,
  viewer_profile_id,
  target_type,
  target_id,
  position_seconds,
  duration_seconds,
  completion_ratio,
  continuity_state,
  last_device_mode,
  last_route_context,
  last_played_at
)
VALUES
  ('40000000-0000-0000-0000-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','video_asset','50000000-0000-0000-0000-000000000001',742,1800,0.4122,'in_progress','mobile','local_player',now())
ON CONFLICT (viewer_profile_id, target_type, target_id) DO UPDATE
SET
  position_seconds = EXCLUDED.position_seconds,
  duration_seconds = EXCLUDED.duration_seconds,
  completion_ratio = EXCLUDED.completion_ratio,
  continuity_state = EXCLUDED.continuity_state,
  last_device_mode = EXCLUDED.last_device_mode,
  last_route_context = EXCLUDED.last_route_context,
  last_played_at = EXCLUDED.last_played_at,
  updated_at = now();

INSERT INTO streaming.cast_handoff_sessions (
  handoff_session_id,
  actor_civilization_id,
  viewer_profile_id,
  source_device_mode,
  target_route_kind,
  target_route_label,
  target_type,
  target_id,
  resume_position_seconds,
  subtitle_default_code,
  audio_default_code,
  claim_code,
  claim_state,
  expires_at
)
VALUES
  ('60000000-0000-0000-0000-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','mobile','tv_route','Living Room TV','video_asset','50000000-0000-0000-0000-000000000001',742,'ja','ja','SW-4821','pending',now() + interval '30 minutes')
ON CONFLICT (handoff_session_id) DO UPDATE
SET
  source_device_mode = EXCLUDED.source_device_mode,
  target_route_kind = EXCLUDED.target_route_kind,
  target_route_label = EXCLUDED.target_route_label,
  resume_position_seconds = EXCLUDED.resume_position_seconds,
  claim_code = EXCLUDED.claim_code,
  claim_state = EXCLUDED.claim_state,
  expires_at = EXCLUDED.expires_at,
  updated_at = now();

COMMIT;
