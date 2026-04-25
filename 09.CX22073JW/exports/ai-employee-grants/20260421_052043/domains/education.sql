-- ============================================================
-- AI EMPLOYEE DOMAIN GRANT SKELETON
-- ============================================================
-- domain_code: education
-- generated_at: 20260421_052043
-- caution:
--   upper-bound skeleton only
--   intersect with rank / app scope / gate before actual apply
-- ============================================================

-- ------------------------------------------------------------
-- role_code: curriculum_guide
-- actual_view_code: AV_EDU_LEVEL_ADAPTIVE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_level_adaptive_context TO aiemp_role__curriculum_guide;

-- ------------------------------------------------------------
-- role_code: curriculum_guide
-- actual_view_code: AV_EDU_PUBLIC_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_public_guide TO aiemp_role__curriculum_guide;

-- ------------------------------------------------------------
-- role_code: curriculum_guide
-- actual_view_code: AV_EDU_SUBJECT_CATALOG
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_subject_catalog TO aiemp_role__curriculum_guide;

-- ------------------------------------------------------------
-- role_code: curriculum_guide
-- actual_view_code: AV_EDU_TEACHING_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_teaching_guide TO aiemp_role__curriculum_guide;

-- ------------------------------------------------------------
-- role_code: exercise_coach
-- actual_view_code: AV_EDU_LEVEL_ADAPTIVE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_level_adaptive_context TO aiemp_role__exercise_coach;

-- ------------------------------------------------------------
-- role_code: exercise_coach
-- actual_view_code: AV_EDU_MASKED_LEARNER_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_masked_learner_context TO aiemp_role__exercise_coach;

-- ------------------------------------------------------------
-- role_code: exercise_coach
-- actual_view_code: AV_EDU_TEACHING_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_teaching_guide TO aiemp_role__exercise_coach;

-- ------------------------------------------------------------
-- role_code: lab_instructor_support
-- actual_view_code: AV_EDU_LAB_RESEARCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_lab_research_context TO aiemp_role__lab_instructor_support;

-- ------------------------------------------------------------
-- role_code: lab_instructor_support
-- actual_view_code: AV_EDU_LEVEL_ADAPTIVE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_level_adaptive_context TO aiemp_role__lab_instructor_support;

-- ------------------------------------------------------------
-- role_code: lab_instructor_support
-- actual_view_code: AV_EDU_TEACHING_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_teaching_guide TO aiemp_role__lab_instructor_support;

-- ------------------------------------------------------------
-- role_code: learning_progress_support
-- actual_view_code: AV_EDU_MASKED_LEARNER_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_masked_learner_context TO aiemp_role__learning_progress_support;

-- ------------------------------------------------------------
-- role_code: learning_progress_support
-- actual_view_code: AV_EDU_PROGRESS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_progress_context TO aiemp_role__learning_progress_support;

-- ------------------------------------------------------------
-- role_code: seminar_facilitator
-- actual_view_code: AV_EDU_LAB_RESEARCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_lab_research_context TO aiemp_role__seminar_facilitator;

-- ------------------------------------------------------------
-- role_code: seminar_facilitator
-- actual_view_code: AV_EDU_PROGRESS_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_progress_context TO aiemp_role__seminar_facilitator;

-- ------------------------------------------------------------
-- role_code: seminar_facilitator
-- actual_view_code: AV_EDU_TEACHING_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_teaching_guide TO aiemp_role__seminar_facilitator;

-- ------------------------------------------------------------
-- role_code: subject_lecturer
-- actual_view_code: AV_EDU_LEVEL_ADAPTIVE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_level_adaptive_context TO aiemp_role__subject_lecturer;

-- ------------------------------------------------------------
-- role_code: subject_lecturer
-- actual_view_code: AV_EDU_PUBLIC_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_public_guide TO aiemp_role__subject_lecturer;

-- ------------------------------------------------------------
-- role_code: subject_lecturer
-- actual_view_code: AV_EDU_SUBJECT_CATALOG
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_subject_catalog TO aiemp_role__subject_lecturer;

-- ------------------------------------------------------------
-- role_code: subject_lecturer
-- actual_view_code: AV_EDU_TEACHING_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_teaching_guide TO aiemp_role__subject_lecturer;

-- ------------------------------------------------------------
-- role_code: test_preparation_support
-- actual_view_code: AV_EDU_LEVEL_ADAPTIVE_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_level_adaptive_context TO aiemp_role__test_preparation_support;

-- ------------------------------------------------------------
-- role_code: test_preparation_support
-- actual_view_code: AV_EDU_TEACHING_GUIDE
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_teaching_guide TO aiemp_role__test_preparation_support;

-- ------------------------------------------------------------
-- role_code: thesis_advisor_support
-- actual_view_code: AV_EDU_LAB_RESEARCH_CONTEXT
-- grant_mode: required
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_lab_research_context TO aiemp_role__thesis_advisor_support;

-- ------------------------------------------------------------
-- role_code: thesis_advisor_support
-- actual_view_code: AV_EDU_MASKED_LEARNER_CONTEXT
-- grant_mode: conditional
-- gate_needed: false
GRANT SELECT ON cx22073jw.vw_aiemp_edu_masked_learner_context TO aiemp_role__thesis_advisor_support;

-- ------------------------------------------------------------
-- role_code: thesis_advisor_support
-- actual_view_code: AV_EDU_PRIVILEGED_CONTEXT
-- grant_mode: conditional
-- gate_needed: true
GRANT SELECT ON cx22073jw.vw_aiemp_edu_privileged_context TO aiemp_role__thesis_advisor_support;

