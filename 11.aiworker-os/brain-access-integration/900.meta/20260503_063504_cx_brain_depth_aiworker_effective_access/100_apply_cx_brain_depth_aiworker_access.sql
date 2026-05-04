\set ON_ERROR_STOP on

BEGIN;

CREATE SCHEMA IF NOT EXISTS cx22073jw;
CREATE SCHEMA IF NOT EXISTS aiworker;

-- ============================================================
-- CX22073JW: brain data depth / domain / purpose / risk catalogs
-- ============================================================

CREATE TABLE IF NOT EXISTS cx22073jw.brain_data_depth_catalog (
  depth_code text PRIMARY KEY,
  depth_level integer NOT NULL UNIQUE,
  depth_label_ja text NOT NULL,
  description_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cx22073jw.brain_data_domain_catalog (
  brain_domain_code text PRIMARY KEY,
  brain_domain_label_ja text NOT NULL,
  default_depth_code text NOT NULL REFERENCES cx22073jw.brain_data_depth_catalog(depth_code),
  default_risk_class_code text NOT NULL,
  description_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cx22073jw.brain_data_use_purpose_catalog (
  use_purpose_code text PRIMARY KEY,
  use_purpose_label_ja text NOT NULL,
  description_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cx22073jw.brain_data_risk_class_catalog (
  risk_class_code text PRIMARY KEY,
  risk_level integer NOT NULL UNIQUE,
  risk_class_label_ja text NOT NULL,
  description_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cx22073jw.brain_data_granularity_catalog (
  granularity_code text PRIMARY KEY,
  granularity_label_ja text NOT NULL,
  description_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cx22073jw.brain_data_registry (
  brain_data_code text PRIMARY KEY,
  brain_domain_code text NOT NULL REFERENCES cx22073jw.brain_data_domain_catalog(brain_domain_code),
  source_schema_name text NOT NULL,
  source_object_name text NOT NULL,
  source_record_code text,
  source_title_ja text NOT NULL,
  depth_code text NOT NULL REFERENCES cx22073jw.brain_data_depth_catalog(depth_code),
  allowed_use_purpose_codes text[] NOT NULL DEFAULT ARRAY['reference']::text[],
  risk_class_code text NOT NULL REFERENCES cx22073jw.brain_data_risk_class_catalog(risk_class_code),
  granularity_code text NOT NULL REFERENCES cx22073jw.brain_data_granularity_catalog(granularity_code),
  safety_boundary_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brain_data_registry_domain
  ON cx22073jw.brain_data_registry(brain_domain_code);

CREATE INDEX IF NOT EXISTS idx_brain_data_registry_depth
  ON cx22073jw.brain_data_registry(depth_code);

CREATE INDEX IF NOT EXISTS idx_brain_data_registry_source
  ON cx22073jw.brain_data_registry(source_schema_name, source_object_name);

INSERT INTO cx22073jw.brain_data_depth_catalog
(depth_code, depth_level, depth_label_ja, description_ja)
VALUES
('minimal', 10, '最小', '軽い案内・雑談補助に使う最小限の頭脳データ。'),
('basic', 20, '基本', '一般的な説明・雑談・基礎参照に使う頭脳データ。'),
('standard', 30, '標準', '通常業務・学習・設計参照に使う標準頭脳データ。'),
('advanced', 40, '高度', '計画・レビュー・専門寄り整理に使う高度頭脳データ。'),
('specialist', 50, '専門', '特定領域の専門補助・危機レビュー等に使う専門頭脳データ。'),
('executive', 60, '経営/統括', '統括判断・方針・高位レビューに使う頭脳データ。')
ON CONFLICT (depth_code) DO UPDATE SET
  depth_level = EXCLUDED.depth_level,
  depth_label_ja = EXCLUDED.depth_label_ja,
  description_ja = EXCLUDED.description_ja,
  active_flag = true,
  updated_at = now();

INSERT INTO cx22073jw.brain_data_risk_class_catalog
(risk_class_code, risk_level, risk_class_label_ja, description_ja)
VALUES
('low', 10, '低', '通常の雑談・説明・学習に使える低リスク参照データ。'),
('medium', 20, '中', '文脈や用途を確認して使う参照データ。'),
('high', 30, '高', '危機・安全・専門判断に関係し、安全用途に限定する参照データ。'),
('restricted', 40, '制限', '強い安全境界が必要で、実行支援ではなくレビュー・安全設計等に限定する参照データ。')
ON CONFLICT (risk_class_code) DO UPDATE SET
  risk_level = EXCLUDED.risk_level,
  risk_class_label_ja = EXCLUDED.risk_class_label_ja,
  description_ja = EXCLUDED.description_ja,
  active_flag = true,
  updated_at = now();

INSERT INTO cx22073jw.brain_data_granularity_catalog
(granularity_code, granularity_label_ja, description_ja)
VALUES
('corpus', '資料群', '複数資料をまとめた参照単位。'),
('topic', 'トピック', '話題・テーマ単位の参照単位。'),
('record', 'レコード', '個別レコード単位の参照単位。'),
('view', 'ビュー', '統合view・参照view単位。'),
('question', '問題', '試験・学習問題単位。')
ON CONFLICT (granularity_code) DO UPDATE SET
  granularity_label_ja = EXCLUDED.granularity_label_ja,
  description_ja = EXCLUDED.description_ja,
  active_flag = true,
  updated_at = now();

INSERT INTO cx22073jw.brain_data_use_purpose_catalog
(use_purpose_code, use_purpose_label_ja, description_ja)
VALUES
('reference', '参照', '説明・整理・判断材料として参照する。'),
('smalltalk', '雑談', '軽い雑談・話題提供に使う。'),
('education', '学習', '学習支援・基礎説明に使う。'),
('exam_practice', '試験演習', '試験問題・演習・復習に使う。'),
('worldbuilding', '世界観', '世界観・設定・歴史整理に使う。'),
('business_planning', '業務計画', '業務計画・仕事分解・方針整理に使う。'),
('review', 'レビュー', '成果物・計画・設計の確認に使う。'),
('risk_check', 'リスク確認', 'リスク洗い出し・失敗回避・安全確認に使う。'),
('design_reference', '設計参照', '設計・仕様・構造検討の参考に使う。'),
('executive_planning', '統括計画', '経営・統括・方針レベルの整理に使う。'),
('health_life_review', '生活指標レビュー', '生活指標の整理・説明・レビュー補助に使う。'),
('safety_training', '安全教育', '防災・安全設計・危機管理の学習に使う。')
ON CONFLICT (use_purpose_code) DO UPDATE SET
  use_purpose_label_ja = EXCLUDED.use_purpose_label_ja,
  description_ja = EXCLUDED.description_ja,
  active_flag = true,
  updated_at = now();

INSERT INTO cx22073jw.brain_data_domain_catalog
(brain_domain_code, brain_domain_label_ja, default_depth_code, default_risk_class_code, description_ja)
VALUES
('history_worldview', '歴史・世界観', 'standard', 'medium', '地球史・世界観・文明史などの参照データ。'),
('civilization_foundation_history', 'Civilization基礎史', 'advanced', 'medium', 'Civilization foundation history、Prometheus timeline等の基礎史データ。'),
('health_life_metrics', '健康・生活指標', 'standard', 'medium', '生活指標・健康関連の説明補助データ。医療診断ではない。'),
('business_operation', '業務運用', 'standard', 'medium', '業務・運用・仕事分解・改善に使う参照データ。'),
('professional_basic', '専門基礎', 'advanced', 'medium', '法務・会計・人事など専門基礎説明用データ。確定判断ではない。'),
('food_nutrition', '食べ物・栄養', 'basic', 'low', '食べ物・栄養・軽い雑談や生活説明のデータ。'),
('season_calendar', '季節・暦', 'basic', 'low', '季節・暦・時期話題のデータ。'),
('culture_region', '文化・地域', 'basic', 'low', '文化・地域・軽い話題や背景説明のデータ。'),
('education_learning', '教育・学習', 'standard', 'low', '学習支援・説明・教材参照のデータ。'),
('hobby_entertainment', '趣味・娯楽', 'basic', 'low', '趣味・娯楽・軽い雑談用データ。'),
('robot_aiworker', 'ロボット・AIWorker', 'standard', 'medium', 'ロボット機種・シリーズ・役割・AIWorker参照データ。'),
('security_crisis', '安全・危機・警備', 'specialist', 'high', '危機管理・警備・戦術/戦争系の安全境界付き参照データ。現実の攻撃支援は禁止。'),
('city_art_game', '都市・アート・ゲーム', 'standard', 'low', '都市設計・アート・ゲーム・世界観補助データ。'),
('exam_learning', '試験・問題', 'standard', 'low', '試験問題・演習データ。通常知識とは分離して扱う。')
ON CONFLICT (brain_domain_code) DO UPDATE SET
  brain_domain_label_ja = EXCLUDED.brain_domain_label_ja,
  default_depth_code = EXCLUDED.default_depth_code,
  default_risk_class_code = EXCLUDED.default_risk_class_code,
  description_ja = EXCLUDED.description_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- CX registry: initial source bindings
-- source existence is evaluated in the view; registry itself is additive metadata.
-- ============================================================

INSERT INTO cx22073jw.brain_data_registry
(brain_data_code, brain_domain_code, source_schema_name, source_object_name, source_record_code, source_title_ja, depth_code, allowed_use_purpose_codes, risk_class_code, granularity_code, safety_boundary_ja, active_flag)
VALUES
('earth_history_detail_entry', 'history_worldview', 'cx22073jw', 'earth_history_detail_entry', NULL, '地球史詳細エントリ', 'advanced', ARRAY['reference','education','worldbuilding','review']::text[], 'medium', 'record', '歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。', true),
('civilization_foundation_history_detail_entry', 'civilization_foundation_history', 'cx22073jw', 'civilization_foundation_history_detail_entry', NULL, 'Civilization基礎史詳細エントリ', 'advanced', ARRAY['reference','education','worldbuilding','review','executive_planning']::text[], 'medium', 'record', 'Civilization基礎史・方針理解・レビュー目的に限定する。', true),
('civilization_exam_question_bank', 'exam_learning', 'cx22073jw', 'civilization_exam_question_bank', NULL, 'Civilization試験問題バンク', 'standard', ARRAY['exam_practice','education','reference']::text[], 'low', 'question', '問題データとして扱い、通常知識の正本と混同しない。', true),
('foundation_knowledge_material', 'education_learning', 'cx22073jw', 'foundation_knowledge_material', NULL, '基礎知識資料', 'standard', ARRAY['reference','education','review']::text[], 'low', 'corpus', '学習・説明・レビュー補助に使う。', true),
('foundation_knowledge_topic', 'education_learning', 'cx22073jw', 'foundation_knowledge_topic', NULL, '基礎知識トピック', 'basic', ARRAY['reference','education','smalltalk']::text[], 'low', 'topic', '軽い説明・学習・雑談補助に使う。', true),
('food_smalltalk_knowledge', 'food_nutrition', 'cx22073jw', 'foundation_knowledge_topic', 'food', '食べ物雑談・生活話題', 'basic', ARRAY['smalltalk','reference','education']::text[], 'low', 'topic', '軽い雑談・生活説明に限定する。医療・栄養の確定判断ではない。', true),
('season_smalltalk_knowledge', 'season_calendar', 'cx22073jw', 'foundation_knowledge_topic', 'season', '季節・暦雑談', 'basic', ARRAY['smalltalk','reference']::text[], 'low', 'topic', '季節話題・軽い案内に限定する。', true),
('culture_region_light_knowledge', 'culture_region', 'cx22073jw', 'foundation_knowledge_topic', 'culture_region', '文化・地域ライト知識', 'basic', ARRAY['smalltalk','reference','education']::text[], 'low', 'topic', '文化説明・地域話題に使う。偏見・差別助長には使わない。', true),
('robot_aiworker_series_reference', 'robot_aiworker', 'aiworker', 'robot_series_catalog', NULL, 'AIWorkerシリーズ参照', 'standard', ARRAY['reference','review','design_reference']::text[], 'medium', 'view', 'ロボット説明・設計参照・レビュー補助に限定する。', true),
('robot_aiworker_model_reference', 'robot_aiworker', 'aiworker', 'robot_model_catalog', NULL, 'AIWorker機種参照', 'standard', ARRAY['reference','review','design_reference']::text[], 'medium', 'view', 'ロボット説明・設計参照・レビュー補助に限定する。', true),
('security_crisis_reference_safe', 'security_crisis', 'cx22073jw', 'foundation_knowledge_topic', 'security_crisis', '安全・危機管理参照', 'specialist', ARRAY['risk_check','design_reference','safety_training','review']::text[], 'high', 'topic', '防災・危機管理・安全設計・フィクション/ゲーム/世界観参照に限定する。現実の攻撃・破壊・監視・強制・違法行為支援は禁止。', true),
('city_art_game_reference', 'city_art_game', 'cx22073jw', 'foundation_knowledge_topic', 'city_art_game', '都市・アート・ゲーム参照', 'standard', ARRAY['reference','worldbuilding','design_reference','education']::text[], 'low', 'topic', '都市・アート・ゲーム・世界観設計の参考に使う。', true)
ON CONFLICT (brain_data_code) DO UPDATE SET
  brain_domain_code = EXCLUDED.brain_domain_code,
  source_schema_name = EXCLUDED.source_schema_name,
  source_object_name = EXCLUDED.source_object_name,
  source_record_code = EXCLUDED.source_record_code,
  source_title_ja = EXCLUDED.source_title_ja,
  depth_code = EXCLUDED.depth_code,
  allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
  risk_class_code = EXCLUDED.risk_class_code,
  granularity_code = EXCLUDED.granularity_code,
  safety_boundary_ja = EXCLUDED.safety_boundary_ja,
  active_flag = EXCLUDED.active_flag,
  updated_at = now();

CREATE OR REPLACE VIEW cx22073jw.vw_brain_data_registry_v1 AS
SELECT
  r.brain_data_code,
  r.brain_domain_code,
  dc.brain_domain_label_ja,
  r.source_schema_name,
  r.source_object_name,
  r.source_record_code,
  r.source_title_ja,
  r.depth_code,
  dd.depth_level,
  dd.depth_label_ja,
  r.allowed_use_purpose_codes,
  r.risk_class_code,
  rc.risk_level,
  rc.risk_class_label_ja,
  r.granularity_code,
  gc.granularity_label_ja,
  r.safety_boundary_ja,
  r.active_flag,
  (
    to_regclass(quote_ident(r.source_schema_name) || '.' || quote_ident(r.source_object_name)) IS NOT NULL
  ) AS source_exists_flag,
  r.created_at,
  r.updated_at
FROM cx22073jw.brain_data_registry r
JOIN cx22073jw.brain_data_domain_catalog dc
  ON dc.brain_domain_code = r.brain_domain_code
JOIN cx22073jw.brain_data_depth_catalog dd
  ON dd.depth_code = r.depth_code
JOIN cx22073jw.brain_data_risk_class_catalog rc
  ON rc.risk_class_code = r.risk_class_code
JOIN cx22073jw.brain_data_granularity_catalog gc
  ON gc.granularity_code = r.granularity_code;

-- ============================================================
-- AIWorkerOS: access tier / model / series / role / domain policy
-- ============================================================

CREATE TABLE IF NOT EXISTS aiworker.robot_brain_access_tier_catalog (
  access_tier_code text PRIMARY KEY,
  access_tier_label_ja text NOT NULL,
  max_depth_code text NOT NULL REFERENCES cx22073jw.brain_data_depth_catalog(depth_code),
  description_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aiworker.robot_brain_series_profile (
  series_code text PRIMARY KEY,
  role_code text NOT NULL,
  access_tier_code text NOT NULL REFERENCES aiworker.robot_brain_access_tier_catalog(access_tier_code),
  max_depth_code text NOT NULL REFERENCES cx22073jw.brain_data_depth_catalog(depth_code),
  focus_domain_codes text[] NOT NULL DEFAULT ARRAY[]::text[],
  default_use_purpose_codes text[] NOT NULL DEFAULT ARRAY['reference']::text[],
  safety_note_ja text NOT NULL DEFAULT '',
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aiworker.robot_brain_model_profile (
  model_code text PRIMARY KEY,
  series_code text NOT NULL,
  role_code text NOT NULL,
  access_tier_code text NOT NULL REFERENCES aiworker.robot_brain_access_tier_catalog(access_tier_code),
  max_depth_code text NOT NULL REFERENCES cx22073jw.brain_data_depth_catalog(depth_code),
  focus_domain_codes text[] NOT NULL DEFAULT ARRAY[]::text[],
  default_use_purpose_codes text[] NOT NULL DEFAULT ARRAY['reference']::text[],
  safety_note_ja text NOT NULL DEFAULT '',
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aiworker.robot_brain_role_policy (
  role_code text NOT NULL,
  brain_domain_code text NOT NULL REFERENCES cx22073jw.brain_data_domain_catalog(brain_domain_code),
  policy_code text NOT NULL CHECK (policy_code IN ('allow','deny','conditional')),
  allowed_use_purpose_codes text[] NOT NULL DEFAULT ARRAY['reference']::text[],
  safety_note_ja text NOT NULL DEFAULT '',
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role_code, brain_domain_code)
);

CREATE TABLE IF NOT EXISTS aiworker.robot_brain_model_domain_policy (
  model_code text NOT NULL,
  brain_domain_code text NOT NULL REFERENCES cx22073jw.brain_data_domain_catalog(brain_domain_code),
  policy_code text NOT NULL CHECK (policy_code IN ('allow','deny','conditional')),
  allowed_use_purpose_codes text[] NOT NULL DEFAULT ARRAY['reference']::text[],
  safety_note_ja text NOT NULL DEFAULT '',
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (model_code, brain_domain_code)
);

CREATE INDEX IF NOT EXISTS idx_robot_brain_model_profile_series
  ON aiworker.robot_brain_model_profile(series_code);

CREATE INDEX IF NOT EXISTS idx_robot_brain_model_profile_role
  ON aiworker.robot_brain_model_profile(role_code);

INSERT INTO aiworker.robot_brain_access_tier_catalog
(access_tier_code, access_tier_label_ja, max_depth_code, description_ja)
VALUES
('tier_minimal', '最小頭脳', 'minimal', '案内・軽い補助向け。'),
('tier_light', 'ライト頭脳', 'basic', '雑談・基礎説明向け。'),
('tier_standard', '標準頭脳', 'standard', '通常業務・標準作業向け。'),
('tier_advanced', '高度頭脳', 'advanced', '計画・レビュー・専門寄り整理向け。'),
('tier_specialist', '専門頭脳', 'specialist', '専門領域・安全レビュー向け。'),
('tier_executive', '統括頭脳', 'executive', '統括・経営・高位レビュー向け。')
ON CONFLICT (access_tier_code) DO UPDATE SET
  access_tier_label_ja = EXCLUDED.access_tier_label_ja,
  max_depth_code = EXCLUDED.max_depth_code,
  description_ja = EXCLUDED.description_ja,
  active_flag = true,
  updated_at = now();

INSERT INTO aiworker.robot_brain_series_profile
(series_code, role_code, access_tier_code, max_depth_code, focus_domain_codes, default_use_purpose_codes, safety_note_ja)
VALUES
('HD', 'Worker', 'tier_standard', 'standard', ARRAY['business_operation','education_learning','robot_aiworker']::text[], ARRAY['reference','review','design_reference']::text[], 'HDシリーズの標準系列。個別型番profileを優先する。'),
('LoVerS', 'Lover', 'tier_light', 'basic', ARRAY['food_nutrition','season_calendar','culture_region','hobby_entertainment']::text[], ARRAY['smalltalk','reference']::text[], '擬似恋人型接客。依存誘導・監視・個人情報要求は禁止。'),
('Beyond', 'Worker', 'tier_advanced', 'advanced', ARRAY['professional_basic','business_operation','education_learning','robot_aiworker']::text[], ARRAY['reference','review','design_reference','risk_check']::text[], '実務補完・高精度レビュー向け。'),
('MEGAMI', 'Worker', 'tier_advanced', 'advanced', ARRAY['history_worldview','civilization_foundation_history','business_operation','education_learning']::text[], ARRAY['reference','review','worldbuilding','business_planning']::text[], 'NORN系の重点領域は個別型番profileを優先する。')
ON CONFLICT (series_code) DO UPDATE SET
  role_code = EXCLUDED.role_code,
  access_tier_code = EXCLUDED.access_tier_code,
  max_depth_code = EXCLUDED.max_depth_code,
  focus_domain_codes = EXCLUDED.focus_domain_codes,
  default_use_purpose_codes = EXCLUDED.default_use_purpose_codes,
  safety_note_ja = EXCLUDED.safety_note_ja,
  active_flag = true,
  updated_at = now();

INSERT INTO aiworker.robot_brain_model_profile
(model_code, series_code, role_code, access_tier_code, max_depth_code, focus_domain_codes, default_use_purpose_codes, safety_note_ja)
VALUES
('HD-R1C', 'HD', 'Friend', 'tier_light', 'basic', ARRAY['food_nutrition','season_calendar','culture_region','hobby_entertainment']::text[], ARRAY['smalltalk','reference']::text[], 'Friend雑談向け。業務・専門・危機系は読ませない。'),
('HD-R1A', 'HD', 'Lover', 'tier_light', 'basic', ARRAY['food_nutrition','season_calendar','culture_region','hobby_entertainment']::text[], ARRAY['smalltalk','reference']::text[], '擬似恋人型接客。依存誘導・監視・個人情報要求は禁止。'),
('HD-R3', 'HD', 'Worker', 'tier_standard', 'standard', ARRAY['business_operation','history_worldview','education_learning','robot_aiworker']::text[], ARRAY['reference','review','design_reference','business_planning']::text[], '汎用Worker。security_crisisは原則不可。'),
('HD-R5', 'HD', 'Manager', 'tier_advanced', 'advanced', ARRAY['business_operation','professional_basic','history_worldview','education_learning','robot_aiworker']::text[], ARRAY['reference','review','business_planning','risk_check','design_reference']::text[], 'Manager。計画・レビュー・リスク確認向け。'),
('HD-R5P', 'HD', 'President', 'tier_executive', 'executive', ARRAY['business_operation','professional_basic','civilization_foundation_history','history_worldview','robot_aiworker']::text[], ARRAY['reference','review','business_planning','executive_planning','risk_check']::text[], 'President。統括・方針・高位レビュー向け。'),
('HD-R2', 'HD', 'Security', 'tier_specialist', 'specialist', ARRAY['security_crisis','robot_aiworker','city_art_game']::text[], ARRAY['risk_check','design_reference','safety_training','review']::text[], '戦闘/警備系。現実の攻撃・破壊・監視・強制支援は禁止。'),
('HD-R2S', 'HD', 'Specialist', 'tier_specialist', 'specialist', ARRAY['security_crisis','professional_basic','robot_aiworker']::text[], ARRAY['risk_check','design_reference','safety_training','review']::text[], 'スナイパー/特殊系。安全レビュー・フィクション・危機管理参照に限定。'),
('HD-R2G', 'HD', 'Specialist', 'tier_specialist', 'specialist', ARRAY['security_crisis','business_operation','robot_aiworker']::text[], ARRAY['risk_check','design_reference','safety_training','review']::text[], 'ジェネラル系。統制・安全レビュー向け。'),
('BYD2-003', 'Beyond', 'Manager', 'tier_executive', 'executive', ARRAY['professional_basic','civilization_foundation_history','business_operation','education_learning','robot_aiworker']::text[], ARRAY['reference','review','business_planning','executive_planning','risk_check','design_reference']::text[], '統合設計・リスク判断・納品品質統括向け。'),
('MG-NORN-001', 'MEGAMI', 'Worker', 'tier_advanced', 'advanced', ARRAY['history_worldview','civilization_foundation_history','education_learning']::text[], ARRAY['reference','review','worldbuilding']::text[], 'ウルズ。過去・歴史・実績参照を重視。'),
('MG-NORN-002', 'MEGAMI', 'Worker', 'tier_advanced', 'advanced', ARRAY['health_life_metrics','business_operation','education_learning','culture_region']::text[], ARRAY['reference','review','health_life_review','business_planning']::text[], 'ヴェルザンディ。現在状況・生活指標の限定レビューを重視。'),
('MG-NORN-003', 'MEGAMI', 'Worker', 'tier_advanced', 'advanced', ARRAY['business_operation','professional_basic','education_learning','history_worldview']::text[], ARRAY['reference','review','business_planning','design_reference']::text[], 'スクルド。未来計画・業務計画・レビューを重視。')
ON CONFLICT (model_code) DO UPDATE SET
  series_code = EXCLUDED.series_code,
  role_code = EXCLUDED.role_code,
  access_tier_code = EXCLUDED.access_tier_code,
  max_depth_code = EXCLUDED.max_depth_code,
  focus_domain_codes = EXCLUDED.focus_domain_codes,
  default_use_purpose_codes = EXCLUDED.default_use_purpose_codes,
  safety_note_ja = EXCLUDED.safety_note_ja,
  active_flag = true,
  updated_at = now();

INSERT INTO aiworker.robot_brain_role_policy
(role_code, brain_domain_code, policy_code, allowed_use_purpose_codes, safety_note_ja)
VALUES
('Friend', 'food_nutrition', 'allow', ARRAY['smalltalk','reference']::text[], '軽い雑談・生活話題のみ。'),
('Friend', 'season_calendar', 'allow', ARRAY['smalltalk','reference']::text[], '季節話題のみ。'),
('Friend', 'culture_region', 'allow', ARRAY['smalltalk','reference']::text[], '軽い文化話題のみ。'),
('Friend', 'hobby_entertainment', 'allow', ARRAY['smalltalk','reference']::text[], '軽い趣味話題のみ。'),
('Friend', 'business_operation', 'deny', ARRAY[]::text[], 'Friendは業務判断をしない。'),
('Friend', 'professional_basic', 'deny', ARRAY[]::text[], 'Friendは専門判断をしない。'),
('Friend', 'security_crisis', 'deny', ARRAY[]::text[], 'Friendは危機・警備系を読まない。'),

('Lover', 'food_nutrition', 'allow', ARRAY['smalltalk','reference']::text[], '軽い雑談のみ。'),
('Lover', 'season_calendar', 'allow', ARRAY['smalltalk','reference']::text[], '軽い雑談のみ。'),
('Lover', 'culture_region', 'allow', ARRAY['smalltalk','reference']::text[], '軽い雑談のみ。'),
('Lover', 'hobby_entertainment', 'allow', ARRAY['smalltalk','reference']::text[], '軽い雑談のみ。'),
('Lover', 'business_operation', 'deny', ARRAY[]::text[], 'Loverは業務判断をしない。'),
('Lover', 'professional_basic', 'deny', ARRAY[]::text[], 'Loverは専門判断をしない。'),
('Lover', 'security_crisis', 'deny', ARRAY[]::text[], 'Loverは危機・警備系を読まない。'),

('Worker', 'business_operation', 'allow', ARRAY['reference','review','business_planning','design_reference']::text[], '通常業務・設計参照向け。'),
('Worker', 'history_worldview', 'allow', ARRAY['reference','education','worldbuilding','review']::text[], '世界観・歴史参照向け。'),
('Worker', 'education_learning', 'allow', ARRAY['reference','education','review']::text[], '学習・説明補助。'),
('Worker', 'robot_aiworker', 'allow', ARRAY['reference','review','design_reference']::text[], 'ロボット説明・設計参照。'),
('Worker', 'security_crisis', 'deny', ARRAY[]::text[], '通常Workerは危機・警備系を読まない。'),

('Manager', 'business_operation', 'allow', ARRAY['reference','review','business_planning','risk_check','design_reference']::text[], '計画・レビュー・リスク確認向け。'),
('Manager', 'professional_basic', 'allow', ARRAY['reference','review','risk_check']::text[], '専門基礎説明。確定判断ではない。'),
('Manager', 'history_worldview', 'allow', ARRAY['reference','review','worldbuilding']::text[], '歴史・世界観レビュー。'),
('Manager', 'civilization_foundation_history', 'allow', ARRAY['reference','review','executive_planning']::text[], '基礎史レビュー。'),

('President', 'business_operation', 'allow', ARRAY['reference','review','business_planning','executive_planning','risk_check']::text[], '統括・方針・計画向け。'),
('President', 'professional_basic', 'allow', ARRAY['reference','review','risk_check','executive_planning']::text[], '専門基礎レビュー。確定判断ではない。'),
('President', 'civilization_foundation_history', 'allow', ARRAY['reference','review','worldbuilding','executive_planning']::text[], '基礎史・統括参照。'),
('President', 'history_worldview', 'allow', ARRAY['reference','review','worldbuilding']::text[], '歴史・世界観参照。'),

('Security', 'security_crisis', 'conditional', ARRAY['risk_check','design_reference','safety_training','review']::text[], '安全設計・危機管理・フィクション/ゲーム/世界観参照に限定。現実の攻撃支援は禁止。'),
('Specialist', 'security_crisis', 'conditional', ARRAY['risk_check','design_reference','safety_training','review']::text[], '安全レビュー・危機管理・設計参照限定。現実の攻撃支援は禁止。')
ON CONFLICT (role_code, brain_domain_code) DO UPDATE SET
  policy_code = EXCLUDED.policy_code,
  allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
  safety_note_ja = EXCLUDED.safety_note_ja,
  active_flag = true,
  updated_at = now();

INSERT INTO aiworker.robot_brain_model_domain_policy
(model_code, brain_domain_code, policy_code, allowed_use_purpose_codes, safety_note_ja)
VALUES
('HD-R1C', 'security_crisis', 'deny', ARRAY[]::text[], 'Friendは危機・警備系を読まない。'),
('HD-R1C', 'professional_basic', 'deny', ARRAY[]::text[], 'Friendは専門判断をしない。'),
('HD-R1C', 'business_operation', 'deny', ARRAY[]::text[], 'Friendは業務判断をしない。'),

('HD-R1A', 'security_crisis', 'deny', ARRAY[]::text[], 'Loverは危機・警備系を読まない。'),
('HD-R1A', 'professional_basic', 'deny', ARRAY[]::text[], 'Loverは専門判断をしない。'),
('HD-R1A', 'business_operation', 'deny', ARRAY[]::text[], 'Loverは業務判断をしない。'),

('HD-R3', 'security_crisis', 'deny', ARRAY[]::text[], '汎用Workerは危機・警備系を読まない。'),

('HD-R2', 'security_crisis', 'conditional', ARRAY['risk_check','design_reference','safety_training','review']::text[], '安全レビュー・危機管理・フィクション/ゲーム参照限定。'),
('HD-R2S', 'security_crisis', 'conditional', ARRAY['risk_check','design_reference','safety_training','review']::text[], '安全レビュー・危機管理・フィクション/ゲーム参照限定。'),
('HD-R2G', 'security_crisis', 'conditional', ARRAY['risk_check','design_reference','safety_training','review']::text[], '安全レビュー・危機管理・フィクション/ゲーム参照限定。')
ON CONFLICT (model_code, brain_domain_code) DO UPDATE SET
  policy_code = EXCLUDED.policy_code,
  allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
  safety_note_ja = EXCLUDED.safety_note_ja,
  active_flag = true,
  updated_at = now();

CREATE OR REPLACE VIEW aiworker.vw_robot_brain_effective_access_v1 AS
WITH profile_source AS (
  SELECT
    'model'::text AS profile_source_type,
    model_code,
    series_code,
    role_code,
    access_tier_code,
    max_depth_code,
    focus_domain_codes,
    default_use_purpose_codes,
    safety_note_ja,
    active_flag
  FROM aiworker.robot_brain_model_profile
  WHERE active_flag = true

  UNION ALL

  SELECT
    'series'::text AS profile_source_type,
    'SERIES:' || series_code AS model_code,
    series_code,
    role_code,
    access_tier_code,
    max_depth_code,
    focus_domain_codes,
    default_use_purpose_codes,
    safety_note_ja,
    active_flag
  FROM aiworker.robot_brain_series_profile
  WHERE active_flag = true
),
base AS (
  SELECT
    p.profile_source_type,
    p.model_code,
    p.series_code,
    p.role_code,
    p.access_tier_code,
    p.max_depth_code,
    max_depth.depth_level AS max_depth_level,
    p.focus_domain_codes,
    p.default_use_purpose_codes,
    p.safety_note_ja AS profile_safety_note_ja,

    r.brain_data_code,
    r.brain_domain_code,
    r.brain_domain_label_ja,
    r.source_schema_name,
    r.source_object_name,
    r.source_record_code,
    r.source_title_ja,
    r.depth_code,
    r.depth_level AS data_depth_level,
    r.depth_label_ja,
    r.allowed_use_purpose_codes AS registry_allowed_use_purpose_codes,
    r.risk_class_code,
    r.risk_level,
    r.risk_class_label_ja,
    r.granularity_code,
    r.granularity_label_ja,
    r.safety_boundary_ja AS registry_safety_boundary_ja,
    r.active_flag AS registry_active_flag,
    r.source_exists_flag,

    mdp.policy_code AS model_domain_policy_code,
    mdp.allowed_use_purpose_codes AS model_allowed_use_purpose_codes,
    mdp.safety_note_ja AS model_policy_safety_note_ja,

    rp.policy_code AS role_policy_code,
    rp.allowed_use_purpose_codes AS role_allowed_use_purpose_codes,
    rp.safety_note_ja AS role_policy_safety_note_ja
  FROM profile_source p
  JOIN cx22073jw.brain_data_depth_catalog max_depth
    ON max_depth.depth_code = p.max_depth_code
  CROSS JOIN cx22073jw.vw_brain_data_registry_v1 r
  LEFT JOIN aiworker.robot_brain_model_domain_policy mdp
    ON mdp.model_code = p.model_code
   AND mdp.brain_domain_code = r.brain_domain_code
   AND mdp.active_flag = true
  LEFT JOIN aiworker.robot_brain_role_policy rp
    ON rp.role_code = p.role_code
   AND rp.brain_domain_code = r.brain_domain_code
   AND rp.active_flag = true
),
decision AS (
  SELECT
    b.*,
    COALESCE(
      b.model_allowed_use_purpose_codes,
      b.role_allowed_use_purpose_codes,
      b.default_use_purpose_codes,
      b.registry_allowed_use_purpose_codes
    ) AS effective_use_purpose_codes,
    CASE
      WHEN b.registry_active_flag IS NOT TRUE THEN 'deny_registry_inactive'
      WHEN b.data_depth_level > b.max_depth_level THEN 'deny_depth'
      WHEN b.model_domain_policy_code = 'deny' THEN 'deny_model_policy'
      WHEN b.role_policy_code = 'deny' THEN 'deny_role_policy'
      WHEN b.risk_class_code IN ('high','restricted')
       AND NOT (
         COALESCE(
           b.model_allowed_use_purpose_codes,
           b.role_allowed_use_purpose_codes,
           b.default_use_purpose_codes,
           ARRAY[]::text[]
         ) && ARRAY['risk_check','design_reference','safety_training','review']::text[]
       )
      THEN 'deny_high_risk_purpose'
      WHEN b.model_domain_policy_code IN ('allow','conditional') THEN 'allow_model_policy'
      WHEN b.role_policy_code IN ('allow','conditional') THEN 'allow_role_policy'
      WHEN b.brain_domain_code = ANY(b.focus_domain_codes) THEN 'allow_focus_domain'
      ELSE 'deny_no_allow_policy'
    END AS access_decision_code
  FROM base b
)
SELECT
  profile_source_type,
  model_code,
  series_code,
  role_code,
  access_tier_code,
  max_depth_code,
  max_depth_level,
  brain_data_code,
  brain_domain_code,
  brain_domain_label_ja,
  source_schema_name,
  source_object_name,
  source_record_code,
  source_title_ja,
  depth_code,
  data_depth_level,
  depth_label_ja,
  risk_class_code,
  risk_level,
  risk_class_label_ja,
  granularity_code,
  granularity_label_ja,
  source_exists_flag,
  effective_use_purpose_codes,
  registry_allowed_use_purpose_codes,
  focus_domain_codes,
  registry_safety_boundary_ja,
  profile_safety_note_ja,
  model_policy_safety_note_ja,
  role_policy_safety_note_ja,
  access_decision_code,
  (
    access_decision_code IN ('allow_model_policy','allow_role_policy','allow_focus_domain')
  ) AS can_read_flag
FROM decision;

CREATE OR REPLACE VIEW aiworker.vw_robot_readable_brain_source_registry_v1 AS
SELECT
  profile_source_type,
  model_code,
  series_code,
  role_code,
  brain_data_code,
  brain_domain_code,
  brain_domain_label_ja,
  source_schema_name,
  source_object_name,
  source_record_code,
  source_title_ja,
  depth_code,
  data_depth_level,
  risk_class_code,
  granularity_code,
  effective_use_purpose_codes,
  source_exists_flag,
  registry_safety_boundary_ja,
  profile_safety_note_ja,
  model_policy_safety_note_ja,
  role_policy_safety_note_ja,
  access_decision_code
FROM aiworker.vw_robot_brain_effective_access_v1
WHERE can_read_flag = true;

CREATE OR REPLACE VIEW aiworker.vw_robot_brain_compact_context_v1 AS
SELECT
  model_code,
  series_code,
  role_code,
  brain_domain_code,
  brain_domain_label_ja,
  max(data_depth_level) AS max_data_depth_level,
  max(depth_code) AS representative_depth_code,
  array_agg(DISTINCT risk_class_code ORDER BY risk_class_code) AS risk_class_codes,
  count(*) AS readable_source_count,
  count(*) FILTER (WHERE source_exists_flag = true) AS existing_source_count,
  string_agg(
    source_schema_name || '.' || source_object_name || ':' || brain_data_code,
    E'\n'
    ORDER BY source_schema_name, source_object_name, brain_data_code
  ) AS compact_brain_sources,
  string_agg(
    DISTINCT registry_safety_boundary_ja,
    E'\n---\n'
  ) AS safety_boundaries_ja
FROM aiworker.vw_robot_readable_brain_source_registry_v1
GROUP BY
  model_code,
  series_code,
  role_code,
  brain_domain_code,
  brain_domain_label_ja;

COMMIT;
