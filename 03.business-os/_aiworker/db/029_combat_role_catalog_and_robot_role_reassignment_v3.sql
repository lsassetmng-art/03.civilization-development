BEGIN;

CREATE TEMP TABLE tmp_combat_role_seed (
  role_code text PRIMARY KEY,
  role_name_ja text,
  role_name_en text,
  target_level_default_code text,
  single_slot_flag boolean,
  max_active_per_target integer,
  sort_order integer,
  status_code text,
  role_description_ja text,
  cx_readable_flag boolean,
  canon_owner text
) ON COMMIT DROP;

INSERT INTO tmp_combat_role_seed (
  role_code,
  role_name_ja,
  role_name_en,
  target_level_default_code,
  single_slot_flag,
  max_active_per_target,
  sort_order,
  status_code,
  role_description_ja,
  cx_readable_flag,
  canon_owner
)
VALUES
  ('Battler','戦闘ロボット','Battler Robot','section',false,NULL,112,'active','戦闘員・護衛・近接防衛・戦闘演出系ロール。現実の危害実行支援ではなく、フィクション、警備設計、防災、危機対応、世界観参照に限定する。',true,'BusinessOS'),
  ('Security','警備ロボット','Security Robot','section',false,NULL,114,'active','警備・防衛・護衛・危機対応系ロール。現実の攻撃支援ではなく、警備設計、防災、避難、リスク整理、世界観参照に限定する。',true,'BusinessOS'),
  ('CombatSpecialist','戦闘専門ロボット','Combat Specialist Robot','section',false,NULL,120,'active','狙撃・特殊戦・高精度戦闘演出などの戦闘専門系ロール。業務系Specialistとは分離し、現実の危害実行支援には使わない。',true,'BusinessOS'),
  ('TacticalLeader','戦術指揮ロボット','Tactical Leader Robot','section',false,NULL,130,'active','戦術指揮・小隊運用・局地防衛・危機対応系ロール。業務系Leaderとは分離し、フィクション/警備/防災/世界観用途に限定する。',true,'BusinessOS'),
  ('StrategicCommander','戦略指揮ロボット','Strategic Commander Robot','department',false,NULL,140,'active','戦略・広域作戦・文明防衛・危機管理・世界観上の戦争設計系ロール。業務系President/Managerとは分離する。',true,'BusinessOS');

DO $$
DECLARE
  v_cols text[];
  v_insert_cols text;
  v_insert_select text;
  v_update_set text;
BEGIN
  SELECT array_agg(col_name ORDER BY ord)
    INTO v_cols
  FROM (
    SELECT *
    FROM unnest(ARRAY[
      'role_code',
      'role_name_ja',
      'role_name_en',
      'target_level_default_code',
      'single_slot_flag',
      'max_active_per_target',
      'sort_order',
      'status_code',
      'role_description_ja',
      'cx_readable_flag',
      'canon_owner'
    ]) WITH ORDINALITY AS u(col_name, ord)
  ) c
  WHERE EXISTS (
    SELECT 1
    FROM information_schema.columns ic
    WHERE ic.table_schema = 'business'
      AND ic.table_name = 'robot_placement_role_catalog'
      AND ic.column_name = c.col_name
  );

  IF v_cols IS NULL OR NOT ('role_code' = ANY(v_cols)) THEN
    RAISE EXCEPTION 'robot_placement_role_catalog role_code column not found';
  END IF;

  SELECT string_agg(format('%I', col_name), ', ')
    INTO v_insert_cols
  FROM unnest(v_cols) AS col_name;

  SELECT string_agg(format('s.%I', col_name), ', ')
    INTO v_insert_select
  FROM unnest(v_cols) AS col_name;

  SELECT string_agg(format('%I = s.%I', col_name, col_name), ', ')
    INTO v_update_set
  FROM unnest(v_cols) AS col_name
  WHERE col_name <> 'role_code';

  IF v_update_set IS NOT NULL THEN
    EXECUTE format(
      'UPDATE business.robot_placement_role_catalog t
          SET %s
        FROM tmp_combat_role_seed s
        WHERE t.role_code = s.role_code',
      v_update_set
    );
  END IF;

  EXECUTE format(
    'INSERT INTO business.robot_placement_role_catalog (%s)
     SELECT %s
     FROM tmp_combat_role_seed s
     WHERE NOT EXISTS (
       SELECT 1
       FROM business.robot_placement_role_catalog t
       WHERE t.role_code = s.role_code
     )',
    v_insert_cols,
    v_insert_select
  );

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business'
      AND table_name = 'robot_placement_role_catalog'
      AND column_name = 'updated_at'
  ) THEN
    EXECUTE
      'UPDATE business.robot_placement_role_catalog
          SET updated_at = now()
        WHERE role_code IN (
          ''Battler'',
          ''Security'',
          ''CombatSpecialist'',
          ''TacticalLeader'',
          ''StrategicCommander''
        )';
  END IF;
END $$;

CREATE TEMP TABLE tmp_combat_model_role_seed (
  model_code text PRIMARY KEY,
  role_1 text,
  role_2 text,
  role_3 text
) ON COMMIT DROP;

INSERT INTO tmp_combat_model_role_seed (model_code, role_1, role_2, role_3)
VALUES
  ('HD-R2', 'Butler', 'Battler', 'Security'),
  ('HD-R2S', 'CombatSpecialist', 'Security', 'Battler'),
  ('HD-R2G', 'StrategicCommander', 'TacticalLeader', 'Battler'),
  ('HD-R2T-0', 'StrategicCommander', 'TacticalLeader', 'Security');

DO $$
DECLARE
  v_model_col text;
  v_role1_col text;
  v_role2_col text;
  v_role3_col text;
  rec record;
BEGIN
  SELECT column_name INTO v_model_col
  FROM information_schema.columns
  WHERE table_schema = 'business'
    AND table_name = 'robot_pool'
    AND column_name IN ('aiworker_model_code', 'model_code')
  ORDER BY CASE column_name WHEN 'aiworker_model_code' THEN 1 ELSE 2 END
  LIMIT 1;

  SELECT column_name INTO v_role1_col
  FROM information_schema.columns
  WHERE table_schema = 'business'
    AND table_name = 'robot_pool'
    AND column_name IN ('placement_role_code_1', 'role_code_1', 'role_1')
  ORDER BY CASE column_name WHEN 'placement_role_code_1' THEN 1 WHEN 'role_code_1' THEN 2 ELSE 3 END
  LIMIT 1;

  SELECT column_name INTO v_role2_col
  FROM information_schema.columns
  WHERE table_schema = 'business'
    AND table_name = 'robot_pool'
    AND column_name IN ('placement_role_code_2', 'role_code_2', 'role_2')
  ORDER BY CASE column_name WHEN 'placement_role_code_2' THEN 1 WHEN 'role_code_2' THEN 2 ELSE 3 END
  LIMIT 1;

  SELECT column_name INTO v_role3_col
  FROM information_schema.columns
  WHERE table_schema = 'business'
    AND table_name = 'robot_pool'
    AND column_name IN ('placement_role_code_3', 'role_code_3', 'role_3')
  ORDER BY CASE column_name WHEN 'placement_role_code_3' THEN 1 WHEN 'role_code_3' THEN 2 ELSE 3 END
  LIMIT 1;

  IF v_model_col IS NULL THEN
    RAISE EXCEPTION 'business.robot_pool model code column not found';
  END IF;

  IF v_role1_col IS NULL OR v_role2_col IS NULL OR v_role3_col IS NULL THEN
    RAISE EXCEPTION 'business.robot_pool placement role slot columns not found';
  END IF;

  FOR rec IN SELECT * FROM tmp_combat_model_role_seed LOOP
    EXECUTE format(
      'UPDATE business.robot_pool
          SET %I = $1,
              %I = $2,
              %I = $3
        WHERE %I = $4',
      v_role1_col,
      v_role2_col,
      v_role3_col,
      v_model_col
    )
    USING rec.role_1, rec.role_2, rec.role_3, rec.model_code;
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business'
      AND table_name = 'robot_pool'
      AND column_name = 'updated_at'
  ) THEN
    EXECUTE format(
      'UPDATE business.robot_pool
          SET updated_at = now()
        WHERE %I IN (
          ''HD-R2'',
          ''HD-R2S'',
          ''HD-R2G'',
          ''HD-R2T-0''
        )',
      v_model_col
    );
  END IF;
END $$;

COMMIT;
