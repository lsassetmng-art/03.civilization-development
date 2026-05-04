-- ============================================================
-- BusinessOS AIWorker add missing robot_pool models only
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Change type: add-only rows
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

DO $$
BEGIN
  IF to_regclass('business.robot_pool') IS NULL THEN
    RAISE EXCEPTION 'required_table_missing: business.robot_pool';
  END IF;
END $$;

CREATE TEMP TABLE tmp_business_aiworker_robot_pool_seed (
  aiworker_model_code text PRIMARY KEY,
  display_name text NOT NULL,
  aiworker_series_code text NOT NULL,
  manufacturer_code text NOT NULL,
  business_offer_code text NOT NULL,
  pool_scope_code text NOT NULL,
  available_quantity integer NOT NULL,
  reserved_quantity integer NOT NULL,
  unlimited_assignment_flag boolean NOT NULL,
  rental_unit_code text NOT NULL,
  status_code text NOT NULL,
  metadata_jsonb jsonb NOT NULL
) ON COMMIT DROP;

INSERT INTO tmp_business_aiworker_robot_pool_seed (
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
  metadata_jsonb
)
VALUES
  -- HD / helios_dynamics missing models
  ('HD-R5P', 'President', 'HD', 'helios_dynamics', 'standard', 'global', 10, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"HD","purpose":"AI企業の方針・事業計画・配分・承認"}'::jsonb),
  ('HD-R1A', 'Lover', 'HD', 'helios_dynamics', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"HD","purpose":"擬似恋人系AIワーカー"}'::jsonb),
  ('HD-R2S', 'Sniper', 'HD', 'helios_dynamics', 'standard', 'global', 20, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"HD","purpose":"特殊ロール・高精度・対象特化"}'::jsonb),
  ('HD-R2G', 'General', 'HD', 'helios_dynamics', 'standard', 'global', 30, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"HD","purpose":"統制・広域整理系"}'::jsonb),
  ('HD-R2T-0', 'Origin', 'HD', 'helios_dynamics', 'standard', 'global', 10, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"HD","purpose":"全体統括・起点的ロール"}'::jsonb),

  -- Beyond / ASIC
  ('BYD1-001', 'ASIC Workers1', 'Beyond', 'asic', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"Beyond","purpose":"単純単発作業レベル"}'::jsonb),
  ('BYD1-002', 'ASIC Workers2', 'Beyond', 'asic', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"Beyond","purpose":"単純反復・抜け漏れ補完レベル"}'::jsonb),
  ('BYD1-003', 'ASIC Workers3', 'Beyond', 'asic', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"Beyond","purpose":"複雑作業・高完成度成果物レベル"}'::jsonb),
  ('BYD2-001', 'ASIC Leader1', 'Beyond', 'asic', 'standard', 'global', 50, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"Beyond","purpose":"基本進行・形式チェックレベル"}'::jsonb),
  ('BYD2-002', 'ASIC Leader2', 'Beyond', 'asic', 'standard', 'global', 50, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"Beyond","purpose":"品質レビュー・整合性確認レベル"}'::jsonb),
  ('BYD2-003', 'ASIC Leader3', 'Beyond', 'asic', 'standard', 'global', 30, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"Beyond","purpose":"統合設計・リスク判断・納品品質統括レベル"}'::jsonb),

  -- LoVerS / lavi_corporation / v001 initial registration
  ('LVS-01Fv001', 'LoVerS 01F Genki', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"01","personality":"元気系","form":"F","version":"001"}'::jsonb),
  ('LVS-01Mv001', 'LoVerS 01M Genki', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"01","personality":"元気系","form":"M","version":"001"}'::jsonb),
  ('LVS-02Fv001', 'LoVerS 02F Seiso', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"02","personality":"清楚系","form":"F","version":"001"}'::jsonb),
  ('LVS-02Mv001', 'LoVerS 02M Seiso', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"02","personality":"清楚系","form":"M","version":"001"}'::jsonb),
  ('LVS-03Fv001', 'LoVerS 03F Ottori', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"03","personality":"おっとり系","form":"F","version":"001"}'::jsonb),
  ('LVS-03Mv001', 'LoVerS 03M Ottori', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"03","personality":"おっとり系","form":"M","version":"001"}'::jsonb),
  ('LVS-04Fv001', 'LoVerS 04F Amae', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"04","personality":"甘え上手系","form":"F","version":"001"}'::jsonb),
  ('LVS-04Mv001', 'LoVerS 04M Amae', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"04","personality":"甘え上手系","form":"M","version":"001"}'::jsonb),
  ('LVS-05Fv001', 'LoVerS 05F Shikkari', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"05","personality":"しっかり者系","form":"F","version":"001"}'::jsonb),
  ('LVS-05Mv001', 'LoVerS 05M Shikkari', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"05","personality":"しっかり者系","form":"M","version":"001"}'::jsonb),
  ('LVS-06Fv001', 'LoVerS 06F Cool', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"06","personality":"クール系","form":"F","version":"001"}'::jsonb),
  ('LVS-06Mv001', 'LoVerS 06M Cool', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"06","personality":"クール系","form":"M","version":"001"}'::jsonb),
  ('LVS-07Fv001', 'LoVerS 07F Iyashi', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"07","personality":"癒やし系","form":"F","version":"001"}'::jsonb),
  ('LVS-07Mv001', 'LoVerS 07M Iyashi', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"07","personality":"癒やし系","form":"M","version":"001"}'::jsonb),
  ('LVS-08Fv001', 'LoVerS 08F Oneesan', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"08","personality":"お姉さん系","form":"F","version":"001"}'::jsonb),
  ('LVS-08Mv001', 'LoVerS 08M Oneesan', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"08","personality":"お姉さん系","form":"M","version":"001"}'::jsonb),
  ('LVS-09Fv001', 'LoVerS 09F Tsundere', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"09","personality":"ツンデレ寄り","form":"F","version":"001"}'::jsonb),
  ('LVS-09Mv001', 'LoVerS 09M Tsundere', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"09","personality":"ツンデレ寄り","form":"M","version":"001"}'::jsonb),
  ('LVS-10Fv001', 'LoVerS 10F Mujaki', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"10","personality":"無邪気系","form":"F","version":"001"}'::jsonb),
  ('LVS-10Mv001', 'LoVerS 10M Mujaki', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"10","personality":"無邪気系","form":"M","version":"001"}'::jsonb),
  ('LVS-11Fv001', 'LoVerS 11F Kuudere', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"11","personality":"クーデレ","form":"F","version":"001"}'::jsonb),
  ('LVS-11Mv001', 'LoVerS 11M Kuudere', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"11","personality":"クーデレ","form":"M","version":"001"}'::jsonb),
  ('LVS-12Fv001', 'LoVerS 12F Business Yandere', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"12","personality":"ビジネスヤンデレ","form":"F","version":"001","safety_note":"演技・接客・キャラ商材用。監視・脅し・依存誘導・個人情報要求は禁止。"}'::jsonb),
  ('LVS-12Mv001', 'LoVerS 12M Business Yandere', 'LoVerS', 'lavi_corporation', 'standard', 'global', 100, 0, true, 'unit', 'active', '{"source":"manual_seed","series":"LoVerS","personality_no":"12","personality":"ビジネスヤンデレ","form":"M","version":"001","safety_note":"演技・接客・キャラ商材用。監視・脅し・依存誘導・個人情報要求は禁止。"}'::jsonb);

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
  s.business_offer_code,
  s.pool_scope_code,
  s.available_quantity,
  s.reserved_quantity,
  s.unlimited_assignment_flag,
  s.rental_unit_code,
  s.status_code,
  s.metadata_jsonb,
  now()
FROM tmp_business_aiworker_robot_pool_seed s
WHERE NOT EXISTS (
  SELECT 1
  FROM business.robot_pool rp
  WHERE rp.aiworker_model_code = s.aiworker_model_code
    AND rp.business_offer_code = s.business_offer_code
    AND rp.pool_scope_code = s.pool_scope_code
);

COMMIT;
