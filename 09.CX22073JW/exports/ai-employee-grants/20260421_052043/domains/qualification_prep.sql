-- ============================================================
-- AI EMPLOYEE DOMAIN GRANT SKELETON
-- ============================================================
-- domain_code: qualification_prep
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- role_code: essay_or_oral_support
-- actual_view_code: AV_QUALIFICATION_ANSWER_EXPLANATION
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_answer_explanation TO aiemp_role__essay_or_oral_support;

-- ------------------------------------------------------------
-- role_code: essay_or_oral_support
-- actual_view_code: AV_QUALIFICATION_ESSAY_ORAL_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_essay_oral_context TO aiemp_role__essay_or_oral_support;

-- ------------------------------------------------------------
-- role_code: essay_or_oral_support
-- actual_view_code: AV_QUALIFICATION_SYLLABUS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_syllabus_context TO aiemp_role__essay_or_oral_support;

-- ------------------------------------------------------------
-- role_code: explanation_instructor
-- actual_view_code: AV_QUALIFICATION_ANSWER_EXPLANATION
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_answer_explanation TO aiemp_role__explanation_instructor;

-- ------------------------------------------------------------
-- role_code: explanation_instructor
-- actual_view_code: AV_QUALIFICATION_SYLLABUS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_syllabus_context TO aiemp_role__explanation_instructor;

-- ------------------------------------------------------------
-- role_code: explanation_instructor
-- actual_view_code: AV_QUALIFICATION_WEAK_AREA_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_weak_area_context TO aiemp_role__explanation_instructor;

-- ------------------------------------------------------------
-- role_code: mock_exam_support
-- actual_view_code: AV_QUALIFICATION_ANSWER_EXPLANATION
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_answer_explanation TO aiemp_role__mock_exam_support;

-- ------------------------------------------------------------
-- role_code: mock_exam_support
-- actual_view_code: AV_QUALIFICATION_MOCK_VARIANT_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_mock_variant_context TO aiemp_role__mock_exam_support;

-- ------------------------------------------------------------
-- role_code: mock_exam_support
-- actual_view_code: AV_QUALIFICATION_PAST_QUESTION_METADATA
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_past_question_metadata TO aiemp_role__mock_exam_support;

-- ------------------------------------------------------------
-- role_code: past_question_coach
-- actual_view_code: AV_QUALIFICATION_ANSWER_EXPLANATION
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_answer_explanation TO aiemp_role__past_question_coach;

-- ------------------------------------------------------------
-- role_code: past_question_coach
-- actual_view_code: AV_QUALIFICATION_PAST_QUESTION_CONTENT
-- grant_mode: conditional
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_past_question_content TO aiemp_role__past_question_coach;

-- ------------------------------------------------------------
-- role_code: past_question_coach
-- actual_view_code: AV_QUALIFICATION_PAST_QUESTION_METADATA
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_past_question_metadata TO aiemp_role__past_question_coach;

-- ------------------------------------------------------------
-- role_code: past_question_coach
-- actual_view_code: AV_QUALIFICATION_WEAK_AREA_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_weak_area_context TO aiemp_role__past_question_coach;

-- ------------------------------------------------------------
-- role_code: privileged_exam_audit_support
-- actual_view_code: AV_QUALIFICATION_PAST_QUESTION_CONTENT
-- grant_mode: conditional
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_past_question_content TO aiemp_role__privileged_exam_audit_support;

-- ------------------------------------------------------------
-- role_code: privileged_exam_audit_support
-- actual_view_code: AV_QUALIFICATION_PRIVILEGED_CONTEXT
-- grant_mode: required
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_privileged_context TO aiemp_role__privileged_exam_audit_support;

-- ------------------------------------------------------------
-- role_code: privileged_exam_audit_support
-- actual_view_code: AV_QUALIFICATION_UPDATE_REVISION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_update_revision_context TO aiemp_role__privileged_exam_audit_support;

-- ------------------------------------------------------------
-- role_code: qualification_lecturer
-- actual_view_code: AV_QUALIFICATION_ANSWER_EXPLANATION
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_answer_explanation TO aiemp_role__qualification_lecturer;

-- ------------------------------------------------------------
-- role_code: qualification_lecturer
-- actual_view_code: AV_QUALIFICATION_CATALOG
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_catalog TO aiemp_role__qualification_lecturer;

-- ------------------------------------------------------------
-- role_code: qualification_lecturer
-- actual_view_code: AV_QUALIFICATION_PUBLIC_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_public_guide TO aiemp_role__qualification_lecturer;

-- ------------------------------------------------------------
-- role_code: qualification_lecturer
-- actual_view_code: AV_QUALIFICATION_SYLLABUS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_syllabus_context TO aiemp_role__qualification_lecturer;

-- ------------------------------------------------------------
-- role_code: study_planner
-- actual_view_code: AV_QUALIFICATION_CATALOG
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_catalog TO aiemp_role__study_planner;

-- ------------------------------------------------------------
-- role_code: study_planner
-- actual_view_code: AV_QUALIFICATION_STUDY_PLAN_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_study_plan_context TO aiemp_role__study_planner;

-- ------------------------------------------------------------
-- role_code: study_planner
-- actual_view_code: AV_QUALIFICATION_SYLLABUS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_syllabus_context TO aiemp_role__study_planner;

-- ------------------------------------------------------------
-- role_code: study_planner
-- actual_view_code: AV_QUALIFICATION_WEAK_AREA_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_weak_area_context TO aiemp_role__study_planner;

-- ------------------------------------------------------------
-- role_code: syllabus_and_update_guide
-- actual_view_code: AV_QUALIFICATION_CATALOG
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_catalog TO aiemp_role__syllabus_and_update_guide;

-- ------------------------------------------------------------
-- role_code: syllabus_and_update_guide
-- actual_view_code: AV_QUALIFICATION_SYLLABUS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_syllabus_context TO aiemp_role__syllabus_and_update_guide;

-- ------------------------------------------------------------
-- role_code: syllabus_and_update_guide
-- actual_view_code: AV_QUALIFICATION_UPDATE_REVISION_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_update_revision_context TO aiemp_role__syllabus_and_update_guide;

-- ------------------------------------------------------------
-- role_code: weak_area_support
-- actual_view_code: AV_QUALIFICATION_ANSWER_EXPLANATION
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_answer_explanation TO aiemp_role__weak_area_support;

-- ------------------------------------------------------------
-- role_code: weak_area_support
-- actual_view_code: AV_QUALIFICATION_STUDY_PLAN_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_qualification_study_plan_context TO aiemp_role__weak_area_support;

