-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: moderation_support
-- suggested_db_role_name: aiemp_role__moderation_support
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_BRAND_SAFE_RULE
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_stream_brand_safe_rule TO aiemp_role__moderation_support;

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_MODERATION_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_stream_moderation_context TO aiemp_role__moderation_support;

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_public_context TO aiemp_role__moderation_support;

-- ------------------------------------------------------------
-- domain_code: streaming
-- actual_view_code: AV_STREAM_SEGMENT_PUBLIC_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_stream_segment_public_context TO aiemp_role__moderation_support;

