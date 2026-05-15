-- ============================================================
-- B6R96R1E Column Exact SQL Proposal
-- STATUS: NOT APPLIED
-- DB_WRITE_PERFORMED=NO
-- SQL_APPLY_PERFORMED=NO
-- Reviewer: 佐藤(DB担当)
-- ============================================================

-- Purpose:
-- - Add common task domain codes using existing aiworker.business_support_task_domain if compatible.
-- - Keep AIWorkerOS robot model profiles in existing aiworker profile/proficiency/brain policy tables.
-- - Keep PersonaOS task profile as derived from personaos parameter/growth/memory tables.
-- - Do not create large duplicate robot_worker_task_profile table in this step.

-- ============================================================
-- 1. Task domain proposals
-- ============================================================

-- task_domain: programming / プログラム作成
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: db_analysis / DB調査
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: document_writing / 文書作成
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: research / 調査
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: historical_reference / 歴史資料作成
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: ui_ux / UI/UX作成
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: data_formatting / データ整形
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: review_audit / レビュー/監査
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: customer_communication / 接客/コミュニケーション
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: creative_planning / 企画/アイデア出し
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: operations_execution / 運用作業
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: cx_reference_authoring / CX参照データ作成
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: security_crisis_response / 警備/危機対応
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: fictional_combat_design / フィクション戦闘設計
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: game_tactical_balance / ゲーム戦術/バランス
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: defense_planning_non_harmful / 防衛計画/非加害設計
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: threat_modeling_safe / 安全な脅威モデリング
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- task_domain: combat_lore_reference / 戦闘/軍事ロア参照
-- MANUAL_REVIEW_REQUIRED: missing non-null columns without default for aiworker.business_support_task_domain: task_domain_id, package_code, task_domain_name, cx_topic_code
-- available columns: task_domain_id, package_code, task_domain_code, task_domain_name, task_domain_name_ja, cx_topic_code, sort_order, status_code, created_at, updated_at

-- ============================================================
-- 2. AIWorkerOS profile placement proposal
-- ============================================================
-- Existing preferred tables:
-- - aiworker.worker_domain_proficiency
-- - aiworker.worker_role_proficiency
-- - aiworker.worker_model_capability_profile
-- - aiworker.robot_model_capability_profile
-- - aiworker.robot_brain_model_domain_policy
-- - aiworker.robot_brain_role_policy
--
-- B6R96R1F should generate INSERT/VIEW only after Sato confirms whether worker_domain_proficiency stores worker_id-based actual worker state or can hold model defaults.
-- If worker_domain_proficiency is individual-worker only, create a small model/domain overlay table instead of overloading it.

-- ============================================================
-- 3. PersonaOS derived profile proposal
-- ============================================================
-- Persona is not robot.
-- Do not use model_code.
-- Prefer derived view from:
-- - personaos.persona_parameter_value
-- - personaos.growth_axis
-- - personaos.growth_core_state
-- - personaos.memory_state
-- If runtime performance requires caching, create personaos.persona_task_profile_snapshot as cache, not canonical truth.
