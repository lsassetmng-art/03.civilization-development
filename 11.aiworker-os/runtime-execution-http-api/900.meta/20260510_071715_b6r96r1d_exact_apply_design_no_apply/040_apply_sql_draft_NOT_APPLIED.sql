-- ============================================================
-- B6R96R1D Apply SQL Draft
-- STATUS: NOT APPLIED
-- Purpose:
-- Add common task domains and profile integration using existing structures.
-- DO NOT RUN before Sato review and explicit GO.
-- ============================================================

-- Design decision:
-- 1. Prefer aiworker.business_support_task_domain for task/domain catalog.
-- 2. Prefer aiworker.worker_domain_proficiency for worker/domain quality.
-- 3. Prefer personaos persona_parameter_value/growth_axis for PersonaOS derived task profile.
-- 4. Add military/security domains separately with strict safety boundaries.
-- 5. Do not create large robot_worker_task_profile yet.

-- Next step B6R96R1E should generate column-exact INSERT statements
-- after reviewing 021_existing_structure_analysis.json and exact columns.
