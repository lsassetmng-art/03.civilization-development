-- ============================================================
-- B6R96R1I PersonaOS Derived Task Profile View Proposal
-- STATUS: NOT APPLIED
-- DB_WRITE_PERFORMED=NO
-- SQL_APPLY_PERFORMED=NO
-- Reviewer: 佐藤(DB担当)
-- ============================================================

-- Purpose:
-- - Reuse AIWorkerOS task_domain as shared task categories.
-- - PersonaOS does NOT become robot/AIWorker.
-- - PersonaOS derives task tendency as parameter-only profile from Persona parameters/growth/memory.
-- - No robot contract, robot role, worker_master, or aiworker employee table is created.

-- Safety:
-- - Restricted military/security domains are parameter tendencies only.
-- - They do not permit real-world harm execution support.
-- - Runtime execution/robot capability remains AIWorkerOS responsibility.

-- ------------------------------------------------------------
-- 1. Persona task domain mapping catalog view
-- ------------------------------------------------------------
create or replace view personaos.vw_persona_task_domain_mapping_proposal_v1 as
select * from (
  select
    'programming'::text as task_domain_code,
    'logic'::text as persona_parameter_key,
    '論理性・手順化・実装継続力'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'programming'::text as task_domain_code,
    'precision'::text as persona_parameter_key,
    '構文・実装ミス抑制'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'db_analysis'::text as task_domain_code,
    'analysis'::text as persona_parameter_key,
    '構造把握・関係整理'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'document_writing'::text as task_domain_code,
    'language'::text as persona_parameter_key,
    '文章化・説明力'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'research'::text as task_domain_code,
    'curiosity'::text as persona_parameter_key,
    '調査継続・比較'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'historical_reference'::text as task_domain_code,
    'memory'::text as persona_parameter_key,
    '時系列・背景保持'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'ui_ux'::text as task_domain_code,
    'sense'::text as persona_parameter_key,
    '見た目・使いやすさ判断'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'data_formatting'::text as task_domain_code,
    'orderliness'::text as persona_parameter_key,
    '整理・正規化'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'review_audit'::text as task_domain_code,
    'critical_thinking'::text as persona_parameter_key,
    'レビュー・矛盾検出'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'customer_communication'::text as task_domain_code,
    'empathy'::text as persona_parameter_key,
    '対話・相手理解'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'creative_planning'::text as task_domain_code,
    'creativity'::text as persona_parameter_key,
    '企画・発想'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'operations_execution'::text as task_domain_code,
    'stability'::text as persona_parameter_key,
    '安定実行'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'cx_reference_authoring'::text as task_domain_code,
    'knowledge_structuring'::text as persona_parameter_key,
    '参照データ構造化'::text as parameter_meaning_ja,
    'normal_work_profile'::text as safety_profile_code
  union all
  select
    'security_crisis_response'::text as task_domain_code,
    'risk_awareness'::text as persona_parameter_key,
    '危機察知・安全優先'::text as parameter_meaning_ja,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code
  union all
  select
    'fictional_combat_design'::text as task_domain_code,
    'fictional_strategy'::text as persona_parameter_key,
    'フィクション戦闘構成'::text as parameter_meaning_ja,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code
  union all
  select
    'game_tactical_balance'::text as task_domain_code,
    'game_balance'::text as persona_parameter_key,
    'ゲーム上の戦術均衡'::text as parameter_meaning_ja,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code
  union all
  select
    'defense_planning_non_harmful'::text as task_domain_code,
    'protective_planning'::text as persona_parameter_key,
    '防御・非加害設計'::text as parameter_meaning_ja,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code
  union all
  select
    'threat_modeling_safe'::text as task_domain_code,
    'risk_modeling'::text as persona_parameter_key,
    '安全な脅威整理'::text as parameter_meaning_ja,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code
  union all
  select
    'combat_lore_reference'::text as task_domain_code,
    'lore_memory'::text as persona_parameter_key,
    '戦闘/軍事ロア記憶'::text as parameter_meaning_ja,
    'restricted_safe_fiction_defense_lore_only'::text as safety_profile_code
) m;

-- ------------------------------------------------------------
-- 2. Persona derived task profile view
-- ------------------------------------------------------------
-- MANUAL_REVIEW_REQUIRED:
-- Could not generate value-based view because required columns were not all found.
-- Required: persona_id column, parameter/axis column, numeric value column.
-- selected_source_table=persona_parameter_value
-- persona_id_col=persona_id
-- axis_col=none
-- value_col=value

-- ------------------------------------------------------------
-- 3. Responsibility note view
-- ------------------------------------------------------------
create or replace view personaos.vw_persona_task_profile_responsibility_note_v1 as
select
  'personaos_parameter_only'::text as responsibility_code,
  'PersonaOSはPersonaの性格・成長・記憶・状態から仕事傾向を派生表示するだけで、AIWorkerOSのロボット性能計算や契約判定は持たない。'::text as responsibility_note_ja,
  'AIWorkerOS remains owner of robot execution, robot entitlement, model capability, CX brain access, and deliverable generation.'::text as aiworker_boundary_note;

