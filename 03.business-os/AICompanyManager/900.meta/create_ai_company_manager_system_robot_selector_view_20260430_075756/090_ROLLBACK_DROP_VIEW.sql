-- ============================================================
-- Rollback for Phase ALH-ALK
-- Drops only AICompanyManager system selector view.
-- Does not touch data.
-- ============================================================

DROP VIEW IF EXISTS business.vw_ai_company_manager_system_robot_selector_options;
