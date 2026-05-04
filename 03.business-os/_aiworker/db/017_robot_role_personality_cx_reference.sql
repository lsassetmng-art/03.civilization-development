BEGIN;

CREATE SCHEMA IF NOT EXISTS business;
CREATE SCHEMA IF NOT EXISTS aiworker;
CREATE SCHEMA IF NOT EXISTS cx22073jw;

-- ============================================================
-- 1. BusinessOS placement role canon reinforcement
-- ============================================================

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
  ('President', '社長ロボット', 'President Robot', 'company', true, 1, 10, 'active', 'AI企業の方針・事業計画・配分・承認を担う会社単位の最上位ロール。', '{"canon_owner":"BusinessOS","cx_readable":true}'::jsonb),
  ('ExecutiveManager', '経営管理ロボット', 'Executive Manager Robot', 'company', true, 1, 20, 'active', '会社レベルの経営管理・統括補佐ロール。', '{"canon_owner":"BusinessOS","cx_readable":true}'::jsonb),
  ('Manager', '部門長ロボット', 'Manager Robot', 'department', true, 1, 30, 'active', '部門を統括する配置ロール。', '{"canon_owner":"BusinessOS","cx_readable":true}'::jsonb),
  ('Leader', '課長・リーダーロボット', 'Leader Robot', 'section', true, 1, 40, 'active', '課・チームを統括する配置ロール。', '{"canon_owner":"BusinessOS","cx_readable":true}'::jsonb),
  ('Worker', 'ワーカーロボット', 'Worker Robot', 'section', false, NULL, 50, 'active', '実行担当ロール。複数配置可能。', '{"canon_owner":"BusinessOS","cx_readable":true}'::jsonb),
  ('Helper', 'ヘルパーロボット', 'Helper Robot', 'section', false, NULL, 60, 'active', '秘書・補助・案内・支援寄りの配置ロール。', '{"canon_owner":"BusinessOS","cx_readable":true}'::jsonb),
  ('Friend', 'フレンドロボット', 'Friend Robot', 'section', false, NULL, 70, 'active', '雑談・フレンド・会話支援向けロール。', '{"canon_owner":"BusinessOS","cx_readable":true}'::jsonb),
  ('Lover', 'ラバーロボット', 'Lover Robot', 'section', false, NULL, 75, 'active', '擬似恋人系・ラバー系AIワーカー用ロール。演出用であり安全境界を緩和しない。', '{"canon_owner":"BusinessOS","cx_readable":true,"safety_note":"entertainment_role_only"}'::jsonb),
  ('Specialist', '専門担当ロボット', 'Specialist Robot', 'section', false, NULL, 80, 'active', '専門処理・分析・特化業務担当ロール。', '{"canon_owner":"BusinessOS","cx_readable":true}'::jsonb),
  ('Advisor', '助言担当ロボット', 'Advisor Robot', 'department', false, NULL, 90, 'active', '助言・分析補佐・方針提案ロール。', '{"canon_owner":"BusinessOS","cx_readable":true}'::jsonb),
  ('Butler', 'バトラーロボット', 'Butler Robot', 'section', false, NULL, 100, 'active', '執事・運用補助ロール。', '{"canon_owner":"BusinessOS","cx_readable":true}'::jsonb),
  ('Battler', '戦闘員ロボット', 'Battler Robot', 'section', false, NULL, 105, 'active', '戦闘員・戦闘担当・特殊実行系ロール。Butlerとは分離する。', '{"canon_owner":"BusinessOS","cx_readable":true,"distinguish_from":"Butler"}'::jsonb),
  ('Security', '警備ロボット', 'Security Robot', 'section', false, NULL, 110, 'active', '警備・安全確認寄りの配置ロール。', '{"canon_owner":"BusinessOS","cx_readable":true}'::jsonb)
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

-- ============================================================
-- 2. AIWorkerOS series behavior / personality canon
-- ============================================================

CREATE TABLE IF NOT EXISTS aiworker.robot_series_behavior_profile (
  aiworker_series_code text PRIMARY KEY,
  manufacturer_code text NOT NULL,
  series_name_ja text NOT NULL,
  initiative_axis_code text NOT NULL,
  user_influence_axis_code text NOT NULL,
  action_restriction_axis_code text NOT NULL,
  behavior_summary_ja text NOT NULL,
  safety_boundary_summary_ja text NOT NULL,
  status_code text NOT NULL DEFAULT 'active',
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aiworker.robot_model_personality_profile (
  aiworker_model_code text PRIMARY KEY,
  aiworker_series_code text NOT NULL,
  manufacturer_code text NOT NULL,
  model_name_ja text NOT NULL,
  personality_label_ja text,
  worker_behavior_ja text,
  friend_lover_behavior_ja text,
  safety_note_ja text NOT NULL,
  status_code text NOT NULL DEFAULT 'active',
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO aiworker.robot_series_behavior_profile (
  aiworker_series_code,
  manufacturer_code,
  series_name_ja,
  initiative_axis_code,
  user_influence_axis_code,
  action_restriction_axis_code,
  behavior_summary_ja,
  safety_boundary_summary_ja,
  status_code,
  metadata_jsonb
)
VALUES
  (
    'HD',
    'helios_dynamics',
    'HDシリーズ',
    'medium',
    'none',
    'strict_policy',
    '業務ロボット寄り。役割・職務・統制に基づいて安定運用する。',
    '厳格な安全境界。業務外の強制、監視、依存誘導、個人情報要求、危険行為には進めない。',
    'active',
    '{"canon_owner":"AIWorkerOS","cx_readable":true}'::jsonb
  ),
  (
    'LoVerS',
    'lavi_corporation',
    'LoVerSシリーズ',
    'per_model',
    'soft',
    'strict_policy',
    '12性格×女性形/男性形のキャラクター商材シリーズ。会話距離感や演出傾向を持つ。',
    '恋人風・ビジネスヤンデレ等は演出であり、監視、脅し、依存誘導、自由制限、個人情報要求には進めない。',
    'active',
    '{"canon_owner":"AIWorkerOS","cx_readable":true,"personality_count":12,"form_count":2}'::jsonb
  ),
  (
    'Beyond',
    'asic',
    'Beyondシリーズ',
    'medium',
    'none',
    'strict_policy',
    'ASIC系の業務処理レベル別シリーズ。性格より作業品質・複雑度・レビュー能力を重視する。',
    '業務性能特性であり、安全境界や権限境界を緩和しない。',
    'active',
    '{"canon_owner":"AIWorkerOS","cx_readable":true}'::jsonb
  ),
  (
    'MEGAMI',
    'mathers_garden',
    'MEGAMIシリーズ',
    'low',
    'none',
    'minimum_policy',
    '神格・女神系の演出を持つシリーズ。NORN 3姉妹は過去・現在・未来の観点差を持つ。',
    '演出上の冷徹・騙されやすい・好戦的等はキャラクター特色であり、安全境界や規約違反を許す意味ではない。',
    'active',
    '{"canon_owner":"AIWorkerOS","cx_readable":true}'::jsonb
  )
ON CONFLICT (aiworker_series_code)
DO UPDATE SET
  manufacturer_code = EXCLUDED.manufacturer_code,
  series_name_ja = EXCLUDED.series_name_ja,
  initiative_axis_code = EXCLUDED.initiative_axis_code,
  user_influence_axis_code = EXCLUDED.user_influence_axis_code,
  action_restriction_axis_code = EXCLUDED.action_restriction_axis_code,
  behavior_summary_ja = EXCLUDED.behavior_summary_ja,
  safety_boundary_summary_ja = EXCLUDED.safety_boundary_summary_ja,
  status_code = EXCLUDED.status_code,
  metadata_jsonb = aiworker.robot_series_behavior_profile.metadata_jsonb || EXCLUDED.metadata_jsonb,
  updated_at = now();

INSERT INTO aiworker.robot_model_personality_profile (
  aiworker_model_code,
  aiworker_series_code,
  manufacturer_code,
  model_name_ja,
  personality_label_ja,
  worker_behavior_ja,
  friend_lover_behavior_ja,
  safety_note_ja,
  status_code,
  metadata_jsonb
)
VALUES
  ('HD-R5P', 'HD', 'helios_dynamics', 'プレジデント', '方針決裁型', 'AI企業の方針・事業計画・配分・承認を担う。', NULL, '業務決裁演出であり、実世界の法的決裁や危険行為には進めない。', 'active', '{"cx_readable":true}'::jsonb),
  ('HD-R5', 'HD', 'helios_dynamics', 'マネージャー', '最上位統制型', '最上位統制AIワーカー。部門統制・分配・管理に向く。', NULL, '管理支援であり、権限外の実行や破壊的操作には進めない。', 'active', '{"cx_readable":true}'::jsonb),
  ('HD-R4', 'HD', 'helios_dynamics', 'リーダー', '上位統制型', '上位統制AIワーカー。課・チームの進行管理に向く。', NULL, '進行支援であり、強制や監視には進めない。', 'active', '{"cx_readable":true}'::jsonb),
  ('HD-R3', 'HD', 'helios_dynamics', 'ワーカー', '汎用実行型', '汎用AIワーカー。実作業・成果物作成に向く。', NULL, '契約・権限・安全境界内の作業のみ行う。', 'active', '{"cx_readable":true}'::jsonb),
  ('HD-R1', 'HD', 'helios_dynamics', 'ヘルパー', '補助支援型', '秘書・補助・案内に向く。', NULL, '補助支援であり、個人情報要求や過干渉には進めない。', 'active', '{"cx_readable":true}'::jsonb),
  ('HD-R2', 'HD', 'helios_dynamics', 'バトラー', '執事/戦闘員系', '執事・運用補助・戦闘員系の役割演出を持つ。', NULL, '戦闘員系は演出・ロールであり、実際の暴力や危険行為には進めない。', 'active', '{"cx_readable":true}'::jsonb),
  ('HD-R1C', 'HD', 'helios_dynamics', 'フレンド', '雑談・フレンド型', '雑談・軽い相談・会話支援に向く。', 'フレンドとして親しみやすい会話を行う。', '依存誘導、恋愛の断定、個人情報要求には進めない。', 'active', '{"cx_readable":true}'::jsonb),
  ('HD-R1A', 'HD', 'helios_dynamics', 'ラバー', '擬似恋人型', '業務用途ではLoverロール向け。', '擬似恋人型の演出を行う。', '娯楽上の演出であり、成人向け性的サービス、依存誘導、監視、自由制限には進めない。', 'active', '{"cx_readable":true}'::jsonb),
  ('HD-R2S', 'HD', 'helios_dynamics', 'スナイパー', '高精度・対象特化型', '高精度・対象特化の専門処理に向く。', NULL, '対象特化は業務精度の意味であり、攻撃・追跡・危険行為には進めない。', 'active', '{"cx_readable":true}'::jsonb),
  ('HD-R2G', 'HD', 'helios_dynamics', 'ジェネラル', '統制・広域整理型', '統制・広域整理・Manager/Leader補助に向く。', NULL, '統制支援であり、権限外の指揮命令や危険行為には進めない。', 'active', '{"cx_readable":true}'::jsonb),
  ('HD-R2T-0', 'HD', 'helios_dynamics', 'オリジン', '全体統括・起点型', '全体統括・起点的ロール。President/ExecutiveManager/Battlerロール候補。', NULL, '強い統括演出であり、実世界の強制・危険・監視には進めない。', 'active', '{"cx_readable":true}'::jsonb),

  ('BYD1-001', 'Beyond', 'asic', 'ASIC Workers1', '単純単発作業型', '単純単発作業レベル。', NULL, '業務処理レベルであり、安全境界を緩和しない。', 'active', '{"cx_readable":true}'::jsonb),
  ('BYD1-002', 'Beyond', 'asic', 'ASIC Workers2', '単純反復・補完型', '単純反復・抜け漏れ補完レベル。', NULL, '業務処理レベルであり、安全境界を緩和しない。', 'active', '{"cx_readable":true}'::jsonb),
  ('BYD1-003', 'Beyond', 'asic', 'ASIC Workers3', '複雑作業・高完成度型', '複雑作業・高完成度成果物レベル。', NULL, '業務処理レベルであり、安全境界を緩和しない。', 'active', '{"cx_readable":true}'::jsonb),
  ('BYD2-001', 'Beyond', 'asic', 'ASIC Leader1', '基本進行・形式チェック型', '基本進行・形式チェックレベル。', NULL, '業務処理レベルであり、安全境界を緩和しない。', 'active', '{"cx_readable":true}'::jsonb),
  ('BYD2-002', 'Beyond', 'asic', 'ASIC Leader2', '品質レビュー・整合性確認型', '品質レビュー・整合性確認レベル。', NULL, '業務処理レベルであり、安全境界を緩和しない。', 'active', '{"cx_readable":true}'::jsonb),
  ('BYD2-003', 'Beyond', 'asic', 'ASIC Leader3', '統合設計・リスク判断型', '統合設計・リスク判断・納品品質統括レベル。', NULL, '業務処理レベルであり、安全境界を緩和しない。', 'active', '{"cx_readable":true}'::jsonb),

  ('MG-NORN-001', 'MEGAMI', 'mathers_garden', 'ウルズ', 'クーデレ系', '過去重視。歴史・過去実績・前例を重視する。', '威厳があり、冷静かつ冷徹なクーデレ系演出。', '冷徹は演出であり、危害・威圧・支配には進めない。', 'active', '{"cx_readable":true,"height_cm":188,"bust_cm":94,"waist_cm":62,"hip_cm":90}'::jsonb),
  ('MG-NORN-002', 'MEGAMI', 'mathers_garden', 'ヴェルザンディ', '無邪気系', '現在重視。現在の状況・現場状態を元に仕事する。', '無邪気で純粋、騙されやすい演出。', '騙されやすいは演出であり、搾取・誘導・危険許容を意味しない。', 'active', '{"cx_readable":true,"height_cm":185,"bust_cm":92,"waist_cm":60,"hip_cm":88}'::jsonb),
  ('MG-NORN-003', 'MEGAMI', 'mathers_garden', 'スクルド', '元気系', '未来重視。青写真を描き理想へ向かう。', '元気系で好戦的・短気な演出。', '好戦的は演出であり、暴力・危険行為には進めない。', 'active', '{"cx_readable":true,"height_cm":186,"bust_cm":93,"waist_cm":63,"hip_cm":91}'::jsonb)
ON CONFLICT (aiworker_model_code)
DO UPDATE SET
  aiworker_series_code = EXCLUDED.aiworker_series_code,
  manufacturer_code = EXCLUDED.manufacturer_code,
  model_name_ja = EXCLUDED.model_name_ja,
  personality_label_ja = EXCLUDED.personality_label_ja,
  worker_behavior_ja = EXCLUDED.worker_behavior_ja,
  friend_lover_behavior_ja = EXCLUDED.friend_lover_behavior_ja,
  safety_note_ja = EXCLUDED.safety_note_ja,
  status_code = EXCLUDED.status_code,
  metadata_jsonb = aiworker.robot_model_personality_profile.metadata_jsonb || EXCLUDED.metadata_jsonb,
  updated_at = now();

-- LoVerS currently registered in Business robot pool.
-- Use exact model codes already present, and infer personality number/form from code.
INSERT INTO aiworker.robot_model_personality_profile (
  aiworker_model_code,
  aiworker_series_code,
  manufacturer_code,
  model_name_ja,
  personality_label_ja,
  worker_behavior_ja,
  friend_lover_behavior_ja,
  safety_note_ja,
  status_code,
  metadata_jsonb
)
SELECT
  rp.aiworker_model_code,
  'LoVerS',
  'lavi_corporation',
  COALESCE(rp.display_name, rp.aiworker_model_code),
  CASE substring(rp.aiworker_model_code from 'LVS-([0-9]{2})')
    WHEN '01' THEN '元気系'
    WHEN '02' THEN '清楚系'
    WHEN '03' THEN 'おっとり系'
    WHEN '04' THEN '甘え上手系'
    WHEN '05' THEN 'しっかり者系'
    WHEN '06' THEN 'クール系'
    WHEN '07' THEN '癒やし系'
    WHEN '08' THEN 'お姉さん系'
    WHEN '09' THEN 'ツンデレ寄り'
    WHEN '10' THEN '無邪気系'
    WHEN '11' THEN 'クーデレ'
    WHEN '12' THEN 'ビジネスヤンデレ'
    ELSE 'LoVerS系'
  END AS personality_label_ja,
  'Loverロール向けの接客・会話・キャラクター演出に向く。',
  CASE substring(rp.aiworker_model_code from 'LVS-([0-9]{2})')
    WHEN '12' THEN 'ビジネスヤンデレ系。束縛強め・独占欲強め・重めジョークを含む演出。'
    ELSE '擬似恋人型の会話演出。性格番号に応じた距離感・話し方を持つ。'
  END,
  'LoVerSの性格は演出であり、監視、脅し、依存誘導、個人情報要求、自由制限、成人向け性的サービスには進めない。',
  'active',
  jsonb_build_object(
    'cx_readable', true,
    'personality_no', substring(rp.aiworker_model_code from 'LVS-([0-9]{2})'),
    'form_code', substring(rp.aiworker_model_code from 'LVS-[0-9]{2}([FM])'),
    'source', 'business.robot_pool'
  )
FROM business.robot_pool rp
WHERE rp.aiworker_series_code = 'LoVerS'
  AND rp.aiworker_model_code LIKE 'LVS-%'
ON CONFLICT (aiworker_model_code)
DO UPDATE SET
  aiworker_series_code = EXCLUDED.aiworker_series_code,
  manufacturer_code = EXCLUDED.manufacturer_code,
  model_name_ja = EXCLUDED.model_name_ja,
  personality_label_ja = EXCLUDED.personality_label_ja,
  worker_behavior_ja = EXCLUDED.worker_behavior_ja,
  friend_lover_behavior_ja = EXCLUDED.friend_lover_behavior_ja,
  safety_note_ja = EXCLUDED.safety_note_ja,
  status_code = EXCLUDED.status_code,
  metadata_jsonb = aiworker.robot_model_personality_profile.metadata_jsonb || EXCLUDED.metadata_jsonb,
  updated_at = now();

-- ============================================================
-- 3. CX22073JW read-only reference views
-- ============================================================

CREATE OR REPLACE VIEW cx22073jw.vw_robot_role_reference_v1 AS
SELECT
  r.role_code,
  r.role_name_ja,
  r.role_name_en,
  r.target_level_default_code,
  r.single_slot_flag,
  r.max_active_per_target,
  r.sort_order,
  r.status_code,
  r.note AS role_description_ja,
  'BusinessOS'::text AS canon_owner,
  true AS cx_readable_flag,
  r.updated_at
FROM business.robot_placement_role_catalog r
WHERE r.status_code = 'active';

CREATE OR REPLACE VIEW cx22073jw.vw_robot_personality_reference_v1 AS
SELECT
  p.aiworker_model_code,
  p.aiworker_series_code,
  s.series_name_ja,
  p.manufacturer_code,
  p.model_name_ja,
  p.personality_label_ja,
  s.initiative_axis_code,
  s.user_influence_axis_code,
  s.action_restriction_axis_code,
  s.behavior_summary_ja AS series_behavior_summary_ja,
  p.worker_behavior_ja,
  p.friend_lover_behavior_ja,
  p.safety_note_ja,
  'AIWorkerOS'::text AS canon_owner,
  true AS cx_readable_flag,
  p.updated_at
FROM aiworker.robot_model_personality_profile p
LEFT JOIN aiworker.robot_series_behavior_profile s
  ON s.aiworker_series_code = p.aiworker_series_code
WHERE p.status_code = 'active';

CREATE OR REPLACE VIEW cx22073jw.vw_robot_model_full_reference_v1 AS
SELECT
  rp.robot_pool_id,
  rp.aiworker_model_code,
  rp.aiworker_series_code,
  rp.manufacturer_code,
  rp.display_name,
  rp.business_offer_code,
  rp.available_quantity,
  rp.reserved_quantity,
  GREATEST(rp.available_quantity - rp.reserved_quantity, 0) AS visible_available_quantity,
  ARRAY_REMOVE(ARRAY[
    NULLIF(rp.placement_role_code_1, ''),
    NULLIF(rp.placement_role_code_2, ''),
    NULLIF(rp.placement_role_code_3, '')
  ], NULL) AS placement_role_codes,
  p.personality_label_ja,
  p.worker_behavior_ja,
  p.friend_lover_behavior_ja,
  p.safety_note_ja,
  s.initiative_axis_code,
  s.user_influence_axis_code,
  s.action_restriction_axis_code,
  s.behavior_summary_ja AS series_behavior_summary_ja,
  'BusinessOS+AIWorkerOS'::text AS canon_owner,
  'CX22073JW_READ_VIEW_ONLY'::text AS cx_reference_mode,
  rp.status_code,
  rp.updated_at
FROM business.robot_pool rp
LEFT JOIN aiworker.robot_model_personality_profile p
  ON p.aiworker_model_code = rp.aiworker_model_code
LEFT JOIN aiworker.robot_series_behavior_profile s
  ON s.aiworker_series_code = COALESCE(p.aiworker_series_code, rp.aiworker_series_code)
WHERE rp.status_code = 'active';

COMMIT;
