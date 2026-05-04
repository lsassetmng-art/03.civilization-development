BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

DO $$
BEGIN
  IF to_regclass('business.robot_pool') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.robot_pool';
  END IF;
END $$;

ALTER TABLE business.robot_pool
  ADD COLUMN IF NOT EXISTS placement_role_code_1 text,
  ADD COLUMN IF NOT EXISTS placement_role_code_2 text,
  ADD COLUMN IF NOT EXISTS placement_role_code_3 text,
  ADD COLUMN IF NOT EXISTS placement_role_config_status_code text NOT NULL DEFAULT 'unset',
  ADD COLUMN IF NOT EXISTS placement_role_config_note text,
  ADD COLUMN IF NOT EXISTS placement_role_config_updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS business.robot_placement_role_catalog (
  role_code text PRIMARY KEY,
  role_name_ja text NOT NULL,
  role_name_en text,
  target_level_default_code text NOT NULL DEFAULT 'section',
  single_slot_flag boolean NOT NULL DEFAULT false,
  max_active_per_target integer,
  sort_order integer NOT NULL DEFAULT 100,
  status_code text NOT NULL DEFAULT 'active',
  note text,
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO business.robot_placement_role_catalog (
  role_code,
  role_name_ja,
  role_name_en,
  target_level_default_code,
  single_slot_flag,
  max_active_per_target,
  sort_order,
  status_code,
  note,
  metadata_jsonb
)
VALUES
  ('President', '社長ロボット', 'President Robot', 'company', true, 1, 10, 'active', 'AI企業設定で会社方針を受ける最上位配置ロール。', '{}'::jsonb),
  ('ExecutiveManager', '経営管理ロボット', 'Executive Manager Robot', 'company', true, 1, 20, 'active', '会社レベルの経営管理・統括補佐ロール。', '{}'::jsonb),
  ('Manager', '部門長ロボット', 'Manager Robot', 'department', true, 1, 30, 'active', '部門詳細で部門を統括する配置ロール。', '{}'::jsonb),
  ('Leader', '課長・リーダーロボット', 'Leader Robot', 'section', true, 1, 40, 'active', '課詳細で課・チームを統括する配置ロール。', '{}'::jsonb),
  ('Worker', 'ワーカーロボット', 'Worker Robot', 'section', false, NULL, 50, 'active', '実行担当ロール。複数配置可能。', '{}'::jsonb),
  ('Helper', 'ヘルパーロボット', 'Helper Robot', 'section', false, NULL, 60, 'active', '補助・秘書・案内・支援寄りの配置ロール。', '{}'::jsonb),
  ('Friend', 'フレンドロボット', 'Friend Robot', 'section', false, NULL, 70, 'active', '会話支援・フレンド系の配置ロール。', '{}'::jsonb),
  ('Lover', 'ラバーロボット', 'Lover Robot', 'section', false, NULL, 75, 'active', '擬似恋人系・ラバー系AIワーカー用ロール。', '{"safety_note":"entertainment_role_only"}'::jsonb),
  ('Specialist', '専門担当ロボット', 'Specialist Robot', 'section', false, NULL, 80, 'active', '専門処理・分析・特化業務担当ロール。', '{}'::jsonb),
  ('Advisor', '助言担当ロボット', 'Advisor Robot', 'department', false, NULL, 90, 'active', '助言・分析補佐・方針提案ロール。', '{}'::jsonb),
  ('Butler', 'バトラーロボット', 'Butler Robot', 'section', false, NULL, 100, 'active', '執事・運用補助ロール。', '{}'::jsonb),
  ('Battler', '戦闘員ロボット', 'Battler Robot', 'section', false, NULL, 105, 'active', '戦闘員・戦闘担当・特殊実行系ロール。Butler=執事とは分ける。', '{"distinguish_from":"Butler"}'::jsonb),
  ('Security', '警備ロボット', 'Security Robot', 'section', false, NULL, 110, 'active', '警備・監視・安全確認寄りの配置ロール。', '{}'::jsonb)
ON CONFLICT (role_code)
DO UPDATE SET
  role_name_ja = EXCLUDED.role_name_ja,
  role_name_en = EXCLUDED.role_name_en,
  target_level_default_code = EXCLUDED.target_level_default_code,
  single_slot_flag = EXCLUDED.single_slot_flag,
  max_active_per_target = EXCLUDED.max_active_per_target,
  sort_order = EXCLUDED.sort_order,
  status_code = EXCLUDED.status_code,
  note = EXCLUDED.note,
  metadata_jsonb = business.robot_placement_role_catalog.metadata_jsonb || EXCLUDED.metadata_jsonb,
  updated_at = now();

CREATE TEMP TABLE tmp_robot_pool_seed (
  aiworker_model_code text PRIMARY KEY,
  display_name text NOT NULL,
  aiworker_series_code text NOT NULL,
  manufacturer_code text NOT NULL,
  available_quantity integer NOT NULL,
  metadata_jsonb jsonb NOT NULL
) ON COMMIT DROP;

INSERT INTO tmp_robot_pool_seed (
  aiworker_model_code,
  display_name,
  aiworker_series_code,
  manufacturer_code,
  available_quantity,
  metadata_jsonb
)
VALUES
  ('HD-R5P', 'President', 'HD', 'helios_dynamics', 10, '{"source":"self_heal","purpose":"AI企業の方針・事業計画・配分・承認"}'::jsonb),
  ('HD-R1A', 'Lover', 'HD', 'helios_dynamics', 100, '{"source":"self_heal","purpose":"擬似恋人系AIワーカー"}'::jsonb),
  ('HD-R2S', 'Sniper', 'HD', 'helios_dynamics', 20, '{"source":"self_heal","purpose":"特殊ロール・高精度・対象特化"}'::jsonb),
  ('HD-R2G', 'General', 'HD', 'helios_dynamics', 30, '{"source":"self_heal","purpose":"統制・広域整理系"}'::jsonb),
  ('HD-R2T-0', 'Origin', 'HD', 'helios_dynamics', 10, '{"source":"self_heal","purpose":"全体統括・起点的ロール"}'::jsonb),
  ('BYD1-001', 'ASIC Workers1', 'Beyond', 'asic', 100, '{"source":"self_heal","purpose":"単純単発作業レベル"}'::jsonb),
  ('BYD1-002', 'ASIC Workers2', 'Beyond', 'asic', 100, '{"source":"self_heal","purpose":"単純反復・抜け漏れ補完レベル"}'::jsonb),
  ('BYD1-003', 'ASIC Workers3', 'Beyond', 'asic', 100, '{"source":"self_heal","purpose":"複雑作業・高完成度成果物レベル"}'::jsonb),
  ('BYD2-001', 'ASIC Leader1', 'Beyond', 'asic', 50, '{"source":"self_heal","purpose":"基本進行・形式チェックレベル"}'::jsonb),
  ('BYD2-002', 'ASIC Leader2', 'Beyond', 'asic', 50, '{"source":"self_heal","purpose":"品質レビュー・整合性確認レベル"}'::jsonb),
  ('BYD2-003', 'ASIC Leader3', 'Beyond', 'asic', 30, '{"source":"self_heal","purpose":"統合設計・リスク判断・納品品質統括レベル"}'::jsonb);

INSERT INTO tmp_robot_pool_seed (
  aiworker_model_code,
  display_name,
  aiworker_series_code,
  manufacturer_code,
  available_quantity,
  metadata_jsonb
)
SELECT
  'LVS-' || lpad(n::text, 2, '0') || form_code || 'v001',
  'LoVerS ' || lpad(n::text, 2, '0') || form_code,
  'LoVerS',
  'lavi_corporation',
  100,
  jsonb_build_object(
    'source', 'self_heal',
    'series', 'LoVerS',
    'personality_no', lpad(n::text, 2, '0'),
    'form', form_code,
    'version', '001'
  )
FROM generate_series(1, 12) AS n
CROSS JOIN (VALUES ('F'), ('M')) AS f(form_code);

INSERT INTO business.robot_pool (
  aiworker_model_code,
  display_name,
  aiworker_series_code,
  manufacturer_code,
  business_offer_code,
  pool_scope_code,
  available_quantity,
  reserved_quantity,
  unlimited_assignment_flag,
  rental_unit_code,
  status_code,
  metadata_jsonb,
  updated_at
)
SELECT
  s.aiworker_model_code,
  s.display_name,
  s.aiworker_series_code,
  s.manufacturer_code,
  'standard',
  'global',
  s.available_quantity,
  0,
  true,
  'unit',
  'active',
  s.metadata_jsonb,
  now()
FROM tmp_robot_pool_seed s
WHERE NOT EXISTS (
  SELECT 1
  FROM business.robot_pool rp
  WHERE rp.aiworker_model_code = s.aiworker_model_code
    AND rp.business_offer_code = 'standard'
    AND rp.pool_scope_code = 'global'
);

WITH role_assignment AS (
  SELECT *
  FROM (
    VALUES
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
      ('BYD1-001', 'Worker',           NULL,       NULL),
      ('BYD1-002', 'Worker',           'Helper',   NULL),
      ('BYD1-003', 'Worker',           'Specialist', NULL),
      ('BYD2-001', 'Leader',           NULL,       NULL),
      ('BYD2-002', 'Leader',           'Manager',  NULL),
      ('BYD2-003', 'President',        'Manager',  'ExecutiveManager'),
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
  placement_role_config_note = 'Boss-approved role slot assignment applied by self-heal.',
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

CREATE OR REPLACE VIEW business.vw_business_robot_selector_options AS
SELECT
  rp.robot_pool_id,
  rp.aiworker_model_code,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  rp.display_name,
  rp.display_name || ' / ' || rp.aiworker_model_code AS selector_label,
  rp.business_offer_code,
  rp.pool_scope_code,
  rp.available_quantity,
  rp.reserved_quantity,
  GREATEST(rp.available_quantity - rp.reserved_quantity, 0) AS visible_available_quantity,
  rp.unlimited_assignment_flag,
  rp.rental_unit_code,
  rp.status_code,
  ARRAY_REMOVE(ARRAY[
    NULLIF(rp.placement_role_code_1, ''),
    NULLIF(rp.placement_role_code_2, ''),
    NULLIF(rp.placement_role_code_3, '')
  ], NULL) AS recommended_role_codes,
  rp.metadata_jsonb,
  rp.updated_at
FROM business.robot_pool rp
WHERE rp.status_code = 'active';

CREATE OR REPLACE VIEW business.vw_company_robot_selector_options AS
SELECT
  cre.company_robot_entitlement_id,
  cre.company_id,
  cre.robot_pool_id,
  cre.aiworker_model_code,
  COALESCE(rp.display_name, cre.aiworker_model_code) AS display_name,
  COALESCE(rp.display_name, cre.aiworker_model_code) || ' / ' || cre.aiworker_model_code AS selector_label,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  cre.business_offer_code,
  cre.entitlement_scope_code,
  cre.contracted_quantity,
  cre.usable_quantity,
  cre.assignment_mode_code,
  cre.status_code,
  ARRAY_REMOVE(ARRAY[
    NULLIF(rp.placement_role_code_1, ''),
    NULLIF(rp.placement_role_code_2, ''),
    NULLIF(rp.placement_role_code_3, '')
  ], NULL) AS recommended_role_codes,
  cre.updated_at
FROM business.company_robot_entitlement cre
LEFT JOIN business.robot_pool rp
  ON rp.robot_pool_id = cre.robot_pool_id
WHERE cre.status_code = 'active';

CREATE OR REPLACE FUNCTION business.fn_business_robot_selector_options_for_role(
  p_role_code text DEFAULT NULL
)
RETURNS TABLE (
  robot_pool_id uuid,
  aiworker_model_code text,
  aiworker_series_code text,
  manufacturer_code text,
  display_name text,
  selector_label text,
  business_offer_code text,
  visible_available_quantity integer,
  recommended_role_codes text[],
  status_code text,
  sort_rank integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    v.robot_pool_id,
    v.aiworker_model_code,
    v.aiworker_series_code,
    v.manufacturer_code,
    v.display_name,
    v.selector_label,
    v.business_offer_code,
    v.visible_available_quantity,
    v.recommended_role_codes,
    v.status_code,
    CASE
      WHEN p_role_code IS NULL OR btrim(p_role_code) = '' THEN 100
      WHEN v.recommended_role_codes[1] = btrim(p_role_code) THEN 1
      WHEN v.recommended_role_codes[2] = btrim(p_role_code) THEN 2
      WHEN v.recommended_role_codes[3] = btrim(p_role_code) THEN 3
      ELSE 999
    END AS sort_rank
  FROM business.vw_business_robot_selector_options v
  WHERE v.status_code = 'active'
    AND (
      p_role_code IS NULL
      OR btrim(p_role_code) = ''
      OR btrim(p_role_code) = ANY(v.recommended_role_codes)
    )
  ORDER BY
    CASE
      WHEN p_role_code IS NULL OR btrim(p_role_code) = '' THEN 100
      WHEN v.recommended_role_codes[1] = btrim(p_role_code) THEN 1
      WHEN v.recommended_role_codes[2] = btrim(p_role_code) THEN 2
      WHEN v.recommended_role_codes[3] = btrim(p_role_code) THEN 3
      ELSE 999
    END,
    v.aiworker_series_code,
    v.aiworker_model_code;
$$;

CREATE OR REPLACE FUNCTION business.fn_company_robot_selector_options_for_role(
  p_company_id uuid,
  p_role_code text DEFAULT NULL
)
RETURNS TABLE (
  company_robot_entitlement_id uuid,
  company_id uuid,
  robot_pool_id uuid,
  aiworker_model_code text,
  aiworker_series_code text,
  manufacturer_code text,
  display_name text,
  selector_label text,
  business_offer_code text,
  usable_quantity integer,
  assignment_mode_code text,
  recommended_role_codes text[],
  status_code text,
  sort_rank integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    v.company_robot_entitlement_id,
    v.company_id,
    v.robot_pool_id,
    v.aiworker_model_code,
    v.aiworker_series_code,
    v.manufacturer_code,
    v.display_name,
    v.selector_label,
    v.business_offer_code,
    v.usable_quantity,
    v.assignment_mode_code,
    v.recommended_role_codes,
    v.status_code,
    CASE
      WHEN p_role_code IS NULL OR btrim(p_role_code) = '' THEN 100
      WHEN v.recommended_role_codes[1] = btrim(p_role_code) THEN 1
      WHEN v.recommended_role_codes[2] = btrim(p_role_code) THEN 2
      WHEN v.recommended_role_codes[3] = btrim(p_role_code) THEN 3
      ELSE 999
    END AS sort_rank
  FROM business.vw_company_robot_selector_options v
  WHERE v.company_id = p_company_id
    AND v.status_code = 'active'
    AND (
      p_role_code IS NULL
      OR btrim(p_role_code) = ''
      OR btrim(p_role_code) = ANY(v.recommended_role_codes)
    )
  ORDER BY
    CASE
      WHEN p_role_code IS NULL OR btrim(p_role_code) = '' THEN 100
      WHEN v.recommended_role_codes[1] = btrim(p_role_code) THEN 1
      WHEN v.recommended_role_codes[2] = btrim(p_role_code) THEN 2
      WHEN v.recommended_role_codes[3] = btrim(p_role_code) THEN 3
      ELSE 999
    END,
    v.aiworker_series_code,
    v.aiworker_model_code;
$$;

CREATE OR REPLACE VIEW business.vw_aicm_robot_role_duplicate_rule AS
SELECT
  role_code,
  single_slot_flag AS duplicate_guard_flag,
  COALESCE(max_active_per_target, CASE WHEN single_slot_flag THEN 1 ELSE NULL::integer END) AS max_active_count,
  CASE WHEN single_slot_flag THEN 'same_company_target_role' ELSE 'multi_allowed' END AS duplicate_scope_code,
  note
FROM business.robot_placement_role_catalog
WHERE status_code = 'active';

COMMIT;
