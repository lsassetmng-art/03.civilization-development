-- ============================================================
-- AI EMPLOYEE FINAL APPLY SKELETON
-- ============================================================
-- export_run_code: ai_employee_final_handoff_20260421_185630
-- source_execution_run_code: ai_employee_governed_apply_preflight_refresh_20260421_173612
-- source_batch_code: ai_employee_governed_apply_batch_refresh_20260421_173612
-- generated_at: 20260421_185630
-- caution:
--   manual handoff skeleton only
--   review before any execution
-- ============================================================

-- ------------------------------------------------------------
-- request_code: actreq_utility_assist_document_writer_20260420_205007819
-- domain_code : utility_assist
-- role_code   : document_writer
-- actual_view : AV_UTILITY_MASKED_USER_CONTEXT
-- logical_view: vw_aiemp_utility_masked_user_context
-- db_role     : aiemp_role__document_writer
GRANT SELECT ON cx22073jw.vw_aiemp_utility_masked_user_context TO aiemp_role__document_writer;

-- ------------------------------------------------------------
-- request_code: actreq_utility_assist_document_writer_20260420_205007819
-- domain_code : utility_assist
-- role_code   : document_writer
-- actual_view : AV_UTILITY_SUMMARY_CONTEXT
-- logical_view: vw_aiemp_utility_summary_context
-- db_role     : aiemp_role__document_writer
GRANT SELECT ON cx22073jw.vw_aiemp_utility_summary_context TO aiemp_role__document_writer;

-- ------------------------------------------------------------
-- request_code: actreq_utility_assist_document_writer_20260420_205007819
-- domain_code : utility_assist
-- role_code   : document_writer
-- actual_view : AV_UTILITY_WRITING_CONTEXT
-- logical_view: vw_aiemp_utility_writing_context
-- db_role     : aiemp_role__document_writer
GRANT SELECT ON cx22073jw.vw_aiemp_utility_writing_context TO aiemp_role__document_writer;

