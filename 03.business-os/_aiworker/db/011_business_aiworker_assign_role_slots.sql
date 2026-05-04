-- ============================================================
-- BusinessOS AIWorker assign role slots
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Change type: targeted update only
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

DO $$
DECLARE
  v_missing_models text;
  v_missing_roles text;
BEGIN
  IF to_regclass('business.robot_pool') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.robot_pool';
  END IF;

  IF to_regclass('business.robot_placement_role_catalog') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.robot_placement_role_catalog';
  END IF;

  SELECT string_agg(model_code, ', ' ORDER BY model_code)
    INTO v_missing_models
  FROM (
    VALUES
      ('HD-R5P'),
      ('HD-R5'),
      ('HD-R4'),
      ('HD-R3'),
      ('HD-R1'),
      ('HD-R2'),
      ('HD-R1C'),
      ('HD-R1A'),
      ('HD-R2S'),
      ('HD-R2G'),
      ('HD-R2T-0'),
      ('BYD1-001'),
      ('BYD1-002'),
      ('BYD1-003'),
      ('BYD2-001'),
      ('BYD2-002'),
      ('BYD2-003'),
      ('MG-NORN-001'),
      ('MG-NORN-002'),
      ('MG-NORN-003')
  ) AS required(model_code)
  WHERE NOT EXISTS (
    SELECT 1
    FROM business.robot_pool rp
    WHERE rp.aiworker_model_code = required.model_code
  );

  IF v_missing_models IS NOT NULL THEN
    RAISE EXCEPTION 'required_robot_pool_models_missing:%', v_missing_models;
  END IF;

  SELECT string_agg(role_code, ', ' ORDER BY role_code)
    INTO v_missing_roles
  FROM (
    VALUES
      ('President'),
      ('ExecutiveManager'),
      ('Manager'),
      ('Leader'),
      ('Worker'),
      ('Helper'),
      ('Friend'),
      ('Specialist'),
      ('Advisor'),
      ('Lover'),
      ('Battler'),
      ('Security')
  ) AS required(role_code)
  WHERE NOT EXISTS (
    SELECT 1
    FROM business.robot_placement_role_catalog rc
    WHERE rc.role_code = required.role_code
      AND rc.status_code = 'active'
  );

  IF v_missing_roles IS NOT NULL THEN
    RAISE EXCEPTION 'required_roles_missing:%', v_missing_roles;
  END IF;
END $$;

WITH role_assignment AS (
  SELECT *
  FROM (
    VALUES
      -- HD / helios_dynamics
      ('HD-R5P',   'President',        NULL,       NULL),
      ('HD-R5',    'ExecutiveManager', 'Manager',  NULL),
      ('HD-R4',    'Leader',           NULL,       NULL),
      ('HD-R3',    'Worker',           NULL,       NULL),
      ('HD-R1',    'Helper',           NULL,       NULL),
      ('HD-R2',    'Battler',          'Security', NULL),
      ('HD-R1C',   'Friend',           NULL,       NULL),
      ('HD-R1A',   'Lover',            NULL,       NULL),
      ('HD-R2S',   'Specialist',       NULL,       NULL),
      ('HD-R2G',   'Manager',          'Leader',   'Battler'),
      ('HD-R2T-0', 'President',        'ExecutiveManager', 'Battler'),

      -- Beyond / ASIC
      ('BYD1-001', 'Worker',           NULL,       NULL),
      ('BYD1-002', 'Worker',           'Helper',   NULL),
      ('BYD1-003', 'Worker',           'Specialist', NULL),
      ('BYD2-001', 'Leader',           NULL,       NULL),
      ('BYD2-002', 'Leader',           'Manager',  NULL),
      ('BYD2-003', 'President',        'Manager',  'ExecutiveManager'),

      -- MEGAMI / Mathers Garden
      ('MG-NORN-001', 'Advisor',       'Worker',   'Lover'),
      ('MG-NORN-002', 'Advisor',       'Worker',   'Lover'),
      ('MG-NORN-003', 'Advisor',       'Worker',   'Lover')
  ) AS t(aiworker_model_code, role_1, role_2, role_3)
)
UPDATE business.robot_pool rp
SET
  placement_role_code_1 = ra.role_1,
  placement_role_code_2 = ra.role_2,
  placement_role_code_3 = ra.role_3,
  placement_role_config_status_code = 'confirmed',
  placement_role_config_note = 'Boss-approved role slot assignment applied.',
  placement_role_config_updated_at = now(),
  updated_at = now()
FROM role_assignment ra
WHERE rp.aiworker_model_code = ra.aiworker_model_code;

UPDATE business.robot_pool rp
SET
  placement_role_code_1 = 'Lover',
  placement_role_code_2 = NULL,
  placement_role_code_3 = NULL,
  placement_role_config_status_code = 'confirmed',
  placement_role_config_note = 'Boss-approved LoVerS role slot assignment: Lover only.',
  placement_role_config_updated_at = now(),
  updated_at = now()
WHERE rp.aiworker_series_code = 'LoVerS'
  AND rp.aiworker_model_code LIKE 'LVS-%';

COMMIT;
