-- ============================================================
-- BusinessOS AIWorker role catalog add Lover / Battler only
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Change type: add-only role master rows
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
    'Lover',
    'ラバーロボット',
    'Lover Robot',
    'section',
    false,
    NULL,
    75,
    'active',
    '擬似恋人系・ラバー系AIワーカー用の配置ロール。LoVerS、HD-R1A、MEGAMI NORNのFriend/Lover寄り利用で使用。',
    '{"slot_type":"multi","safety_note":"entertainment_role_only_no_real_relationship_implication"}'::jsonb
  ),
  (
    'Battler',
    '戦闘員ロボット',
    'Battler Robot',
    'section',
    false,
    NULL,
    105,
    'active',
    '戦闘員・戦闘担当・特殊実行系AIワーカー用の配置ロール。Butler=執事とは分ける。',
    '{"slot_type":"multi","distinguish_from":"Butler"}'::jsonb
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
