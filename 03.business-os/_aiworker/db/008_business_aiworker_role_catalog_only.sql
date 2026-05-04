-- ============================================================
-- BusinessOS AIWorker role catalog only
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Change type: add-only table + idempotent seed
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

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

COMMENT ON TABLE business.robot_placement_role_catalog IS
  'BusinessOS AIWorker placement role catalog. Defines roles such as President, Manager, Leader, Worker.';

COMMENT ON COLUMN business.robot_placement_role_catalog.role_code IS
  'Canonical placement role code used by robot_pool role slots and company_robot_placement.role_code.';

COMMENT ON COLUMN business.robot_placement_role_catalog.single_slot_flag IS
  'If true, normally only one active placement is allowed per company/target/role.';

COMMENT ON COLUMN business.robot_placement_role_catalog.max_active_per_target IS
  'Optional maximum active placement count per target. NULL means no fixed limit.';

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
  (
    'President',
    '社長ロボット',
    'President Robot',
    'company',
    true,
    1,
    10,
    'active',
    'AI企業設定で会社方針を受ける最上位配置ロール。',
    '{"screen":"AI企業設定","slot_type":"single"}'::jsonb
  ),
  (
    'ExecutiveManager',
    '経営管理ロボット',
    'Executive Manager Robot',
    'company',
    true,
    1,
    20,
    'active',
    '会社レベルの経営管理・統括補佐ロール。',
    '{"screen":"AI企業設定","slot_type":"single"}'::jsonb
  ),
  (
    'Manager',
    '部門長ロボット',
    'Manager Robot',
    'department',
    true,
    1,
    30,
    'active',
    '部門詳細で部門を統括する配置ロール。',
    '{"screen":"部門詳細","slot_type":"single"}'::jsonb
  ),
  (
    'Leader',
    '課長・リーダーロボット',
    'Leader Robot',
    'section',
    true,
    1,
    40,
    'active',
    '課詳細で課・チームを統括する配置ロール。',
    '{"screen":"課詳細","slot_type":"single"}'::jsonb
  ),
  (
    'Worker',
    'ワーカーロボット',
    'Worker Robot',
    'section',
    false,
    NULL,
    50,
    'active',
    '実行担当ロール。複数配置可能。',
    '{"screen":"Worker配置","slot_type":"multi"}'::jsonb
  ),
  (
    'Helper',
    'ヘルパーロボット',
    'Helper Robot',
    'section',
    false,
    NULL,
    60,
    'active',
    '補助・秘書・案内・支援寄りの配置ロール。複数配置可能。',
    '{"slot_type":"multi"}'::jsonb
  ),
  (
    'Friend',
    'フレンドロボット',
    'Friend Robot',
    'section',
    false,
    NULL,
    70,
    'active',
    '会話支援・軽い補助・フレンド系の配置ロール。複数配置可能。',
    '{"slot_type":"multi"}'::jsonb
  ),
  (
    'Specialist',
    '専門担当ロボット',
    'Specialist Robot',
    'section',
    false,
    NULL,
    80,
    'active',
    '専門処理・分析・特化業務担当ロール。複数配置可能。',
    '{"slot_type":"multi"}'::jsonb
  ),
  (
    'Advisor',
    '助言担当ロボット',
    'Advisor Robot',
    'department',
    false,
    NULL,
    90,
    'active',
    '助言・分析補佐・方針提案ロール。複数配置可能。',
    '{"slot_type":"multi"}'::jsonb
  ),
  (
    'Butler',
    'バトラーロボット',
    'Butler Robot',
    'section',
    false,
    NULL,
    100,
    'active',
    'バトラー・運用補助・支援実行ロール。複数配置可能。',
    '{"slot_type":"multi"}'::jsonb
  ),
  (
    'Security',
    '警備ロボット',
    'Security Robot',
    'section',
    false,
    NULL,
    110,
    'active',
    '警備・監視・安全確認寄りの配置ロール。複数配置可能。',
    '{"slot_type":"multi"}'::jsonb
  )
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

COMMIT;
