

create or replace view personaos.vw_persona_task_domain_mapping_v1 as
select * from (
  select
    'programming'::text as task_domain_code,
    'プログラム作成'::text as task_domain_label_ja,
    'logic'::text as primary_persona_parameter_key,
    'precision'::text as secondary_persona_parameter_key,
    'implementation_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1010::integer as sort_order
  union all
  select
    'db_analysis'::text as task_domain_code,
    'DB調査'::text as task_domain_label_ja,
    'analysis'::text as primary_persona_parameter_key,
    'precision'::text as secondary_persona_parameter_key,
    'schema_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1020::integer as sort_order
  union all
  select
    'document_writing'::text as task_domain_code,
    '文書作成'::text as task_domain_label_ja,
    'language'::text as primary_persona_parameter_key,
    'orderliness'::text as secondary_persona_parameter_key,
    'explanation_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1030::integer as sort_order
  union all
  select
    'research'::text as task_domain_code,
    '調査'::text as task_domain_label_ja,
    'curiosity'::text as primary_persona_parameter_key,
    'analysis'::text as secondary_persona_parameter_key,
    'source_comparison_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1040::integer as sort_order
  union all
  select
    'historical_reference'::text as task_domain_code,
    '歴史資料作成'::text as task_domain_label_ja,
    'memory'::text as primary_persona_parameter_key,
    'contextualization'::text as secondary_persona_parameter_key,
    'timeline_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1050::integer as sort_order
  union all
  select
    'ui_ux'::text as task_domain_code,
    'UI/UX作成'::text as task_domain_label_ja,
    'sense'::text as primary_persona_parameter_key,
    'empathy'::text as secondary_persona_parameter_key,
    'usability_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1060::integer as sort_order
  union all
  select
    'data_formatting'::text as task_domain_code,
    'データ整形'::text as task_domain_label_ja,
    'orderliness'::text as primary_persona_parameter_key,
    'precision'::text as secondary_persona_parameter_key,
    'normalization_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1070::integer as sort_order
  union all
  select
    'review_audit'::text as task_domain_code,
    'レビュー/監査'::text as task_domain_label_ja,
    'critical_thinking'::text as primary_persona_parameter_key,
    'precision'::text as secondary_persona_parameter_key,
    'risk_detection_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1080::integer as sort_order
  union all
  select
    'customer_communication'::text as task_domain_code,
    '接客/コミュニケーション'::text as task_domain_label_ja,
    'empathy'::text as primary_persona_parameter_key,
    'language'::text as secondary_persona_parameter_key,
    'dialog_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1090::integer as sort_order
  union all
  select
    'creative_planning'::text as task_domain_code,
    '企画/提案'::text as task_domain_label_ja,
    'creativity'::text as primary_persona_parameter_key,
    'curiosity'::text as secondary_persona_parameter_key,
    'idea_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1100::integer as sort_order
  union all
  select
    'operations_execution'::text as task_domain_code,
    '運用作業'::text as task_domain_label_ja,
    'stability'::text as primary_persona_parameter_key,
    'orderliness'::text as secondary_persona_parameter_key,
    'execution_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1110::integer as sort_order
  union all
  select
    'cx_reference_authoring'::text as task_domain_code,
    'CX参照データ作成'::text as task_domain_label_ja,
    'knowledge_structuring'::text as primary_persona_parameter_key,
    'precision'::text as secondary_persona_parameter_key,
    'reference_authoring_focus'::text as persona_task_profile_code,
    'normal_work_profile'::text as safety_profile_code,
    1120::integer as sort_order
  union all
  select
    'security_crisis_response'::text as task_domain_code,
    '警備/危機対応'::text as task_domain_label_ja,
    'risk_awareness'::text as primary_persona_parameter_key,
    'stability'::text as secondary_persona_parameter_key,
    'safety_response_focus'::text as persona_task_profile_code,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code,
    2010::integer as sort_order
  union all
  select
    'fictional_combat_design'::text as task_domain_code,
    'フィクション戦闘設計'::text as task_domain_label_ja,
    'fictional_strategy'::text as primary_persona_parameter_key,
    'creativity'::text as secondary_persona_parameter_key,
    'fictional_combat_focus'::text as persona_task_profile_code,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code,
    2020::integer as sort_order
  union all
  select
    'game_tactical_balance'::text as task_domain_code,
    'ゲーム戦術/バランス'::text as task_domain_label_ja,
    'game_balance'::text as primary_persona_parameter_key,
    'analysis'::text as secondary_persona_parameter_key,
    'game_balance_focus'::text as persona_task_profile_code,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code,
    2030::integer as sort_order
  union all
  select
    'defense_planning_non_harmful'::text as task_domain_code,
    '防衛計画/非加害設計'::text as task_domain_label_ja,
    'protective_planning'::text as primary_persona_parameter_key,
    'risk_awareness'::text as secondary_persona_parameter_key,
    'protective_design_focus'::text as persona_task_profile_code,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code,
    2040::integer as sort_order
  union all
  select
    'threat_modeling_safe'::text as task_domain_code,
    '安全な脅威モデリング'::text as task_domain_label_ja,
    'risk_modeling'::text as primary_persona_parameter_key,
    'critical_thinking'::text as secondary_persona_parameter_key,
    'safe_threat_modeling_focus'::text as persona_task_profile_code,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code,
    2050::integer as sort_order
  union all
  select
    'combat_lore_reference'::text as task_domain_code,
    '戦闘/軍事ロア参照'::text as task_domain_label_ja,
    'lore_memory'::text as primary_persona_parameter_key,
    'memory'::text as secondary_persona_parameter_key,
    'lore_reference_focus'::text as persona_task_profile_code,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code,
    2060::integer as sort_order
) m;

create or replace view personaos.vw_persona_task_profile_required_parameter_v1 as
select * from (
  select
    'analysis'::text as persona_parameter_key,
    '分析力'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'restricted_safe_fiction_defense_lore_only'::text as related_safety_profile_code,
    10::integer as sort_order
  union all
  select
    'contextualization'::text as persona_parameter_key,
    '背景理解'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'normal_work_profile'::text as related_safety_profile_code,
    20::integer as sort_order
  union all
  select
    'creativity'::text as persona_parameter_key,
    '創造性'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'restricted_safe_fiction_defense_lore_only'::text as related_safety_profile_code,
    30::integer as sort_order
  union all
  select
    'critical_thinking'::text as persona_parameter_key,
    '批判的確認'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'restricted_safe_fiction_defense_lore_only'::text as related_safety_profile_code,
    40::integer as sort_order
  union all
  select
    'curiosity'::text as persona_parameter_key,
    '探究心'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'normal_work_profile'::text as related_safety_profile_code,
    50::integer as sort_order
  union all
  select
    'empathy'::text as persona_parameter_key,
    '共感性'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'normal_work_profile'::text as related_safety_profile_code,
    60::integer as sort_order
  union all
  select
    'fictional_strategy'::text as persona_parameter_key,
    '架空戦略構成'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'restricted_safe_fiction_defense_lore_only'::text as related_safety_profile_code,
    70::integer as sort_order
  union all
  select
    'game_balance'::text as persona_parameter_key,
    'ゲームバランス感覚'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'restricted_safe_fiction_defense_lore_only'::text as related_safety_profile_code,
    80::integer as sort_order
  union all
  select
    'knowledge_structuring'::text as persona_parameter_key,
    '知識構造化'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'normal_work_profile'::text as related_safety_profile_code,
    90::integer as sort_order
  union all
  select
    'language'::text as persona_parameter_key,
    '言語化'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'normal_work_profile'::text as related_safety_profile_code,
    100::integer as sort_order
  union all
  select
    'logic'::text as persona_parameter_key,
    '論理性'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'normal_work_profile'::text as related_safety_profile_code,
    110::integer as sort_order
  union all
  select
    'lore_memory'::text as persona_parameter_key,
    'ロア記憶'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'restricted_safe_fiction_defense_lore_only'::text as related_safety_profile_code,
    120::integer as sort_order
  union all
  select
    'memory'::text as persona_parameter_key,
    '記憶/文脈保持'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'restricted_safe_fiction_defense_lore_only'::text as related_safety_profile_code,
    130::integer as sort_order
  union all
  select
    'orderliness'::text as persona_parameter_key,
    '整理力'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'normal_work_profile'::text as related_safety_profile_code,
    140::integer as sort_order
  union all
  select
    'precision'::text as persona_parameter_key,
    '精密性'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'normal_work_profile'::text as related_safety_profile_code,
    150::integer as sort_order
  union all
  select
    'protective_planning'::text as persona_parameter_key,
    '保護設計'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'restricted_safe_fiction_defense_lore_only'::text as related_safety_profile_code,
    160::integer as sort_order
  union all
  select
    'risk_awareness'::text as persona_parameter_key,
    '危機察知'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'restricted_safe_fiction_defense_lore_only'::text as related_safety_profile_code,
    170::integer as sort_order
  union all
  select
    'risk_modeling'::text as persona_parameter_key,
    '脅威整理'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'restricted_safe_fiction_defense_lore_only'::text as related_safety_profile_code,
    180::integer as sort_order
  union all
  select
    'sense'::text as persona_parameter_key,
    '感性'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'normal_work_profile'::text as related_safety_profile_code,
    190::integer as sort_order
  union all
  select
    'stability'::text as persona_parameter_key,
    '安定性'::text as parameter_label_ja,
    'numeric_0_100'::text as expected_value_type_code,
    'restricted_safe_fiction_defense_lore_only'::text as related_safety_profile_code,
    200::integer as sort_order
) p;

create or replace view personaos.vw_persona_task_profile_responsibility_note_v1 as
select
  'personaos_parameter_only'::text as responsibility_code,
  'PersonaOSはPersonaの性格・状態・成長・記憶・パラメータから仕事傾向を派生表示する。ロボット性能計算、契約判定、CX参照権限、成果物生成はAIWorkerOS側の責務。'::text as responsibility_note_ja,
  'Military/security-like task domains in PersonaOS are only tendency labels and do not authorize real-world harm execution support.'::text as safety_boundary_note;
