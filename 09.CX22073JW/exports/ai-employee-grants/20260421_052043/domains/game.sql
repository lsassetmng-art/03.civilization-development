-- ============================================================
-- AI EMPLOYEE DOMAIN GRANT SKELETON
-- ============================================================
-- domain_code: game
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- role_code: battle_director
-- actual_view_code: AV_GAME_BALANCE_SAFE_CONTEXT
-- grant_mode: conditional
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_game_balance_safe_context TO aiemp_role__battle_director;

-- ------------------------------------------------------------
-- role_code: battle_director
-- actual_view_code: AV_GAME_COMMENTATOR_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_commentator_context TO aiemp_role__battle_director;

-- ------------------------------------------------------------
-- role_code: battle_director
-- actual_view_code: AV_GAME_MATCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_match_context TO aiemp_role__battle_director;

-- ------------------------------------------------------------
-- role_code: battle_director
-- actual_view_code: AV_GAME_PARTY_MEMBER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_party_member_context TO aiemp_role__battle_director;

-- ------------------------------------------------------------
-- role_code: commentator
-- actual_view_code: AV_GAME_COMMENTATOR_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_commentator_context TO aiemp_role__commentator;

-- ------------------------------------------------------------
-- role_code: commentator
-- actual_view_code: AV_GAME_MATCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_match_context TO aiemp_role__commentator;

-- ------------------------------------------------------------
-- role_code: commentator
-- actual_view_code: AV_GAME_PARTY_MEMBER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_party_member_context TO aiemp_role__commentator;

-- ------------------------------------------------------------
-- role_code: npc
-- actual_view_code: AV_GAME_COMMENTATOR_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_commentator_context TO aiemp_role__npc;

-- ------------------------------------------------------------
-- role_code: npc
-- actual_view_code: AV_GAME_MATCH_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_match_context TO aiemp_role__npc;

-- ------------------------------------------------------------
-- role_code: npc
-- actual_view_code: AV_GAME_OPPONENT_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_opponent_context TO aiemp_role__npc;

-- ------------------------------------------------------------
-- role_code: opponent
-- actual_view_code: AV_GAME_BALANCE_SAFE_CONTEXT
-- grant_mode: conditional
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_game_balance_safe_context TO aiemp_role__opponent;

-- ------------------------------------------------------------
-- role_code: opponent
-- actual_view_code: AV_GAME_COMMENTATOR_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_commentator_context TO aiemp_role__opponent;

-- ------------------------------------------------------------
-- role_code: opponent
-- actual_view_code: AV_GAME_MATCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_match_context TO aiemp_role__opponent;

-- ------------------------------------------------------------
-- role_code: opponent
-- actual_view_code: AV_GAME_PARTY_MEMBER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_party_member_context TO aiemp_role__opponent;

-- ------------------------------------------------------------
-- role_code: party_member
-- actual_view_code: AV_GAME_COMMENTATOR_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_commentator_context TO aiemp_role__party_member;

-- ------------------------------------------------------------
-- role_code: party_member
-- actual_view_code: AV_GAME_MATCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_match_context TO aiemp_role__party_member;

-- ------------------------------------------------------------
-- role_code: party_member
-- actual_view_code: AV_GAME_PARTY_MEMBER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_party_member_context TO aiemp_role__party_member;

-- ------------------------------------------------------------
-- role_code: trainer
-- actual_view_code: AV_GAME_BALANCE_SAFE_CONTEXT
-- grant_mode: conditional
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_game_balance_safe_context TO aiemp_role__trainer;

-- ------------------------------------------------------------
-- role_code: trainer
-- actual_view_code: AV_GAME_MATCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_match_context TO aiemp_role__trainer;

-- ------------------------------------------------------------
-- role_code: trainer
-- actual_view_code: AV_GAME_PARTY_MEMBER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_game_party_member_context TO aiemp_role__trainer;

