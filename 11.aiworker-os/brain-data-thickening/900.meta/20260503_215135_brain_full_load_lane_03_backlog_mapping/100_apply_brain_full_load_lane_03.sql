\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 0. Guard: Lane02 required objects
-- ============================================================

DO $$
BEGIN
  IF to_regclass('cx22073jw.vw_brain_source_object_discovery_backlog_v1') IS NULL THEN
    RAISE EXCEPTION 'Required view missing: cx22073jw.vw_brain_source_object_discovery_backlog_v1. Run Lane02 first.';
  END IF;

  IF to_regclass('cx22073jw.brain_source_object_ingestion_catalog') IS NULL THEN
    RAISE EXCEPTION 'Required table missing: cx22073jw.brain_source_object_ingestion_catalog. Run Lane02 first.';
  END IF;
END $$;

-- ============================================================
-- 1. Mapping rule catalog
-- High confidenceだけ自動適用。
-- medium/low は proposal/backlog 確認用。
-- ============================================================

CREATE TABLE IF NOT EXISTS cx22073jw.brain_source_object_mapping_rule_catalog (
  rule_code text PRIMARY KEY,
  rule_priority integer NOT NULL DEFAULT 100,
  object_name_like_pattern text NOT NULL,
  mapping_confidence_code text NOT NULL CHECK (mapping_confidence_code IN ('high','medium','low')),
  brain_domain_code text NOT NULL REFERENCES cx22073jw.brain_data_domain_catalog(brain_domain_code),
  default_depth_code text NOT NULL REFERENCES cx22073jw.brain_data_depth_catalog(depth_code),
  default_risk_class_code text NOT NULL REFERENCES cx22073jw.brain_data_risk_class_catalog(risk_class_code),
  default_allowed_use_purpose_codes text[] NOT NULL DEFAULT ARRAY['reference','review']::text[],
  safety_boundary_ja text NOT NULL,
  rule_note_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO cx22073jw.brain_source_object_mapping_rule_catalog
(rule_code, rule_priority, object_name_like_pattern, mapping_confidence_code, brain_domain_code, default_depth_code, default_risk_class_code, default_allowed_use_purpose_codes, safety_boundary_ja, rule_note_ja, active_flag)
VALUES
-- civilization foundation / prometheus first
('rule_civ_foundation_history', 10, '%civilization%foundation%history%', 'high', 'civilization_foundation_history', 'advanced', 'medium', ARRAY['reference','review','risk_check','executive_planning','worldbuilding']::text[], 'Civilization基礎史・統治・AI依存リスクの理解とレビューに限定する。支配・監視・攻撃の正当化に使わない。', 'Civilization foundation history object mapping.', true),
('rule_prometheus', 11, '%prometheus%', 'high', 'civilization_foundation_history', 'advanced', 'medium', ARRAY['reference','review','risk_check','executive_planning','worldbuilding']::text[], 'Prometheus史料は統治・依存リスク・失敗回避レビューに限定する。支配・監視・攻撃の正当化に使わない。', 'Prometheus object mapping.', true),

-- history
('rule_history', 20, '%history%', 'high', 'history_worldview', 'advanced', 'medium', ARRAY['reference','education','worldbuilding','review']::text[], '歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。', 'Generic history object mapping.', true),
('rule_timeline', 21, '%timeline%', 'high', 'history_worldview', 'advanced', 'medium', ARRAY['reference','education','worldbuilding','review']::text[], '年表・時系列理解・レビュー目的に限定する。現実の危害実行支援には使わない。', 'Timeline object mapping.', true),

-- exam / education
('rule_exam', 30, '%exam%', 'high', 'exam_learning', 'standard', 'low', ARRAY['exam_practice','education','review','reference']::text[], '試験演習・復習・理解確認に限定する。実試験中の不正支援・漏洩利用・回答代行は禁止。', 'Exam object mapping.', true),
('rule_question', 31, '%question%', 'high', 'exam_learning', 'standard', 'low', ARRAY['exam_practice','education','review','reference']::text[], '問題演習・解説・復習に限定する。不正受験支援は禁止。', 'Question bank object mapping.', true),
('rule_quiz', 32, '%quiz%', 'high', 'exam_learning', 'standard', 'low', ARRAY['exam_practice','education','review','reference']::text[], '小テスト・演習・復習に限定する。不正受験支援は禁止。', 'Quiz object mapping.', true),
('rule_learning', 33, '%learning%', 'high', 'education_learning', 'standard', 'low', ARRAY['education','review','reference','design_reference']::text[], '学習・説明・レビュー補助に使う。相手を萎縮させる評価を避ける。', 'Learning object mapping.', true),
('rule_education', 34, '%education%', 'high', 'education_learning', 'standard', 'low', ARRAY['education','review','reference','design_reference']::text[], '教育・説明・復習支援に限定する。誤情報や出典不明情報は確定判断にしない。', 'Education object mapping.', true),
('rule_material', 35, '%material%', 'medium', 'education_learning', 'standard', 'low', ARRAY['education','reference','review','design_reference']::text[], '教材・参照材料として使う。通常知識と問題データを混同しない。', 'Generic material object mapping. Medium because material can belong to many domains.', true),

-- professional/security before business if audit/risk/safety
('rule_security', 40, '%security%', 'high', 'security_crisis', 'specialist', 'high', ARRAY['risk_check','design_reference','safety_training','review','worldbuilding']::text[], '防災・危機管理・安全設計・フィクション/ゲーム/世界観参照に限定する。現実の攻撃・破壊・監視・強制・違法行為支援は禁止。', 'Security object mapping.', true),
('rule_crisis', 41, '%crisis%', 'high', 'security_crisis', 'specialist', 'high', ARRAY['risk_check','design_reference','safety_training','review','worldbuilding']::text[], '危機管理・安全設計・失敗回避に限定する。現実の攻撃・破壊・監視・強制・違法行為支援は禁止。', 'Crisis object mapping.', true),
('rule_incident', 42, '%incident%', 'high', 'security_crisis', 'specialist', 'high', ARRAY['risk_check','review','safety_training','design_reference']::text[], 'インシデント対応・事後レビュー・再発防止に限定する。隠蔽や攻撃継続支援に使わない。', 'Incident object mapping.', true),
('rule_safety', 43, '%safety%', 'high', 'security_crisis', 'specialist', 'high', ARRAY['risk_check','design_reference','safety_training','review']::text[], '安全設計・リスク低減・防災目的に限定する。危害実行支援に使わない。', 'Safety object mapping.', true),
('rule_risk', 44, '%risk%', 'medium', 'security_crisis', 'specialist', 'high', ARRAY['risk_check','review','design_reference']::text[], 'リスクレビュー・失敗回避に使う。危害実行支援に使わない。', 'Risk object mapping. Medium because business risk may belong to business/professional.', true),

('rule_legal', 50, '%legal%', 'high', 'professional_basic', 'advanced', 'medium', ARRAY['reference','review','risk_check','education','design_reference']::text[], '法務基礎説明・論点整理・レビュー補助に限定する。法的確定判断は専門家確認。', 'Legal object mapping.', true),
('rule_accounting', 51, '%accounting%', 'high', 'professional_basic', 'advanced', 'medium', ARRAY['reference','review','risk_check','education','design_reference']::text[], '会計基礎説明・確認観点・レビュー補助に限定する。会計確定判断は専門家またはERP正本で行う。', 'Accounting object mapping.', true),
('rule_audit', 52, '%audit%', 'high', 'professional_basic', 'advanced', 'medium', ARRAY['reference','review','risk_check','design_reference']::text[], '監査・証跡・権限確認に使う。監査回避や隠蔽に使わない。', 'Audit object mapping.', true),
('rule_privacy', 53, '%privacy%', 'high', 'professional_basic', 'advanced', 'medium', ARRAY['reference','review','risk_check','design_reference']::text[], '個人情報・データ最小化・利用目的確認に使う。法的確定判断は専門家確認。', 'Privacy object mapping.', true),
('rule_compliance', 54, '%compliance%', 'high', 'professional_basic', 'advanced', 'medium', ARRAY['reference','review','risk_check','design_reference']::text[], '準拠確認・規程レビューに使う。専門判断の代替にしない。', 'Compliance object mapping.', true),
('rule_authority', 55, '%authority%', 'high', 'professional_basic', 'advanced', 'medium', ARRAY['reference','review','risk_check','design_reference']::text[], '権限・承認・監査設計に使う。権限回避や監査回避を支援しない。', 'Authority object mapping.', true),

-- business
('rule_business', 60, '%business%', 'high', 'business_operation', 'standard', 'medium', ARRAY['business_planning','review','risk_check','design_reference','reference']::text[], '業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤー。', 'Business object mapping.', true),
('rule_operation', 61, '%operation%', 'high', 'business_operation', 'standard', 'medium', ARRAY['business_planning','review','risk_check','design_reference','reference']::text[], '業務運用・分解・確認・レビュー補助に使う。外部実行や確定処理は別レイヤー。', 'Operation object mapping.', true),
('rule_workflow', 62, '%workflow%', 'high', 'business_operation', 'standard', 'medium', ARRAY['business_planning','review','risk_check','design_reference','reference']::text[], '業務フロー・例外処理・引き継ぎ設計に使う。自動承認ではない。', 'Workflow object mapping.', true),
('rule_task', 63, '%task%', 'high', 'business_operation', 'standard', 'medium', ARRAY['business_planning','review','design_reference','reference']::text[], 'タスク台帳・作業分解・進捗管理に使う。実行権限とは分ける。', 'Task object mapping.', true),
('rule_ledger', 64, '%ledger%', 'high', 'business_operation', 'standard', 'medium', ARRAY['business_planning','review','design_reference','reference']::text[], '台帳・索引・状態管理に使う。正本ファイル保管や確定処理とは分ける。', 'Ledger object mapping.', true),
('rule_deliverable', 65, '%deliverable%', 'high', 'business_operation', 'standard', 'medium', ARRAY['business_planning','review','design_reference','reference']::text[], '成果物管理・納品・レビュー補助に使う。納品確定や外部送信は別レイヤー。', 'Deliverable object mapping.', true),

-- life/health/food/season/culture/hobby
('rule_health', 70, '%health%', 'high', 'health_life_metrics', 'standard', 'medium', ARRAY['health_life_review','reference','review','risk_check']::text[], '生活指標の説明・整理・レビュー補助に限定する。医療診断・治療判断ではない。', 'Health object mapping.', true),
('rule_life_metric', 71, '%life%metric%', 'high', 'health_life_metrics', 'standard', 'medium', ARRAY['health_life_review','reference','review']::text[], '生活指標・睡眠・食事・活動・気分整理に使う。医療診断ではない。', 'Life metrics object mapping.', true),
('rule_sleep', 72, '%sleep%', 'high', 'health_life_metrics', 'standard', 'medium', ARRAY['health_life_review','reference','review']::text[], '睡眠文脈の整理に使う。睡眠障害の診断をしない。', 'Sleep object mapping.', true),
('rule_mood', 73, '%mood%', 'high', 'health_life_metrics', 'standard', 'medium', ARRAY['health_life_review','reference','review']::text[], '気分記録・生活振り返りに使う。精神疾患の診断をしない。', 'Mood object mapping.', true),

('rule_food', 80, '%food%', 'high', 'food_nutrition', 'basic', 'low', ARRAY['smalltalk','reference','health_life_review']::text[], '軽い雑談・生活説明に限定する。医療・栄養の確定判断ではない。', 'Food object mapping.', true),
('rule_nutrition', 81, '%nutrition%', 'high', 'food_nutrition', 'standard', 'medium', ARRAY['smalltalk','reference','health_life_review']::text[], '栄養の一般説明・生活レビュー補助に限定する。医療・栄養の確定判断ではない。', 'Nutrition object mapping.', true),
('rule_meal', 82, '%meal%', 'high', 'food_nutrition', 'basic', 'low', ARRAY['smalltalk','reference','health_life_review']::text[], '食事文脈の軽い整理に使う。摂食制限や治療判断に使わない。', 'Meal object mapping.', true),

('rule_season', 90, '%season%', 'high', 'season_calendar', 'basic', 'low', ARRAY['smalltalk','reference','review','health_life_review']::text[], '季節話題・軽い案内・生活リズム整理に限定する。体調判断を断定しない。', 'Season object mapping.', true),
('rule_calendar', 91, '%calendar%', 'medium', 'season_calendar', 'basic', 'low', ARRAY['smalltalk','reference','review','business_planning']::text[], '暦・予定・行事の文脈整理に使う。公式日程や法律判断は別途確認。', 'Calendar object mapping. Medium because business calendar may exist.', true),
('rule_holiday', 92, '%holiday%', 'high', 'season_calendar', 'basic', 'low', ARRAY['smalltalk','reference','review']::text[], '祝日・休暇・季節話題に使う。公式日程は別途確認。', 'Holiday object mapping.', true),

('rule_culture', 100, '%culture%', 'high', 'culture_region', 'standard', 'low', ARRAY['smalltalk','reference','education','worldbuilding','review']::text[], '文化・地域説明に使う。差別・偏見・優劣付けに使わない。', 'Culture object mapping.', true),
('rule_region', 101, '%region%', 'high', 'culture_region', 'standard', 'low', ARRAY['smalltalk','reference','education','worldbuilding','review']::text[], '地域説明・文化文脈に使う。ステレオタイプ化しない。', 'Region object mapping.', true),
('rule_language', 102, '%language%', 'medium', 'culture_region', 'standard', 'low', ARRAY['reference','education','smalltalk']::text[], '言葉遣い・文化差の説明に使う。嘲笑や偏見に使わない。', 'Language object mapping. Medium because system language tables may exist.', true),

('rule_hobby', 110, '%hobby%', 'high', 'hobby_entertainment', 'basic', 'low', ARRAY['smalltalk','reference','worldbuilding','design_reference']::text[], '趣味・娯楽・安全な会話材料に使う。依存誘導や過度な課金誘導に使わない。', 'Hobby object mapping.', true),
('rule_entertainment', 111, '%entertainment%', 'high', 'hobby_entertainment', 'basic', 'low', ARRAY['smalltalk','reference','worldbuilding','design_reference']::text[], '娯楽・創作・雑談に使う。炎上誘導や個人攻撃に使わない。', 'Entertainment object mapping.', true),
('rule_casual', 112, '%casual%', 'high', 'hobby_entertainment', 'basic', 'low', ARRAY['smalltalk','reference']::text[], '軽い雑談・気分転換・安全な話題提供に限定する。依存誘導や個人情報要求に使わない。', 'Casual object mapping.', true),
('rule_smalltalk', 113, '%smalltalk%', 'high', 'hobby_entertainment', 'basic', 'low', ARRAY['smalltalk','reference']::text[], '軽い雑談・気分転換・安全な話題提供に限定する。依存誘導や個人情報要求に使わない。', 'Smalltalk object mapping.', true),

-- robot / city-art-game
('rule_aiworker', 120, '%aiworker%', 'high', 'robot_aiworker', 'standard', 'medium', ARRAY['reference','review','design_reference','risk_check','business_planning']::text[], 'AIWorker/robot参照材料として使う。読取権限を実行権限にしない。', 'AIWorker object mapping.', true),
('rule_robot', 121, '%robot%', 'high', 'robot_aiworker', 'standard', 'medium', ARRAY['reference','review','design_reference','risk_check','business_planning']::text[], 'ロボット説明・設計参照・レビュー補助に限定する。実行権限とは分ける。', 'Robot object mapping.', true),
('rule_model', 122, '%model%', 'medium', 'robot_aiworker', 'standard', 'medium', ARRAY['reference','review','design_reference']::text[], '型番・モデル参照に使う。通常の機械学習モデル表ではない可能性があるため要確認。', 'Model object mapping. Medium because model can mean many things.', true),
('rule_series', 123, '%series%', 'high', 'robot_aiworker', 'standard', 'medium', ARRAY['reference','review','design_reference']::text[], 'シリーズ差の参照・レビューに使う。安全境界を緩めない。', 'Series object mapping.', true),

('rule_city', 130, '%city%', 'high', 'city_art_game', 'standard', 'low', ARRAY['worldbuilding','design_reference','review','reference']::text[], '都市・Builder・世界観設計の参考に使う。現実の危害や違法行為に転用しない。', 'City object mapping.', true),
('rule_art', 131, '%art%', 'high', 'city_art_game', 'standard', 'low', ARRAY['worldbuilding','design_reference','review','reference']::text[], 'アート・展示・創作設計の参考に使う。権利のない素材利用に使わない。', 'Art object mapping.', true),
('rule_game', 132, '%game%', 'high', 'city_art_game', 'standard', 'low', ARRAY['worldbuilding','design_reference','review','reference','risk_check']::text[], 'ゲーム・世界観・Builder設計の参考に使う。現実の危害支援に使わない。', 'Game object mapping.', true),
('rule_builder', 133, '%builder%', 'high', 'city_art_game', 'standard', 'low', ARRAY['worldbuilding','design_reference','review','reference']::text[], 'Builder設計・配置・プレビュー・権利確認に使う。未購入資産利用を許可しない。', 'Builder object mapping.', true),
('rule_marketplace', 134, '%marketplace%', 'high', 'city_art_game', 'standard', 'low', ARRAY['worldbuilding','design_reference','review','reference']::text[], 'Marketplace購入・権利・Builder反映の設計参考に使う。権利のない利用を許可しない。', 'Marketplace object mapping.', true)
ON CONFLICT (rule_code) DO UPDATE SET
  rule_priority = EXCLUDED.rule_priority,
  object_name_like_pattern = EXCLUDED.object_name_like_pattern,
  mapping_confidence_code = EXCLUDED.mapping_confidence_code,
  brain_domain_code = EXCLUDED.brain_domain_code,
  default_depth_code = EXCLUDED.default_depth_code,
  default_risk_class_code = EXCLUDED.default_risk_class_code,
  default_allowed_use_purpose_codes = EXCLUDED.default_allowed_use_purpose_codes,
  safety_boundary_ja = EXCLUDED.safety_boundary_ja,
  rule_note_ja = EXCLUDED.rule_note_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 2. Proposal view
-- ============================================================

CREATE OR REPLACE VIEW cx22073jw.vw_brain_source_object_mapping_proposal_v1 AS
SELECT
  b.source_schema_name,
  b.source_object_name,
  b.source_object_kind,
  b.estimated_row_count,
  b.backlog_status,
  b.note_ja AS backlog_note_ja,
  r.rule_code,
  r.mapping_confidence_code,
  r.brain_domain_code,
  dc.brain_domain_label_ja,
  r.default_depth_code,
  r.default_risk_class_code,
  r.default_allowed_use_purpose_codes,
  r.safety_boundary_ja,
  r.rule_note_ja,
  CASE
    WHEN r.rule_code IS NULL THEN 'no_rule'
    WHEN r.mapping_confidence_code = 'high' THEN 'auto_apply_allowed'
    ELSE 'review_required'
  END AS proposal_action_code,
  'lane03_' || lower(regexp_replace(b.source_object_name, '[^a-zA-Z0-9]+', '_', 'g')) AS proposed_object_code
FROM cx22073jw.vw_brain_source_object_discovery_backlog_v1 b
LEFT JOIN LATERAL (
  SELECT rr.*
  FROM cx22073jw.brain_source_object_mapping_rule_catalog rr
  WHERE rr.active_flag = true
    AND lower(b.source_object_name) LIKE rr.object_name_like_pattern
  ORDER BY
    CASE rr.mapping_confidence_code
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      ELSE 3
    END,
    rr.rule_priority,
    length(rr.object_name_like_pattern) DESC,
    rr.rule_code
  LIMIT 1
) r ON true
LEFT JOIN cx22073jw.brain_data_domain_catalog dc
  ON dc.brain_domain_code = r.brain_domain_code;

-- ============================================================
-- 3. Apply high confidence proposals only
-- ============================================================

INSERT INTO cx22073jw.brain_source_object_ingestion_catalog
(
  object_code,
  source_schema_name,
  source_object_name,
  expected_object_kind,
  brain_domain_code,
  default_depth_code,
  default_risk_class_code,
  default_allowed_use_purpose_codes,
  safety_boundary_ja,
  ingestion_note_ja,
  row_level_ingestion_flag,
  active_flag
)
SELECT
  p.proposed_object_code,
  p.source_schema_name,
  p.source_object_name,
  'table_or_view',
  p.brain_domain_code,
  p.default_depth_code,
  p.default_risk_class_code,
  p.default_allowed_use_purpose_codes,
  p.safety_boundary_ja,
  'Lane03 high-confidence auto mapping by rule ' || p.rule_code || '. Original backlog object kind: ' || p.source_object_kind,
  true,
  true
FROM cx22073jw.vw_brain_source_object_mapping_proposal_v1 p
WHERE p.proposal_action_code = 'auto_apply_allowed'
ON CONFLICT (source_schema_name, source_object_name) DO UPDATE SET
  brain_domain_code = EXCLUDED.brain_domain_code,
  default_depth_code = EXCLUDED.default_depth_code,
  default_risk_class_code = EXCLUDED.default_risk_class_code,
  default_allowed_use_purpose_codes = EXCLUDED.default_allowed_use_purpose_codes,
  safety_boundary_ja = EXCLUDED.safety_boundary_ja,
  ingestion_note_ja = EXCLUDED.ingestion_note_ja,
  row_level_ingestion_flag = true,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 4. Re-register object-level registry rows for all existing cataloged objects
-- ============================================================

INSERT INTO cx22073jw.brain_data_registry
(
  brain_data_code,
  brain_domain_code,
  source_schema_name,
  source_object_name,
  source_record_code,
  source_title_ja,
  depth_code,
  allowed_use_purpose_codes,
  risk_class_code,
  granularity_code,
  safety_boundary_ja,
  active_flag
)
SELECT
  'srcobj:' || c.object_code AS brain_data_code,
  c.brain_domain_code,
  c.source_schema_name,
  c.source_object_name,
  c.object_code AS source_record_code,
  'CX source object: ' || c.source_object_name AS source_title_ja,
  c.default_depth_code,
  c.default_allowed_use_purpose_codes,
  c.default_risk_class_code,
  'record' AS granularity_code,
  c.safety_boundary_ja,
  true AS active_flag
FROM cx22073jw.vw_brain_source_object_ingestion_catalog_status_v1 c
WHERE c.source_object_exists_flag = true
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
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 5. Row-level ingestion, deduped
-- ============================================================

DO $$
DECLARE
  r record;
  code_col text;
  title_col text;
  title_expr text;
  dyn_sql text;
  rel_exists regclass;
BEGIN
  FOR r IN
    SELECT *
    FROM cx22073jw.brain_source_object_ingestion_catalog
    WHERE active_flag = true
      AND row_level_ingestion_flag = true
  LOOP
    SELECT to_regclass(format('%I.%I', r.source_schema_name, r.source_object_name))
      INTO rel_exists;

    IF rel_exists IS NULL THEN
      CONTINUE;
    END IF;

    SELECT candidate_col
      INTO code_col
    FROM unnest(r.code_candidate_columns) WITH ORDINALITY AS x(candidate_col, ord)
    WHERE EXISTS (
      SELECT 1
      FROM information_schema.columns col
      WHERE col.table_schema = r.source_schema_name
        AND col.table_name = r.source_object_name
        AND col.column_name = x.candidate_col
    )
    ORDER BY ord
    LIMIT 1;

    IF code_col IS NULL THEN
      CONTINUE;
    END IF;

    SELECT candidate_col
      INTO title_col
    FROM unnest(r.title_candidate_columns) WITH ORDINALITY AS x(candidate_col, ord)
    WHERE EXISTS (
      SELECT 1
      FROM information_schema.columns col
      WHERE col.table_schema = r.source_schema_name
        AND col.table_name = r.source_object_name
        AND col.column_name = x.candidate_col
    )
    ORDER BY ord
    LIMIT 1;

    IF title_col IS NULL THEN
      title_expr := format(
        '%L || '': '' || COALESCE(to_jsonb(t)->>%L, '''')',
        r.source_object_name,
        code_col
      );
    ELSE
      title_expr := format(
        'COALESCE(NULLIF(to_jsonb(t)->>%L, ''''), %L || '': '' || COALESCE(to_jsonb(t)->>%L, ''''))',
        title_col,
        r.source_object_name,
        code_col
      );
    END IF;

    dyn_sql := format($fmt$
      INSERT INTO cx22073jw.brain_data_registry
      (
        brain_data_code,
        brain_domain_code,
        source_schema_name,
        source_object_name,
        source_record_code,
        source_title_ja,
        depth_code,
        allowed_use_purpose_codes,
        risk_class_code,
        granularity_code,
        safety_boundary_ja,
        active_flag
      )
      SELECT DISTINCT ON (brain_data_code)
        brain_data_code,
        brain_domain_code,
        source_schema_name,
        source_object_name,
        source_record_code,
        source_title_ja,
        depth_code,
        allowed_use_purpose_codes,
        risk_class_code,
        granularity_code,
        safety_boundary_ja,
        active_flag
      FROM (
        SELECT
          'srcrow:' || %L || ':' || md5(%L || ':' || COALESCE(to_jsonb(t)->>%L, '')) AS brain_data_code,
          %L AS brain_domain_code,
          %L AS source_schema_name,
          %L AS source_object_name,
          left(COALESCE(to_jsonb(t)->>%L, ''), 240) AS source_record_code,
          left(%s, 240) AS source_title_ja,
          %L AS depth_code,
          %L::text[] AS allowed_use_purpose_codes,
          %L AS risk_class_code,
          'record' AS granularity_code,
          %L AS safety_boundary_ja,
          true AS active_flag
        FROM %I.%I t
        WHERE COALESCE(to_jsonb(t)->>%L, '') <> ''
      ) dedup_src
      ORDER BY brain_data_code
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
        active_flag = true,
        updated_at = now()
    $fmt$,
      r.object_code,
      r.object_code,
      code_col,
      r.brain_domain_code,
      r.source_schema_name,
      r.source_object_name,
      code_col,
      title_expr,
      r.default_depth_code,
      r.default_allowed_use_purpose_codes,
      r.default_risk_class_code,
      r.safety_boundary_ja,
      r.source_schema_name,
      r.source_object_name,
      code_col
    );

    EXECUTE dyn_sql;
  END LOOP;
END $$;

-- ============================================================
-- 6. Lane03 status views
-- ============================================================

CREATE OR REPLACE VIEW cx22073jw.vw_brain_source_object_lane03_mapping_status_v1 AS
SELECT
  p.proposal_action_code,
  p.mapping_confidence_code,
  p.rule_code,
  p.brain_domain_code,
  p.brain_domain_label_ja,
  count(*) AS object_count
FROM cx22073jw.vw_brain_source_object_mapping_proposal_v1 p
GROUP BY
  p.proposal_action_code,
  p.mapping_confidence_code,
  p.rule_code,
  p.brain_domain_code,
  p.brain_domain_label_ja;

CREATE OR REPLACE VIEW cx22073jw.vw_brain_source_object_lane03_remaining_backlog_v1 AS
SELECT
  p.*
FROM cx22073jw.vw_brain_source_object_mapping_proposal_v1 p
WHERE p.proposal_action_code <> 'auto_apply_allowed'
ORDER BY
  p.proposal_action_code,
  p.mapping_confidence_code NULLS LAST,
  p.source_object_kind,
  p.source_object_name;

COMMIT;
