\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 1. MG-NORN-001 Urd also reads NORN common robot material for worldbuilding.
-- ============================================================

INSERT INTO aiworker.robot_brain_model_domain_policy
(model_code, brain_domain_code, policy_code, allowed_use_purpose_codes, safety_note_ja, active_flag)
VALUES
('MG-NORN-001', 'robot_aiworker', 'allow', ARRAY['worldbuilding','reference','review','design_reference']::text[], 'ウルズは過去・歴史・基礎史の文脈でNORN共通/robot設計材料を読める。', true)
ON CONFLICT (model_code, brain_domain_code) DO UPDATE SET
  policy_code = EXCLUDED.policy_code,
  allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
  safety_note_ja = EXCLUDED.safety_note_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 2. NORN common robot material should be usable for worldbuilding too.
-- Existing purposes are preserved.
-- ============================================================

UPDATE cx22073jw.brain_knowledge_unit
SET
  allowed_use_purpose_codes = (
    SELECT ARRAY(
      SELECT DISTINCT x
      FROM unnest(
        allowed_use_purpose_codes
        || ARRAY['worldbuilding','health_life_review','business_planning','reference','review','design_reference']::text[]
      ) AS u(x)
      ORDER BY x
    )
  ),
  updated_at = now()
WHERE unit_code IN (
  'pack04_robot_009_megami_time_axis',
  'pack04_megami_007_norn_cross_review'
);

UPDATE cx22073jw.brain_data_registry r
SET
  allowed_use_purpose_codes = u.allowed_use_purpose_codes,
  safety_boundary_ja = u.safety_boundary_ja,
  updated_at = now()
FROM cx22073jw.brain_knowledge_unit u
WHERE r.brain_data_code = u.unit_code
  AND u.unit_code IN (
    'pack04_robot_009_megami_time_axis',
    'pack04_megami_007_norn_cross_review'
  );

COMMIT;
