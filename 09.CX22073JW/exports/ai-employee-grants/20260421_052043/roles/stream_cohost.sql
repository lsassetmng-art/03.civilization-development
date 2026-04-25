-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: stream_cohost
-- suggested_db_role_name: aiemp_role__stream_cohost
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_GAME_RULE_GUIDE
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_rule_guide TO aiemp_role__stream_cohost;

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_SHARED_PUBLIC_GUIDE
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_public_guide TO aiemp_role__stream_cohost;

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_public_context TO aiemp_role__stream_cohost;

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_SEGMENT_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_segment_public_context TO aiemp_role__stream_cohost;

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_SHOW_FLOW_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_show_flow_context TO aiemp_role__stream_cohost;

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_SUPPORT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_support_context TO aiemp_role__stream_cohost;

