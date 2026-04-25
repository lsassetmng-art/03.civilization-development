#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_actual_view_registry_and_grant_skeleton.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS ACTUAL VIEW REGISTRY / GRANT SKELETON"
  echo "target db    : PERSONA_DATABASE_URL"
  echo "target schema: cx22073jw"
  echo "reviewer     : Sato (DB)"
  echo "started_at   : $RUN_TS"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
SET search_path TO cx22073jw, public;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_domain_master'
  ) THEN
    RAISE EXCEPTION 'access_domain_master is required before actual view registry bootstrap';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_role_master'
  ) THEN
    RAISE EXCEPTION 'access_role_master is required before actual view registry bootstrap';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_view_family_master'
  ) THEN
    RAISE EXCEPTION 'access_view_family_master is required before actual view registry bootstrap';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'access_role_view_family_policy'
  ) THEN
    RAISE EXCEPTION 'access_role_view_family_policy is required before actual view registry bootstrap';
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'foundation_domain_master'
  ) THEN
    INSERT INTO cx22073jw.foundation_domain_master (
      domain_code, domain_name, layer_code, domain_family, description
    ) VALUES (
      'access_actual_view_registry',
      'AI Employee Actual View Registry',
      'normal',
      'integration',
      'Actual view registry, naming registry, and grant skeleton for AI employees'
    )
    ON CONFLICT (domain_code) DO UPDATE
    SET domain_name   = EXCLUDED.domain_name,
        layer_code    = EXCLUDED.layer_code,
        domain_family = EXCLUDED.domain_family,
        description   = EXCLUDED.description,
        updated_at    = NOW();
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS cx22073jw.access_view_naming_rule_registry (
  naming_rule_code          text PRIMARY KEY,
  domain_code               text NOT NULL REFERENCES cx22073jw.access_domain_master(domain_code),
  rule_group                text NOT NULL,
  rule_text                 text NOT NULL,
  pattern_example           text,
  created_at                timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_actual_view_registry (
  actual_view_code          text PRIMARY KEY,
  domain_code               text NOT NULL REFERENCES cx22073jw.access_domain_master(domain_code),
  view_family_code          text NOT NULL REFERENCES cx22073jw.access_view_family_master(view_family_code),
  logical_view_name         text NOT NULL UNIQUE,
  intended_schema_name      text NOT NULL DEFAULT 'cx22073jw',
  sensitivity_code          text NOT NULL CHECK (
                             sensitivity_code IN (
                               'public',
                               'masked',
                               'support',
                               'operational',
                               'audit',
                               'privileged',
                               'safety',
                               'restricted'
                             )
                           ),
  exposure_scope            text NOT NULL CHECK (
                             exposure_scope IN (
                               'access_only',
                               'access_only_gate_controlled'
                             )
                           ),
  lifecycle_status          text NOT NULL CHECK (
                             lifecycle_status IN (
                               'registry_only',
                               'planned',
                               'active',
                               'retired'
                             )
                           ),
  purpose_text              text NOT NULL,
  raw_table_read_allowed    boolean NOT NULL DEFAULT false,
  grantable_readonly        boolean NOT NULL DEFAULT true,
  gate_required             boolean NOT NULL DEFAULT false,
  notes                     text,
  created_at                timestamptz NOT NULL DEFAULT NOW(),
  updated_at                timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_view_family_actual_view_map (
  view_family_code          text NOT NULL REFERENCES cx22073jw.access_view_family_master(view_family_code),
  actual_view_code          text NOT NULL REFERENCES cx22073jw.access_actual_view_registry(actual_view_code),
  mapping_role              text NOT NULL CHECK (
                             mapping_role IN (
                               'primary',
                               'supporting',
                               'specialized'
                             )
                           ),
  sort_order                integer NOT NULL CHECK (sort_order > 0),
  created_at                timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (view_family_code, actual_view_code)
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_role_actual_view_grant_skeleton (
  role_code                 text NOT NULL REFERENCES cx22073jw.access_role_master(role_code),
  actual_view_code          text NOT NULL REFERENCES cx22073jw.access_actual_view_registry(actual_view_code),
  grant_kind                text NOT NULL CHECK (grant_kind IN ('select_readonly')),
  grant_mode                text NOT NULL CHECK (grant_mode IN ('required','conditional')),
  rank_intersection_needed  boolean NOT NULL DEFAULT true,
  app_scope_needed          boolean NOT NULL DEFAULT true,
  gate_needed               boolean NOT NULL DEFAULT false,
  audit_obligation          boolean NOT NULL DEFAULT true,
  notes                     text,
  created_at                timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_code, actual_view_code)
);

CREATE INDEX IF NOT EXISTS ix_access_actual_view_registry_family
  ON cx22073jw.access_actual_view_registry (view_family_code, domain_code, sensitivity_code);

CREATE INDEX IF NOT EXISTS ix_access_view_family_actual_view_map_family
  ON cx22073jw.access_view_family_actual_view_map (view_family_code, mapping_role, sort_order);

CREATE INDEX IF NOT EXISTS ix_access_role_actual_view_grant_skeleton_view
  ON cx22073jw.access_role_actual_view_grant_skeleton (actual_view_code, grant_mode);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'cx22073jw'
      AND p.proname = 'fn_set_updated_at'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_actual_view_registry_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_actual_view_registry'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_actual_view_registry_updated_at
        BEFORE UPDATE ON cx22073jw.access_actual_view_registry
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

INSERT INTO cx22073jw.access_view_naming_rule_registry (
  naming_rule_code, domain_code, rule_group, rule_text, pattern_example
) VALUES
  ('shared_aiemp_prefix', 'shared', 'prefix', 'All AI employee views start with vw_aiemp_.', 'vw_aiemp_public_guide'),
  ('shared_no_raw_table_name', 'shared', 'boundary', 'Raw table names must not be exposed in logical view names.', 'use context names instead of internal table names'),
  ('shared_domain_purpose_visibility', 'shared', 'pattern', 'View names should reveal domain and purpose and never imply raw unrestricted access.', 'vw_aiemp_stream_public_context'),
  ('operations_name_pattern', 'operations', 'pattern', 'Operations views use purpose names such as masked_record_context, approval_routing_context, queue_context.', 'vw_aiemp_review_package_context'),
  ('streaming_name_pattern', 'streaming', 'pattern', 'Streaming views use public_context / support_context / moderation_context naming.', 'vw_aiemp_stream_moderation_context'),
  ('game_name_pattern', 'game', 'pattern', 'Game views use match / role / balance_safe naming.', 'vw_aiemp_game_balance_safe_context'),
  ('education_name_pattern', 'education', 'pattern', 'Education views use subject / teaching / exercise / progress / research naming.', 'vw_aiemp_edu_teaching_guide'),
  ('qualification_name_pattern', 'qualification_prep', 'pattern', 'Qualification views use catalog / syllabus / past_question / explanation / plan / revision naming.', 'vw_aiemp_qualification_syllabus_context'),
  ('utility_name_pattern', 'utility_assist', 'pattern', 'Utility views use writing / calculation / meal / research / task / summary naming.', 'vw_aiemp_utility_summary_context'),
  ('casual_name_pattern', 'casual_relationship', 'pattern', 'Casual views use profile / memory / tone / checkin / outing / boundary naming.', 'vw_aiemp_casual_boundary_and_safety_context'),
  ('workforce_name_pattern', 'workforce_execution', 'pattern', 'Workforce views use work_order / app_operation / masked_work / research_summary / audit naming.', 'vw_aiemp_workforce_work_order_context'),
  ('combat_name_pattern', 'combat_unit', 'pattern', 'Combat views use mission / battlefield / role_loadout / roe_safety / damage_repair / audit naming.', 'vw_aiemp_combat_roe_safety_context'),
  ('clerical_exec_name_pattern', 'clerical_execution', 'pattern', 'Clerical execution views use case / document_form / process / reference / audit naming.', 'vw_aiemp_admin_process_context'),
  ('clerical_control_name_pattern', 'clerical_control', 'pattern', 'Clerical control views use policy / workforce / assignment / reporting / audit naming.', 'vw_aiemp_admin_control_assignment_context'),
  ('senior_control_name_pattern', 'senior_clerical_control', 'pattern', 'Senior control views use aggregation / policy_draft / approval_request / audit naming.', 'vw_aiemp_senior_control_policy_draft_context')
ON CONFLICT (naming_rule_code) DO NOTHING;

INSERT INTO cx22073jw.access_actual_view_registry (
  actual_view_code,
  domain_code,
  view_family_code,
  logical_view_name,
  intended_schema_name,
  sensitivity_code,
  exposure_scope,
  lifecycle_status,
  purpose_text,
  raw_table_read_allowed,
  grantable_readonly,
  gate_required,
  notes
) VALUES
  ('AV_SHARED_PUBLIC_GUIDE', 'shared', 'VF00_PUBLIC_GUIDE', 'vw_aiemp_public_guide', 'cx22073jw', 'public', 'access_only', 'registry_only', 'General overview, glossary, and basic guide for AI employees', false, true, false, 'Shared AI-only guide view'),
  ('AV_SHARED_APP_HELP', 'shared', 'VF01_APP_HELP', 'vw_aiemp_app_help', 'cx22073jw', 'public', 'access_only', 'registry_only', 'Shared app help, screen help, and field help for AI employees', false, true, false, 'Shared AI-only help view'),

  ('AV_OPS_MASKED_RECORD_CONTEXT', 'operations', 'VF02_MASKED_CONTEXT', 'vw_aiemp_masked_record_context', 'cx22073jw', 'masked', 'access_only', 'registry_only', 'Masked current record and entered values context', false, true, false, 'Primary masked operations context'),
  ('AV_OPS_MASKED_ERROR_CONTEXT', 'operations', 'VF02_MASKED_CONTEXT', 'vw_aiemp_masked_error_context', 'cx22073jw', 'masked', 'access_only', 'registry_only', 'Masked latest error and failure context', false, true, false, 'Specialized masked error view'),
  ('AV_OPS_REVIEW_PACKAGE_CONTEXT', 'operations', 'VF03_OPERATION_CONTEXT', 'vw_aiemp_review_package_context', 'cx22073jw', 'operational', 'access_only', 'registry_only', 'Review package and governed execution request context', false, true, false, 'Primary operation context'),
  ('AV_OPS_APPROVAL_ROUTING_CONTEXT', 'operations', 'VF03_OPERATION_CONTEXT', 'vw_aiemp_approval_routing_context', 'cx22073jw', 'operational', 'access_only', 'registry_only', 'Approval routing and escalation route context', false, true, false, 'Supporting operation view'),
  ('AV_OPS_QUEUE_CONTEXT', 'operations', 'VF03_OPERATION_CONTEXT', 'vw_aiemp_queue_context', 'cx22073jw', 'operational', 'access_only', 'registry_only', 'Queue status and backlog context', false, true, false, 'Queue-focused operation view'),
  ('AV_OPS_RETRY_CONTEXT', 'operations', 'VF03_OPERATION_CONTEXT', 'vw_aiemp_retry_context', 'cx22073jw', 'operational', 'access_only', 'registry_only', 'Retry cause and retry plan context', false, true, false, 'Retry-focused operation view'),
  ('AV_OPS_AUDIT_DIGEST', 'operations', 'VF04_AUDIT_CONTEXT', 'vw_aiemp_audit_digest', 'cx22073jw', 'audit', 'access_only', 'registry_only', 'Audit digest and review trace summary', false, true, false, 'Primary audit view'),
  ('AV_OPS_FAILURE_SUMMARY', 'operations', 'VF04_AUDIT_CONTEXT', 'vw_aiemp_failure_summary', 'cx22073jw', 'audit', 'access_only', 'registry_only', 'Failure summary and retry trace digest', false, true, false, 'Supporting audit view'),
  ('AV_OPS_PRIVILEGED_INCIDENT_CONTEXT', 'operations', 'VF05_PRIVILEGED_CONTEXT', 'vw_aiemp_privileged_incident_context', 'cx22073jw', 'privileged', 'access_only_gate_controlled', 'registry_only', 'Privileged incident and restricted operational support context', false, true, true, 'Gate-controlled privileged operations view'),

  ('AV_STREAM_PUBLIC_CONTEXT', 'streaming', 'VF20_STREAM_PUBLIC_CONTEXT', 'vw_aiemp_stream_public_context', 'cx22073jw', 'public', 'access_only', 'registry_only', 'Public-safe stream context for live response', false, true, false, 'Primary streaming public view'),
  ('AV_STREAM_SEGMENT_PUBLIC_CONTEXT', 'streaming', 'VF20_STREAM_PUBLIC_CONTEXT', 'vw_aiemp_stream_segment_public_context', 'cx22073jw', 'public', 'access_only', 'registry_only', 'Segment-level public stream context', false, true, false, 'Supporting streaming public view'),
  ('AV_STREAM_SUPPORT_CONTEXT', 'streaming', 'VF21_STREAM_SUPPORT_CONTEXT', 'vw_aiemp_stream_support_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Run-of-show and support memo context', false, true, false, 'Primary streaming support view'),
  ('AV_STREAM_SHOW_FLOW_CONTEXT', 'streaming', 'VF21_STREAM_SUPPORT_CONTEXT', 'vw_aiemp_stream_show_flow_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Show flow and transition cue context', false, true, false, 'Supporting streaming support view'),
  ('AV_STREAM_MODERATION_CONTEXT', 'streaming', 'VF22_STREAM_MODERATION_CONTEXT', 'vw_aiemp_stream_moderation_context', 'cx22073jw', 'safety', 'access_only_gate_controlled', 'registry_only', 'Moderation and unsafe output classification context', false, true, true, 'Safety-constrained moderation view'),
  ('AV_STREAM_BRAND_SAFE_RULE', 'streaming', 'VF22_STREAM_MODERATION_CONTEXT', 'vw_aiemp_stream_brand_safe_rule', 'cx22073jw', 'safety', 'access_only_gate_controlled', 'registry_only', 'Brand-safe and sponsor-safe rule context', false, true, true, 'Supporting safety view'),

  ('AV_GAME_MATCH_CONTEXT', 'game', 'VF30_GAME_MATCH_CONTEXT', 'vw_aiemp_game_match_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Current match and session context', false, true, false, 'Primary game match view'),
  ('AV_GAME_PARTY_MEMBER_CONTEXT', 'game', 'VF30_GAME_MATCH_CONTEXT', 'vw_aiemp_game_party_member_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Party-member oriented match context', false, true, false, 'Specialized game match view'),
  ('AV_GAME_OPPONENT_CONTEXT', 'game', 'VF30_GAME_MATCH_CONTEXT', 'vw_aiemp_game_opponent_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Opponent-oriented visible state context', false, true, false, 'Specialized opponent context'),
  ('AV_GAME_NPC_ROLE_CONTEXT', 'game', 'VF31_GAME_ROLE_CONTEXT', 'vw_aiemp_game_npc_role_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'NPC role and narrative context', false, true, false, 'Specialized npc role view'),
  ('AV_GAME_COMMENTATOR_CONTEXT', 'game', 'VF31_GAME_ROLE_CONTEXT', 'vw_aiemp_game_commentator_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Commentary role context', false, true, false, 'Specialized commentator view'),
  ('AV_GAME_BALANCE_SAFE_CONTEXT', 'game', 'VF32_GAME_BALANCE_SAFE', 'vw_aiemp_game_balance_safe_context', 'cx22073jw', 'safety', 'access_only_gate_controlled', 'registry_only', 'Difficulty, fairness, and anti-cheat safe context', false, true, true, 'Controlled balance-safe view'),
  ('AV_GAME_RULE_GUIDE', 'game', 'VF00_PUBLIC_GUIDE', 'vw_aiemp_game_rule_guide', 'cx22073jw', 'public', 'access_only', 'registry_only', 'Non-sensitive game rule and guide view', false, true, false, 'Game-facing shared guide specialization'),

  ('AV_EDU_SUBJECT_CATALOG', 'education', 'VF40_EDU_SUBJECT_CATALOG', 'vw_aiemp_edu_subject_catalog', 'cx22073jw', 'public', 'access_only', 'registry_only', 'Education subject catalog view', false, true, false, 'Primary education catalog view'),
  ('AV_EDU_PUBLIC_GUIDE', 'education', 'VF41_EDU_PUBLIC_GUIDE', 'vw_aiemp_edu_public_guide', 'cx22073jw', 'public', 'access_only', 'registry_only', 'Education public guide view', false, true, false, 'Primary education guide view'),
  ('AV_EDU_TEACHING_GUIDE', 'education', 'VF42_EDU_TEACHING_GUIDE', 'vw_aiemp_edu_teaching_guide', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Teaching guide and misconception context', false, true, false, 'Primary teaching view'),
  ('AV_EDU_LEVEL_ADAPTIVE_CONTEXT', 'education', 'VF43_EDU_LEVEL_ADAPTIVE_CONTEXT', 'vw_aiemp_edu_level_adaptive_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Adaptive explanation and level band context', false, true, false, 'Primary level adaptive view'),
  ('AV_EDU_EXERCISE_CONTEXT', 'education', 'VF44_EDU_EXERCISE_AND_ASSESSMENT_CONTEXT', 'vw_aiemp_edu_exercise_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Exercise and assessment support context', false, true, false, 'Primary exercise view'),
  ('AV_EDU_PROGRESS_CONTEXT', 'education', 'VF45_EDU_PLAN_AND_PROGRESS_CONTEXT', 'vw_aiemp_edu_progress_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Progress and plan context', false, true, false, 'Primary progress view'),
  ('AV_EDU_LAB_RESEARCH_CONTEXT', 'education', 'VF46_EDU_LAB_AND_RESEARCH_CONTEXT', 'vw_aiemp_edu_lab_research_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Lab, seminar, and research support context', false, true, false, 'Primary research view'),
  ('AV_EDU_MASKED_LEARNER_CONTEXT', 'education', 'VF47_EDU_MASKED_LEARNER_CONTEXT', 'vw_aiemp_edu_masked_learner_context', 'cx22073jw', 'masked', 'access_only', 'registry_only', 'Masked learner progress and weakness context', false, true, false, 'Masked learner view'),
  ('AV_EDU_PRIVILEGED_CONTEXT', 'education', 'VF48_EDU_PRIVILEGED_CONTEXT', 'vw_aiemp_edu_privileged_context', 'cx22073jw', 'privileged', 'access_only_gate_controlled', 'registry_only', 'Restricted education audit and sensitive support context', false, true, true, 'Gate-controlled education privileged view'),

  ('AV_QUALIFICATION_CATALOG', 'qualification_prep', 'VF50_QUALIFICATION_CATALOG', 'vw_aiemp_qualification_catalog', 'cx22073jw', 'public', 'access_only', 'registry_only', 'Qualification catalog view', false, true, false, 'Primary qualification catalog view'),
  ('AV_QUALIFICATION_PUBLIC_GUIDE', 'qualification_prep', 'VF51_QUALIFICATION_PUBLIC_GUIDE', 'vw_aiemp_qualification_public_guide', 'cx22073jw', 'public', 'access_only', 'registry_only', 'Qualification public guide view', false, true, false, 'Primary qualification guide view'),
  ('AV_QUALIFICATION_SYLLABUS_CONTEXT', 'qualification_prep', 'VF52_QUALIFICATION_SYLLABUS_CONTEXT', 'vw_aiemp_qualification_syllabus_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Qualification syllabus and topic map context', false, true, false, 'Primary syllabus view'),
  ('AV_QUALIFICATION_PAST_QUESTION_METADATA', 'qualification_prep', 'VF53_QUALIFICATION_PAST_QUESTION_METADATA', 'vw_aiemp_qualification_past_question_metadata', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Past question metadata view', false, true, false, 'Primary metadata view'),
  ('AV_QUALIFICATION_PAST_QUESTION_CONTENT', 'qualification_prep', 'VF54_QUALIFICATION_PAST_QUESTION_CONTENT', 'vw_aiemp_qualification_past_question_content', 'cx22073jw', 'restricted', 'access_only_gate_controlled', 'registry_only', 'Rights-controlled past question content view', false, true, true, 'Restricted content view'),
  ('AV_QUALIFICATION_ANSWER_EXPLANATION', 'qualification_prep', 'VF55_QUALIFICATION_ANSWER_AND_EXPLANATION', 'vw_aiemp_qualification_answer_explanation', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Answer and explanation view', false, true, false, 'Primary explanation view'),
  ('AV_QUALIFICATION_WEAK_AREA_CONTEXT', 'qualification_prep', 'VF56_QUALIFICATION_WEAK_AREA_CONTEXT', 'vw_aiemp_qualification_weak_area_context', 'cx22073jw', 'masked', 'access_only', 'registry_only', 'Weak area and mastery band context', false, true, false, 'Masked weak area view'),
  ('AV_QUALIFICATION_STUDY_PLAN_CONTEXT', 'qualification_prep', 'VF57_QUALIFICATION_STUDY_PLAN_CONTEXT', 'vw_aiemp_qualification_study_plan_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Study plan and countdown context', false, true, false, 'Primary plan view'),
  ('AV_QUALIFICATION_MOCK_VARIANT_CONTEXT', 'qualification_prep', 'VF58_QUALIFICATION_MOCK_AND_VARIANT_CONTEXT', 'vw_aiemp_qualification_mock_variant_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Mock and variant generation context', false, true, false, 'Primary mock view'),
  ('AV_QUALIFICATION_ESSAY_ORAL_CONTEXT', 'qualification_prep', 'VF59_QUALIFICATION_ESSAY_AND_ORAL_CONTEXT', 'vw_aiemp_qualification_essay_oral_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Essay and oral support context', false, true, false, 'Primary essay/oral view'),
  ('AV_QUALIFICATION_UPDATE_REVISION_CONTEXT', 'qualification_prep', 'VF60_QUALIFICATION_UPDATE_AND_REVISION_CONTEXT', 'vw_aiemp_qualification_update_revision_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Update and revision context', false, true, false, 'Primary revision view'),
  ('AV_QUALIFICATION_MASKED_LEARNER_CONTEXT', 'qualification_prep', 'VF61_QUALIFICATION_MASKED_LEARNER_CONTEXT', 'vw_aiemp_qualification_masked_learner_context', 'cx22073jw', 'masked', 'access_only', 'registry_only', 'Masked learner progress and attempt context', false, true, false, 'Masked learner context'),
  ('AV_QUALIFICATION_PRIVILEGED_CONTEXT', 'qualification_prep', 'VF62_QUALIFICATION_PRIVILEGED_CONTEXT', 'vw_aiemp_qualification_privileged_context', 'cx22073jw', 'privileged', 'access_only_gate_controlled', 'registry_only', 'Restricted rights and sensitive qualification context', false, true, true, 'Gate-controlled qualification privileged view'),

  ('AV_UTILITY_WRITING_CONTEXT', 'utility_assist', 'VF70_UTILITY_WRITING_CONTEXT', 'vw_aiemp_utility_writing_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Writing template and drafting context', false, true, false, 'Primary writing view'),
  ('AV_UTILITY_CALCULATION_CONTEXT', 'utility_assist', 'VF71_UTILITY_CALCULATION_CONTEXT', 'vw_aiemp_utility_calculation_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Calculation and step explanation context', false, true, false, 'Primary calculation view'),
  ('AV_UTILITY_MEAL_PLANNING_CONTEXT', 'utility_assist', 'VF72_UTILITY_MEAL_PLANNING_CONTEXT', 'vw_aiemp_utility_meal_planning_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Meal planning context', false, true, false, 'Primary meal planning view'),
  ('AV_UTILITY_RESEARCH_CONTEXT', 'utility_assist', 'VF73_UTILITY_RESEARCH_CONTEXT', 'vw_aiemp_utility_research_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Topic summary and research assistance context', false, true, false, 'Primary research view'),
  ('AV_UTILITY_DAILY_TASK_CONTEXT', 'utility_assist', 'VF74_UTILITY_DAILY_TASK_CONTEXT', 'vw_aiemp_utility_daily_task_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Daily task checklist and routine context', false, true, false, 'Primary daily task view'),
  ('AV_UTILITY_SUMMARY_CONTEXT', 'utility_assist', 'VF75_UTILITY_SUMMARY_CONTEXT', 'vw_aiemp_utility_summary_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Summary and note structuring context', false, true, false, 'Primary summary view'),
  ('AV_UTILITY_MASKED_USER_CONTEXT', 'utility_assist', 'VF76_UTILITY_MASKED_USER_CONTEXT', 'vw_aiemp_utility_masked_user_context', 'cx22073jw', 'masked', 'access_only', 'registry_only', 'Masked user preference context', false, true, false, 'Masked utility user context'),
  ('AV_UTILITY_PRIVILEGED_CONTEXT', 'utility_assist', 'VF77_UTILITY_PRIVILEGED_CONTEXT', 'vw_aiemp_utility_privileged_context', 'cx22073jw', 'privileged', 'access_only_gate_controlled', 'registry_only', 'Restricted drafting and research context', false, true, true, 'Gate-controlled utility privileged view'),

  ('AV_WORKFORCE_WORK_ORDER_CONTEXT', 'workforce_execution', 'VF80_WORKFORCE_WORK_ORDER_CONTEXT', 'vw_aiemp_workforce_work_order_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Assigned work order and due band context', false, true, false, 'Primary workforce order view'),
  ('AV_WORKFORCE_APP_OPERATION_CONTEXT', 'workforce_execution', 'VF81_WORKFORCE_APP_OPERATION_CONTEXT', 'vw_aiemp_workforce_app_operation_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'App operation and official route context', false, true, false, 'Primary workforce operation view'),
  ('AV_WORKFORCE_MASKED_WORK_CONTEXT', 'workforce_execution', 'VF82_WORKFORCE_MASKED_WORK_CONTEXT', 'vw_aiemp_workforce_masked_work_context', 'cx22073jw', 'masked', 'access_only', 'registry_only', 'Masked work record and issue context', false, true, false, 'Primary masked work view'),
  ('AV_WORKFORCE_RESEARCH_SUMMARY_CONTEXT', 'workforce_execution', 'VF83_WORKFORCE_RESEARCH_AND_SUMMARY_CONTEXT', 'vw_aiemp_workforce_research_summary_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Research digest and prior output summary context', false, true, false, 'Primary workforce research/summary view'),
  ('AV_WORKFORCE_AUDIT_CONTEXT', 'workforce_execution', 'VF84_WORKFORCE_AUDIT_CONTEXT', 'vw_aiemp_workforce_audit_context', 'cx22073jw', 'audit', 'access_only', 'registry_only', 'Work trace and handoff history context', false, true, false, 'Primary workforce audit view'),

  ('AV_COMBAT_MISSION_CONTEXT', 'combat_unit', 'VF90_COMBAT_MISSION_CONTEXT', 'vw_aiemp_combat_mission_context', 'cx22073jw', 'operational', 'access_only_gate_controlled', 'registry_only', 'Mission and command summary context', false, true, true, 'Mission context'),
  ('AV_COMBAT_BATTLEFIELD_CONTEXT', 'combat_unit', 'VF91_COMBAT_BATTLEFIELD_CONTEXT', 'vw_aiemp_combat_battlefield_context', 'cx22073jw', 'operational', 'access_only_gate_controlled', 'registry_only', 'Battlefield visible state context', false, true, true, 'Battlefield context'),
  ('AV_COMBAT_ROLE_LOADOUT_CONTEXT', 'combat_unit', 'VF92_COMBAT_ROLE_AND_LOADOUT_CONTEXT', 'vw_aiemp_combat_role_loadout_context', 'cx22073jw', 'operational', 'access_only_gate_controlled', 'registry_only', 'Role, loadout, and engagement style context', false, true, true, 'Loadout context'),
  ('AV_COMBAT_ROE_SAFETY_CONTEXT', 'combat_unit', 'VF93_COMBAT_ROE_AND_SAFETY_CONTEXT', 'vw_aiemp_combat_roe_safety_context', 'cx22073jw', 'safety', 'access_only_gate_controlled', 'registry_only', 'Rules of engagement and safety boundary context', false, true, true, 'ROE context'),
  ('AV_COMBAT_DAMAGE_REPAIR_CONTEXT', 'combat_unit', 'VF94_COMBAT_DAMAGE_AND_REPAIR_CONTEXT', 'vw_aiemp_combat_damage_repair_context', 'cx22073jw', 'operational', 'access_only_gate_controlled', 'registry_only', 'Damage, repair, and rebuild lifecycle context', false, true, true, 'Repair lifecycle context'),
  ('AV_COMBAT_AUDIT_CONTEXT', 'combat_unit', 'VF95_COMBAT_AUDIT_CONTEXT', 'vw_aiemp_combat_audit_context', 'cx22073jw', 'audit', 'access_only_gate_controlled', 'registry_only', 'Combat action and repair audit context', false, true, true, 'Combat audit context'),

  ('AV_ADMIN_CASE_CONTEXT', 'clerical_execution', 'VF100_ADMIN_CASE_CONTEXT', 'vw_aiemp_admin_case_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Administrative case context', false, true, false, 'Primary admin case view'),
  ('AV_ADMIN_DOCUMENT_FORM_CONTEXT', 'clerical_execution', 'VF101_ADMIN_DOCUMENT_AND_FORM_CONTEXT', 'vw_aiemp_admin_document_form_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Administrative document and form context', false, true, false, 'Primary admin document/form view'),
  ('AV_ADMIN_PROCESS_CONTEXT', 'clerical_execution', 'VF102_ADMIN_PROCESS_CONTEXT', 'vw_aiemp_admin_process_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Administrative process and routing context', false, true, false, 'Primary admin process view'),
  ('AV_ADMIN_REFERENCE_CONTEXT', 'clerical_execution', 'VF103_ADMIN_REFERENCE_CONTEXT', 'vw_aiemp_admin_reference_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Administrative reference and regulation digest context', false, true, false, 'Primary admin reference view'),
  ('AV_ADMIN_AUDIT_CONTEXT', 'clerical_execution', 'VF104_ADMIN_AUDIT_CONTEXT', 'vw_aiemp_admin_audit_context', 'cx22073jw', 'audit', 'access_only', 'registry_only', 'Administrative audit and trace context', false, true, false, 'Primary admin audit view'),

  ('AV_ADMIN_CONTROL_POLICY_CONTEXT', 'clerical_control', 'VF110_ADMIN_CONTROL_POLICY_CONTEXT', 'vw_aiemp_admin_control_policy_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Administrative control policy context', false, true, false, 'Primary control policy view'),
  ('AV_ADMIN_CONTROL_WORKFORCE_CONTEXT', 'clerical_control', 'VF111_ADMIN_CONTROL_WORKFORCE_CONTEXT', 'vw_aiemp_admin_control_workforce_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Administrative control workforce context', false, true, false, 'Primary control workforce view'),
  ('AV_ADMIN_CONTROL_ASSIGNMENT_CONTEXT', 'clerical_control', 'VF112_ADMIN_CONTROL_ASSIGNMENT_CONTEXT', 'vw_aiemp_admin_control_assignment_context', 'cx22073jw', 'operational', 'access_only_gate_controlled', 'registry_only', 'Administrative control assignment context', false, true, true, 'Controlled assignment view'),
  ('AV_ADMIN_CONTROL_REPORTING_CONTEXT', 'clerical_control', 'VF113_ADMIN_CONTROL_REPORTING_CONTEXT', 'vw_aiemp_admin_control_reporting_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Administrative control reporting context', false, true, false, 'Primary control reporting view'),
  ('AV_ADMIN_CONTROL_AUDIT_CONTEXT', 'clerical_control', 'VF114_ADMIN_CONTROL_AUDIT_CONTEXT', 'vw_aiemp_admin_control_audit_context', 'cx22073jw', 'audit', 'access_only', 'registry_only', 'Administrative control audit context', false, true, false, 'Primary control audit view'),

  ('AV_SENIOR_CONTROL_AGGREGATION_CONTEXT', 'senior_clerical_control', 'VF120_SENIOR_CONTROL_AGGREGATION_CONTEXT', 'vw_aiemp_senior_control_aggregation_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Senior control aggregation context', false, true, false, 'Primary senior aggregation view'),
  ('AV_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT', 'senior_clerical_control', 'VF121_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT', 'vw_aiemp_senior_control_policy_draft_context', 'cx22073jw', 'support', 'access_only', 'registry_only', 'Senior control policy draft context', false, true, false, 'Primary senior policy draft view'),
  ('AV_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT', 'senior_clerical_control', 'VF122_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT', 'vw_aiemp_senior_control_approval_request_context', 'cx22073jw', 'support', 'access_only_gate_controlled', 'registry_only', 'Senior control approval request package context', false, true, true, 'Human approval required context'),
  ('AV_SENIOR_CONTROL_AUDIT_CONTEXT', 'senior_clerical_control', 'VF123_SENIOR_CONTROL_AUDIT_CONTEXT', 'vw_aiemp_senior_control_audit_context', 'cx22073jw', 'audit', 'access_only', 'registry_only', 'Senior control audit context', false, true, false, 'Primary senior audit view')
ON CONFLICT (actual_view_code) DO UPDATE
SET domain_code           = EXCLUDED.domain_code,
    view_family_code      = EXCLUDED.view_family_code,
    logical_view_name     = EXCLUDED.logical_view_name,
    intended_schema_name  = EXCLUDED.intended_schema_name,
    sensitivity_code      = EXCLUDED.sensitivity_code,
    exposure_scope        = EXCLUDED.exposure_scope,
    lifecycle_status      = EXCLUDED.lifecycle_status,
    purpose_text          = EXCLUDED.purpose_text,
    raw_table_read_allowed= EXCLUDED.raw_table_read_allowed,
    grantable_readonly    = EXCLUDED.grantable_readonly,
    gate_required         = EXCLUDED.gate_required,
    notes                 = EXCLUDED.notes,
    updated_at            = NOW();

INSERT INTO cx22073jw.access_view_family_actual_view_map (
  view_family_code, actual_view_code, mapping_role, sort_order
)
SELECT
  avr.view_family_code,
  avr.actual_view_code,
  CASE
    WHEN avr.actual_view_code IN (
      'AV_OPS_MASKED_RECORD_CONTEXT','AV_OPS_REVIEW_PACKAGE_CONTEXT','AV_OPS_AUDIT_DIGEST',
      'AV_STREAM_PUBLIC_CONTEXT','AV_STREAM_SUPPORT_CONTEXT','AV_STREAM_MODERATION_CONTEXT',
      'AV_GAME_MATCH_CONTEXT','AV_GAME_BALANCE_SAFE_CONTEXT',
      'AV_EDU_SUBJECT_CATALOG','AV_EDU_TEACHING_GUIDE','AV_EDU_MASKED_LEARNER_CONTEXT',
      'AV_QUALIFICATION_CATALOG','AV_QUALIFICATION_PAST_QUESTION_METADATA','AV_QUALIFICATION_ANSWER_EXPLANATION',
      'AV_UTILITY_WRITING_CONTEXT','AV_UTILITY_SUMMARY_CONTEXT',
      'AV_WORKFORCE_WORK_ORDER_CONTEXT','AV_WORKFORCE_APP_OPERATION_CONTEXT','AV_WORKFORCE_MASKED_WORK_CONTEXT',
      'AV_COMBAT_MISSION_CONTEXT','AV_COMBAT_ROE_SAFETY_CONTEXT',
      'AV_ADMIN_CASE_CONTEXT','AV_ADMIN_PROCESS_CONTEXT',
      'AV_ADMIN_CONTROL_POLICY_CONTEXT','AV_ADMIN_CONTROL_ASSIGNMENT_CONTEXT',
      'AV_SENIOR_CONTROL_AGGREGATION_CONTEXT','AV_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT',
      'AV_SHARED_PUBLIC_GUIDE','AV_SHARED_APP_HELP',
      'AV_QUALIFICATION_PAST_QUESTION_CONTENT','AV_EDU_PRIVILEGED_CONTEXT','AV_QUALIFICATION_PRIVILEGED_CONTEXT',
      'AV_OPS_PRIVILEGED_INCIDENT_CONTEXT','AV_UTILITY_PRIVILEGED_CONTEXT'
    ) THEN 'primary'
    WHEN avr.actual_view_code IN (
      'AV_OPS_APPROVAL_ROUTING_CONTEXT','AV_OPS_QUEUE_CONTEXT','AV_OPS_RETRY_CONTEXT',
      'AV_STREAM_SEGMENT_PUBLIC_CONTEXT','AV_STREAM_SHOW_FLOW_CONTEXT','AV_STREAM_BRAND_SAFE_RULE',
      'AV_GAME_PARTY_MEMBER_CONTEXT','AV_GAME_COMMENTATOR_CONTEXT',
      'AV_EDU_PUBLIC_GUIDE','AV_EDU_LEVEL_ADAPTIVE_CONTEXT','AV_EDU_PROGRESS_CONTEXT','AV_EDU_LAB_RESEARCH_CONTEXT',
      'AV_QUALIFICATION_PUBLIC_GUIDE','AV_QUALIFICATION_SYLLABUS_CONTEXT','AV_QUALIFICATION_STUDY_PLAN_CONTEXT',
      'AV_QUALIFICATION_MOCK_VARIANT_CONTEXT','AV_QUALIFICATION_ESSAY_ORAL_CONTEXT','AV_QUALIFICATION_UPDATE_REVISION_CONTEXT',
      'AV_UTILITY_CALCULATION_CONTEXT','AV_UTILITY_MEAL_PLANNING_CONTEXT','AV_UTILITY_DAILY_TASK_CONTEXT','AV_UTILITY_RESEARCH_CONTEXT',
      'AV_WORKFORCE_RESEARCH_SUMMARY_CONTEXT','AV_WORKFORCE_AUDIT_CONTEXT',
      'AV_COMBAT_BATTLEFIELD_CONTEXT','AV_COMBAT_ROLE_LOADOUT_CONTEXT','AV_COMBAT_DAMAGE_REPAIR_CONTEXT','AV_COMBAT_AUDIT_CONTEXT',
      'AV_ADMIN_DOCUMENT_FORM_CONTEXT','AV_ADMIN_REFERENCE_CONTEXT','AV_ADMIN_AUDIT_CONTEXT',
      'AV_ADMIN_CONTROL_WORKFORCE_CONTEXT','AV_ADMIN_CONTROL_REPORTING_CONTEXT','AV_ADMIN_CONTROL_AUDIT_CONTEXT',
      'AV_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT','AV_SENIOR_CONTROL_AUDIT_CONTEXT'
    ) THEN 'supporting'
    ELSE 'specialized'
  END AS mapping_role,
  ROW_NUMBER() OVER (PARTITION BY avr.view_family_code ORDER BY avr.logical_view_name)::integer
FROM cx22073jw.access_actual_view_registry avr
ON CONFLICT (view_family_code, actual_view_code) DO UPDATE
SET mapping_role = EXCLUDED.mapping_role,
    sort_order   = EXCLUDED.sort_order;

INSERT INTO cx22073jw.access_role_actual_view_grant_skeleton (
  role_code,
  actual_view_code,
  grant_kind,
  grant_mode,
  rank_intersection_needed,
  app_scope_needed,
  gate_needed,
  audit_obligation,
  notes
)
SELECT
  rvf.role_code,
  fmap.actual_view_code,
  'select_readonly',
  rvf.access_mode,
  true,
  true,
  avr.gate_required,
  true,
  COALESCE(rvf.scope_note, '') || CASE WHEN avr.gate_required THEN ' / gate_required' ELSE '' END
FROM cx22073jw.access_role_view_family_policy rvf
JOIN cx22073jw.access_view_family_actual_view_map fmap
  ON fmap.view_family_code = rvf.view_family_code
JOIN cx22073jw.access_actual_view_registry avr
  ON avr.actual_view_code = fmap.actual_view_code
WHERE
  (rvf.access_mode = 'required' AND fmap.mapping_role IN ('primary','supporting'))
  OR
  (rvf.access_mode = 'conditional' AND fmap.mapping_role IN ('primary','specialized'))
ON CONFLICT (role_code, actual_view_code) DO UPDATE
SET grant_kind                = EXCLUDED.grant_kind,
    grant_mode                = EXCLUDED.grant_mode,
    rank_intersection_needed  = EXCLUDED.rank_intersection_needed,
    app_scope_needed          = EXCLUDED.app_scope_needed,
    gate_needed               = EXCLUDED.gate_needed,
    audit_obligation          = EXCLUDED.audit_obligation,
    notes                     = EXCLUDED.notes;

CREATE OR REPLACE VIEW cx22073jw.v_access_actual_view_family_summary AS
SELECT
  vf.domain_code,
  vf.view_family_code,
  vf.family_name,
  vf.sensitivity_code,
  COUNT(avr.actual_view_code) AS actual_view_count
FROM cx22073jw.access_view_family_master vf
LEFT JOIN cx22073jw.access_actual_view_registry avr
  ON avr.view_family_code = vf.view_family_code
GROUP BY
  vf.domain_code,
  vf.view_family_code,
  vf.family_name,
  vf.sensitivity_code
ORDER BY vf.domain_code, vf.view_family_code;

CREATE OR REPLACE VIEW cx22073jw.v_access_actual_view_registry_summary AS
SELECT
  avr.domain_code,
  avr.view_family_code,
  avr.actual_view_code,
  avr.logical_view_name,
  avr.sensitivity_code,
  avr.exposure_scope,
  avr.lifecycle_status,
  avr.gate_required,
  avr.grantable_readonly
FROM cx22073jw.access_actual_view_registry avr
ORDER BY avr.domain_code, avr.view_family_code, avr.logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_role_actual_view_grant_matrix AS
SELECT
  r.domain_code,
  r.role_code,
  r.role_name,
  avr.actual_view_code,
  avr.logical_view_name,
  avr.view_family_code,
  g.grant_mode,
  g.gate_needed,
  g.audit_obligation,
  g.notes
FROM cx22073jw.access_role_actual_view_grant_skeleton g
JOIN cx22073jw.access_role_master r
  ON r.role_code = g.role_code
JOIN cx22073jw.access_actual_view_registry avr
  ON avr.actual_view_code = g.actual_view_code
ORDER BY r.domain_code, r.role_code, avr.logical_view_name;

CREATE OR REPLACE VIEW cx22073jw.v_access_gate_controlled_actual_views AS
SELECT
  avr.domain_code,
  avr.view_family_code,
  avr.actual_view_code,
  avr.logical_view_name,
  avr.sensitivity_code,
  avr.exposure_scope,
  avr.gate_required,
  avr.notes
FROM cx22073jw.access_actual_view_registry avr
WHERE avr.gate_required = true
   OR avr.exposure_scope = 'access_only_gate_controlled'
ORDER BY avr.domain_code, avr.logical_view_name;

COMMIT;

\echo '============================================================'
\echo 'ACTUAL VIEW FAMILY SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_access_actual_view_family_summary;

\echo '============================================================'
\echo 'GATE CONTROLLED ACTUAL VIEWS'
\echo '============================================================'
TABLE cx22073jw.v_access_gate_controlled_actual_views;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS ACTUAL VIEW REGISTRY / GRANT DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
