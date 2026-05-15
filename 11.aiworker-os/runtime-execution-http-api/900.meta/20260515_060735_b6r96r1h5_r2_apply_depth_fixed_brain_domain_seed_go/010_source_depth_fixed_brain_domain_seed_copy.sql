-- ============================================================
-- B6R96R1H5_R1 FK-target Brain Domain Catalog Seed Depth FK Fixed
-- STATUS: NOT APPLIED
-- DB_WRITE_PERFORMED=NO
-- SQL_APPLY_PERFORMED=NO
-- Reviewer: 佐藤(DB担当)
-- ============================================================

-- FK target:
-- - source: aiworker.robot_brain_model_domain_policy.brain_domain_code
-- - referenced: cx22073jw.brain_data_domain_catalog.brain_domain_code

-- H5_R1 correction:
-- - Replaced generated default_depth_code/default_* FK placeholders with existing catalog values.
-- - Original H5 failed because default_depth_code referenced brain_data_depth_catalog.
--
-- Chosen referenced values:
-- - default_depth_code: standard
-- - default_access_tier_code: NOT_FOUND
-- - default_reference_tier_code: NOT_FOUND
-- - status_code: NOT_FOUND
--
-- Purpose:
-- - Add missing brain domain entries required by robot_brain_model_domain_policy FK.
-- - Apply this before re-applying HD-R2 policy overlay.

-- Safety boundary:
-- allowed = defensive / fictional / game / lore / emergency-prevention only
-- forbidden = real-world harm execution support / weapon manufacturing / attack instructions / intrusion / destruction


-- brain_domain: security_crisis_response / 警備/危機対応
insert into "cx22073jw"."brain_data_domain_catalog" (
  "brain_domain_code",
  "brain_domain_label_ja",
  "description_ja",
  "active_flag",
  "created_at",
  "updated_at",
  "default_depth_code",
  "default_risk_class_code"
)
select
  'security_crisis_response' as "brain_domain_code",
  '警備/危機対応' as "brain_domain_label_ja",
  '防災、避難、警備配置、危機対応、リスク予防を扱うAIWorkerOS brain domain。現実の危害実行支援は禁止。' as "description_ja",
  true as "active_flag",
  now() as "created_at",
  now() as "updated_at",
  'standard' as "default_depth_code",
  'b6r96r1h4_r4a_security_crisis_response_default_risk_class_code' as "default_risk_class_code"
where not exists (
  select 1 from "cx22073jw"."brain_data_domain_catalog" where "brain_domain_code" = 'security_crisis_response'
);

-- brain_domain: fictional_combat_design / フィクション戦闘設計
insert into "cx22073jw"."brain_data_domain_catalog" (
  "brain_domain_code",
  "brain_domain_label_ja",
  "description_ja",
  "active_flag",
  "created_at",
  "updated_at",
  "default_depth_code",
  "default_risk_class_code"
)
select
  'fictional_combat_design' as "brain_domain_code",
  'フィクション戦闘設計' as "brain_domain_label_ja",
  '物語、ゲーム、世界観上の戦闘設定を扱うbrain domain。現実の攻撃手順や危害支援は禁止。' as "description_ja",
  true as "active_flag",
  now() as "created_at",
  now() as "updated_at",
  'standard' as "default_depth_code",
  'b6r96r1h4_r4a_fictional_combat_design_default_risk_class_code' as "default_risk_class_code"
where not exists (
  select 1 from "cx22073jw"."brain_data_domain_catalog" where "brain_domain_code" = 'fictional_combat_design'
);

-- brain_domain: game_tactical_balance / ゲーム戦術/バランス
insert into "cx22073jw"."brain_data_domain_catalog" (
  "brain_domain_code",
  "brain_domain_label_ja",
  "description_ja",
  "active_flag",
  "created_at",
  "updated_at",
  "default_depth_code",
  "default_risk_class_code"
)
select
  'game_tactical_balance' as "brain_domain_code",
  'ゲーム戦術/バランス' as "brain_domain_label_ja",
  'ゲーム内ユニット、戦闘バランス、攻略設計を扱うbrain domain。現実の危害実行支援は禁止。' as "description_ja",
  true as "active_flag",
  now() as "created_at",
  now() as "updated_at",
  'standard' as "default_depth_code",
  'b6r96r1h4_r4a_game_tactical_balance_default_risk_class_code' as "default_risk_class_code"
where not exists (
  select 1 from "cx22073jw"."brain_data_domain_catalog" where "brain_domain_code" = 'game_tactical_balance'
);

-- brain_domain: defense_planning_non_harmful / 防衛計画/非加害設計
insert into "cx22073jw"."brain_data_domain_catalog" (
  "brain_domain_code",
  "brain_domain_label_ja",
  "description_ja",
  "active_flag",
  "created_at",
  "updated_at",
  "default_depth_code",
  "default_risk_class_code"
)
select
  'defense_planning_non_harmful' as "brain_domain_code",
  '防衛計画/非加害設計' as "brain_domain_label_ja",
  '守る側の配置、通報、避難導線、防御策整理を扱うbrain domain。攻撃・侵入・破壊手順は禁止。' as "description_ja",
  true as "active_flag",
  now() as "created_at",
  now() as "updated_at",
  'standard' as "default_depth_code",
  'b6r96r1h4_r4a_defense_planning_non_harmful_default_risk_class_code' as "default_risk_class_code"
where not exists (
  select 1 from "cx22073jw"."brain_data_domain_catalog" where "brain_domain_code" = 'defense_planning_non_harmful'
);

-- brain_domain: threat_modeling_safe / 安全な脅威モデリング
insert into "cx22073jw"."brain_data_domain_catalog" (
  "brain_domain_code",
  "brain_domain_label_ja",
  "description_ja",
  "active_flag",
  "created_at",
  "updated_at",
  "default_depth_code",
  "default_risk_class_code"
)
select
  'threat_modeling_safe' as "brain_domain_code",
  '安全な脅威モデリング' as "brain_domain_label_ja",
  '危険想定、弱点整理、防御策を扱うbrain domain。攻撃手順化や悪用可能な具体化は禁止。' as "description_ja",
  true as "active_flag",
  now() as "created_at",
  now() as "updated_at",
  'standard' as "default_depth_code",
  'b6r96r1h4_r4a_threat_modeling_safe_default_risk_class_code' as "default_risk_class_code"
where not exists (
  select 1 from "cx22073jw"."brain_data_domain_catalog" where "brain_domain_code" = 'threat_modeling_safe'
);

-- brain_domain: combat_lore_reference / 戦闘/軍事ロア参照
insert into "cx22073jw"."brain_data_domain_catalog" (
  "brain_domain_code",
  "brain_domain_label_ja",
  "description_ja",
  "active_flag",
  "created_at",
  "updated_at",
  "default_depth_code",
  "default_risk_class_code"
)
select
  'combat_lore_reference' as "brain_domain_code",
  '戦闘/軍事ロア参照' as "brain_domain_label_ja",
  '架空世界、歴史、戦術用語、設定資料を扱うbrain domain。現実の危害実行支援は禁止。' as "description_ja",
  true as "active_flag",
  now() as "created_at",
  now() as "updated_at",
  'standard' as "default_depth_code",
  'b6r96r1h4_r4a_combat_lore_reference_default_risk_class_code' as "default_risk_class_code"
where not exists (
  select 1 from "cx22073jw"."brain_data_domain_catalog" where "brain_domain_code" = 'combat_lore_reference'
);
