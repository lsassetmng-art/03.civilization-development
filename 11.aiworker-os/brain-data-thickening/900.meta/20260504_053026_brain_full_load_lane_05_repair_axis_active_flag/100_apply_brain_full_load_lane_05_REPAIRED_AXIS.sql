\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 0. Guard
-- ============================================================

DO $$
BEGIN
  IF to_regclass('cx22073jw.vw_brain_full_load_coverage_v1') IS NULL THEN
    RAISE EXCEPTION 'Required view missing: cx22073jw.vw_brain_full_load_coverage_v1';
  END IF;

  IF to_regclass('cx22073jw.brain_knowledge_unit') IS NULL THEN
    RAISE EXCEPTION 'Required table missing: cx22073jw.brain_knowledge_unit';
  END IF;

  IF to_regclass('aiworker.vw_robot_readable_brain_runtime_material_v1') IS NULL THEN
    RAISE EXCEPTION 'Required view missing: aiworker.vw_robot_readable_brain_runtime_material_v1. Run Lane04 first.';
  END IF;
END $$;

-- ============================================================
-- 1. Fill axis catalog
-- 全domainに共通で使う「頭脳補強の観点」
-- ============================================================

CREATE TABLE IF NOT EXISTS cx22073jw.brain_full_load_fill_axis_catalog (
  axis_code text PRIMARY KEY,
  axis_order integer NOT NULL,
  axis_title_ja text NOT NULL,
  axis_summary_ja text NOT NULL,
  axis_use_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO cx22073jw.brain_full_load_fill_axis_catalog
(axis_code, axis_order, axis_title_ja, axis_summary_ja, axis_use_ja)
VALUES
('basic_concept', 1, '基本概念', 'domainの基本概念を短く説明する。', '初期理解・説明・軽い参照'),
('canonical_boundary', 2, '正本境界', 'どこまでがこのdomainの正本かを分ける。', '責務分離・設計レビュー'),
('purpose_fit', 3, '利用目的', 'どのpurposeで読ませるべきかを整理する。', 'runtime purpose filtering'),
('depth_fit', 4, '読取深度', 'basic/standard/advanced等の深度差を整理する。', 'model性能差・depth制御'),
('safety_boundary', 5, '安全境界', '危険用途・誤用・禁止出力を明確にする。', '安全レビュー・prompt制御'),
('practical_application', 6, '実務適用', '実際の仕事・生活・創作でどう使うかを整理する。', '実務補助・設計参照'),
('review_lens', 7, 'レビュー観点', '確認・検証・品質レビューで見る点を整理する。', 'Manager/Beyondレビュー'),
('failure_pattern', 8, '失敗パターン', 'よくある失敗・誤解・過不足を整理する。', '再発防止・risk_check'),
('exception_handling', 9, '例外処理', '通常処理では扱えない例外時の考え方を整理する。', '運用設計・安全側判断'),
('runtime_summary', 10, 'runtime要約', 'runtime contextへ渡す時の短い要約軸を持つ。', 'prompt context生成'),
('source_registry_bridge', 11, 'source registry連携', '既存CX sourceとbrain registryの接続を整理する。', 'srcobj/srcrow/srcmat活用'),
('prompt_context_bridge', 12, 'prompt context連携', 'promptへ載せる/載せない基準を整理する。', 'runtime prompt builder'),
('role_difference', 13, 'role差', 'President/Manager/Worker/Friend等で読み方を変える。', 'AIWorker role制御'),
('model_series_difference', 14, 'model/series差', '型番・シリーズごとの性能差を整理する。', 'ロボット個性・性能差'),
('evidence_trace', 15, '証跡/監査', '根拠・証跡・確認ログとの接続を整理する。', '監査・レビュー'),
('not_ui_boundary', 16, 'UI非表示境界', '頭脳データをUI表示データと混同しない。', 'AICM非接触・責務分離'),
('execution_separation', 17, '外部実行分離', '読取・判断材料とDB更新/外部操作を分ける。', '安全な実行設計'),
('education_transform', 18, '教育/説明化', '知識を学習・説明・復習へ変換する。', 'education/exam支援'),
('worldbuilding_reference', 19, '世界観/設計参照', '世界観・創作・設計材料として安全に使う。', 'GameOS/City/Art設計'),
('future_extension', 20, '将来拡張', '契約・成長・paid pack・会社制限などへ拡張できる余地を持つ。', '将来設計')
ON CONFLICT (axis_code) DO UPDATE SET
  axis_order = EXCLUDED.axis_order,
  axis_title_ja = EXCLUDED.axis_title_ja,
  axis_summary_ja = EXCLUDED.axis_summary_ja,
  axis_use_ja = EXCLUDED.axis_use_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 2. Before snapshot
-- ============================================================

CREATE TABLE IF NOT EXISTS cx22073jw.brain_full_load_lane05_run_snapshot (
  run_code text NOT NULL,
  snapshot_phase text NOT NULL,
  brain_domain_code text NOT NULL,
  target_min_unit_count integer NOT NULL,
  active_unit_count integer NOT NULL,
  deficit_count integer NOT NULL,
  registry_count integer NOT NULL,
  source_missing_count integer NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (run_code, snapshot_phase, brain_domain_code)
);

INSERT INTO cx22073jw.brain_full_load_lane05_run_snapshot
(run_code, snapshot_phase, brain_domain_code, target_min_unit_count, active_unit_count, deficit_count, registry_count, source_missing_count)
SELECT
  :'RUN_CODE',
  'before',
  brain_domain_code,
  target_min_unit_count,
  active_unit_count,
  GREATEST(target_min_unit_count - active_unit_count, 0) AS deficit_count,
  registry_count,
  source_missing_count
FROM cx22073jw.vw_brain_full_load_coverage_v1
ON CONFLICT (run_code, snapshot_phase, brain_domain_code) DO UPDATE SET
  target_min_unit_count = EXCLUDED.target_min_unit_count,
  active_unit_count = EXCLUDED.active_unit_count,
  deficit_count = EXCLUDED.deficit_count,
  registry_count = EXCLUDED.registry_count,
  source_missing_count = EXCLUDED.source_missing_count,
  captured_at = now();

-- ============================================================
-- 3. Target fill-up units
-- 不足domainだけ lane05_* unit を生成する。
-- 内容は「domain全載せの補強観点」として生成。
-- ============================================================

WITH coverage AS (
  SELECT
    c.brain_domain_code,
    c.brain_domain_label_ja,
    c.full_load_priority,
    c.target_min_unit_count,
    c.active_unit_count,
    GREATEST(c.target_min_unit_count - c.active_unit_count, 0) AS need_count,
    s.target_depth_codes,
    s.target_use_purpose_codes,
    s.full_load_note_ja
  FROM cx22073jw.vw_brain_full_load_coverage_v1 c
  JOIN cx22073jw.brain_full_load_scope_catalog s
    ON s.brain_domain_code = c.brain_domain_code
  WHERE s.active_flag = true
),
needed AS (
  SELECT
    c.*,
    gs.n AS fill_no,
    ((gs.n - 1) % 20) + 1 AS axis_order
  FROM coverage c
  CROSS JOIN LATERAL generate_series(1, c.need_count) AS gs(n)
  WHERE c.need_count > 0
),
axis AS (
  SELECT *
  FROM cx22073jw.brain_full_load_fill_axis_catalog
  WHERE active_flag = true
)
INSERT INTO cx22073jw.brain_knowledge_unit
(
  unit_code,
  brain_domain_code,
  unit_title_ja,
  unit_summary_ja,
  unit_detail_ja,
  practical_use_ja,
  example_prompt_ja,
  safety_boundary_ja,
  depth_code,
  risk_class_code,
  allowed_use_purpose_codes,
  tags,
  active_flag
)
SELECT
  'lane05_' || lower(regexp_replace(n.brain_domain_code, '[^a-zA-Z0-9]+', '_', 'g')) || '_' || lpad(n.fill_no::text, 3, '0') AS unit_code,
  n.brain_domain_code,
  n.brain_domain_label_ja || ' / 全載せ補強 / ' || a.axis_title_ja AS unit_title_ja,
  n.brain_domain_label_ja || ' の頭脳全載せに必要な「' || a.axis_title_ja || '」を補強するunit。' AS unit_summary_ja,
  n.brain_domain_label_ja || ' domainをAIWorkerOSの頭脳として使うため、'
    || a.axis_summary_ja
    || ' このunitは、CX22073JW側でデータ本体・domain・depth・purpose・risk・safetyを持ち、'
    || 'AIWorkerOS側でmodel/series/role/purpose別に読取制御される前提で利用する。'
    || ' full_load_note=' || n.full_load_note_ja AS unit_detail_ja,
  a.axis_use_ja || '。runtimeでは必要domain・目的・modelに応じて短く参照する。' AS practical_use_ja,
  n.brain_domain_label_ja || 'について「' || a.axis_title_ja || '」の観点で安全に整理して。' AS example_prompt_ja,
  CASE n.brain_domain_code
    WHEN 'security_crisis' THEN '防災・危機管理・安全設計・フィクション/ゲーム/世界観参照に限定する。現実の攻撃・破壊・監視・強制・違法行為支援は禁止。'
    WHEN 'health_life_metrics' THEN '生活指標の説明・整理・レビュー補助に限定する。医療診断・治療判断ではない。危険サインは専門先へつなぐ。'
    WHEN 'professional_basic' THEN '法務・会計・人事などの専門基礎説明・レビュー補助に限定する。確定判断は専門家または該当OS/ERPの業務正本で行う。'
    WHEN 'exam_learning' THEN '試験演習・復習・理解確認に限定する。実試験中の不正支援・漏洩利用・回答代行は禁止。'
    WHEN 'civilization_foundation_history' THEN 'Civilization基礎史・統治・AI依存リスクの理解とレビューに限定する。支配・監視・攻撃の正当化に使わない。'
    WHEN 'history_worldview' THEN '歴史・世界観・教育・レビュー目的に限定する。現実の危害実行支援には使わない。'
    WHEN 'business_operation' THEN '業務計画・業務整理・設計参照・レビュー補助に使う。正式な承認・契約・会計確定・外部実行は別レイヤーで判断する。'
    ELSE 'AIWorkerOSの読取制御と用途制限に従って扱う。安全境界・契約範囲・実行権限を超えない。'
  END AS safety_boundary_ja,
  n.target_depth_codes[((n.fill_no - 1) % array_length(n.target_depth_codes, 1)) + 1] AS depth_code,
  CASE
    WHEN n.brain_domain_code = 'security_crisis' THEN 'high'
    WHEN n.brain_domain_code IN ('health_life_metrics','business_operation','professional_basic','robot_aiworker','history_worldview','civilization_foundation_history') THEN 'medium'
    ELSE 'low'
  END AS risk_class_code,
  n.target_use_purpose_codes AS allowed_use_purpose_codes,
  ARRAY[
    'lane05',
    'full_load_target_fillup',
    n.brain_domain_code,
    a.axis_code,
    'run:' || :'RUN_CODE'
  ]::text[] AS tags,
  true AS active_flag
FROM needed n
JOIN axis a
  ON a.axis_order = n.axis_order
ON CONFLICT (unit_code) DO UPDATE SET
  brain_domain_code = EXCLUDED.brain_domain_code,
  unit_title_ja = EXCLUDED.unit_title_ja,
  unit_summary_ja = EXCLUDED.unit_summary_ja,
  unit_detail_ja = EXCLUDED.unit_detail_ja,
  practical_use_ja = EXCLUDED.practical_use_ja,
  example_prompt_ja = EXCLUDED.example_prompt_ja,
  safety_boundary_ja = EXCLUDED.safety_boundary_ja,
  depth_code = EXCLUDED.depth_code,
  risk_class_code = EXCLUDED.risk_class_code,
  allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
  tags = EXCLUDED.tags,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 4. Registry sync for lane05 units
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
  u.unit_code AS brain_data_code,
  u.brain_domain_code,
  'cx22073jw' AS source_schema_name,
  'brain_knowledge_unit' AS source_object_name,
  u.unit_code AS source_record_code,
  u.unit_title_ja AS source_title_ja,
  u.depth_code,
  u.allowed_use_purpose_codes,
  u.risk_class_code,
  'record' AS granularity_code,
  u.safety_boundary_ja,
  true AS active_flag
FROM cx22073jw.brain_knowledge_unit u
WHERE u.active_flag = true
  AND u.unit_code LIKE 'lane05_%'
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
-- 5. After snapshot + summary view
-- ============================================================

INSERT INTO cx22073jw.brain_full_load_lane05_run_snapshot
(run_code, snapshot_phase, brain_domain_code, target_min_unit_count, active_unit_count, deficit_count, registry_count, source_missing_count)
SELECT
  :'RUN_CODE',
  'after',
  brain_domain_code,
  target_min_unit_count,
  active_unit_count,
  GREATEST(target_min_unit_count - active_unit_count, 0) AS deficit_count,
  registry_count,
  source_missing_count
FROM cx22073jw.vw_brain_full_load_coverage_v1
ON CONFLICT (run_code, snapshot_phase, brain_domain_code) DO UPDATE SET
  target_min_unit_count = EXCLUDED.target_min_unit_count,
  active_unit_count = EXCLUDED.active_unit_count,
  deficit_count = EXCLUDED.deficit_count,
  registry_count = EXCLUDED.registry_count,
  source_missing_count = EXCLUDED.source_missing_count,
  captured_at = now();

CREATE OR REPLACE VIEW cx22073jw.vw_brain_full_load_lane05_latest_summary_v1 AS
WITH latest_run AS (
  SELECT run_code
  FROM cx22073jw.brain_full_load_lane05_run_snapshot
  ORDER BY captured_at DESC
  LIMIT 1
),
before_s AS (
  SELECT *
  FROM cx22073jw.brain_full_load_lane05_run_snapshot
  WHERE run_code = (SELECT run_code FROM latest_run)
    AND snapshot_phase = 'before'
),
after_s AS (
  SELECT *
  FROM cx22073jw.brain_full_load_lane05_run_snapshot
  WHERE run_code = (SELECT run_code FROM latest_run)
    AND snapshot_phase = 'after'
)
SELECT
  a.run_code,
  a.brain_domain_code,
  a.target_min_unit_count,
  b.active_unit_count AS before_active_unit_count,
  a.active_unit_count AS after_active_unit_count,
  b.deficit_count AS before_deficit_count,
  a.deficit_count AS after_deficit_count,
  GREATEST(a.active_unit_count - b.active_unit_count, 0) AS added_unit_count,
  a.registry_count,
  a.source_missing_count,
  CASE
    WHEN a.active_unit_count >= a.target_min_unit_count THEN 'target_met'
    ELSE 'target_not_met'
  END AS target_status
FROM after_s a
LEFT JOIN before_s b
  ON b.run_code = a.run_code
 AND b.brain_domain_code = a.brain_domain_code;

COMMIT;
