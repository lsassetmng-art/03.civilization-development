-- ============================================================
-- DO NOT RUN YET
-- BusinessOS AIWorker RLS Phase1 Apply Review SQL
-- Reviewer: 佐藤(DB担当)
-- ============================================================
-- This file is generated for review.
-- Do not apply until Boss gives explicit GO.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. BusinessOS read catalog tables
-- ============================================================

ALTER TABLE business.robot_placement_role_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS robot_placement_role_catalog_active_read
ON business.robot_placement_role_catalog;

CREATE POLICY robot_placement_role_catalog_active_read
ON business.robot_placement_role_catalog
FOR SELECT
USING (status_code = 'active');

ALTER TABLE business.robot_pool ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS robot_pool_active_read
ON business.robot_pool;

CREATE POLICY robot_pool_active_read
ON business.robot_pool
FOR SELECT
USING (status_code = 'active');

-- ============================================================
-- 2. AIWorkerOS read reference canon tables
-- ============================================================

ALTER TABLE aiworker.robot_series_behavior_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS robot_series_behavior_profile_active_read
ON aiworker.robot_series_behavior_profile;

CREATE POLICY robot_series_behavior_profile_active_read
ON aiworker.robot_series_behavior_profile
FOR SELECT
USING (status_code = 'active');

ALTER TABLE aiworker.robot_model_personality_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS robot_model_personality_profile_active_read
ON aiworker.robot_model_personality_profile;

CREATE POLICY robot_model_personality_profile_active_read
ON aiworker.robot_model_personality_profile
FOR SELECT
USING (status_code = 'active');

ALTER TABLE aiworker.robot_model_public_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS robot_model_public_profile_active_read
ON aiworker.robot_model_public_profile;

CREATE POLICY robot_model_public_profile_active_read
ON aiworker.robot_model_public_profile
FOR SELECT
USING (status_code = 'active');

-- ============================================================
-- 3. API client / audit log lock-down candidates
-- ============================================================
-- 注意:
-- ここはAPIのauth/audit関数が SECURITY INVOKER のため、
-- 実行ロール次第でAPIが壊れる可能性あり。
-- Phase1で適用するかは佐藤(DB担当)レビュー必須。
-- 初回適用ではコメント解除しない方が安全。

-- ALTER TABLE business.aicm_aiworker_api_client ENABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_select
-- ON business.aicm_aiworker_api_client;
--
-- CREATE POLICY aicm_aiworker_api_client_no_public_select
-- ON business.aicm_aiworker_api_client
-- FOR SELECT
-- USING (false);

-- ALTER TABLE business.aicm_aiworker_api_audit_log ENABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS aicm_aiworker_api_audit_log_no_public_select
-- ON business.aicm_aiworker_api_audit_log;
--
-- CREATE POLICY aicm_aiworker_api_audit_log_no_public_select
-- ON business.aicm_aiworker_api_audit_log
-- FOR SELECT
-- USING (false);

-- ============================================================
-- 4. Explicitly not in Phase1
-- ============================================================
-- DO NOT ENABLE YET:
-- ALTER TABLE business.company_robot_entitlement ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE business.company_robot_placement ENABLE ROW LEVEL SECURITY;

-- Reason:
-- company identity strategy is not fixed.
-- write functions are currently SECURITY INVOKER.
-- enabling RLS here can break grant/place/update/deactivate.

ROLLBACK;
