-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: show_flow_assist
-- suggested_db_role_name: aiemp_role__show_flow_assist
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_public_context TO aiemp_role__show_flow_assist;

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_SEGMENT_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_segment_public_context TO aiemp_role__show_flow_assist;

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_SHOW_FLOW_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_show_flow_context TO aiemp_role__show_flow_assist;

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_SUPPORT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_support_context TO aiemp_role__show_flow_assist;

