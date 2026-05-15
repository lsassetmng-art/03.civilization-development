-- ============================================================
-- B6R96R1H4_R4 Brain Data Domain Catalog Seed
-- STATUS: NOT APPLIED
-- DB_WRITE_PERFORMED=NO
-- SQL_APPLY_PERFORMED=NO
-- Reviewer: 佐藤(DB担当)
-- ============================================================

-- Purpose:
-- - Add missing brain_data_domain_catalog entries required by robot_brain_model_domain_policy FK.
-- - Keep task_domain_code and brain_domain_code aligned for HD-R2 safe military/security domains.
-- - Apply this before re-applying HD-R2 policy overlay.

-- Safety boundary:
-- allowed = defensive / fictional / game / lore / emergency-prevention only
-- forbidden = real-world harm execution support / weapon manufacturing / attack instructions / intrusion / destruction


-- brain_domain: security_crisis_response / 警備/危機対応
-- MANUAL_REVIEW_REQUIRED: code column not found.

-- brain_domain: fictional_combat_design / フィクション戦闘設計
-- MANUAL_REVIEW_REQUIRED: code column not found.

-- brain_domain: game_tactical_balance / ゲーム戦術/バランス
-- MANUAL_REVIEW_REQUIRED: code column not found.

-- brain_domain: defense_planning_non_harmful / 防衛計画/非加害設計
-- MANUAL_REVIEW_REQUIRED: code column not found.

-- brain_domain: threat_modeling_safe / 安全な脅威モデリング
-- MANUAL_REVIEW_REQUIRED: code column not found.

-- brain_domain: combat_lore_reference / 戦闘/軍事ロア参照
-- MANUAL_REVIEW_REQUIRED: code column not found.
