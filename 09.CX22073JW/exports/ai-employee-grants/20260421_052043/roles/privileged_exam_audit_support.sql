-- ============================================================
-- AI EMPLOYEE ROLE GRANT SKELETON
-- ============================================================
-- role_code: privileged_exam_audit_support
-- suggested_db_role_name: aiemp_role__privileged_exam_audit_support
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_PAST_QUESTION_CONTENT
-- grant_mode: conditional
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_past_question_content TO aiemp_role__privileged_exam_audit_support;

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_PRIVILEGED_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_privileged_context TO aiemp_role__privileged_exam_audit_support;

-- ------------------------------------------------------------
-- domain_code: qualification_prep
-- actual_view_code: AV_QUALIFICATION_UPDATE_REVISION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_update_revision_context TO aiemp_role__privileged_exam_audit_support;

