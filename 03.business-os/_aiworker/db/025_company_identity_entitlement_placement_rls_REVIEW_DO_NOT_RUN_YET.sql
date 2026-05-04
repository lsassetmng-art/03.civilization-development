-- ============================================================
-- DO NOT RUN YET
-- Company identity / entitlement-placement RLS review SQL
-- Reviewer: 佐藤(DB担当)
-- ============================================================
-- This file is review-only.
-- Do not apply until company identity strategy is fixed.
-- ============================================================

BEGIN;

-- ============================================================
-- Candidate session context helpers
-- ============================================================
-- These are candidates only.
-- Final names and roles must be reviewed.

-- Example:
-- SET LOCAL app.current_company_id = '<company_uuid>';
-- SET LOCAL app.current_api_client_id = '<client_uuid>';

-- ============================================================
-- Candidate policy concept for entitlement
-- ============================================================

-- ALTER TABLE business.company_robot_entitlement ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS company_robot_entitlement_company_select
-- ON business.company_robot_entitlement;

-- CREATE POLICY company_robot_entitlement_company_select
-- ON business.company_robot_entitlement
-- FOR SELECT
-- USING (
--   company_id::text = current_setting('app.current_company_id', true)
-- );

-- DROP POLICY IF EXISTS company_robot_entitlement_company_insert
-- ON business.company_robot_entitlement;

-- CREATE POLICY company_robot_entitlement_company_insert
-- ON business.company_robot_entitlement
-- FOR INSERT
-- WITH CHECK (
--   company_id::text = current_setting('app.current_company_id', true)
-- );

-- DROP POLICY IF EXISTS company_robot_entitlement_company_update
-- ON business.company_robot_entitlement;

-- CREATE POLICY company_robot_entitlement_company_update
-- ON business.company_robot_entitlement
-- FOR UPDATE
-- USING (
--   company_id::text = current_setting('app.current_company_id', true)
-- )
-- WITH CHECK (
--   company_id::text = current_setting('app.current_company_id', true)
-- );

-- No DELETE policy in first company-scoped RLS phase.

-- ============================================================
-- Candidate policy concept for placement
-- ============================================================

-- ALTER TABLE business.company_robot_placement ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS company_robot_placement_company_select
-- ON business.company_robot_placement;

-- CREATE POLICY company_robot_placement_company_select
-- ON business.company_robot_placement
-- FOR SELECT
-- USING (
--   company_id::text = current_setting('app.current_company_id', true)
-- );

-- DROP POLICY IF EXISTS company_robot_placement_company_insert
-- ON business.company_robot_placement;

-- CREATE POLICY company_robot_placement_company_insert
-- ON business.company_robot_placement
-- FOR INSERT
-- WITH CHECK (
--   company_id::text = current_setting('app.current_company_id', true)
-- );

-- DROP POLICY IF EXISTS company_robot_placement_company_update
-- ON business.company_robot_placement;

-- CREATE POLICY company_robot_placement_company_update
-- ON business.company_robot_placement
-- FOR UPDATE
-- USING (
--   company_id::text = current_setting('app.current_company_id', true)
-- )
-- WITH CHECK (
--   company_id::text = current_setting('app.current_company_id', true)
-- );

-- No DELETE policy in first company-scoped RLS phase.

-- ============================================================
-- Candidate function hardening idea
-- ============================================================
-- Before applying RLS to these write tables, review whether these functions
-- must validate company_id against trusted context:
--
-- business.fn_company_robot_grant_entitlement
-- business.fn_company_robot_place
-- business.fn_company_robot_placement_update
-- business.fn_company_robot_placement_deactivate
--
-- Candidate check inside functions:
-- current_setting('app.current_company_id', true) must equal p_company_id::text.
--
-- Update/deactivate by placement_id must resolve placement.company_id and compare
-- against current_setting('app.current_company_id', true).

ROLLBACK;
