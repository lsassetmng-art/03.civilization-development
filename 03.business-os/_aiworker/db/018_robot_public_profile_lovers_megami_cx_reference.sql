BEGIN;

CREATE SCHEMA IF NOT EXISTS aiworker;
CREATE SCHEMA IF NOT EXISTS cx22073jw;
CREATE SCHEMA IF NOT EXISTS business;

-- ============================================================
-- 1. AIWorkerOS public profile canon
-- ============================================================

CREATE TABLE IF NOT EXISTS aiworker.robot_model_public_profile (
  aiworker_model_code text PRIMARY KEY,
  aiworker_series_code text NOT NULL,
  manufacturer_code text NOT NULL,
  model_name_ja text,
  public_profile_status_code text NOT NULL DEFAULT 'pending_value',
  profile_scope_code text NOT NULL DEFAULT 'public_display',
  form_code text,
  personality_no text,
  height_cm integer,
  bust_cm integer,
  waist_cm integer,
  hip_cm integer,
  body_profile_note_ja text,
  safety_note_ja text NOT NULL,
  source_code text NOT NULL DEFAULT 'manual_or_metadata_sync',
  status_code text NOT NULL DEFAULT 'active',
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aiworker_robot_model_public_profile_series
  ON aiworker.robot_model_public_profile(aiworker_series_code, status_code);

CREATE INDEX IF NOT EXISTS idx_aiworker_robot_model_public_profile_status
  ON aiworker.robot_model_public_profile(public_profile_status_code, status_code);

COMMENT ON TABLE aiworker.robot_model_public_profile IS
  'AIWorkerOS canonical public display profile for robot models. CX22073JW may read via views, but is not the canon owner.';

-- ============================================================
-- 2. MEGAMI confirmed public profiles
-- ============================================================

INSERT INTO aiworker.robot_model_public_profile (
  aiworker_model_code,
  aiworker_series_code,
  manufacturer_code,
  model_name_ja,
  public_profile_status_code,
  profile_scope_code,
  form_code,
  personality_no,
  height_cm,
  bust_cm,
  waist_cm,
  hip_cm,
  body_profile_note_ja,
  safety_note_ja,
  source_code,
  status_code,
  metadata_jsonb
)
VALUES
  (
    'MG-NORN-001',
    'MEGAMI',
    'mathers_garden',
    'ウルズ',
    'confirmed',
    'public_display',
    'F',
    NULL,
    188,
    94,
    62,
    90,
    'NORN 3姉妹の公開プロフィール。過去重視・クーデレ系。',
    '公開プロフィールはキャラクター外形/表示用メタデータであり、安全境界を緩和しない。',
    'canonical_megami_norn_public_profile',
    'active',
    '{"cx_readable":true,"profile_confirmed_by":"Boss","series":"MEGAMI"}'::jsonb
  ),
  (
    'MG-NORN-002',
    'MEGAMI',
    'mathers_garden',
    'ヴェルザンディ',
    'confirmed',
    'public_display',
    'F',
    NULL,
    185,
    92,
    60,
    88,
    'NORN 3姉妹の公開プロフィール。現在重視・無邪気系。',
    '公開プロフィールはキャラクター外形/表示用メタデータであり、安全境界を緩和しない。',
    'canonical_megami_norn_public_profile',
    'active',
    '{"cx_readable":true,"profile_confirmed_by":"Boss","series":"MEGAMI"}'::jsonb
  ),
  (
    'MG-NORN-003',
    'MEGAMI',
    'mathers_garden',
    'スクルド',
    'confirmed',
    'public_display',
    'F',
    NULL,
    186,
    93,
    63,
    91,
    'NORN 3姉妹の公開プロフィール。未来重視・元気系。',
    '公開プロフィールはキャラクター外形/表示用メタデータであり、安全境界を緩和しない。',
    'canonical_megami_norn_public_profile',
    'active',
    '{"cx_readable":true,"profile_confirmed_by":"Boss","series":"MEGAMI"}'::jsonb
  )
ON CONFLICT (aiworker_model_code)
DO UPDATE SET
  aiworker_series_code = EXCLUDED.aiworker_series_code,
  manufacturer_code = EXCLUDED.manufacturer_code,
  model_name_ja = EXCLUDED.model_name_ja,
  public_profile_status_code = EXCLUDED.public_profile_status_code,
  profile_scope_code = EXCLUDED.profile_scope_code,
  form_code = EXCLUDED.form_code,
  personality_no = EXCLUDED.personality_no,
  height_cm = EXCLUDED.height_cm,
  bust_cm = EXCLUDED.bust_cm,
  waist_cm = EXCLUDED.waist_cm,
  hip_cm = EXCLUDED.hip_cm,
  body_profile_note_ja = EXCLUDED.body_profile_note_ja,
  safety_note_ja = EXCLUDED.safety_note_ja,
  source_code = EXCLUDED.source_code,
  status_code = EXCLUDED.status_code,
  metadata_jsonb = aiworker.robot_model_public_profile.metadata_jsonb || EXCLUDED.metadata_jsonb,
  updated_at = now();

-- ============================================================
-- 3. LoVerS public profile rows
--    Sync exact values if already stored in business.robot_pool.metadata_jsonb.
--    Otherwise create pending_value rows.
-- ============================================================

WITH lovers_source AS (
  SELECT
    rp.aiworker_model_code,
    rp.aiworker_series_code,
    rp.manufacturer_code,
    COALESCE(rp.display_name, rp.aiworker_model_code) AS model_name_ja,
    rp.metadata_jsonb,
    COALESCE(
      rp.metadata_jsonb->'public_metrics',
      rp.metadata_jsonb->'public_profile',
      rp.metadata_jsonb->'profile',
      '{}'::jsonb
    ) AS profile_jsonb,
    COALESCE(
      rp.metadata_jsonb->>'personality_no',
      substring(rp.aiworker_model_code from 'LVS-([0-9]{2})')
    ) AS personality_no,
    COALESCE(
      rp.metadata_jsonb->>'form_code',
      substring(rp.aiworker_model_code from 'LVS-[0-9]{2}([FM])')
    ) AS form_code
  FROM business.robot_pool rp
  WHERE rp.aiworker_series_code = 'LoVerS'
    AND rp.aiworker_model_code LIKE 'LVS-%'
),
lovers_extracted AS (
  SELECT
    s.*,

    CASE
      WHEN COALESCE(
        s.profile_jsonb->>'height_cm',
        s.metadata_jsonb->>'height_cm'
      ) ~ '^[0-9]+$'
      THEN COALESCE(
        s.profile_jsonb->>'height_cm',
        s.metadata_jsonb->>'height_cm'
      )::integer
      ELSE NULL
    END AS height_cm,

    CASE
      WHEN COALESCE(
        s.profile_jsonb->>'bust_cm',
        s.metadata_jsonb->>'bust_cm'
      ) ~ '^[0-9]+$'
      THEN COALESCE(
        s.profile_jsonb->>'bust_cm',
        s.metadata_jsonb->>'bust_cm'
      )::integer
      ELSE NULL
    END AS bust_cm,

    CASE
      WHEN COALESCE(
        s.profile_jsonb->>'waist_cm',
        s.metadata_jsonb->>'waist_cm'
      ) ~ '^[0-9]+$'
      THEN COALESCE(
        s.profile_jsonb->>'waist_cm',
        s.metadata_jsonb->>'waist_cm'
      )::integer
      ELSE NULL
    END AS waist_cm,

    CASE
      WHEN COALESCE(
        s.profile_jsonb->>'hip_cm',
        s.metadata_jsonb->>'hip_cm'
      ) ~ '^[0-9]+$'
      THEN COALESCE(
        s.profile_jsonb->>'hip_cm',
        s.metadata_jsonb->>'hip_cm'
      )::integer
      ELSE NULL
    END AS hip_cm
  FROM lovers_source s
)
INSERT INTO aiworker.robot_model_public_profile (
  aiworker_model_code,
  aiworker_series_code,
  manufacturer_code,
  model_name_ja,
  public_profile_status_code,
  profile_scope_code,
  form_code,
  personality_no,
  height_cm,
  bust_cm,
  waist_cm,
  hip_cm,
  body_profile_note_ja,
  safety_note_ja,
  source_code,
  status_code,
  metadata_jsonb
)
SELECT
  e.aiworker_model_code,
  'LoVerS',
  COALESCE(NULLIF(e.manufacturer_code, ''), 'lavi_corporation'),
  e.model_name_ja,
  CASE
    WHEN e.height_cm IS NOT NULL
     AND e.bust_cm IS NOT NULL
     AND e.waist_cm IS NOT NULL
     AND e.hip_cm IS NOT NULL
    THEN 'confirmed'
    ELSE 'pending_value'
  END AS public_profile_status_code,
  'public_display',
  e.form_code,
  e.personality_no,
  e.height_cm,
  e.bust_cm,
  e.waist_cm,
  e.hip_cm,
  CASE
    WHEN e.height_cm IS NOT NULL
     AND e.bust_cm IS NOT NULL
     AND e.waist_cm IS NOT NULL
     AND e.hip_cm IS NOT NULL
    THEN 'LoVerS公開プロフィール。既存metadataから公開数値を同期済み。'
    ELSE 'LoVerS公開プロフィール枠。具体値は未確定のため pending_value。'
  END,
  'LoVerS公開プロフィールはキャラクター外形/表示用メタデータであり、性的サービス、依存誘導、監視、自由制限、個人情報要求、安全境界緩和を意味しない。',
  CASE
    WHEN e.height_cm IS NOT NULL
     AND e.bust_cm IS NOT NULL
     AND e.waist_cm IS NOT NULL
     AND e.hip_cm IS NOT NULL
    THEN 'business.robot_pool.metadata_jsonb.public_profile_sync'
    ELSE 'lovers_public_profile_pending_seed'
  END,
  'active',
  jsonb_build_object(
    'cx_readable', true,
    'series', 'LoVerS',
    'personality_no', e.personality_no,
    'form_code', e.form_code,
    'source_robot_pool_metadata', e.metadata_jsonb,
    'profile_jsonb_used', e.profile_jsonb
  )
FROM lovers_extracted e
ON CONFLICT (aiworker_model_code)
DO UPDATE SET
  aiworker_series_code = EXCLUDED.aiworker_series_code,
  manufacturer_code = EXCLUDED.manufacturer_code,
  model_name_ja = EXCLUDED.model_name_ja,
  public_profile_status_code = EXCLUDED.public_profile_status_code,
  profile_scope_code = EXCLUDED.profile_scope_code,
  form_code = EXCLUDED.form_code,
  personality_no = EXCLUDED.personality_no,
  height_cm = COALESCE(EXCLUDED.height_cm, aiworker.robot_model_public_profile.height_cm),
  bust_cm = COALESCE(EXCLUDED.bust_cm, aiworker.robot_model_public_profile.bust_cm),
  waist_cm = COALESCE(EXCLUDED.waist_cm, aiworker.robot_model_public_profile.waist_cm),
  hip_cm = COALESCE(EXCLUDED.hip_cm, aiworker.robot_model_public_profile.hip_cm),
  body_profile_note_ja = EXCLUDED.body_profile_note_ja,
  safety_note_ja = EXCLUDED.safety_note_ja,
  source_code = EXCLUDED.source_code,
  status_code = EXCLUDED.status_code,
  metadata_jsonb = aiworker.robot_model_public_profile.metadata_jsonb || EXCLUDED.metadata_jsonb,
  updated_at = now();

-- ============================================================
-- 4. CX22073JW read-only public profile reference views
-- ============================================================

CREATE OR REPLACE VIEW cx22073jw.vw_robot_public_profile_reference_v1 AS
SELECT
  p.aiworker_model_code,
  p.aiworker_series_code,
  p.manufacturer_code,
  p.model_name_ja,
  p.public_profile_status_code,
  p.profile_scope_code,
  p.form_code,
  p.personality_no,
  p.height_cm,
  p.bust_cm,
  p.waist_cm,
  p.hip_cm,
  p.body_profile_note_ja,
  p.safety_note_ja,
  'AIWorkerOS'::text AS canon_owner,
  'CX22073JW_READ_VIEW_ONLY'::text AS cx_reference_mode,
  p.status_code,
  p.updated_at
FROM aiworker.robot_model_public_profile p
WHERE p.status_code = 'active';

CREATE OR REPLACE VIEW cx22073jw.vw_robot_model_full_reference_v2 AS
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

  personality.personality_label_ja,
  personality.worker_behavior_ja,
  personality.friend_lover_behavior_ja,
  personality.safety_note_ja AS personality_safety_note_ja,

  series.initiative_axis_code,
  series.user_influence_axis_code,
  series.action_restriction_axis_code,
  series.behavior_summary_ja AS series_behavior_summary_ja,

  public_profile.public_profile_status_code,
  public_profile.profile_scope_code,
  public_profile.form_code,
  public_profile.personality_no,
  public_profile.height_cm,
  public_profile.bust_cm,
  public_profile.waist_cm,
  public_profile.hip_cm,
  public_profile.body_profile_note_ja,
  public_profile.safety_note_ja AS public_profile_safety_note_ja,

  'BusinessOS+AIWorkerOS'::text AS canon_owner,
  'CX22073JW_READ_VIEW_ONLY'::text AS cx_reference_mode,
  rp.status_code,
  rp.updated_at
FROM business.robot_pool rp
LEFT JOIN aiworker.robot_model_personality_profile personality
  ON personality.aiworker_model_code = rp.aiworker_model_code
LEFT JOIN aiworker.robot_series_behavior_profile series
  ON series.aiworker_series_code = COALESCE(personality.aiworker_series_code, rp.aiworker_series_code)
LEFT JOIN aiworker.robot_model_public_profile public_profile
  ON public_profile.aiworker_model_code = rp.aiworker_model_code
WHERE rp.status_code = 'active';

COMMIT;
