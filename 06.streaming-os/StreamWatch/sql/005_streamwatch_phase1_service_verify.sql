SELECT 'v_streamwatch_profiles' AS check_name, count(*) AS row_count
FROM streaming.v_streamwatch_profiles
UNION ALL
SELECT 'v_streamwatch_category_tree_active' AS check_name, count(*) AS row_count
FROM streaming.v_streamwatch_category_tree_active
UNION ALL
SELECT 'v_streamwatch_library_history' AS check_name, count(*) AS row_count
FROM streaming.v_streamwatch_library_history;

DO $$
DECLARE
  v_actor uuid;
  v_profile uuid;
  v_target uuid;
  v_handoff uuid;
BEGIN
  SELECT actor_civilization_id, viewer_profile_id
    INTO v_actor, v_profile
  FROM streaming.viewer_profile_records
  ORDER BY is_default_profile DESC, created_at ASC
  LIMIT 1;

  SELECT target_id
    INTO v_target
  FROM streaming.viewer_progress_states
  WHERE viewer_profile_id = v_profile
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_actor IS NOT NULL AND v_profile IS NOT NULL AND v_target IS NOT NULL THEN
    PERFORM *
    FROM streaming.fn_streamwatch_progress_upsert(
      v_actor,
      v_profile,
      'video_asset',
      v_target,
      888,
      1800,
      0.4933,
      'mobile',
      'verify_route'
    );
  END IF;

  SELECT handoff_session_id
    INTO v_handoff
  FROM streaming.cast_handoff_sessions
  WHERE actor_civilization_id = v_actor
    AND viewer_profile_id = v_profile
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_actor IS NOT NULL AND v_profile IS NOT NULL AND v_handoff IS NOT NULL THEN
    PERFORM *
    FROM streaming.fn_streamwatch_claim_handoff(
      v_actor,
      v_profile,
      v_handoff,
      'verify-device'
    );
  END IF;
END $$;

SELECT viewer_profile_id, display_name, restriction_mode
FROM streaming.v_streamwatch_profiles
ORDER BY is_default_profile DESC, display_name ASC
LIMIT 5;

SELECT viewer_profile_id, target_type, target_id, continuity_state, position_seconds, completion_ratio
FROM streaming.viewer_progress_states
ORDER BY updated_at DESC
LIMIT 5;

SELECT handoff_session_id, claim_state, claimed_at, target_route_label
FROM streaming.cast_handoff_sessions
ORDER BY updated_at DESC
LIMIT 5;
