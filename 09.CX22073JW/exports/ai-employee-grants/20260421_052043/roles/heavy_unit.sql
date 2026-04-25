-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: heavy_unit
-- suggested_db_role_name: aiemp_role__heavy_unit
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: combat_unit
-- actual_view_code: AV_COMBAT_AUDIT_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_combat_audit_context TO aiemp_role__heavy_unit;

-- ------------------------------------------------------------
-- domain_code: combat_unit
-- actual_view_code: AV_COMBAT_BATTLEFIELD_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_combat_battlefield_context TO aiemp_role__heavy_unit;

-- ------------------------------------------------------------
-- domain_code: combat_unit
-- actual_view_code: AV_COMBAT_DAMAGE_REPAIR_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_combat_damage_repair_context TO aiemp_role__heavy_unit;

-- ------------------------------------------------------------
-- domain_code: combat_unit
-- actual_view_code: AV_COMBAT_MISSION_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_combat_mission_context TO aiemp_role__heavy_unit;

-- ------------------------------------------------------------
-- domain_code: combat_unit
-- actual_view_code: AV_COMBAT_ROE_SAFETY_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_combat_roe_safety_context TO aiemp_role__heavy_unit;

-- ------------------------------------------------------------
-- domain_code: combat_unit
-- actual_view_code: AV_COMBAT_ROLE_LOADOUT_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_combat_role_loadout_context TO aiemp_role__heavy_unit;

