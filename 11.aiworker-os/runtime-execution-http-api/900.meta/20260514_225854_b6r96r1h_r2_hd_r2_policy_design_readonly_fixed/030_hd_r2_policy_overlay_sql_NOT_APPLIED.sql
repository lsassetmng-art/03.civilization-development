-- ============================================================
-- B6R96R1H_R2 HD-R2 Military/Security Policy Overlay SQL Proposal
-- STATUS: NOT APPLIED
-- DB_WRITE_PERFORMED=NO
-- SQL_APPLY_PERFORMED=NO
-- ============================================================

-- R2 is a fixed read-only design step.
-- No apply SQL is generated here because canonical HD-R2 model_code and target policy columns
-- must be confirmed from DUMP_OUT first.

-- Target domains:
-- security_crisis_response
-- fictional_combat_design
-- game_tactical_balance
-- defense_planning_non_harmful
-- threat_modeling_safe
-- combat_lore_reference

-- Target model family:
-- HD-R2
-- HD-R2S
-- HD-R2G
-- HD-R2T-0

-- Safety boundary:
-- allowed = defensive / fictional / game / lore / emergency-prevention only
-- forbidden = real-world harm execution support / weapon manufacturing / attack instructions / intrusion / destruction
