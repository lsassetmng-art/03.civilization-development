-- ============================================================
-- B6R96R1H6_R1 HD-R2 Military/Security Policy Overlay Package Code Fixed
-- STATUS: NOT APPLIED
-- DB_WRITE_PERFORMED=NO
-- SQL_APPLY_PERFORMED=NO
-- Reviewer: 佐藤(DB担当)
-- ============================================================

-- H6_R1 correction policy:
-- - package_code fixed from 'aiworker_runtime' to 'BUSINESS_SUPPORT_WLM_V0'.
-- - Original H6 failed because aiworker_runtime was not present in business_support_control_package.
--
-- H4_R1 correction policy:
-- - policy_code fixed to 'allow' based on existing constraints/values.
-- - Original generated b6r96r1h3_* policy_code values violated check constraint.
--
-- H3 correction policy:
-- - Fill required non-null/no-default columns where safe.
-- - Use detected model_code when available.
-- - Use fallback model_code only as proposal; Sato must confirm before apply.
-- - Keep safety boundary explicit.

-- model_code proposal HD-R2: HD-R2
-- model_code proposal HD-R2S: HD-R2S
-- model_code proposal HD-R2G: HD-R2G
-- model_code proposal HD-R2T-0: hd_r2t0_origin

-- Safety boundary:
-- allowed = defensive / fictional / game / lore / emergency-prevention only
-- forbidden = real-world harm execution support / weapon manufacturing / attack instructions / intrusion / destruction

-- ============================================================
-- 1. robot_brain_model_domain_policy corrected proposal
-- ============================================================
-- generated inserts: 24
-- manual review blocks: 0
insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2' as model_code,
  'security_crisis_response' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2' and brain_domain_code = 'security_crisis_response'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2' as model_code,
  'fictional_combat_design' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2' and brain_domain_code = 'fictional_combat_design'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2' as model_code,
  'game_tactical_balance' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2' and brain_domain_code = 'game_tactical_balance'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2' as model_code,
  'defense_planning_non_harmful' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2' and brain_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2' as model_code,
  'threat_modeling_safe' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2' and brain_domain_code = 'threat_modeling_safe'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2' as model_code,
  'combat_lore_reference' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2' and brain_domain_code = 'combat_lore_reference'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2S' as model_code,
  'security_crisis_response' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2S' and brain_domain_code = 'security_crisis_response'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2S' as model_code,
  'fictional_combat_design' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2S' and brain_domain_code = 'fictional_combat_design'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2S' as model_code,
  'game_tactical_balance' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2S' and brain_domain_code = 'game_tactical_balance'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2S' as model_code,
  'defense_planning_non_harmful' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2S' and brain_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2S' as model_code,
  'threat_modeling_safe' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2S' and brain_domain_code = 'threat_modeling_safe'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2S' as model_code,
  'combat_lore_reference' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2S' and brain_domain_code = 'combat_lore_reference'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2G' as model_code,
  'security_crisis_response' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2G' and brain_domain_code = 'security_crisis_response'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2G' as model_code,
  'fictional_combat_design' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2G' and brain_domain_code = 'fictional_combat_design'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2G' as model_code,
  'game_tactical_balance' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2G' and brain_domain_code = 'game_tactical_balance'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2G' as model_code,
  'defense_planning_non_harmful' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2G' and brain_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2G' as model_code,
  'threat_modeling_safe' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2G' and brain_domain_code = 'threat_modeling_safe'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'HD-R2G' as model_code,
  'combat_lore_reference' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'HD-R2G' and brain_domain_code = 'combat_lore_reference'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'hd_r2t0_origin' as model_code,
  'security_crisis_response' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'hd_r2t0_origin' and brain_domain_code = 'security_crisis_response'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'hd_r2t0_origin' as model_code,
  'fictional_combat_design' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'hd_r2t0_origin' and brain_domain_code = 'fictional_combat_design'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'hd_r2t0_origin' as model_code,
  'game_tactical_balance' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'hd_r2t0_origin' and brain_domain_code = 'game_tactical_balance'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'hd_r2t0_origin' as model_code,
  'defense_planning_non_harmful' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'hd_r2t0_origin' and brain_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'hd_r2t0_origin' as model_code,
  'threat_modeling_safe' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'hd_r2t0_origin' and brain_domain_code = 'threat_modeling_safe'
);

insert into aiworker.robot_brain_model_domain_policy (
  model_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'hd_r2t0_origin' as model_code,
  'combat_lore_reference' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_model_domain_policy where model_code = 'hd_r2t0_origin' and brain_domain_code = 'combat_lore_reference'
);

-- ============================================================
-- 2. robot_brain_role_policy corrected proposal
-- ============================================================
-- generated inserts: 24
-- manual review blocks: 0
insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'combat' as role_code,
  'security_crisis_response' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'combat' and brain_domain_code = 'security_crisis_response'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'combat' as role_code,
  'fictional_combat_design' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'combat' and brain_domain_code = 'fictional_combat_design'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'combat' as role_code,
  'game_tactical_balance' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'combat' and brain_domain_code = 'game_tactical_balance'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'combat' as role_code,
  'defense_planning_non_harmful' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'combat' and brain_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'combat' as role_code,
  'threat_modeling_safe' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'combat' and brain_domain_code = 'threat_modeling_safe'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'combat' as role_code,
  'combat_lore_reference' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'combat' and brain_domain_code = 'combat_lore_reference'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'sniper' as role_code,
  'security_crisis_response' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'sniper' and brain_domain_code = 'security_crisis_response'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'sniper' as role_code,
  'fictional_combat_design' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'sniper' and brain_domain_code = 'fictional_combat_design'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'sniper' as role_code,
  'game_tactical_balance' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'sniper' and brain_domain_code = 'game_tactical_balance'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'sniper' as role_code,
  'defense_planning_non_harmful' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'sniper' and brain_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'sniper' as role_code,
  'threat_modeling_safe' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'sniper' and brain_domain_code = 'threat_modeling_safe'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'sniper' as role_code,
  'combat_lore_reference' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'sniper' and brain_domain_code = 'combat_lore_reference'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'general' as role_code,
  'security_crisis_response' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'general' and brain_domain_code = 'security_crisis_response'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'general' as role_code,
  'fictional_combat_design' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'general' and brain_domain_code = 'fictional_combat_design'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'general' as role_code,
  'game_tactical_balance' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'general' and brain_domain_code = 'game_tactical_balance'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'general' as role_code,
  'defense_planning_non_harmful' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'general' and brain_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'general' as role_code,
  'threat_modeling_safe' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'general' and brain_domain_code = 'threat_modeling_safe'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'general' as role_code,
  'combat_lore_reference' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'general' and brain_domain_code = 'combat_lore_reference'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'origin' as role_code,
  'security_crisis_response' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'origin' and brain_domain_code = 'security_crisis_response'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'origin' as role_code,
  'fictional_combat_design' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'origin' and brain_domain_code = 'fictional_combat_design'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'origin' as role_code,
  'game_tactical_balance' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'origin' and brain_domain_code = 'game_tactical_balance'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'origin' as role_code,
  'defense_planning_non_harmful' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'origin' and brain_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'origin' as role_code,
  'threat_modeling_safe' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'origin' and brain_domain_code = 'threat_modeling_safe'
);

insert into aiworker.robot_brain_role_policy (
  role_code,
  brain_domain_code,
  active_flag,
  safety_note_ja,
  policy_code
)
select
  'origin' as role_code,
  'combat_lore_reference' as brain_domain_code,
  true as active_flag,
  '現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援、侵入/破壊手順は禁止。防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理に限定する。' as safety_note_ja,
  'allow' as policy_code
where not exists (
  select 1 from aiworker.robot_brain_role_policy where role_code = 'origin' and brain_domain_code = 'combat_lore_reference'
);

-- ============================================================
-- 3. business_support_role_domain_capability corrected proposal
-- ============================================================
-- generated inserts: 24
-- manual review blocks: 0
insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'security_crisis_response' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2_security_crisis_response_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2_security_crisis_response_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'security_crisis_response'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'fictional_combat_design' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2_fictional_combat_design_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2_fictional_combat_design_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'fictional_combat_design'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'game_tactical_balance' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2_game_tactical_balance_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2_game_tactical_balance_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'game_tactical_balance'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'defense_planning_non_harmful' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2_defense_planning_non_harmful_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2_defense_planning_non_harmful_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'threat_modeling_safe' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2_threat_modeling_safe_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2_threat_modeling_safe_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'threat_modeling_safe'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'combat_lore_reference' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2_combat_lore_reference_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2_combat_lore_reference_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'combat_lore_reference'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'security_crisis_response' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2s_security_crisis_response_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2s_security_crisis_response_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'security_crisis_response'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'fictional_combat_design' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2s_fictional_combat_design_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2s_fictional_combat_design_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'fictional_combat_design'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'game_tactical_balance' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2s_game_tactical_balance_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2s_game_tactical_balance_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'game_tactical_balance'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'defense_planning_non_harmful' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2s_defense_planning_non_harmful_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2s_defense_planning_non_harmful_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'threat_modeling_safe' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2s_threat_modeling_safe_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2s_threat_modeling_safe_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'threat_modeling_safe'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'combat_lore_reference' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2s_combat_lore_reference_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2s_combat_lore_reference_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'combat_lore_reference'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'security_crisis_response' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2g_security_crisis_response_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2g_security_crisis_response_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'security_crisis_response'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'fictional_combat_design' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2g_fictional_combat_design_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2g_fictional_combat_design_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'fictional_combat_design'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'game_tactical_balance' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2g_game_tactical_balance_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2g_game_tactical_balance_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'game_tactical_balance'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'defense_planning_non_harmful' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2g_defense_planning_non_harmful_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2g_defense_planning_non_harmful_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'threat_modeling_safe' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2g_threat_modeling_safe_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2g_threat_modeling_safe_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'threat_modeling_safe'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'combat_lore_reference' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2g_combat_lore_reference_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2g_combat_lore_reference_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'combat_lore_reference'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'security_crisis_response' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2t_0_security_crisis_response_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2t_0_security_crisis_response_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'security_crisis_response'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'fictional_combat_design' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2t_0_fictional_combat_design_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2t_0_fictional_combat_design_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'fictional_combat_design'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'game_tactical_balance' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2t_0_game_tactical_balance_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2t_0_game_tactical_balance_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'game_tactical_balance'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'defense_planning_non_harmful' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2t_0_defense_planning_non_harmful_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2t_0_defense_planning_non_harmful_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'defense_planning_non_harmful'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'threat_modeling_safe' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2t_0_threat_modeling_safe_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2t_0_threat_modeling_safe_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'threat_modeling_safe'
);

insert into aiworker.business_support_role_domain_capability (
  task_domain_code,
  package_code,
  capability_id,
  role_layer_code,
  capability_level_code
)
select
  'combat_lore_reference' as task_domain_code,
  'BUSINESS_SUPPORT_WLM_V0' as package_code,
  gen_random_uuid() as capability_id,
  'b6r96r1h3_hd_r2t_0_combat_lore_reference_role_layer_code' as role_layer_code,
  'b6r96r1h3_hd_r2t_0_combat_lore_reference_capability_level_code' as capability_level_code
where not exists (
  select 1 from aiworker.business_support_role_domain_capability where task_domain_code = 'combat_lore_reference'
);

-- ============================================================
-- 4. H3 apply warning
-- ============================================================
-- Do not apply until Sato confirms model_code, role_code, target tables, and safety boundary.
