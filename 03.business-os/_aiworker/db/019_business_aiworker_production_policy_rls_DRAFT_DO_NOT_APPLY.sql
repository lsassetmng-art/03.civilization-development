-- ============================================================
-- DRAFT ONLY - DO NOT APPLY WITHOUT REVIEW
-- BusinessOS AIWorker production policy / RLS hardening draft
-- ============================================================
-- This file is generated as a review artifact.
-- It intentionally does not run in the prep bundle.
-- ============================================================

BEGIN;

-- Candidate: protect API client secrets
-- ALTER TABLE business.aicm_aiworker_api_client ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY aicm_aiworker_api_client_no_public_select
-- ON business.aicm_aiworker_api_client
-- FOR SELECT
-- USING (false);

-- Candidate: audit log lock-down
-- ALTER TABLE business.aicm_aiworker_api_audit_log ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY aicm_aiworker_api_audit_log_no_public_select
-- ON business.aicm_aiworker_api_audit_log
-- FOR SELECT
-- USING (false);

-- Candidate: catalog/reference read
-- ALTER TABLE business.robot_placement_role_catalog ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE business.robot_pool ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY robot_placement_role_catalog_active_read
-- ON business.robot_placement_role_catalog
-- FOR SELECT
-- USING (status_code = 'active');
-- CREATE POLICY robot_pool_active_read
-- ON business.robot_pool
-- FOR SELECT
-- USING (status_code = 'active');

-- Candidate: company-scoped entitlement/placement
-- DO NOT APPLY until company identity strategy is fixed.
-- ALTER TABLE business.company_robot_entitlement ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE business.company_robot_placement ENABLE ROW LEVEL SECURITY;

-- Candidate: AIWorker reference canon read-only
-- ALTER TABLE aiworker.robot_series_behavior_profile ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE aiworker.robot_model_personality_profile ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE aiworker.robot_model_public_profile ENABLE ROW LEVEL SECURITY;

ROLLBACK;
