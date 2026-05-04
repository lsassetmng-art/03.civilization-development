\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 1. Series / model policy reinforcement
-- ============================================================

INSERT INTO aiworker.robot_brain_model_domain_policy
(model_code, brain_domain_code, policy_code, allowed_use_purpose_codes, safety_note_ja, active_flag)
VALUES
('SERIES:LoVerS', 'hobby_entertainment', 'allow', ARRAY['smalltalk','reference']::text[], 'LoVerSシリーズは安全な趣味・接客・擬似恋人雑談材料を読める。依存誘導・監視・束縛は禁止。', true),
('MG-NORN-002', 'robot_aiworker', 'allow', ARRAY['health_life_review','reference','review','design_reference']::text[], 'ヴェルザンディは現在状況・生活文脈のため、NORN共通/robot設計材料を限定的に読める。', true),
('MG-NORN-003', 'robot_aiworker', 'allow', ARRAY['business_planning','reference','review','design_reference']::text[], 'スクルドは未来計画・業務計画のため、NORN共通/robot設計材料を読める。', true)
ON CONFLICT (model_code, brain_domain_code) DO UPDATE SET
  policy_code = EXCLUDED.policy_code,
  allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
  safety_note_ja = EXCLUDED.safety_note_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 2. Unit purpose reinforcement
-- NORN共通材料を health_life_review / business_planning でも使えるようにする。
-- 既存用途は消さずに追加する。
-- ============================================================

UPDATE cx22073jw.brain_knowledge_unit
SET
  allowed_use_purpose_codes = (
    SELECT ARRAY(
      SELECT DISTINCT x
      FROM unnest(
        allowed_use_purpose_codes
        || ARRAY['health_life_review','business_planning','reference','review','design_reference']::text[]
      ) AS u(x)
      ORDER BY x
    )
  ),
  updated_at = now()
WHERE unit_code IN (
  'pack04_robot_009_megami_time_axis',
  'pack04_megami_007_norn_cross_review'
);

UPDATE cx22073jw.brain_knowledge_unit
SET
  allowed_use_purpose_codes = (
    SELECT ARRAY(
      SELECT DISTINCT x
      FROM unnest(
        allowed_use_purpose_codes
        || ARRAY['health_life_review','smalltalk','reference']::text[]
      ) AS u(x)
      ORDER BY x
    )
  ),
  updated_at = now()
WHERE unit_code IN (
  'pack04_megami_004_verdandi_innocent_tone'
);

UPDATE cx22073jw.brain_knowledge_unit
SET
  allowed_use_purpose_codes = (
    SELECT ARRAY(
      SELECT DISTINCT x
      FROM unnest(
        allowed_use_purpose_codes
        || ARRAY['business_planning','smalltalk','reference']::text[]
      ) AS u(x)
      ORDER BY x
    )
  ),
  updated_at = now()
WHERE unit_code IN (
  'pack04_megami_006_skuld_energy_tone'
);

-- Registry同期
UPDATE cx22073jw.brain_data_registry r
SET
  allowed_use_purpose_codes = u.allowed_use_purpose_codes,
  safety_boundary_ja = u.safety_boundary_ja,
  updated_at = now()
FROM cx22073jw.brain_knowledge_unit u
WHERE r.brain_data_code = u.unit_code
  AND u.unit_code IN (
    'pack04_robot_009_megami_time_axis',
    'pack04_megami_007_norn_cross_review',
    'pack04_megami_004_verdandi_innocent_tone',
    'pack04_megami_006_skuld_energy_tone'
  );

COMMIT;
