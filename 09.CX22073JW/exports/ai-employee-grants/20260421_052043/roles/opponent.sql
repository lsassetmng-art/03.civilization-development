-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: opponent
-- suggested_db_role_name: aiemp_role__opponent
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: game
-- actual_view_code: AV_GAME_BALANCE_SAFE_CONTEXT
-- grant_mode: conditional
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_game_balance_safe_context TO aiemp_role__opponent;

-- ------------------------------------------------------------
-- domain_code: game
-- actual_view_code: AV_GAME_COMMENTATOR_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_commentator_context TO aiemp_role__opponent;

-- ------------------------------------------------------------
-- domain_code: game
-- actual_view_code: AV_GAME_MATCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_match_context TO aiemp_role__opponent;

-- ------------------------------------------------------------
-- domain_code: game
-- actual_view_code: AV_GAME_PARTY_MEMBER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_party_member_context TO aiemp_role__opponent;

