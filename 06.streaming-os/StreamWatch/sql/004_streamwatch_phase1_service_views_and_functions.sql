BEGIN;

CREATE INDEX IF NOT EXISTS idx_viewer_progress_states_last_played_at
  ON streaming.viewer_progress_states(last_played_at DESC);

CREATE OR REPLACE VIEW streaming.v_streamwatch_profiles AS
SELECT
  viewer_profile_id,
  actor_civilization_id,
  display_name,
  avatar_url,
  preferred_language_code,
  subtitle_default_code,
  autoplay_enabled,
  live_notification_enabled,
  restriction_mode,
  age_band,
  is_default_profile,
  is_active,
  created_at,
  updated_at
FROM streaming.viewer_profile_records
WHERE is_active = true;

CREATE OR REPLACE VIEW streaming.v_streamwatch_category_tree_active AS
SELECT
  category_node_id,
  parent_category_node_id,
  root_key,
  node_key,
  display_label,
  sort_order,
  is_active,
  created_at,
  updated_at
FROM streaming.category_tree_nodes
WHERE is_active = true;

CREATE OR REPLACE VIEW streaming.v_streamwatch_library_history AS
SELECT
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
  last_played_at,
  updated_at
FROM streaming.viewer_progress_states
WHERE last_played_at IS NOT NULL
ORDER BY last_played_at DESC, updated_at DESC;

CREATE OR REPLACE FUNCTION streaming.fn_streamwatch_progress_upsert(
  p_actor_civilization_id uuid,
  p_viewer_profile_id uuid,
  p_target_type text,
  p_target_id uuid,
  p_position_seconds integer,
  p_duration_seconds integer DEFAULT NULL,
  p_completion_ratio numeric DEFAULT NULL,
  p_device_mode text DEFAULT NULL,
  p_route_context text DEFAULT NULL
)
RETURNS TABLE (
  progress_state_id uuid,
  continuity_state text,
  updated_at timestamptz
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_completion_ratio numeric;
BEGIN
  IF p_actor_civilization_id IS NULL THEN
    RAISE EXCEPTION 'actor_civilization_id is required';
  END IF;

  IF p_viewer_profile_id IS NULL THEN
    RAISE EXCEPTION 'viewer_profile_id is required';
  END IF;

  IF p_target_type IS NULL OR btrim(p_target_type) = '' THEN
    RAISE EXCEPTION 'target_type is required';
  END IF;

  IF p_target_id IS NULL THEN
    RAISE EXCEPTION 'target_id is required';
  END IF;

  v_completion_ratio := COALESCE(p_completion_ratio, 0);

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
  VALUES (
    (
      ('00000000-0000-0000-0000-' || substr(md5(clock_timestamp()::text || random()::text), 1, 12))::uuid
    ),
    p_actor_civilization_id,
    p_viewer_profile_id,
    p_target_type,
    p_target_id,
    GREATEST(COALESCE(p_position_seconds, 0), 0),
    p_duration_seconds,
    LEAST(GREATEST(v_completion_ratio, 0), 1),
    CASE
      WHEN LEAST(GREATEST(v_completion_ratio, 0), 1) >= 0.95 THEN 'completed'
      WHEN GREATEST(COALESCE(p_position_seconds, 0), 0) > 0 THEN 'in_progress'
      ELSE 'not_started'
    END,
    p_device_mode,
    p_route_context,
    now()
  )
  ON CONFLICT (viewer_profile_id, target_type, target_id)
  DO UPDATE SET
    actor_civilization_id = EXCLUDED.actor_civilization_id,
    position_seconds = EXCLUDED.position_seconds,
    duration_seconds = COALESCE(EXCLUDED.duration_seconds, streaming.viewer_progress_states.duration_seconds),
    completion_ratio = EXCLUDED.completion_ratio,
    continuity_state = EXCLUDED.continuity_state,
    last_device_mode = EXCLUDED.last_device_mode,
    last_route_context = EXCLUDED.last_route_context,
    last_played_at = now(),
    updated_at = now();

  RETURN QUERY
  SELECT
    s.progress_state_id,
    s.continuity_state,
    s.updated_at
  FROM streaming.viewer_progress_states s
  WHERE s.viewer_profile_id = p_viewer_profile_id
    AND s.target_type = p_target_type
    AND s.target_id = p_target_id;
END;
$$;

CREATE OR REPLACE FUNCTION streaming.fn_streamwatch_claim_handoff(
  p_actor_civilization_id uuid,
  p_viewer_profile_id uuid,
  p_handoff_session_id uuid,
  p_claim_device_ref text
)
RETURNS TABLE (
  handoff_session_id uuid,
  claim_state text,
  claimed_at timestamptz,
  target_route_label text
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_handoff_session_id IS NULL THEN
    RAISE EXCEPTION 'handoff_session_id is required';
  END IF;

  UPDATE streaming.cast_handoff_sessions
  SET
    claim_state = 'claimed',
    claimed_at = now(),
    target_route_label = COALESCE(NULLIF(target_route_label, ''), NULLIF(p_claim_device_ref, ''), target_route_label),
    updated_at = now()
  WHERE handoff_session_id = p_handoff_session_id
    AND actor_civilization_id = p_actor_civilization_id
    AND viewer_profile_id = p_viewer_profile_id
    AND claim_state = 'pending'
    AND expires_at > now();

  RETURN QUERY
  SELECT
    s.handoff_session_id,
    s.claim_state,
    s.claimed_at,
    s.target_route_label
  FROM streaming.cast_handoff_sessions s
  WHERE s.handoff_session_id = p_handoff_session_id;
END;
$$;

COMMIT;
