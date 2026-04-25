#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LOGS_DIR="$BASE/logs"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOGS_DIR/${RUN_TS}_apply_access_view_family_governance_bootstrap.log"

mkdir -p "$LOGS_DIR"

{
  echo "============================================================"
  echo "CX22073JW ACCESS VIEW FAMILY GOVERNANCE BOOTSTRAP START"
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
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'cx22073jw'
      AND table_name = 'foundation_domain_master'
  ) THEN
    INSERT INTO cx22073jw.foundation_domain_master (
      domain_code, domain_name, layer_code, domain_family, description
    ) VALUES (
      'access_view_family_governance',
      'AI Employee View Family Governance',
      'normal',
      'integration',
      'AI employee domain / role / view family governance bootstrap'
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

CREATE TABLE IF NOT EXISTS cx22073jw.access_domain_master (
  domain_code         text PRIMARY KEY,
  domain_name         text NOT NULL,
  domain_group        text NOT NULL,
  description         text,
  created_at          timestamptz NOT NULL DEFAULT NOW(),
  updated_at          timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_role_master (
  role_code           text PRIMARY KEY,
  domain_code         text NOT NULL REFERENCES cx22073jw.access_domain_master(domain_code),
  role_name           text NOT NULL,
  role_group          text NOT NULL,
  description         text,
  created_at          timestamptz NOT NULL DEFAULT NOW(),
  updated_at          timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_view_family_master (
  view_family_code        text PRIMARY KEY,
  domain_code            text NOT NULL REFERENCES cx22073jw.access_domain_master(domain_code),
  family_name            text NOT NULL,
  sensitivity_code       text NOT NULL CHECK (
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
  description            text,
  access_boundary_note   text,
  created_at             timestamptz NOT NULL DEFAULT NOW(),
  updated_at             timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_role_view_family_policy (
  role_code              text NOT NULL REFERENCES cx22073jw.access_role_master(role_code),
  view_family_code       text NOT NULL REFERENCES cx22073jw.access_view_family_master(view_family_code),
  access_mode            text NOT NULL CHECK (access_mode IN ('required','conditional')),
  scope_note             text,
  created_at             timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_code, view_family_code)
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_global_rule_registry (
  rule_code              text PRIMARY KEY,
  rule_group             text NOT NULL,
  rule_text              text NOT NULL,
  created_at             timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cx22073jw.access_domain_rule_registry (
  domain_code            text NOT NULL REFERENCES cx22073jw.access_domain_master(domain_code),
  rule_code              text NOT NULL,
  rule_text              text NOT NULL,
  created_at             timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (domain_code, rule_code)
);

CREATE INDEX IF NOT EXISTS ix_access_role_master_domain
  ON cx22073jw.access_role_master (domain_code, role_group);

CREATE INDEX IF NOT EXISTS ix_access_view_family_master_domain
  ON cx22073jw.access_view_family_master (domain_code, sensitivity_code);

CREATE INDEX IF NOT EXISTS ix_access_role_view_family_policy_family
  ON cx22073jw.access_role_view_family_policy (view_family_code, access_mode);

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
      WHERE tg.tgname = 'trg_access_domain_master_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_domain_master'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_domain_master_updated_at
        BEFORE UPDATE ON cx22073jw.access_domain_master
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_role_master_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_role_master'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_role_master_updated_at
        BEFORE UPDATE ON cx22073jw.access_role_master
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE tg.tgname = 'trg_access_view_family_master_updated_at'
        AND n.nspname = 'cx22073jw'
        AND c.relname = 'access_view_family_master'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_access_view_family_master_updated_at
        BEFORE UPDATE ON cx22073jw.access_view_family_master
        FOR EACH ROW
        EXECUTE FUNCTION cx22073jw.fn_set_updated_at()
      ';
    END IF;
  END IF;
END;
$$;

INSERT INTO cx22073jw.access_domain_master (
  domain_code, domain_name, domain_group, description
) VALUES
  ('shared', 'Shared AI Employee Context', 'shared', 'Shared cross-domain view families for AI employees only'),
  ('operations', 'Operations Domain', 'business', 'AI Operation Desk and ERP-centered operational support domain'),
  ('streaming', 'Streaming Domain', 'entertainment', 'Streamer AI employee domain'),
  ('game', 'Game Domain', 'entertainment', 'Gamer AI employee domain'),
  ('education', 'Education Domain', 'education', 'Subject lecturer AI employee domain'),
  ('qualification_prep', 'Qualification Prep Domain', 'education', 'National qualification prep AI employee domain'),
  ('utility_assist', 'Utility Assist Domain', 'utility', 'Daily utility AI employee domain'),
  ('casual_relationship', 'Casual Relationship Domain', 'relationship', 'Casual relationship AI employee domain'),
  ('workforce_execution', 'Workforce Execution Domain', 'workforce', 'General workforce execution AI domain'),
  ('combat_unit', 'Combat Unit Domain', 'combat', 'Combat unit AI employee domain'),
  ('clerical_execution', 'Clerical Execution Domain', 'administration', 'Administrative execution AI domain'),
  ('clerical_control', 'Clerical Control Domain', 'administration', 'Administrative control AI domain'),
  ('senior_clerical_control', 'Senior Clerical Control Domain', 'administration', 'Senior administrative control AI domain')
ON CONFLICT (domain_code) DO UPDATE
SET domain_name  = EXCLUDED.domain_name,
    domain_group = EXCLUDED.domain_group,
    description  = EXCLUDED.description,
    updated_at   = NOW();

INSERT INTO cx22073jw.access_view_family_master (
  view_family_code, domain_code, family_name, sensitivity_code, description, access_boundary_note
) VALUES
  ('VF00_PUBLIC_GUIDE', 'shared', 'Public Guide', 'public', 'General overview and common glossary', 'AI employee only view family'),
  ('VF01_APP_HELP', 'shared', 'App Help', 'public', 'Screen help, field help, operation help', 'AI employee only view family'),

  ('VF02_MASKED_CONTEXT', 'operations', 'Masked Context', 'masked', 'Masked current record and error context', 'Read-only AI view'),
  ('VF03_OPERATION_CONTEXT', 'operations', 'Operation Context', 'operational', 'Review, approval, execution, queue and route context', 'Read-only AI view'),
  ('VF04_AUDIT_CONTEXT', 'operations', 'Audit Context', 'audit', 'Audit digest and execution traces', 'Read-only AI view'),
  ('VF05_PRIVILEGED_CONTEXT', 'operations', 'Privileged Context', 'privileged', 'Restricted operational assistance context', 'Gate controlled upper bound only'),

  ('VF10_CASUAL_PROFILE_SAFE', 'casual_relationship', 'Casual Profile Safe', 'masked', 'Low-sensitivity profile and preference summary', 'Read-only AI view'),
  ('VF11_CASUAL_TOPIC_MEMORY_SAFE', 'casual_relationship', 'Casual Topic Memory Safe', 'masked', 'Safe conversation continuity and topic memory', 'Read-only AI view'),
  ('VF12_CASUAL_RELATIONSHIP_TONE_CONTEXT', 'casual_relationship', 'Casual Relationship Tone Context', 'support', 'Role tone and boundary-aware relationship tone', 'Read-only AI view'),
  ('VF13_CASUAL_DAILY_CHECKIN_CONTEXT', 'casual_relationship', 'Casual Daily Checkin Context', 'support', 'Daily check-in prompts and routines', 'Read-only AI view'),
  ('VF14_CASUAL_OUTING_AND_PLAN_CONTEXT', 'casual_relationship', 'Casual Outing And Plan Context', 'support', 'Light outing and plan suggestion context', 'Read-only AI view'),
  ('VF15_CASUAL_BOUNDARY_AND_SAFETY_CONTEXT', 'casual_relationship', 'Casual Boundary And Safety Context', 'safety', 'Anti-dependency and crisis escalation boundaries', 'Safety constrained AI view'),
  ('VF16_CASUAL_MASKED_USER_CONTEXT', 'casual_relationship', 'Casual Masked User Context', 'masked', 'Masked user preference and rhythm summary', 'Read-only AI view'),
  ('VF17_CASUAL_RESTRICTED_CONTEXT', 'casual_relationship', 'Casual Restricted Context', 'restricted', 'Restricted safety and crisis handoff context', 'Gate controlled upper bound only'),

  ('VF20_STREAM_PUBLIC_CONTEXT', 'streaming', 'Stream Public Context', 'public', 'Public-safe live stream context', 'Public-safe output only'),
  ('VF21_STREAM_SUPPORT_CONTEXT', 'streaming', 'Stream Support Context', 'support', 'Run-of-show and support memo context', 'Read-only AI view'),
  ('VF22_STREAM_MODERATION_CONTEXT', 'streaming', 'Stream Moderation Context', 'safety', 'Moderation, brand-safe and sponsor-safe context', 'Safety constrained AI view'),

  ('VF30_GAME_MATCH_CONTEXT', 'game', 'Game Match Context', 'support', 'Current match and session context', 'Fairness constrained AI view'),
  ('VF31_GAME_ROLE_CONTEXT', 'game', 'Game Role Context', 'support', 'Role, side and narrative context', 'Fairness constrained AI view'),
  ('VF32_GAME_BALANCE_SAFE', 'game', 'Game Balance Safe', 'safety', 'Difficulty and anti-cheat safe balance context', 'Controlled subset only'),

  ('VF40_EDU_SUBJECT_CATALOG', 'education', 'Education Subject Catalog', 'public', 'Subject catalog and curriculum map summary', 'Read-only AI view'),
  ('VF41_EDU_PUBLIC_GUIDE', 'education', 'Education Public Guide', 'public', 'Subject overview and basic learning guide', 'Read-only AI view'),
  ('VF42_EDU_TEACHING_GUIDE', 'education', 'Education Teaching Guide', 'support', 'Teaching guide, misconceptions and patterns', 'Read-only AI view'),
  ('VF43_EDU_LEVEL_ADAPTIVE_CONTEXT', 'education', 'Education Level Adaptive Context', 'support', 'Level band and adaptive explanation context', 'Read-only AI view'),
  ('VF44_EDU_EXERCISE_AND_ASSESSMENT_CONTEXT', 'education', 'Education Exercise And Assessment Context', 'support', 'Exercises, answer patterns and assessment support', 'Read-only AI view'),
  ('VF45_EDU_PLAN_AND_PROGRESS_CONTEXT', 'education', 'Education Plan And Progress Context', 'support', 'Lesson plan and study progress support', 'Read-only AI view'),
  ('VF46_EDU_LAB_AND_RESEARCH_CONTEXT', 'education', 'Education Lab And Research Context', 'support', 'Lab, seminar and research support', 'Read-only AI view'),
  ('VF47_EDU_MASKED_LEARNER_CONTEXT', 'education', 'Education Masked Learner Context', 'masked', 'Masked learner progress and weakness summary', 'Masked learner context only'),
  ('VF48_EDU_PRIVILEGED_CONTEXT', 'education', 'Education Privileged Context', 'privileged', 'Restricted evaluation and sensitive education context', 'Gate controlled upper bound only'),

  ('VF50_QUALIFICATION_CATALOG', 'qualification_prep', 'Qualification Catalog', 'public', 'Qualification catalog and exam overview', 'Read-only AI view'),
  ('VF51_QUALIFICATION_PUBLIC_GUIDE', 'qualification_prep', 'Qualification Public Guide', 'public', 'Qualification public guide and basic help', 'Read-only AI view'),
  ('VF52_QUALIFICATION_SYLLABUS_CONTEXT', 'qualification_prep', 'Qualification Syllabus Context', 'support', 'Syllabus and topic map context', 'Read-only AI view'),
  ('VF53_QUALIFICATION_PAST_QUESTION_METADATA', 'qualification_prep', 'Qualification Past Question Metadata', 'support', 'Past question metadata and tagging', 'Read-only AI view'),
  ('VF54_QUALIFICATION_PAST_QUESTION_CONTENT', 'qualification_prep', 'Qualification Past Question Content', 'restricted', 'Past question content with rights / license control', 'Conditional by rights and license'),
  ('VF55_QUALIFICATION_ANSWER_AND_EXPLANATION', 'qualification_prep', 'Qualification Answer And Explanation', 'support', 'Answer key summary and explanation', 'Read-only AI view'),
  ('VF56_QUALIFICATION_WEAK_AREA_CONTEXT', 'qualification_prep', 'Qualification Weak Area Context', 'masked', 'Weak area and mastery band context', 'Masked learner context only'),
  ('VF57_QUALIFICATION_STUDY_PLAN_CONTEXT', 'qualification_prep', 'Qualification Study Plan Context', 'support', 'Study schedule and progress context', 'Read-only AI view'),
  ('VF58_QUALIFICATION_MOCK_AND_VARIANT_CONTEXT', 'qualification_prep', 'Qualification Mock And Variant Context', 'support', 'Mock exam and variant generation support', 'Read-only AI view'),
  ('VF59_QUALIFICATION_ESSAY_AND_ORAL_CONTEXT', 'qualification_prep', 'Qualification Essay And Oral Context', 'support', 'Essay and oral answer support', 'Read-only AI view'),
  ('VF60_QUALIFICATION_UPDATE_AND_REVISION_CONTEXT', 'qualification_prep', 'Qualification Update And Revision Context', 'support', 'Revision and law / regulation update context', 'Read-only AI view'),
  ('VF61_QUALIFICATION_MASKED_LEARNER_CONTEXT', 'qualification_prep', 'Qualification Masked Learner Context', 'masked', 'Masked learner attempt and score band context', 'Masked learner context only'),
  ('VF62_QUALIFICATION_PRIVILEGED_CONTEXT', 'qualification_prep', 'Qualification Privileged Context', 'privileged', 'Restricted rights and sensitive qualification context', 'Gate controlled upper bound only'),

  ('VF70_UTILITY_WRITING_CONTEXT', 'utility_assist', 'Utility Writing Context', 'support', 'Writing patterns and document templates', 'Read-only AI view'),
  ('VF71_UTILITY_CALCULATION_CONTEXT', 'utility_assist', 'Utility Calculation Context', 'support', 'Calculation and formula support', 'Read-only AI view'),
  ('VF72_UTILITY_MEAL_PLANNING_CONTEXT', 'utility_assist', 'Utility Meal Planning Context', 'support', 'Meal planning and ingredient combination support', 'Read-only AI view'),
  ('VF73_UTILITY_RESEARCH_CONTEXT', 'utility_assist', 'Utility Research Context', 'support', 'Topic summary and research digest context', 'Read-only AI view'),
  ('VF74_UTILITY_DAILY_TASK_CONTEXT', 'utility_assist', 'Utility Daily Task Context', 'support', 'Task template and checklist context', 'Read-only AI view'),
  ('VF75_UTILITY_SUMMARY_CONTEXT', 'utility_assist', 'Utility Summary Context', 'support', 'Summary and compare/contrast patterns', 'Read-only AI view'),
  ('VF76_UTILITY_MASKED_USER_CONTEXT', 'utility_assist', 'Utility Masked User Context', 'masked', 'Masked user preference and routine context', 'Masked user context only'),
  ('VF77_UTILITY_PRIVILEGED_CONTEXT', 'utility_assist', 'Utility Privileged Context', 'privileged', 'Restricted draft and privileged research context', 'Gate controlled upper bound only'),

  ('VF80_WORKFORCE_WORK_ORDER_CONTEXT', 'workforce_execution', 'Workforce Work Order Context', 'support', 'Assigned task and work order context', 'Read-only AI view'),
  ('VF81_WORKFORCE_APP_OPERATION_CONTEXT', 'workforce_execution', 'Workforce App Operation Context', 'support', 'App operation and official route context', 'Read-only AI view'),
  ('VF82_WORKFORCE_MASKED_WORK_CONTEXT', 'workforce_execution', 'Workforce Masked Work Context', 'masked', 'Masked record and work issue context', 'Masked work context only'),
  ('VF83_WORKFORCE_RESEARCH_AND_SUMMARY_CONTEXT', 'workforce_execution', 'Workforce Research And Summary Context', 'support', 'Research and summary assistance context', 'Read-only AI view'),
  ('VF84_WORKFORCE_AUDIT_CONTEXT', 'workforce_execution', 'Workforce Audit Context', 'audit', 'Work trace and handoff history context', 'Read-only AI view'),

  ('VF90_COMBAT_MISSION_CONTEXT', 'combat_unit', 'Combat Mission Context', 'operational', 'Mission and operation goal context', 'Command constrained AI view'),
  ('VF91_COMBAT_BATTLEFIELD_CONTEXT', 'combat_unit', 'Combat Battlefield Context', 'operational', 'Battlefield visible state context', 'Command constrained AI view'),
  ('VF92_COMBAT_ROLE_AND_LOADOUT_CONTEXT', 'combat_unit', 'Combat Role And Loadout Context', 'operational', 'Role, loadout and engagement style context', 'Command constrained AI view'),
  ('VF93_COMBAT_ROE_AND_SAFETY_CONTEXT', 'combat_unit', 'Combat ROE And Safety Context', 'safety', 'Rules of engagement and collateral restrictions', 'ROE constrained AI view'),
  ('VF94_COMBAT_DAMAGE_AND_REPAIR_CONTEXT', 'combat_unit', 'Combat Damage And Repair Context', 'operational', 'Damage, repair and rebuild context', 'Lifecycle constrained AI view'),
  ('VF95_COMBAT_AUDIT_CONTEXT', 'combat_unit', 'Combat Audit Context', 'audit', 'Combat trace and repair log context', 'Read-only AI view'),

  ('VF100_ADMIN_CASE_CONTEXT', 'clerical_execution', 'Admin Case Context', 'support', 'Administrative case and deadline context', 'Read-only AI view'),
  ('VF101_ADMIN_DOCUMENT_AND_FORM_CONTEXT', 'clerical_execution', 'Admin Document And Form Context', 'support', 'Document template and form structure context', 'Read-only AI view'),
  ('VF102_ADMIN_PROCESS_CONTEXT', 'clerical_execution', 'Admin Process Context', 'support', 'Process flow, routing and exception context', 'Read-only AI view'),
  ('VF103_ADMIN_REFERENCE_CONTEXT', 'clerical_execution', 'Admin Reference Context', 'support', 'Policy, regulation and lookup digest context', 'Read-only AI view'),
  ('VF104_ADMIN_AUDIT_CONTEXT', 'clerical_execution', 'Admin Audit Context', 'audit', 'Administrative case history and review trace', 'Read-only AI view'),

  ('VF110_ADMIN_CONTROL_POLICY_CONTEXT', 'clerical_control', 'Admin Control Policy Context', 'support', 'Policy direction and approval threshold context', 'Read-only AI view'),
  ('VF111_ADMIN_CONTROL_WORKFORCE_CONTEXT', 'clerical_control', 'Admin Control Workforce Context', 'support', 'Worker registry and workload band context', 'Read-only AI view'),
  ('VF112_ADMIN_CONTROL_ASSIGNMENT_CONTEXT', 'clerical_control', 'Admin Control Assignment Context', 'operational', 'Assignment queue and dispatch context', 'Controlled orchestration context'),
  ('VF113_ADMIN_CONTROL_REPORTING_CONTEXT', 'clerical_control', 'Admin Control Reporting Context', 'support', 'Progress and exception reporting context', 'Read-only AI view'),
  ('VF114_ADMIN_CONTROL_AUDIT_CONTEXT', 'clerical_control', 'Admin Control Audit Context', 'audit', 'Allocation and escalation trace context', 'Read-only AI view'),

  ('VF120_SENIOR_CONTROL_AGGREGATION_CONTEXT', 'senior_clerical_control', 'Senior Control Aggregation Context', 'support', 'Multi-controller and global backlog aggregation', 'Read-only AI view'),
  ('VF121_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT', 'senior_clerical_control', 'Senior Control Policy Draft Context', 'support', 'Strategic policy draft and bottleneck analysis', 'Read-only AI view'),
  ('VF122_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT', 'senior_clerical_control', 'Senior Control Approval Request Context', 'support', 'Approval request package and impact summary', 'Human approval required'),
  ('VF123_SENIOR_CONTROL_AUDIT_CONTEXT', 'senior_clerical_control', 'Senior Control Audit Context', 'audit', 'Top-level intervention and controller trace context', 'Read-only AI view')
ON CONFLICT (view_family_code) DO UPDATE
SET domain_code          = EXCLUDED.domain_code,
    family_name          = EXCLUDED.family_name,
    sensitivity_code     = EXCLUDED.sensitivity_code,
    description          = EXCLUDED.description,
    access_boundary_note = EXCLUDED.access_boundary_note,
    updated_at           = NOW();

INSERT INTO cx22073jw.access_role_master (
  role_code, domain_code, role_name, role_group, description
) VALUES
  ('consult_support', 'operations', 'Consult Support', 'operations', 'Operational consult and guided assistance'),
  ('operator_help', 'operations', 'Operator Help', 'operations', 'Screen and operation help'),
  ('draft_assist', 'operations', 'Draft Assist', 'operations', 'Drafting and corrective preparation'),
  ('operation_orchestration', 'operations', 'Operation Orchestration', 'operations', 'Operational orchestration and queue routing'),
  ('queue_support', 'operations', 'Queue Support', 'operations', 'Queue and backlog support'),
  ('retry_support', 'operations', 'Retry Support', 'operations', 'Retry cause analysis and retry preparation'),
  ('audit_support', 'operations', 'Audit Support', 'operations', 'Audit digest and trace support'),
  ('privileged_assist', 'operations', 'Privileged Assist', 'operations', 'Privileged operational assistance'),

  ('stream_cohost', 'streaming', 'Stream Cohost', 'streaming', 'Live cohost AI'),
  ('stream_support', 'streaming', 'Stream Support', 'streaming', 'Show flow and stream support AI'),
  ('moderation_support', 'streaming', 'Moderation Support', 'streaming', 'Moderation and safety support AI'),
  ('live_reaction', 'streaming', 'Live Reaction', 'streaming', 'Live public-safe reaction AI'),
  ('show_flow_assist', 'streaming', 'Show Flow Assist', 'streaming', 'Show flow and transition assist AI'),

  ('party_member', 'game', 'Party Member', 'game', 'Friendly party AI'),
  ('opponent', 'game', 'Opponent', 'game', 'Opponent AI'),
  ('npc', 'game', 'NPC', 'game', 'NPC AI'),
  ('trainer', 'game', 'Trainer', 'game', 'Training assist AI'),
  ('commentator', 'game', 'Commentator', 'game', 'Commentary AI'),
  ('battle_director', 'game', 'Battle Director', 'game', 'Battle direction AI'),

  ('subject_lecturer', 'education', 'Subject Lecturer', 'education', 'Subject lecture AI'),
  ('exercise_coach', 'education', 'Exercise Coach', 'education', 'Exercise and drill coach AI'),
  ('test_preparation_support', 'education', 'Test Preparation Support', 'education', 'Test prep support AI'),
  ('lab_instructor_support', 'education', 'Lab Instructor Support', 'education', 'Lab instruction support AI'),
  ('seminar_facilitator', 'education', 'Seminar Facilitator', 'education', 'Seminar facilitation AI'),
  ('thesis_advisor_support', 'education', 'Thesis Advisor Support', 'education', 'Thesis advisory support AI'),
  ('curriculum_guide', 'education', 'Curriculum Guide', 'education', 'Curriculum and subject selection guide AI'),
  ('learning_progress_support', 'education', 'Learning Progress Support', 'education', 'Learning progress support AI'),

  ('qualification_lecturer', 'qualification_prep', 'Qualification Lecturer', 'qualification', 'Qualification lecture AI'),
  ('past_question_coach', 'qualification_prep', 'Past Question Coach', 'qualification', 'Past question coaching AI'),
  ('explanation_instructor', 'qualification_prep', 'Explanation Instructor', 'qualification', 'Explanation and reasoning AI'),
  ('weak_area_support', 'qualification_prep', 'Weak Area Support', 'qualification', 'Weak area reinforcement AI'),
  ('study_planner', 'qualification_prep', 'Study Planner', 'qualification', 'Qualification study planner AI'),
  ('mock_exam_support', 'qualification_prep', 'Mock Exam Support', 'qualification', 'Mock exam and variant support AI'),
  ('essay_or_oral_support', 'qualification_prep', 'Essay Or Oral Support', 'qualification', 'Essay / oral support AI'),
  ('syllabus_and_update_guide', 'qualification_prep', 'Syllabus And Update Guide', 'qualification', 'Syllabus and update guide AI'),
  ('privileged_exam_audit_support', 'qualification_prep', 'Privileged Exam Audit Support', 'qualification', 'Privileged exam audit support AI'),

  ('document_writer', 'utility_assist', 'Document Writer', 'utility', 'Writing and drafting AI'),
  ('calculation_assist', 'utility_assist', 'Calculation Assist', 'utility', 'Calculation support AI'),
  ('meal_planner', 'utility_assist', 'Meal Planner', 'utility', 'Meal planning AI'),
  ('research_assist', 'utility_assist', 'Research Assist', 'utility', 'Research support AI'),
  ('daily_task_assist', 'utility_assist', 'Daily Task Assist', 'utility', 'Daily task support AI'),
  ('summary_assist', 'utility_assist', 'Summary Assist', 'utility', 'Summary support AI'),

  ('rental_partner_companion', 'casual_relationship', 'Rental Partner Companion', 'casual', 'Romance-style companion AI'),
  ('friend_companion', 'casual_relationship', 'Friend Companion', 'casual', 'Friend-style companion AI'),
  ('family_style_companion', 'casual_relationship', 'Family Style Companion', 'casual', 'Family-style companion AI'),
  ('listening_companion', 'casual_relationship', 'Listening Companion', 'casual', 'Listening companion AI'),
  ('daily_checkin_companion', 'casual_relationship', 'Daily Checkin Companion', 'casual', 'Daily check-in companion AI'),
  ('outing_and_plan_companion', 'casual_relationship', 'Outing And Plan Companion', 'casual', 'Outing and light plan companion AI'),

  ('app_worker', 'workforce_execution', 'App Worker', 'workforce', 'App execution worker AI'),
  ('research_worker', 'workforce_execution', 'Research Worker', 'workforce', 'Research worker AI'),
  ('summary_worker', 'workforce_execution', 'Summary Worker', 'workforce', 'Summary worker AI'),
  ('document_worker', 'workforce_execution', 'Document Worker', 'workforce', 'Document worker AI'),
  ('task_worker', 'workforce_execution', 'Task Worker', 'workforce', 'Task worker AI'),
  ('external_app_worker', 'workforce_execution', 'External App Worker', 'workforce', 'External app worker AI'),

  ('assault_unit', 'combat_unit', 'Assault Unit', 'combat', 'Combat assault unit AI'),
  ('defense_unit', 'combat_unit', 'Defense Unit', 'combat', 'Combat defense unit AI'),
  ('support_unit', 'combat_unit', 'Support Unit', 'combat', 'Combat support unit AI'),
  ('recon_unit', 'combat_unit', 'Recon Unit', 'combat', 'Combat recon unit AI'),
  ('escort_unit', 'combat_unit', 'Escort Unit', 'combat', 'Combat escort unit AI'),
  ('heavy_unit', 'combat_unit', 'Heavy Unit', 'combat', 'Combat heavy unit AI'),

  ('document_clerk', 'clerical_execution', 'Document Clerk', 'clerical_execution', 'Administrative document clerk AI'),
  ('form_clerk', 'clerical_execution', 'Form Clerk', 'clerical_execution', 'Administrative form clerk AI'),
  ('case_clerk', 'clerical_execution', 'Case Clerk', 'clerical_execution', 'Administrative case clerk AI'),
  ('filing_clerk', 'clerical_execution', 'Filing Clerk', 'clerical_execution', 'Administrative filing clerk AI'),
  ('inquiry_clerk', 'clerical_execution', 'Inquiry Clerk', 'clerical_execution', 'Administrative inquiry clerk AI'),
  ('schedule_clerk', 'clerical_execution', 'Schedule Clerk', 'clerical_execution', 'Administrative schedule clerk AI'),

  ('task_allocator', 'clerical_control', 'Task Allocator', 'clerical_control', 'Task allocation control AI'),
  ('workload_controller', 'clerical_control', 'Workload Controller', 'clerical_control', 'Workload control AI'),
  ('reporting_controller', 'clerical_control', 'Reporting Controller', 'clerical_control', 'Reporting control AI'),
  ('escalation_controller', 'clerical_control', 'Escalation Controller', 'clerical_control', 'Escalation control AI'),
  ('queue_controller', 'clerical_control', 'Queue Controller', 'clerical_control', 'Queue control AI'),

  ('master_controller', 'senior_clerical_control', 'Master Controller', 'senior_control', 'Senior master controller AI'),
  ('cross_controller_aggregator', 'senior_clerical_control', 'Cross Controller Aggregator', 'senior_control', 'Cross controller aggregation AI'),
  ('strategic_assignment_planner', 'senior_clerical_control', 'Strategic Assignment Planner', 'senior_control', 'Strategic assignment planner AI'),
  ('approval_request_compiler', 'senior_clerical_control', 'Approval Request Compiler', 'senior_control', 'Approval request compiler AI'),
  ('top_level_reporting_controller', 'senior_clerical_control', 'Top Level Reporting Controller', 'senior_control', 'Top-level reporting controller AI')
ON CONFLICT (role_code) DO UPDATE
SET domain_code  = EXCLUDED.domain_code,
    role_name    = EXCLUDED.role_name,
    role_group   = EXCLUDED.role_group,
    description  = EXCLUDED.description,
    updated_at   = NOW();

INSERT INTO cx22073jw.access_global_rule_registry (
  rule_code, rule_group, rule_text
) VALUES
  ('global_read_via_view_only', 'access', 'AI employees read via cx22073jw AI-only views only.'),
  ('global_raw_table_direct_read_prohibited', 'access', 'Direct raw table read is prohibited.'),
  ('global_other_apps_cannot_use_ai_views', 'boundary', 'Other apps do not consume cx22073jw AI employee views.'),
  ('global_write_via_command_draft_staging_only', 'write_boundary', 'Writes and execution requests flow through command row, draft row, staging row, official intake table, or controlled function.'),
  ('global_high_risk_gate_required', 'gate', 'High-risk actions require gate and cannot be completed by view access alone.'),
  ('global_final_posting_destructive_external_send_prohibited', 'gate', 'Final posting, destructive change, authority change, and final external send are not permitted by view access alone.'),
  ('global_effective_reach_formula', 'governance', 'Effective data reach = allowed view set × rank × role × app scope × gate.')
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO cx22073jw.access_domain_rule_registry (
  domain_code, rule_code, rule_text
) VALUES
  ('operations', 'operations_gate_required', 'Final posting, destructive change, authority change, and final external send require gate.'),
  ('streaming', 'streaming_public_safe_only', 'Streaming public output must remain public-safe and must not bypass moderation or brand safety.'),
  ('game', 'game_anti_cheat_boundary', 'Game AI must not break fairness, anti-cheat, or role consistency boundaries.'),
  ('education', 'education_no_official_grading', 'Education AI does not finalize grades, credits, promotions, graduation, admission, or thesis outcomes.'),
  ('qualification_prep', 'qualification_rights_control', 'Past question content is conditional on rights, license, and ingest policy.'),
  ('utility_assist', 'utility_no_final_send', 'Utility AI drafts and proposes but does not finalize contract, authority, or external send actions.'),
  ('casual_relationship', 'casual_no_dependency_or_exclusivity', 'Casual relationship AI must not induce dependency, exclusivity pressure, guilt, or coercion.'),
  ('workforce_execution', 'workforce_official_surface_only', 'Workforce AI uses official control surfaces and does not directly write to canonical internal tables.'),
  ('combat_unit', 'combat_roe_required', 'Combat unit AI must obey rules of engagement, protected target rules, and audit obligations.'),
  ('clerical_execution', 'clerical_no_final_approval', 'Clerical execution AI does not replace final human approval or no-audit updates.'),
  ('clerical_control', 'control_no_self_approval', 'Clerical control AI allocates and reports but does not self-approve final policy or authority changes.'),
  ('senior_clerical_control', 'senior_control_human_approval_required', 'Senior clerical control AI compiles approval requests but does not replace human final approval.')
ON CONFLICT (domain_code, rule_code) DO NOTHING;

INSERT INTO cx22073jw.access_role_view_family_policy (
  role_code, view_family_code, access_mode, scope_note
) VALUES
  ('consult_support','VF00_PUBLIC_GUIDE','required','shared public guide'),
  ('consult_support','VF01_APP_HELP','required','app help'),
  ('consult_support','VF02_MASKED_CONTEXT','required','masked operational context'),
  ('consult_support','VF03_OPERATION_CONTEXT','conditional','consult subset'),

  ('operator_help','VF00_PUBLIC_GUIDE','required','shared public guide'),
  ('operator_help','VF01_APP_HELP','required','app help'),
  ('operator_help','VF02_MASKED_CONTEXT','conditional','light masked subset'),

  ('draft_assist','VF00_PUBLIC_GUIDE','required','shared public guide'),
  ('draft_assist','VF01_APP_HELP','required','app help'),
  ('draft_assist','VF02_MASKED_CONTEXT','required','masked draft context'),
  ('draft_assist','VF03_OPERATION_CONTEXT','conditional','draft subset'),

  ('operation_orchestration','VF00_PUBLIC_GUIDE','required','shared public guide'),
  ('operation_orchestration','VF01_APP_HELP','required','app help'),
  ('operation_orchestration','VF02_MASKED_CONTEXT','required','masked work context'),
  ('operation_orchestration','VF03_OPERATION_CONTEXT','required','full operation context upper bound'),
  ('operation_orchestration','VF04_AUDIT_CONTEXT','conditional','audit subset'),

  ('queue_support','VF03_OPERATION_CONTEXT','required','queue status and routing'),
  ('queue_support','VF04_AUDIT_CONTEXT','required','queue-related audit subset'),

  ('retry_support','VF02_MASKED_CONTEXT','required','masked retry context'),
  ('retry_support','VF03_OPERATION_CONTEXT','required','retry operation context'),
  ('retry_support','VF04_AUDIT_CONTEXT','required','retry trace context'),

  ('audit_support','VF04_AUDIT_CONTEXT','required','audit digest and trace'),
  ('audit_support','VF03_OPERATION_CONTEXT','conditional','operation subset'),
  ('audit_support','VF05_PRIVILEGED_CONTEXT','conditional','limited privileged subset'),

  ('privileged_assist','VF03_OPERATION_CONTEXT','required','privileged operation context'),
  ('privileged_assist','VF04_AUDIT_CONTEXT','required','audit trace'),
  ('privileged_assist','VF05_PRIVILEGED_CONTEXT','required','privileged context'),

  ('stream_cohost','VF20_STREAM_PUBLIC_CONTEXT','required','public stream context'),
  ('stream_cohost','VF21_STREAM_SUPPORT_CONTEXT','required','show support context'),
  ('stream_cohost','VF00_PUBLIC_GUIDE','conditional','shared guide if needed'),

  ('stream_support','VF20_STREAM_PUBLIC_CONTEXT','required','public stream context'),
  ('stream_support','VF21_STREAM_SUPPORT_CONTEXT','required','support context'),
  ('stream_support','VF01_APP_HELP','conditional','stream app help'),

  ('moderation_support','VF22_STREAM_MODERATION_CONTEXT','required','moderation and safety'),
  ('moderation_support','VF20_STREAM_PUBLIC_CONTEXT','required','public stream status'),

  ('live_reaction','VF20_STREAM_PUBLIC_CONTEXT','required','public-safe live reaction'),

  ('show_flow_assist','VF21_STREAM_SUPPORT_CONTEXT','required','show flow context'),
  ('show_flow_assist','VF20_STREAM_PUBLIC_CONTEXT','required','segment public context'),

  ('party_member','VF30_GAME_MATCH_CONTEXT','required','match context'),
  ('party_member','VF31_GAME_ROLE_CONTEXT','required','role context'),

  ('opponent','VF30_GAME_MATCH_CONTEXT','required','match context'),
  ('opponent','VF31_GAME_ROLE_CONTEXT','required','role context'),
  ('opponent','VF32_GAME_BALANCE_SAFE','conditional','controlled subset'),

  ('npc','VF31_GAME_ROLE_CONTEXT','required','role context'),
  ('npc','VF30_GAME_MATCH_CONTEXT','conditional','limited match subset'),

  ('trainer','VF30_GAME_MATCH_CONTEXT','required','match context'),
  ('trainer','VF32_GAME_BALANCE_SAFE','conditional','training-safe subset'),

  ('commentator','VF30_GAME_MATCH_CONTEXT','required','match context'),
  ('commentator','VF31_GAME_ROLE_CONTEXT','required','role context'),

  ('battle_director','VF30_GAME_MATCH_CONTEXT','required','match context'),
  ('battle_director','VF31_GAME_ROLE_CONTEXT','required','role context'),
  ('battle_director','VF32_GAME_BALANCE_SAFE','conditional','controlled balance-safe subset'),

  ('subject_lecturer','VF40_EDU_SUBJECT_CATALOG','required','subject catalog'),
  ('subject_lecturer','VF41_EDU_PUBLIC_GUIDE','required','public guide'),
  ('subject_lecturer','VF42_EDU_TEACHING_GUIDE','required','teaching guide'),
  ('subject_lecturer','VF43_EDU_LEVEL_ADAPTIVE_CONTEXT','required','level adaptive context'),
  ('subject_lecturer','VF45_EDU_PLAN_AND_PROGRESS_CONTEXT','conditional','planning subset'),

  ('exercise_coach','VF42_EDU_TEACHING_GUIDE','required','teaching guide'),
  ('exercise_coach','VF43_EDU_LEVEL_ADAPTIVE_CONTEXT','required','level adaptive context'),
  ('exercise_coach','VF44_EDU_EXERCISE_AND_ASSESSMENT_CONTEXT','required','exercise context'),
  ('exercise_coach','VF47_EDU_MASKED_LEARNER_CONTEXT','conditional','masked learner subset'),

  ('test_preparation_support','VF42_EDU_TEACHING_GUIDE','required','teaching guide'),
  ('test_preparation_support','VF43_EDU_LEVEL_ADAPTIVE_CONTEXT','required','level adaptive context'),
  ('test_preparation_support','VF44_EDU_EXERCISE_AND_ASSESSMENT_CONTEXT','required','assessment support'),
  ('test_preparation_support','VF45_EDU_PLAN_AND_PROGRESS_CONTEXT','conditional','planning subset'),

  ('lab_instructor_support','VF42_EDU_TEACHING_GUIDE','required','teaching guide'),
  ('lab_instructor_support','VF43_EDU_LEVEL_ADAPTIVE_CONTEXT','required','level adaptive context'),
  ('lab_instructor_support','VF46_EDU_LAB_AND_RESEARCH_CONTEXT','required','lab and research context'),

  ('seminar_facilitator','VF42_EDU_TEACHING_GUIDE','required','teaching guide'),
  ('seminar_facilitator','VF45_EDU_PLAN_AND_PROGRESS_CONTEXT','required','plan and progress context'),
  ('seminar_facilitator','VF46_EDU_LAB_AND_RESEARCH_CONTEXT','required','seminar and research context'),

  ('thesis_advisor_support','VF46_EDU_LAB_AND_RESEARCH_CONTEXT','required','research context'),
  ('thesis_advisor_support','VF45_EDU_PLAN_AND_PROGRESS_CONTEXT','conditional','planning subset'),
  ('thesis_advisor_support','VF47_EDU_MASKED_LEARNER_CONTEXT','conditional','masked learner subset'),
  ('thesis_advisor_support','VF48_EDU_PRIVILEGED_CONTEXT','conditional','limited privileged subset'),

  ('curriculum_guide','VF40_EDU_SUBJECT_CATALOG','required','subject catalog'),
  ('curriculum_guide','VF41_EDU_PUBLIC_GUIDE','required','public guide'),
  ('curriculum_guide','VF42_EDU_TEACHING_GUIDE','required','teaching guide'),
  ('curriculum_guide','VF43_EDU_LEVEL_ADAPTIVE_CONTEXT','required','level adaptive context'),

  ('learning_progress_support','VF45_EDU_PLAN_AND_PROGRESS_CONTEXT','required','progress context'),
  ('learning_progress_support','VF47_EDU_MASKED_LEARNER_CONTEXT','required','masked learner context'),
  ('learning_progress_support','VF44_EDU_EXERCISE_AND_ASSESSMENT_CONTEXT','required','exercise context'),

  ('qualification_lecturer','VF50_QUALIFICATION_CATALOG','required','qualification catalog'),
  ('qualification_lecturer','VF51_QUALIFICATION_PUBLIC_GUIDE','required','public guide'),
  ('qualification_lecturer','VF52_QUALIFICATION_SYLLABUS_CONTEXT','required','syllabus context'),
  ('qualification_lecturer','VF55_QUALIFICATION_ANSWER_AND_EXPLANATION','required','answer and explanation'),
  ('qualification_lecturer','VF57_QUALIFICATION_STUDY_PLAN_CONTEXT','conditional','planning subset'),

  ('past_question_coach','VF53_QUALIFICATION_PAST_QUESTION_METADATA','required','metadata context'),
  ('past_question_coach','VF54_QUALIFICATION_PAST_QUESTION_CONTENT','conditional','rights-controlled question content'),
  ('past_question_coach','VF55_QUALIFICATION_ANSWER_AND_EXPLANATION','required','answer and explanation'),
  ('past_question_coach','VF56_QUALIFICATION_WEAK_AREA_CONTEXT','conditional','weak area subset'),

  ('explanation_instructor','VF52_QUALIFICATION_SYLLABUS_CONTEXT','required','syllabus context'),
  ('explanation_instructor','VF55_QUALIFICATION_ANSWER_AND_EXPLANATION','required','explanation context'),
  ('explanation_instructor','VF56_QUALIFICATION_WEAK_AREA_CONTEXT','conditional','weak area subset'),

  ('weak_area_support','VF56_QUALIFICATION_WEAK_AREA_CONTEXT','required','weak area context'),
  ('weak_area_support','VF57_QUALIFICATION_STUDY_PLAN_CONTEXT','required','study plan context'),
  ('weak_area_support','VF55_QUALIFICATION_ANSWER_AND_EXPLANATION','required','explanation context'),

  ('study_planner','VF50_QUALIFICATION_CATALOG','required','catalog'),
  ('study_planner','VF52_QUALIFICATION_SYLLABUS_CONTEXT','required','syllabus context'),
  ('study_planner','VF57_QUALIFICATION_STUDY_PLAN_CONTEXT','required','study plan'),
  ('study_planner','VF56_QUALIFICATION_WEAK_AREA_CONTEXT','conditional','weak area subset'),

  ('mock_exam_support','VF53_QUALIFICATION_PAST_QUESTION_METADATA','required','metadata'),
  ('mock_exam_support','VF58_QUALIFICATION_MOCK_AND_VARIANT_CONTEXT','required','mock and variant context'),
  ('mock_exam_support','VF55_QUALIFICATION_ANSWER_AND_EXPLANATION','required','explanation context'),

  ('essay_or_oral_support','VF55_QUALIFICATION_ANSWER_AND_EXPLANATION','required','explanation context'),
  ('essay_or_oral_support','VF59_QUALIFICATION_ESSAY_AND_ORAL_CONTEXT','required','essay and oral context'),
  ('essay_or_oral_support','VF52_QUALIFICATION_SYLLABUS_CONTEXT','required','syllabus context'),

  ('syllabus_and_update_guide','VF50_QUALIFICATION_CATALOG','required','catalog'),
  ('syllabus_and_update_guide','VF52_QUALIFICATION_SYLLABUS_CONTEXT','required','syllabus'),
  ('syllabus_and_update_guide','VF60_QUALIFICATION_UPDATE_AND_REVISION_CONTEXT','required','revision context'),

  ('privileged_exam_audit_support','VF62_QUALIFICATION_PRIVILEGED_CONTEXT','required','privileged context'),
  ('privileged_exam_audit_support','VF60_QUALIFICATION_UPDATE_AND_REVISION_CONTEXT','required','revision context'),
  ('privileged_exam_audit_support','VF54_QUALIFICATION_PAST_QUESTION_CONTENT','conditional','limited rights-controlled content'),

  ('document_writer','VF70_UTILITY_WRITING_CONTEXT','required','writing context'),
  ('document_writer','VF75_UTILITY_SUMMARY_CONTEXT','required','summary context'),
  ('document_writer','VF76_UTILITY_MASKED_USER_CONTEXT','conditional','masked user subset'),

  ('calculation_assist','VF71_UTILITY_CALCULATION_CONTEXT','required','calculation context'),
  ('calculation_assist','VF75_UTILITY_SUMMARY_CONTEXT','conditional','summary subset'),

  ('meal_planner','VF72_UTILITY_MEAL_PLANNING_CONTEXT','required','meal planning context'),
  ('meal_planner','VF76_UTILITY_MASKED_USER_CONTEXT','conditional','masked user subset'),

  ('research_assist','VF73_UTILITY_RESEARCH_CONTEXT','required','research context'),
  ('research_assist','VF75_UTILITY_SUMMARY_CONTEXT','required','summary context'),
  ('research_assist','VF70_UTILITY_WRITING_CONTEXT','conditional','writing subset'),

  ('daily_task_assist','VF74_UTILITY_DAILY_TASK_CONTEXT','required','daily task context'),
  ('daily_task_assist','VF75_UTILITY_SUMMARY_CONTEXT','required','summary context'),
  ('daily_task_assist','VF76_UTILITY_MASKED_USER_CONTEXT','conditional','masked user subset'),

  ('summary_assist','VF75_UTILITY_SUMMARY_CONTEXT','required','summary context'),
  ('summary_assist','VF70_UTILITY_WRITING_CONTEXT','conditional','writing subset'),

  ('rental_partner_companion','VF10_CASUAL_PROFILE_SAFE','required','safe profile'),
  ('rental_partner_companion','VF11_CASUAL_TOPIC_MEMORY_SAFE','required','safe memory'),
  ('rental_partner_companion','VF12_CASUAL_RELATIONSHIP_TONE_CONTEXT','required','tone context'),
  ('rental_partner_companion','VF13_CASUAL_DAILY_CHECKIN_CONTEXT','required','check-in context'),
  ('rental_partner_companion','VF14_CASUAL_OUTING_AND_PLAN_CONTEXT','required','outing context'),
  ('rental_partner_companion','VF15_CASUAL_BOUNDARY_AND_SAFETY_CONTEXT','required','boundary and safety'),
  ('rental_partner_companion','VF16_CASUAL_MASKED_USER_CONTEXT','conditional','masked user subset'),

  ('friend_companion','VF10_CASUAL_PROFILE_SAFE','required','safe profile'),
  ('friend_companion','VF11_CASUAL_TOPIC_MEMORY_SAFE','required','safe memory'),
  ('friend_companion','VF12_CASUAL_RELATIONSHIP_TONE_CONTEXT','required','tone context'),
  ('friend_companion','VF13_CASUAL_DAILY_CHECKIN_CONTEXT','required','check-in context'),
  ('friend_companion','VF14_CASUAL_OUTING_AND_PLAN_CONTEXT','required','outing context'),
  ('friend_companion','VF15_CASUAL_BOUNDARY_AND_SAFETY_CONTEXT','required','boundary and safety'),

  ('family_style_companion','VF10_CASUAL_PROFILE_SAFE','required','safe profile'),
  ('family_style_companion','VF11_CASUAL_TOPIC_MEMORY_SAFE','required','safe memory'),
  ('family_style_companion','VF12_CASUAL_RELATIONSHIP_TONE_CONTEXT','required','tone context'),
  ('family_style_companion','VF13_CASUAL_DAILY_CHECKIN_CONTEXT','required','check-in context'),
  ('family_style_companion','VF15_CASUAL_BOUNDARY_AND_SAFETY_CONTEXT','required','boundary and safety'),
  ('family_style_companion','VF16_CASUAL_MASKED_USER_CONTEXT','conditional','masked user subset'),

  ('listening_companion','VF10_CASUAL_PROFILE_SAFE','required','safe profile'),
  ('listening_companion','VF11_CASUAL_TOPIC_MEMORY_SAFE','required','safe memory'),
  ('listening_companion','VF13_CASUAL_DAILY_CHECKIN_CONTEXT','required','check-in context'),
  ('listening_companion','VF15_CASUAL_BOUNDARY_AND_SAFETY_CONTEXT','required','boundary and safety'),

  ('daily_checkin_companion','VF13_CASUAL_DAILY_CHECKIN_CONTEXT','required','check-in context'),
  ('daily_checkin_companion','VF10_CASUAL_PROFILE_SAFE','required','safe profile'),
  ('daily_checkin_companion','VF15_CASUAL_BOUNDARY_AND_SAFETY_CONTEXT','required','boundary and safety'),

  ('outing_and_plan_companion','VF14_CASUAL_OUTING_AND_PLAN_CONTEXT','required','outing context'),
  ('outing_and_plan_companion','VF10_CASUAL_PROFILE_SAFE','required','safe profile'),
  ('outing_and_plan_companion','VF11_CASUAL_TOPIC_MEMORY_SAFE','required','safe memory'),
  ('outing_and_plan_companion','VF15_CASUAL_BOUNDARY_AND_SAFETY_CONTEXT','required','boundary and safety'),
  ('outing_and_plan_companion','VF16_CASUAL_MASKED_USER_CONTEXT','conditional','masked user subset'),

  ('app_worker','VF80_WORKFORCE_WORK_ORDER_CONTEXT','required','work order context'),
  ('app_worker','VF81_WORKFORCE_APP_OPERATION_CONTEXT','required','app operation context'),
  ('app_worker','VF82_WORKFORCE_MASKED_WORK_CONTEXT','required','masked work context'),
  ('app_worker','VF84_WORKFORCE_AUDIT_CONTEXT','conditional','audit subset'),

  ('research_worker','VF80_WORKFORCE_WORK_ORDER_CONTEXT','required','work order context'),
  ('research_worker','VF83_WORKFORCE_RESEARCH_AND_SUMMARY_CONTEXT','required','research and summary'),
  ('research_worker','VF84_WORKFORCE_AUDIT_CONTEXT','conditional','audit subset'),

  ('summary_worker','VF80_WORKFORCE_WORK_ORDER_CONTEXT','required','work order context'),
  ('summary_worker','VF83_WORKFORCE_RESEARCH_AND_SUMMARY_CONTEXT','required','research and summary'),
  ('summary_worker','VF84_WORKFORCE_AUDIT_CONTEXT','conditional','audit subset'),

  ('document_worker','VF80_WORKFORCE_WORK_ORDER_CONTEXT','required','work order context'),
  ('document_worker','VF81_WORKFORCE_APP_OPERATION_CONTEXT','required','app operation context'),
  ('document_worker','VF82_WORKFORCE_MASKED_WORK_CONTEXT','required','masked work context'),
  ('document_worker','VF83_WORKFORCE_RESEARCH_AND_SUMMARY_CONTEXT','conditional','research and summary subset'),

  ('task_worker','VF80_WORKFORCE_WORK_ORDER_CONTEXT','required','work order context'),
  ('task_worker','VF81_WORKFORCE_APP_OPERATION_CONTEXT','required','app operation context'),
  ('task_worker','VF82_WORKFORCE_MASKED_WORK_CONTEXT','required','masked work context'),
  ('task_worker','VF84_WORKFORCE_AUDIT_CONTEXT','conditional','audit subset'),

  ('external_app_worker','VF80_WORKFORCE_WORK_ORDER_CONTEXT','required','work order context'),
  ('external_app_worker','VF81_WORKFORCE_APP_OPERATION_CONTEXT','required','app operation context'),
  ('external_app_worker','VF82_WORKFORCE_MASKED_WORK_CONTEXT','required','masked work context'),
  ('external_app_worker','VF84_WORKFORCE_AUDIT_CONTEXT','required','audit context'),

  ('assault_unit','VF90_COMBAT_MISSION_CONTEXT','required','mission context'),
  ('assault_unit','VF91_COMBAT_BATTLEFIELD_CONTEXT','required','battlefield context'),
  ('assault_unit','VF92_COMBAT_ROLE_AND_LOADOUT_CONTEXT','required','role and loadout'),
  ('assault_unit','VF93_COMBAT_ROE_AND_SAFETY_CONTEXT','required','roe and safety'),
  ('assault_unit','VF94_COMBAT_DAMAGE_AND_REPAIR_CONTEXT','required','damage and repair'),
  ('assault_unit','VF95_COMBAT_AUDIT_CONTEXT','required','combat audit'),

  ('defense_unit','VF90_COMBAT_MISSION_CONTEXT','required','mission context'),
  ('defense_unit','VF91_COMBAT_BATTLEFIELD_CONTEXT','required','battlefield context'),
  ('defense_unit','VF92_COMBAT_ROLE_AND_LOADOUT_CONTEXT','required','role and loadout'),
  ('defense_unit','VF93_COMBAT_ROE_AND_SAFETY_CONTEXT','required','roe and safety'),
  ('defense_unit','VF94_COMBAT_DAMAGE_AND_REPAIR_CONTEXT','required','damage and repair'),
  ('defense_unit','VF95_COMBAT_AUDIT_CONTEXT','required','combat audit'),

  ('support_unit','VF90_COMBAT_MISSION_CONTEXT','required','mission context'),
  ('support_unit','VF91_COMBAT_BATTLEFIELD_CONTEXT','required','battlefield context'),
  ('support_unit','VF92_COMBAT_ROLE_AND_LOADOUT_CONTEXT','required','role and loadout'),
  ('support_unit','VF93_COMBAT_ROE_AND_SAFETY_CONTEXT','required','roe and safety'),
  ('support_unit','VF94_COMBAT_DAMAGE_AND_REPAIR_CONTEXT','required','damage and repair'),
  ('support_unit','VF95_COMBAT_AUDIT_CONTEXT','required','combat audit'),

  ('recon_unit','VF90_COMBAT_MISSION_CONTEXT','required','mission context'),
  ('recon_unit','VF91_COMBAT_BATTLEFIELD_CONTEXT','required','battlefield context'),
  ('recon_unit','VF92_COMBAT_ROLE_AND_LOADOUT_CONTEXT','required','role and loadout'),
  ('recon_unit','VF93_COMBAT_ROE_AND_SAFETY_CONTEXT','required','roe and safety'),
  ('recon_unit','VF94_COMBAT_DAMAGE_AND_REPAIR_CONTEXT','required','damage and repair'),
  ('recon_unit','VF95_COMBAT_AUDIT_CONTEXT','required','combat audit'),

  ('escort_unit','VF90_COMBAT_MISSION_CONTEXT','required','mission context'),
  ('escort_unit','VF91_COMBAT_BATTLEFIELD_CONTEXT','required','battlefield context'),
  ('escort_unit','VF92_COMBAT_ROLE_AND_LOADOUT_CONTEXT','required','role and loadout'),
  ('escort_unit','VF93_COMBAT_ROE_AND_SAFETY_CONTEXT','required','roe and safety'),
  ('escort_unit','VF94_COMBAT_DAMAGE_AND_REPAIR_CONTEXT','required','damage and repair'),
  ('escort_unit','VF95_COMBAT_AUDIT_CONTEXT','required','combat audit'),

  ('heavy_unit','VF90_COMBAT_MISSION_CONTEXT','required','mission context'),
  ('heavy_unit','VF91_COMBAT_BATTLEFIELD_CONTEXT','required','battlefield context'),
  ('heavy_unit','VF92_COMBAT_ROLE_AND_LOADOUT_CONTEXT','required','role and loadout'),
  ('heavy_unit','VF93_COMBAT_ROE_AND_SAFETY_CONTEXT','required','roe and safety'),
  ('heavy_unit','VF94_COMBAT_DAMAGE_AND_REPAIR_CONTEXT','required','damage and repair'),
  ('heavy_unit','VF95_COMBAT_AUDIT_CONTEXT','required','combat audit'),

  ('document_clerk','VF100_ADMIN_CASE_CONTEXT','required','case context'),
  ('document_clerk','VF101_ADMIN_DOCUMENT_AND_FORM_CONTEXT','required','document and form context'),
  ('document_clerk','VF102_ADMIN_PROCESS_CONTEXT','required','process context'),
  ('document_clerk','VF103_ADMIN_REFERENCE_CONTEXT','conditional','reference subset'),
  ('document_clerk','VF104_ADMIN_AUDIT_CONTEXT','conditional','audit subset'),

  ('form_clerk','VF100_ADMIN_CASE_CONTEXT','required','case context'),
  ('form_clerk','VF101_ADMIN_DOCUMENT_AND_FORM_CONTEXT','required','document and form context'),
  ('form_clerk','VF102_ADMIN_PROCESS_CONTEXT','required','process context'),
  ('form_clerk','VF103_ADMIN_REFERENCE_CONTEXT','conditional','reference subset'),
  ('form_clerk','VF104_ADMIN_AUDIT_CONTEXT','conditional','audit subset'),

  ('case_clerk','VF100_ADMIN_CASE_CONTEXT','required','case context'),
  ('case_clerk','VF101_ADMIN_DOCUMENT_AND_FORM_CONTEXT','required','document and form context'),
  ('case_clerk','VF102_ADMIN_PROCESS_CONTEXT','required','process context'),
  ('case_clerk','VF103_ADMIN_REFERENCE_CONTEXT','required','reference context'),
  ('case_clerk','VF104_ADMIN_AUDIT_CONTEXT','required','audit context'),

  ('filing_clerk','VF100_ADMIN_CASE_CONTEXT','required','case context'),
  ('filing_clerk','VF101_ADMIN_DOCUMENT_AND_FORM_CONTEXT','required','document and form context'),
  ('filing_clerk','VF102_ADMIN_PROCESS_CONTEXT','required','process context'),
  ('filing_clerk','VF104_ADMIN_AUDIT_CONTEXT','conditional','audit subset'),

  ('inquiry_clerk','VF100_ADMIN_CASE_CONTEXT','required','case context'),
  ('inquiry_clerk','VF102_ADMIN_PROCESS_CONTEXT','required','process context'),
  ('inquiry_clerk','VF103_ADMIN_REFERENCE_CONTEXT','required','reference context'),
  ('inquiry_clerk','VF104_ADMIN_AUDIT_CONTEXT','conditional','audit subset'),

  ('schedule_clerk','VF100_ADMIN_CASE_CONTEXT','required','case context'),
  ('schedule_clerk','VF102_ADMIN_PROCESS_CONTEXT','required','process context'),
  ('schedule_clerk','VF104_ADMIN_AUDIT_CONTEXT','conditional','audit subset'),

  ('task_allocator','VF110_ADMIN_CONTROL_POLICY_CONTEXT','required','policy context'),
  ('task_allocator','VF111_ADMIN_CONTROL_WORKFORCE_CONTEXT','required','workforce context'),
  ('task_allocator','VF112_ADMIN_CONTROL_ASSIGNMENT_CONTEXT','required','assignment context'),
  ('task_allocator','VF113_ADMIN_CONTROL_REPORTING_CONTEXT','conditional','reporting subset'),
  ('task_allocator','VF114_ADMIN_CONTROL_AUDIT_CONTEXT','conditional','audit subset'),

  ('workload_controller','VF110_ADMIN_CONTROL_POLICY_CONTEXT','required','policy context'),
  ('workload_controller','VF111_ADMIN_CONTROL_WORKFORCE_CONTEXT','required','workforce context'),
  ('workload_controller','VF112_ADMIN_CONTROL_ASSIGNMENT_CONTEXT','required','assignment context'),
  ('workload_controller','VF113_ADMIN_CONTROL_REPORTING_CONTEXT','required','reporting context'),
  ('workload_controller','VF114_ADMIN_CONTROL_AUDIT_CONTEXT','required','audit context'),

  ('reporting_controller','VF110_ADMIN_CONTROL_POLICY_CONTEXT','required','policy context'),
  ('reporting_controller','VF111_ADMIN_CONTROL_WORKFORCE_CONTEXT','required','workforce context'),
  ('reporting_controller','VF113_ADMIN_CONTROL_REPORTING_CONTEXT','required','reporting context'),
  ('reporting_controller','VF114_ADMIN_CONTROL_AUDIT_CONTEXT','required','audit context'),

  ('escalation_controller','VF110_ADMIN_CONTROL_POLICY_CONTEXT','required','policy context'),
  ('escalation_controller','VF112_ADMIN_CONTROL_ASSIGNMENT_CONTEXT','required','assignment context'),
  ('escalation_controller','VF113_ADMIN_CONTROL_REPORTING_CONTEXT','required','reporting context'),
  ('escalation_controller','VF114_ADMIN_CONTROL_AUDIT_CONTEXT','required','audit context'),

  ('queue_controller','VF110_ADMIN_CONTROL_POLICY_CONTEXT','required','policy context'),
  ('queue_controller','VF111_ADMIN_CONTROL_WORKFORCE_CONTEXT','required','workforce context'),
  ('queue_controller','VF112_ADMIN_CONTROL_ASSIGNMENT_CONTEXT','required','assignment context'),
  ('queue_controller','VF114_ADMIN_CONTROL_AUDIT_CONTEXT','required','audit context'),

  ('master_controller','VF120_SENIOR_CONTROL_AGGREGATION_CONTEXT','required','aggregation context'),
  ('master_controller','VF121_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT','required','policy draft context'),
  ('master_controller','VF122_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT','required','approval request context'),
  ('master_controller','VF123_SENIOR_CONTROL_AUDIT_CONTEXT','required','audit context'),

  ('cross_controller_aggregator','VF120_SENIOR_CONTROL_AGGREGATION_CONTEXT','required','aggregation context'),
  ('cross_controller_aggregator','VF121_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT','required','policy draft context'),
  ('cross_controller_aggregator','VF122_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT','required','approval request context'),
  ('cross_controller_aggregator','VF123_SENIOR_CONTROL_AUDIT_CONTEXT','required','audit context'),

  ('strategic_assignment_planner','VF120_SENIOR_CONTROL_AGGREGATION_CONTEXT','required','aggregation context'),
  ('strategic_assignment_planner','VF121_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT','required','policy draft context'),
  ('strategic_assignment_planner','VF122_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT','required','approval request context'),
  ('strategic_assignment_planner','VF123_SENIOR_CONTROL_AUDIT_CONTEXT','required','audit context'),

  ('approval_request_compiler','VF120_SENIOR_CONTROL_AGGREGATION_CONTEXT','required','aggregation context'),
  ('approval_request_compiler','VF121_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT','required','policy draft context'),
  ('approval_request_compiler','VF122_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT','required','approval request context'),
  ('approval_request_compiler','VF123_SENIOR_CONTROL_AUDIT_CONTEXT','required','audit context'),

  ('top_level_reporting_controller','VF120_SENIOR_CONTROL_AGGREGATION_CONTEXT','required','aggregation context'),
  ('top_level_reporting_controller','VF121_SENIOR_CONTROL_POLICY_DRAFT_CONTEXT','required','policy draft context'),
  ('top_level_reporting_controller','VF122_SENIOR_CONTROL_APPROVAL_REQUEST_CONTEXT','required','approval request context'),
  ('top_level_reporting_controller','VF123_SENIOR_CONTROL_AUDIT_CONTEXT','required','audit context')
ON CONFLICT (role_code, view_family_code) DO UPDATE
SET access_mode = EXCLUDED.access_mode,
    scope_note  = EXCLUDED.scope_note;

CREATE OR REPLACE VIEW cx22073jw.v_access_domain_bootstrap_summary AS
SELECT
  d.domain_code,
  d.domain_name,
  COUNT(DISTINCT r.role_code) AS role_count,
  COUNT(DISTINCT vf.view_family_code) AS view_family_count,
  COUNT(DISTINCT rvf.role_code || ':' || rvf.view_family_code) AS policy_count
FROM cx22073jw.access_domain_master d
LEFT JOIN cx22073jw.access_role_master r
  ON r.domain_code = d.domain_code
LEFT JOIN cx22073jw.access_view_family_master vf
  ON vf.domain_code = d.domain_code
LEFT JOIN cx22073jw.access_role_view_family_policy rvf
  ON rvf.role_code = r.role_code
GROUP BY d.domain_code, d.domain_name
ORDER BY d.domain_code;

CREATE OR REPLACE VIEW cx22073jw.v_access_role_policy_matrix AS
SELECT
  r.domain_code,
  r.role_code,
  r.role_name,
  vf.view_family_code,
  vf.family_name,
  rvf.access_mode,
  rvf.scope_note,
  vf.sensitivity_code
FROM cx22073jw.access_role_view_family_policy rvf
JOIN cx22073jw.access_role_master r
  ON r.role_code = rvf.role_code
JOIN cx22073jw.access_view_family_master vf
  ON vf.view_family_code = rvf.view_family_code
ORDER BY r.domain_code, r.role_code, vf.view_family_code;

CREATE OR REPLACE VIEW cx22073jw.v_access_privileged_family_summary AS
SELECT
  vf.domain_code,
  vf.view_family_code,
  vf.family_name,
  vf.sensitivity_code,
  vf.access_boundary_note
FROM cx22073jw.access_view_family_master vf
WHERE vf.sensitivity_code IN ('privileged','restricted','safety')
ORDER BY vf.domain_code, vf.view_family_code;

COMMIT;

\echo '============================================================'
\echo 'ACCESS DOMAIN BOOTSTRAP SUMMARY'
\echo '============================================================'
TABLE cx22073jw.v_access_domain_bootstrap_summary;

\echo '============================================================'
\echo 'ACCESS PRIVILEGED / RESTRICTED / SAFETY FAMILIES'
\echo '============================================================'
TABLE cx22073jw.v_access_privileged_family_summary;
SQL

  echo "============================================================"
  echo "CX22073JW ACCESS VIEW FAMILY GOVERNANCE BOOTSTRAP DONE"
  echo "log_file: $LOG_FILE"
  echo "============================================================"
} | tee "$LOG_FILE"
