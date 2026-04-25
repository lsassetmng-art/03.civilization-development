-- ============================================================
-- AI EMPLOYEE DOMAIN GRANT SKELETON
-- ============================================================
-- domain_code: streaming
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- role_code: live_reaction
-- actual_view_code: AV_STREAM_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_public_context TO aiemp_role__live_reaction;

-- ------------------------------------------------------------
-- role_code: live_reaction
-- actual_view_code: AV_STREAM_SEGMENT_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_segment_public_context TO aiemp_role__live_reaction;

-- ------------------------------------------------------------
-- role_code: moderation_support
-- actual_view_code: AV_STREAM_BRAND_SAFE_RULE
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_stream_brand_safe_rule TO aiemp_role__moderation_support;

-- ------------------------------------------------------------
-- role_code: moderation_support
-- actual_view_code: AV_STREAM_MODERATION_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_stream_moderation_context TO aiemp_role__moderation_support;

-- ------------------------------------------------------------
-- role_code: moderation_support
-- actual_view_code: AV_STREAM_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_public_context TO aiemp_role__moderation_support;

-- ------------------------------------------------------------
-- role_code: moderation_support
-- actual_view_code: AV_STREAM_SEGMENT_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_segment_public_context TO aiemp_role__moderation_support;

-- ------------------------------------------------------------
-- role_code: show_flow_assist
-- actual_view_code: AV_STREAM_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_public_context TO aiemp_role__show_flow_assist;

-- ------------------------------------------------------------
-- role_code: show_flow_assist
-- actual_view_code: AV_STREAM_SEGMENT_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_segment_public_context TO aiemp_role__show_flow_assist;

-- ------------------------------------------------------------
-- role_code: show_flow_assist
-- actual_view_code: AV_STREAM_SHOW_FLOW_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_show_flow_context TO aiemp_role__show_flow_assist;

-- ------------------------------------------------------------
-- role_code: show_flow_assist
-- actual_view_code: AV_STREAM_SUPPORT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_support_context TO aiemp_role__show_flow_assist;

-- ------------------------------------------------------------
-- role_code: stream_cohost
-- actual_view_code: AV_GAME_RULE_GUIDE
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_rule_guide TO aiemp_role__stream_cohost;

-- ------------------------------------------------------------
-- role_code: stream_cohost
-- actual_view_code: AV_SHARED_PUBLIC_GUIDE
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_public_guide TO aiemp_role__stream_cohost;

-- ------------------------------------------------------------
-- role_code: stream_cohost
-- actual_view_code: AV_STREAM_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_public_context TO aiemp_role__stream_cohost;

-- ------------------------------------------------------------
-- role_code: stream_cohost
-- actual_view_code: AV_STREAM_SEGMENT_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_segment_public_context TO aiemp_role__stream_cohost;

-- ------------------------------------------------------------
-- role_code: stream_cohost
-- actual_view_code: AV_STREAM_SHOW_FLOW_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_show_flow_context TO aiemp_role__stream_cohost;

-- ------------------------------------------------------------
-- role_code: stream_cohost
-- actual_view_code: AV_STREAM_SUPPORT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_support_context TO aiemp_role__stream_cohost;

-- ------------------------------------------------------------
-- role_code: stream_support
-- actual_view_code: AV_SHARED_APP_HELP
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_app_help TO aiemp_role__stream_support;

-- ------------------------------------------------------------
-- role_code: stream_support
-- actual_view_code: AV_STREAM_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_public_context TO aiemp_role__stream_support;

-- ------------------------------------------------------------
-- role_code: stream_support
-- actual_view_code: AV_STREAM_SEGMENT_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_segment_public_context TO aiemp_role__stream_support;

-- ------------------------------------------------------------
-- role_code: stream_support
-- actual_view_code: AV_STREAM_SHOW_FLOW_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_show_flow_context TO aiemp_role__stream_support;

-- ------------------------------------------------------------
-- role_code: stream_support
-- actual_view_code: AV_STREAM_SUPPORT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_support_context TO aiemp_role__stream_support;

