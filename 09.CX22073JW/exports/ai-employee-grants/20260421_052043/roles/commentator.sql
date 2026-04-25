-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: commentator
-- suggested_db_role_name: aiemp_role__commentator
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: game
-- actual_view_code: AV_GAME_COMMENTATOR_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_commentator_context TO aiemp_role__commentator;

-- ------------------------------------------------------------
-- domain_code: game
-- actual_view_code: AV_GAME_MATCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_match_context TO aiemp_role__commentator;

-- ------------------------------------------------------------
-- domain_code: game
-- actual_view_code: AV_GAME_PARTY_MEMBER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_party_member_context TO aiemp_role__commentator;

