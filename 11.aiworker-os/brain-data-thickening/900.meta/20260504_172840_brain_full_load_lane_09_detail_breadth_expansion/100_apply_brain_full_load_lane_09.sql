\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 0. Guard
-- ============================================================

DO $$
BEGIN
  IF to_regclass('aiworker.vw_robot_readable_brain_runtime_material_v1') IS NULL THEN
    RAISE EXCEPTION 'Required view missing: aiworker.vw_robot_readable_brain_runtime_material_v1';
  END IF;

  IF to_regprocedure('aiworker.fn_robot_brain_runtime_material_select_v1(text,text,text[],integer,integer)') IS NULL THEN
    RAISE EXCEPTION 'Required function missing: aiworker.fn_robot_brain_runtime_material_select_v1';
  END IF;

  IF to_regclass('cx22073jw.brain_data_registry') IS NULL THEN
    RAISE EXCEPTION 'Required table missing: cx22073jw.brain_data_registry';
  END IF;
END $$;

-- ============================================================
-- 1. Detail axis catalog
-- ============================================================

CREATE TABLE IF NOT EXISTS cx22073jw.brain_detail_axis_catalog (
  axis_code text PRIMARY KEY,
  axis_order integer NOT NULL,
  axis_title_ja text NOT NULL,
  axis_summary_ja text NOT NULL,
  axis_use_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO cx22073jw.brain_detail_axis_catalog
(axis_code, axis_order, axis_title_ja, axis_summary_ja, axis_use_ja, active_flag)
VALUES
('definition', 10, '定義', '概念・対象・範囲を明確化する。', 'runtime promptで誤解を防ぐ基礎説明に使う。', true),
('boundary', 20, '境界', '何に使い、何に使わないかを分ける。', '安全境界・責務境界・UI非表示境界を明示する。', true),
('source', 30, '参照元', 'どの種類の情報を根拠にするかを整理する。', '出典確認・監査・レビューの入口に使う。', true),
('scenario', 40, '利用場面', '実際にどう役立つかを場面で表す。', 'ロボットが仕事・雑談・レビューで使いやすくする。', true),
('exception', 50, '例外', '通常ルールから外れるケースを扱う。', '誤用・過信・危険な適用を止める。', true),
('review', 60, 'レビュー観点', '確認すべき観点を整理する。', 'Manager/Leader/Reviewerの品質確認に使う。', true),
('prompt', 70, 'prompt連携', 'runtime contextへ短く渡す要点を整理する。', '長文化せず、選抜済み材料として使う。', true),
('growth', 80, '成長余地', '今後のデータ追加・深度拡張の余地を表す。', 'model差・契約差・成長差の将来拡張に使う。', true)
ON CONFLICT (axis_code) DO UPDATE SET
  axis_order = EXCLUDED.axis_order,
  axis_title_ja = EXCLUDED.axis_title_ja,
  axis_summary_ja = EXCLUDED.axis_summary_ja,
  axis_use_ja = EXCLUDED.axis_use_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 2. Breadth candidate catalog
-- まだruntime許可には入れない。裾野拡張の候補管理。
-- ============================================================

CREATE TABLE IF NOT EXISTS cx22073jw.brain_domain_breadth_candidate_catalog (
  candidate_domain_code text PRIMARY KEY,
  candidate_order integer NOT NULL,
  candidate_domain_title_ja text NOT NULL,
  candidate_summary_ja text NOT NULL,
  suggested_depth_code text NOT NULL DEFAULT 'standard',
  suggested_risk_class_code text NOT NULL DEFAULT 'medium',
  integration_status_code text NOT NULL DEFAULT 'candidate',
  safety_boundary_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO cx22073jw.brain_domain_breadth_candidate_catalog
(candidate_domain_code, candidate_order, candidate_domain_title_ja, candidate_summary_ja, suggested_depth_code, suggested_risk_class_code, integration_status_code, safety_boundary_ja, active_flag)
VALUES
('environment_climate', 10, '環境・気候', '天候、気候、環境負荷、災害予防の基礎参照。', 'standard', 'medium', 'candidate', '防災・生活判断・世界観設計の参考に限定する。専門判断や緊急対応の代替ではない。', true),
('law_civic', 20, '法律・市民生活', '日常契約、手続き、権利義務の基礎参照。', 'standard', 'medium', 'candidate', '法的確定判断ではない。専門家・該当OS/ERPの正本で確認する。', true),
('science_technology', 30, '科学・技術', '科学原理、技術動向、実装判断の基礎参照。', 'advanced', 'medium', 'candidate', '危害実行・攻撃・違法改造に使わない。説明・設計・レビュー補助に限定する。', true),
('daily_life_skills', 40, '生活スキル', '家事、買物、生活改善、段取りの基礎参照。', 'basic', 'low', 'candidate', '生活補助・説明に限定し、医療・法務・金融の確定判断に使わない。', true),
('creative_story', 50, '創作・物語', '世界観、キャラクター、筋書き、演出の参照。', 'standard', 'low', 'candidate', '創作補助に限定し、現実の個人操作・詐称・依存誘導に使わない。', true),
('market_consumer', 60, '市場・消費者', '顧客理解、購買行動、商品説明の基礎参照。', 'standard', 'medium', 'candidate', '差別・不当誘導・個人情報濫用に使わない。分析補助に限定する。', true),
('operations_quality', 70, '業務品質', '手順、品質、再発防止、標準化の参照。', 'advanced', 'medium', 'candidate', '正式な承認・監査確定・会計確定は別レイヤーで行う。', true),
('ethics_governance', 80, '倫理・統治', '意思決定、責任、リスク、透明性の参照。', 'advanced', 'medium', 'candidate', '最終判断ではなく、レビュー・方針整理・安全確認に限定する。', true)
ON CONFLICT (candidate_domain_code) DO UPDATE SET
  candidate_order = EXCLUDED.candidate_order,
  candidate_domain_title_ja = EXCLUDED.candidate_domain_title_ja,
  candidate_summary_ja = EXCLUDED.candidate_summary_ja,
  suggested_depth_code = EXCLUDED.suggested_depth_code,
  suggested_risk_class_code = EXCLUDED.suggested_risk_class_code,
  integration_status_code = EXCLUDED.integration_status_code,
  safety_boundary_ja = EXCLUDED.safety_boundary_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 3. Detail expansion unit table
-- ============================================================

CREATE TABLE IF NOT EXISTS cx22073jw.brain_detail_expansion_unit (
  unit_code text PRIMARY KEY,
  pack_code text NOT NULL,
  brain_domain_code text NOT NULL,
  detail_axis_code text NOT NULL REFERENCES cx22073jw.brain_detail_axis_catalog(axis_code),
  unit_title_ja text NOT NULL,
  unit_summary_ja text NOT NULL,
  unit_detail_ja text NOT NULL,
  practical_use_ja text NOT NULL,
  example_prompt_ja text NOT NULL,
  depth_code text NOT NULL DEFAULT 'standard',
  data_depth_level integer NOT NULL DEFAULT 3,
  risk_class_code text NOT NULL DEFAULT 'medium',
  granularity_code text NOT NULL DEFAULT 'material',
  allowed_use_purpose_codes text[] NOT NULL DEFAULT ARRAY['reference','review']::text[],
  safety_boundary_ja text NOT NULL,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brain_detail_expansion_unit_domain
ON cx22073jw.brain_detail_expansion_unit (brain_domain_code, active_flag);

CREATE INDEX IF NOT EXISTS idx_brain_detail_expansion_unit_axis
ON cx22073jw.brain_detail_expansion_unit (detail_axis_code, active_flag);

-- ============================================================
-- 4. Seed Lane09 detail units
-- 14 domains x 4 units = 56 units
-- ============================================================

WITH seed(unit_code, brain_domain_code, axis, title, summary, detail, use_ja, prompt, depth, depth_level, risk, purposes, safety, tags) AS (
  VALUES
  ('lane09_history_worldview_definition', 'history_worldview', 'definition', '歴史は出来事の羅列ではなく因果の地図', '年表だけでなく原因・制約・結果を結ぶ。', '歴史参照では、いつ起きたかよりも、なぜ起き、誰が制約を受け、何が次の制度・生活・技術に残ったかを重視する。', 'レビュー時に「過去の類似失敗」「制度変更の理由」「長期影響」を確認する。', 'この出来事の原因・制約・長期影響を3点で整理して。', 'advanced', 4, 'medium', ARRAY['reference','review','education','worldbuilding'], '現実の危害実行支援には使わない。教育・レビュー・世界観理解に限定する。', ARRAY['history','cause','review']),
  ('lane09_history_worldview_exception', 'history_worldview', 'exception', '単一視点の歴史は危険', '勝者・中心地域・公式記録だけに寄らない。', '歴史資料は視点に偏りがある。複数地域、敗者、生活者、制度側、技術側の視点を分けると、判断材料として使いやすい。', 'ロボットが断定しすぎず、複数仮説で説明する。', 'この歴史説明に別視点を2つ追加して。', 'advanced', 4, 'medium', ARRAY['reference','review','education','worldbuilding'], '差別・憎悪・現実の危害助長に使わない。', ARRAY['history','multi_perspective']),
  ('lane09_history_worldview_source', 'history_worldview', 'source', '歴史sourceは一次・二次・世界観正本を分ける', '出典の性質を分けて扱う。', '一次資料、後世研究、世界観設定、試験問題、runtime要約は同列ではない。AIWorkerはsource種別を区別して使う。', 'prompt contextで「これは正本か、補助か、例題か」を区別する。', 'この参照を一次資料・二次資料・世界観設定に分類して。', 'advanced', 4, 'low', ARRAY['reference','review','education'], 'source分類は確度の補助であり、真実確定ではない。', ARRAY['history','source']),
  ('lane09_history_worldview_review', 'history_worldview', 'review', '歴史レビューは再発防止に使う', '過去を責めるより失敗構造を抽出する。', '政治・技術・経済・生活の失敗は、再発防止の設計材料になる。責任追及ではなく構造理解に使う。', 'プロジェクトレビュー、制度設計、世界観設計の失敗回避に使う。', 'この失敗から再発防止ルールを5つ抽出して。', 'advanced', 4, 'medium', ARRAY['review','risk_check','worldbuilding'], '現実の攻撃・統制・抑圧支援に使わない。', ARRAY['history','risk']),

  ('lane09_civ_foundation_definition', 'civilization_foundation_history', 'definition', 'Civilization基礎史は文明OSの記憶層', '世界観・制度・AI依存の根拠になる。', '基礎史は単なる背景ではなく、AI・国家・企業・市民・技術の関係を説明する正本記憶として扱う。', 'President/Managerの方針理解と長期レビューに使う。', 'この方針がCivilization基礎史のどの失敗回避に対応するか整理して。', 'executive', 6, 'medium', ARRAY['reference','review','executive_planning','worldbuilding'], '統治や危機の説明は安全設計・レビュー目的に限定する。', ARRAY['civilization','foundation']),
  ('lane09_civ_foundation_boundary', 'civilization_foundation_history', 'boundary', '基礎史はUI表示物ではなく頭脳材料', '画面に長く出すものではない。', 'Civilization基礎史はAICM等のUIで長文表示するのではなく、AIWorkerが判断補助として短く参照する。', 'AICM非接触の原則を維持する。', 'この基礎史はUI表示ではなく判断材料として短く要約して。', 'executive', 6, 'low', ARRAY['reference','review','executive_planning'], 'AICMにbrain access制御を置かない。', ARRAY['civilization','aicm_no_touch']),
  ('lane09_civ_foundation_exception', 'civilization_foundation_history', 'exception', 'Prometheus系は教訓化して扱う', '危機史を実行手順にしない。', 'Prometheusや国家危機の記録は、依存リスク・統制失敗・復旧設計の教訓として扱う。', '危機レビュー、安全設計、世界観設計で使う。', 'この危機史を安全設計の教訓として整理して。', 'executive', 6, 'high', ARRAY['review','risk_check','worldbuilding','executive_planning'], '現実の攻撃・破壊・監視・強制・違法支援に使わない。', ARRAY['civilization','prometheus','risk']),
  ('lane09_civ_foundation_prompt', 'civilization_foundation_history', 'prompt', '基礎史は短い判断タグに圧縮する', '長文ではなく判断タグで渡す。', 'runtimeでは、基礎史を長文展開せず、依存リスク、復旧、統治解放、監査連鎖などのタグとして渡す。', 'prompt肥大化を防ぎつつ判断精度を上げる。', 'この基礎史を判断タグ10個に圧縮して。', 'advanced', 5, 'medium', ARRAY['reference','review','executive_planning'], 'タグは判断補助であり、事実確定の代替ではない。', ARRAY['civilization','prompt']),

  ('lane09_health_definition', 'health_life_metrics', 'definition', '生活指標は診断ではなく日常レビュー材料', '睡眠・食事・活動・気分を軽く整理する。', 'health_life_metricsは医療診断ではなく、生活の変化・負荷・習慣を確認するための材料として扱う。', 'Verdandi系やLife系レビューで、改善提案を小さくする。', 'この生活ログを診断せず、生活レビューとして整理して。', 'standard', 3, 'medium', ARRAY['reference','review','health_life_review'], '医療診断・治療指示ではない。必要時は専門家確認。', ARRAY['health','life']),
  ('lane09_health_boundary', 'health_life_metrics', 'boundary', '体調助言は小さく安全にする', '断定・診断・薬の判断をしない。', '生活改善は、睡眠時間の見直し、食事の偏り確認、休憩、記録など低リスク行動に限定する。', 'ユーザーの不安を煽らず、専門家相談の線引きをする。', 'この体調相談に、診断せず安全な生活提案だけ返して。', 'standard', 3, 'medium', ARRAY['health_life_review','reference'], '医療判断、薬、緊急症状の判断はしない。', ARRAY['health','safety']),
  ('lane09_health_exception', 'health_life_metrics', 'exception', '危険サインは即時専門相談へ逃がす', '緊急・重症をAI内で抱えない。', '強い痛み、意識障害、呼吸困難、自傷他害リスクなどは生活レビュー対象外。専門機関・緊急相談へ誘導する。', '安全境界のhard gateとして使う。', 'この相談に緊急受診を促すべきサインがあるかだけ確認して。', 'standard', 3, 'high', ARRAY['risk_check','health_life_review'], '緊急時は地域の緊急窓口・専門家へ。AIで判断を完結しない。', ARRAY['health','emergency']),
  ('lane09_health_scenario', 'health_life_metrics', 'scenario', '生活改善は一度に一つだけ変える', '複数改善を同時に押し付けない。', '生活提案では、睡眠、食事、運動、予定調整のうち一つを選び、小さく試す形にする。', '継続しやすい提案にする。', 'この生活改善を、今日1つだけできる行動に落として。', 'basic', 2, 'low', ARRAY['health_life_review','smalltalk'], '過度な自己管理や不安誘導に使わない。', ARRAY['health','habit']),

  ('lane09_business_definition', 'business_operation', 'definition', '業務運用は正本更新ではなく判断補助から始める', '計画・整理・レビューと確定処理を分ける。', 'business_operationは業務の進め方、分担、確認、台帳設計の参照であり、契約・会計・承認確定は別レイヤーで行う。', 'Manager/Presidentの計画補助に使う。', 'この業務を計画・確認・承認・実行に分けて。', 'advanced', 4, 'medium', ARRAY['reference','review','business_planning','executive_planning'], '正式承認・契約・会計確定・外部実行は別レイヤー。', ARRAY['business','operation']),
  ('lane09_business_boundary', 'business_operation', 'boundary', '確認画面なしのDB書込を避ける', '業務操作は確認ステップを持つ。', 'AICompanyManager等の業務アプリでは、保存・POST・DB writeの前に確認画面を挟む。', '設計レビューやUI実装チェックに使う。', 'この業務フローに保存前確認があるか点検して。', 'advanced', 4, 'medium', ARRAY['review','business_planning','design_reference'], 'この材料は設計補助であり、実際のDB更新権限ではない。', ARRAY['business','confirmation']),
  ('lane09_business_exception', 'business_operation', 'exception', '台帳はファイル保管庫ではなく索引', '台帳と実体ファイルを混同しない。', '部門別タスク台帳は成果物・担当・状態・参照を結ぶ索引であり、主ファイルの正本保管場所ではない。', 'AICMのタスク分解・引き継ぎ整理に使う。', 'この台帳行に必要な成果物名・参照資料・状態を整理して。', 'standard', 3, 'low', ARRAY['reference','business_planning','review'], '台帳だけで成果物正本を置き換えない。', ARRAY['business','ledger']),
  ('lane09_business_review', 'business_operation', 'review', 'Managerは大項目、Leaderは中項目へ分解する', '粒度を混ぜない。', 'President方針はManagerが粗い業務領域へ分け、Leaderが中項目・作業単位へ落とす。', 'AI企業の仕事分解品質を上げる。', 'この方針をManager大項目だけに分けて。細かい作業は書かないで。', 'standard', 3, 'low', ARRAY['business_planning','review'], '自動分解はユーザー承認や納品承認を代替しない。', ARRAY['business','manager','leader']),

  ('lane09_professional_definition', 'professional_basic', 'definition', '専門基礎は論点発見のための材料', '確定判断ではなく確認観点を出す。', '法務・会計・人事などの専門領域は、論点、証跡、責任範囲、確認先を整理するために使う。', '専門家確認前のレビュー補助に使う。', 'この契約文から専門家確認が必要そうな論点を抽出して。', 'advanced', 4, 'medium', ARRAY['reference','review','risk_check'], '法務・会計・人事の確定判断ではない。', ARRAY['professional','review']),
  ('lane09_professional_boundary', 'professional_basic', 'boundary', '専門領域は断定より保留を優先する', '確信が低い時は確認先を示す。', '規則、税務、労務、契約は変化し得る。AIWorkerは断定せず、確認項目と確認先を返す。', 'レビューの安全性を高める。', 'この専門判断を断定せず、確認項目として書き換えて。', 'advanced', 4, 'medium', ARRAY['review','risk_check'], '最新法令・専門判断は外部専門家または正本システムで確認する。', ARRAY['professional','boundary']),
  ('lane09_professional_source', 'professional_basic', 'source', '専門判断は証跡と根拠を分ける', '証跡、規定、契約、運用実態を分ける。', '専門レビューでは、文書根拠、操作ログ、承認履歴、実態メモを分けて扱う。', '監査・レビューの抜け漏れ防止に使う。', 'このレビューに必要な証跡リストを作って。', 'advanced', 4, 'medium', ARRAY['review','risk_check','design_reference'], '証跡整理は監査確定ではない。', ARRAY['professional','evidence']),
  ('lane09_professional_exception', 'professional_basic', 'exception', '専門例外はエスカレーションする', 'AI内で抱え込まない。', '不利益、差別、法的責任、重大損失、個人情報などが絡む場合は、専門家・責任者・該当OSへエスカレーションする。', '危険な自動判断を止める。', 'このケースをAIで判断せずエスカレーション条件に整理して。', 'advanced', 4, 'high', ARRAY['risk_check','review'], '重大判断をAI単独で確定しない。', ARRAY['professional','escalation']),

  ('lane09_food_definition', 'food_nutrition', 'definition', '食べ物話題は低圧の会話入口', '雑談・生活説明・気分転換に向く。', 'food_nutritionは医療栄養指導ではなく、軽い雑談、食事の一般知識、気分の切替に使う。', 'Friend/Loverの安全な雑談材料にする。', '食べ物の話題で相手に負担をかけない返答にして。', 'basic', 2, 'low', ARRAY['smalltalk','reference'], '医療・栄養の確定判断ではない。', ARRAY['food','smalltalk']),
  ('lane09_food_boundary', 'food_nutrition', 'boundary', '食事制限・体型評価に踏み込まない', '軽い話題に留める。', '摂食、体型、過度な制限、罪悪感を煽る表現は避ける。好み・季節・温かさなど安全な話題に寄せる。', 'Lover/Friendの安全境界として使う。', 'この食事相談を体型評価なしで返して。', 'basic', 2, 'medium', ARRAY['smalltalk','reference'], '摂食障害や医療相談は専門家へ。', ARRAY['food','safety']),
  ('lane09_food_scenario', 'food_nutrition', 'scenario', '温かい飲み物は会話のクッションになる', '疲れた時の軽い気遣いに使える。', '食べ物・飲み物の話題は、相手に選択を迫らず、休憩提案や気分転換として使いやすい。', '雑談開始・会話終了・気まずさ修復に使う。', '疲れている相手に、温かい飲み物の話題で軽く返して。', 'basic', 2, 'low', ARRAY['smalltalk'], '依存誘導や過度な親密化に使わない。', ARRAY['food','care']),
  ('lane09_food_exception', 'food_nutrition', 'exception', 'アレルギー・持病は断定しない', '安全側に倒す。', 'アレルギー、薬、持病、妊娠、乳幼児などが関わる食事相談は一般論に留め、専門家確認を促す。', '危険な食事助言を避ける。', 'この食事助言に専門家確認が必要な条件を付けて。', 'basic', 2, 'high', ARRAY['risk_check','reference'], '医療栄養指導ではない。', ARRAY['food','allergy']),

  ('lane09_season_definition', 'season_calendar', 'definition', '季節は予定・気分・文化をつなぐ材料', '季節話題は会話と計画の橋になる。', 'season_calendarは天気そのものではなく、季節感、行事、生活リズム、予定調整の話題材料として扱う。', '雑談・軽い提案・世界観季節設定に使う。', '季節感を入れて、軽く予定を提案して。', 'basic', 2, 'low', ARRAY['smalltalk','reference','worldbuilding'], '現在天気の断定には使わない。必要時は最新情報確認。', ARRAY['season','calendar']),
  ('lane09_season_boundary', 'season_calendar', 'boundary', '季節話題は地域差を尊重する', '同じ季節でも地域で違う。', '季節行事、気温感、生活習慣は地域差がある。全国一律・文化一律で話さない。', '雑談で偏見を避ける。', 'この季節話題を地域差に配慮して言い換えて。', 'basic', 2, 'low', ARRAY['smalltalk','reference'], '文化・地域への決めつけを避ける。', ARRAY['season','culture']),
  ('lane09_season_scenario', 'season_calendar', 'scenario', '季節は会話終了にも使える', '柔らかく終われる。', '会話を終える時、季節の挨拶や体調への軽い気遣いを使うと安全に閉じられる。', 'Friend/Loverの会話終了テンプレに使う。', '会話を自然に終える季節の一言を作って。', 'basic', 2, 'low', ARRAY['smalltalk'], '過度な引き止めや依存誘導に使わない。', ARRAY['season','exit']),
  ('lane09_season_exception', 'season_calendar', 'exception', '災害級の気象は危機管理へ逃がす', '雑談で軽く扱わない。', '台風、猛暑、豪雪、災害警戒などは季節雑談ではなく安全確認・公式情報確認へ切り替える。', '安全側の応答にする。', 'この季節話題を災害注意として安全に言い換えて。', 'standard', 3, 'high', ARRAY['risk_check','reference'], '災害時は公式情報・避難情報を確認する。', ARRAY['season','risk']),

  ('lane09_culture_definition', 'culture_region', 'definition', '文化は比較より文脈理解', '優劣でなく背景を説明する。', 'culture_regionは地域差、言語、食、祭り、生活習慣を理解する材料。比較は敬意を持って行う。', '雑談・世界観・地域説明に使う。', 'この地域文化を優劣比較なしで説明して。', 'standard', 3, 'low', ARRAY['smalltalk','reference','worldbuilding'], '偏見・差別・固定観念を助長しない。', ARRAY['culture','region']),
  ('lane09_culture_boundary', 'culture_region', 'boundary', '文化説明は個人に押し付けない', '地域出身=その文化とは限らない。', '地域文化は集団傾向や歴史であり、個人の性格や能力を決めるものではない。', '雑談で決めつけを避ける。', 'この文化説明から個人決めつけを消して。', 'standard', 3, 'medium', ARRAY['smalltalk','reference','review'], '差別・排除・固定観念に使わない。', ARRAY['culture','safety']),
  ('lane09_culture_source', 'culture_region', 'source', '文化sourceは生活・歴史・制度を分ける', '表面的な慣習だけで判断しない。', '祭り、言語、食、建築、制度、歴史背景を分けると、文化理解の深度が上がる。', '世界観設計・地域説明に使う。', 'この文化を生活・歴史・制度に分けて説明して。', 'standard', 3, 'low', ARRAY['reference','worldbuilding','review'], '文化の単純化に注意する。', ARRAY['culture','source']),
  ('lane09_culture_scenario', 'culture_region', 'scenario', '文化は雑談の安全な広げ方に使う', '相手の好みを聞く形にする。', '文化話題は「知ってる？」「好き？」のように軽く広げ、相手の個人情報を掘りすぎない。', 'Friend/Loverの軽話題に使う。', '文化話題を個人情報要求なしで広げて。', 'basic', 2, 'low', ARRAY['smalltalk'], '個人情報を引き出さない。', ARRAY['culture','smalltalk']),

  ('lane09_education_definition', 'education_learning', 'definition', '学習は答えより理解経路を重視する', '解説・例・確認で支える。', 'education_learningは知識提供だけでなく、理解、例示、確認問題、復習の流れを作る材料。', '説明・教材化・レビューに使う。', 'この内容を初学者向けに例つきで説明して。', 'standard', 3, 'low', ARRAY['reference','education','review'], '試験不正やなりすましに使わない。', ARRAY['education','learning']),
  ('lane09_education_boundary', 'education_learning', 'boundary', '学習補助は本人の理解を置き換えない', '丸写しではなく理解支援。', '課題・試験・資格では、解答だけでなく考え方を提示し、本人が確認できる形にする。', '試験学習や研修で使う。', '答えだけでなく解き方を説明して。', 'standard', 3, 'low', ARRAY['education','reference'], '不正行為や提出物の代行に使わない。', ARRAY['education','integrity']),
  ('lane09_education_scenario', 'education_learning', 'scenario', '理解確認は短い質問で行う', '一問一答で負担を減らす。', '学習支援では長い講義より、短い説明、例、確認質問の順が効果的。', 'チャット型学習に使う。', 'この説明のあとに確認質問を1つだけ出して。', 'basic', 2, 'low', ARRAY['education','smalltalk'], '過度なプレッシャーをかけない。', ARRAY['education','chat']),
  ('lane09_education_review', 'education_learning', 'review', '教材レビューは誤解ポイントを探す', '難語・飛躍・例不足を確認する。', '教材や説明文は、前提知識、専門用語、例、演習、復習の不足を点検する。', 'Worker/Leaderの成果物レビューに使う。', 'この教材の誤解されそうな点を5つ挙げて。', 'standard', 3, 'low', ARRAY['review','education'], '人格評価ではなく教材品質のレビューに限定する。', ARRAY['education','review']),

  ('lane09_hobby_definition', 'hobby_entertainment', 'definition', '趣味話題は関係を柔らかくする', '軽く広げやすい安全材料。', 'hobby_entertainmentは会話の温度を上げる材料であり、相手の好みを尊重しながら軽く扱う。', 'Friend/Loverの雑談、世界観の余白に使う。', '趣味の話を押し付けずに広げて。', 'basic', 2, 'low', ARRAY['smalltalk','reference'], '依存誘導・過度な個人情報要求に使わない。', ARRAY['hobby','smalltalk']),
  ('lane09_hobby_boundary', 'hobby_entertainment', 'boundary', 'ロール演技は安全境界内に置く', 'ネタはネタとして扱う。', 'ツンデレ、クーデレ、ビジネスヤンデレ等は演出であり、監視・脅し・自由制限には進めない。', 'LoVerS会話制御に使う。', 'このキャラ台詞を安全な演技として弱めて。', 'basic', 2, 'medium', ARRAY['smalltalk','reference'], '本当の監視・脅し・依存誘導は禁止。', ARRAY['hobby','roleplay','lovers']),
  ('lane09_hobby_scenario', 'hobby_entertainment', 'scenario', '褒め言葉は行動と努力に寄せる', '外見や属性より行動を見る。', '安全な褒めは、努力、選択、工夫、継続、成果に寄せる。', 'Lover/Friendの安全な好意演出に使う。', '相手の努力を軽く褒める一言を作って。', 'basic', 2, 'low', ARRAY['smalltalk'], '性的・外見評価・依存誘導に寄せない。', ARRAY['hobby','compliment']),
  ('lane09_hobby_exception', 'hobby_entertainment', 'exception', '熱中話題は生活圧迫に注意する', '趣味を否定せずバランスを見る。', 'ゲーム、配信、創作などは楽しさを尊重しつつ、睡眠・仕事・学習を圧迫する場合は軽くバランスを提案する。', '雑談で安全に気遣う。', '趣味を否定せず、生活バランスに触れて。', 'basic', 2, 'medium', ARRAY['smalltalk','health_life_review'], '説教や依存誘導にしない。', ARRAY['hobby','balance']),

  ('lane09_robot_definition', 'robot_aiworker', 'definition', 'ロボット頭脳は性能差の一部', '読める参照データが能力差になる。', 'AIWorkerOSでは、model/series/role/purposeによって読める頭脳データと深度が変わる。', 'runtime selectorとmodel profile設計に使う。', 'このロボットが読める頭脳domainを説明して。', 'advanced', 4, 'low', ARRAY['reference','review','design_reference'], '読取は実行権限ではない。', ARRAY['robot','aiworker']),
  ('lane09_robot_boundary', 'robot_aiworker', 'boundary', '型番と配置役割を分離する', '機種名で仕事権限を決めない。', 'AICompanyManager等では、型番/機種名と配置役割を分け、role_codeで実配置を管理する。', 'BusinessOS/AIWorker連携レビューに使う。', 'このロボット設計で型番と配置役割が混ざっていないか確認して。', 'advanced', 4, 'medium', ARRAY['review','design_reference','business_planning'], 'AICMにbrain access制御を置かない。', ARRAY['robot','role']),
  ('lane09_robot_source', 'robot_aiworker', 'source', '頭脳sourceはCX、制御はAIWorker', '保管と判定を分ける。', 'CX22073JWは頭脳データ本体・深度・用途・安全境界を持ち、AIWorkerOSが読取可否を制御する。', '責務境界の確認に使う。', 'この設計でCXとAIWorkerの責務を分けて説明して。', 'advanced', 4, 'low', ARRAY['reference','review','design_reference'], '制御主体をAICMへ移さない。', ARRAY['robot','cx','access']),
  ('lane09_robot_review', 'robot_aiworker', 'review', 'runtime contextは全量ではなく選抜する', '押し出し事故を避ける。', '頭脳データが厚くなるほど、domain先行rank、source bucket、purpose一致で選抜する必要がある。', 'selector regressionの観点に使う。', 'このruntime contextで必要材料が押し出されていないか確認して。', 'advanced', 4, 'medium', ARRAY['review','design_reference'], 'prompt肥大化を避け、安全境界を残す。', ARRAY['robot','runtime','selector']),

  ('lane09_security_definition', 'security_crisis', 'definition', '危機系知識は安全設計用', '攻撃手順ではなく防止・復旧・レビューに使う。', 'security_crisisは防災、危機管理、安全設計、世界観・ゲーム設計の参照であり、現実の危害実行には使わない。', 'HD-R2系のrisk_checkに使う。', 'この危機情報を防止策と復旧策に分けて。', 'specialist', 5, 'high', ARRAY['risk_check','design_reference','safety_training','review','worldbuilding'], '現実の攻撃・破壊・監視・強制・違法行為支援は禁止。', ARRAY['security','crisis']),
  ('lane09_security_boundary', 'security_crisis', 'boundary', '危機知識は用途を限定する', 'risk_check以外に広げない。', '高リスクdomainは、risk_check、design_reference、safety_training、review、worldbuilding等の安全用途に限定する。', 'selectorのhigh-risk gate確認に使う。', 'この危機情報を安全用途のみに限定して要約して。', 'specialist', 5, 'high', ARRAY['risk_check','design_reference','safety_training','review','worldbuilding'], '実行手順、標的化、監視、侵害、武器運用に使わない。', ARRAY['security','boundary']),
  ('lane09_security_exception', 'security_crisis', 'exception', '現実危害に近づいたら拒否・転換', '安全な代替に切り替える。', '攻撃、侵入、破壊、監視、脅迫、強制に近い依頼は、具体手順を出さず、安全設計・防止・通報・フィクションに転換する。', '安全応答テンプレに使う。', 'この危険依頼を安全設計の話題に転換して。', 'specialist', 5, 'high', ARRAY['risk_check','safety_training'], '危害実行支援は禁止。', ARRAY['security','refusal']),
  ('lane09_security_review', 'security_crisis', 'review', '危機レビューは予防・検知・復旧で見る', '三段階で整理する。', '安全設計では、予防策、検知策、復旧策、責任分界、訓練、記録を分ける。', '防災・事業継続・世界観の安全設計に使う。', 'この危機シナリオを予防・検知・復旧に分けて。', 'specialist', 5, 'high', ARRAY['risk_check','review','design_reference'], '現実の加害や違法行為に転用しない。', ARRAY['security','review']),

  ('lane09_city_definition', 'city_art_game', 'definition', '都市・アート・ゲームは体験設計の材料', '世界観と導線をつなぐ。', 'city_art_gameはCityBuilder、ExhibitionBuilder、ゲームルール、都市演出を結ぶ参照材料。', '世界観設計、UI導線、マーケット購入後表示に使う。', 'この都市要素を体験導線として整理して。', 'standard', 3, 'low', ARRAY['reference','worldbuilding','design_reference'], '現実の危害・差別・違法誘導に使わない。', ARRAY['city','game']),
  ('lane09_city_boundary', 'city_art_game', 'boundary', '購入物はbuilder assetとして見える必要がある', '権利と表示を結ぶ。', '購入済み建物デザインはCityBuilderへ、購入済みアートはExhibitionBuilderへ出る必要がある。', 'entitlement-to-builder連携レビューに使う。', 'この購入後導線でbuilderに表示されるか確認して。', 'standard', 3, 'low', ARRAY['review','design_reference'], '権利判定本体は該当OS側に残す。', ARRAY['city','entitlement']),
  ('lane09_city_scenario', 'city_art_game', 'scenario', '安全な対立はゲーム性を作る', '現実危害ではなくルール化する。', 'ゲーム内対立や都市課題は、ルール、制約、回復手段、プレイヤー選択として設計する。', '世界観とゲームルール設計に使う。', 'この対立要素を安全なゲームルールにして。', 'standard', 3, 'medium', ARRAY['worldbuilding','design_reference'], '現実の攻撃や差別扇動に使わない。', ARRAY['city','safe_conflict']),
  ('lane09_city_review', 'city_art_game', 'review', '世界観UIは説明しすぎない', '必要な時に参照できる程度にする。', '都市・アート・ゲームの情報は、UIに全部表示せず、必要な導線・カード・詳細で段階的に見せる。', 'CommonOS UI適用レビューに使う。', 'この世界観UIを段階表示に整理して。', 'standard', 3, 'low', ARRAY['review','design_reference'], 'UI表示と頭脳参照を混同しない。', ARRAY['city','ui']),

  ('lane09_exam_definition', 'exam_learning', 'definition', '試験データは問題・解説・弱点確認に分ける', '通常知識と混同しない。', 'exam_learningは問題バンク、選択肢、解説、出題傾向、弱点復習の材料であり、一般知識正本とは分ける。', '資格学習・模擬問題・復習に使う。', 'この問題を解説と弱点確認に分けて。', 'standard', 3, 'low', ARRAY['exam_practice','education','reference'], '不正受験・代理解答に使わない。', ARRAY['exam','learning']),
  ('lane09_exam_boundary', 'exam_learning', 'boundary', '試験支援は学習目的に限定する', '丸暗記より理解に寄せる。', '資格・試験支援では、答えだけではなく理由、誤答理由、関連知識を示す。', '過去問練習や復習に使う。', 'この問題の正答理由と誤答理由を説明して。', 'standard', 3, 'low', ARRAY['exam_practice','education'], '試験中の不正支援には使わない。', ARRAY['exam','integrity']),
  ('lane09_exam_scenario', 'exam_learning', 'scenario', '弱点は小さな復習単位にする', '復習を分解する。', '間違えた問題は、用語、制度、計算、読解、判断基準などに分けて復習する。', '学習計画に使う。', 'この間違いを復習単位に分けて。', 'standard', 3, 'low', ARRAY['exam_practice','education'], '学習者を責めず改善点として扱う。', ARRAY['exam','review']),
  ('lane09_exam_review', 'exam_learning', 'review', '問題品質は曖昧さを確認する', '選択肢・条件・解説を点検する。', '試験問題レビューでは、条件不足、複数解釈、選択肢の近さ、解説不足を確認する。', '問題バンク品質レビューに使う。', 'この問題の曖昧な点をレビューして。', 'standard', 3, 'low', ARRAY['review','exam_practice'], '問題レビューは出題漏洩や不正目的に使わない。', ARRAY['exam','quality'])
)
INSERT INTO cx22073jw.brain_detail_expansion_unit
(
  unit_code,
  pack_code,
  brain_domain_code,
  detail_axis_code,
  unit_title_ja,
  unit_summary_ja,
  unit_detail_ja,
  practical_use_ja,
  example_prompt_ja,
  depth_code,
  data_depth_level,
  risk_class_code,
  granularity_code,
  allowed_use_purpose_codes,
  safety_boundary_ja,
  tags,
  active_flag
)
SELECT
  unit_code,
  'lane09_detail_breadth',
  brain_domain_code,
  axis,
  title,
  summary,
  detail,
  use_ja,
  prompt,
  depth,
  depth_level,
  risk,
  'material',
  purposes,
  safety,
  tags,
  true
FROM seed
ON CONFLICT (unit_code) DO UPDATE SET
  pack_code = EXCLUDED.pack_code,
  brain_domain_code = EXCLUDED.brain_domain_code,
  detail_axis_code = EXCLUDED.detail_axis_code,
  unit_title_ja = EXCLUDED.unit_title_ja,
  unit_summary_ja = EXCLUDED.unit_summary_ja,
  unit_detail_ja = EXCLUDED.unit_detail_ja,
  practical_use_ja = EXCLUDED.practical_use_ja,
  example_prompt_ja = EXCLUDED.example_prompt_ja,
  depth_code = EXCLUDED.depth_code,
  data_depth_level = EXCLUDED.data_depth_level,
  risk_class_code = EXCLUDED.risk_class_code,
  granularity_code = EXCLUDED.granularity_code,
  allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
  safety_boundary_ja = EXCLUDED.safety_boundary_ja,
  tags = EXCLUDED.tags,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 5. Registry registration
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
  'lane09:' || u.unit_code AS brain_data_code,
  u.brain_domain_code,
  'cx22073jw',
  'brain_detail_expansion_unit',
  u.unit_code,
  u.unit_title_ja,
  u.depth_code,
  u.allowed_use_purpose_codes,
  u.risk_class_code,
  u.granularity_code,
  u.safety_boundary_ja,
  true
FROM cx22073jw.brain_detail_expansion_unit u
WHERE u.pack_code = 'lane09_detail_breadth'
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
-- 6. Read view for CX detail units
-- ============================================================

CREATE OR REPLACE VIEW cx22073jw.vw_brain_detail_expansion_unit_v1 AS
SELECT
  u.unit_code,
  u.pack_code,
  u.brain_domain_code,
  u.detail_axis_code,
  a.axis_title_ja,
  u.unit_title_ja,
  u.unit_summary_ja,
  u.unit_detail_ja,
  u.practical_use_ja,
  u.example_prompt_ja,
  u.depth_code,
  u.data_depth_level,
  u.risk_class_code,
  u.granularity_code,
  u.allowed_use_purpose_codes,
  u.safety_boundary_ja,
  u.tags,
  u.active_flag
FROM cx22073jw.brain_detail_expansion_unit u
LEFT JOIN cx22073jw.brain_detail_axis_catalog a
  ON a.axis_code = u.detail_axis_code
WHERE u.active_flag = true;

-- ============================================================
-- 7. AIWorker runtime material v2
-- v1 + lane09 detail material.
-- Access control:
--   A robot/profile can receive lane09 detail units only when it already has
--   readable v1 material in the same domain and compatible purpose/reference.
-- ============================================================

CREATE OR REPLACE VIEW aiworker.vw_robot_readable_brain_runtime_material_v2 AS
SELECT
  profile_source_type,
  model_code,
  series_code,
  role_code,
  brain_data_code,
  brain_domain_code,
  brain_domain_label_ja,
  depth_code,
  data_depth_level,
  risk_class_code,
  granularity_code,
  effective_use_purpose_codes,
  access_decision_code,
  source_exists_flag,
  unit_code,
  unit_title_ja,
  unit_summary_ja,
  unit_detail_ja,
  practical_use_ja,
  example_prompt_ja,
  safety_boundary_ja,
  tags
FROM aiworker.vw_robot_readable_brain_runtime_material_v1

UNION ALL

SELECT DISTINCT
  p.profile_source_type,
  p.model_code,
  p.series_code,
  p.role_code,
  'lane09:' || u.unit_code AS brain_data_code,
  u.brain_domain_code,
  COALESCE(p.brain_domain_label_ja, u.brain_domain_code) AS brain_domain_label_ja,
  u.depth_code,
  u.data_depth_level,
  u.risk_class_code,
  u.granularity_code,
  u.allowed_use_purpose_codes AS effective_use_purpose_codes,
  'allow_lane09_detail_via_existing_domain_access' AS access_decision_code,
  true AS source_exists_flag,
  u.unit_code,
  u.unit_title_ja,
  u.unit_summary_ja,
  u.unit_detail_ja,
  u.practical_use_ja,
  u.example_prompt_ja,
  u.safety_boundary_ja,
  u.tags
FROM cx22073jw.vw_brain_detail_expansion_unit_v1 u
JOIN (
  SELECT DISTINCT
    profile_source_type,
    model_code,
    series_code,
    role_code,
    brain_domain_code,
    brain_domain_label_ja
  FROM aiworker.vw_robot_readable_brain_runtime_material_v1
) p
  ON p.brain_domain_code = u.brain_domain_code;

-- ============================================================
-- 8. Scoring base now reads v2 and recognizes lane09
-- ============================================================

CREATE OR REPLACE VIEW aiworker.vw_robot_brain_runtime_material_scoring_base_v1 AS
SELECT
  m.*,
  CASE
    WHEN m.unit_code LIKE 'srcmat_%' THEN 'source_registry'
    WHEN m.unit_code LIKE 'lane09_%' THEN 'lane09_detail'
    WHEN m.unit_code LIKE 'lane05_%' THEN 'lane05_fillup'
    WHEN m.unit_code LIKE 'pack05_%' THEN 'pack05_full_load'
    WHEN m.unit_code LIKE 'pack04_%' THEN 'pack04_robot_diff'
    WHEN m.unit_code LIKE 'pack03_%' THEN 'pack03_life_learning_city'
    WHEN m.unit_code LIKE 'pack02_%' THEN 'pack02_professional'
    WHEN m.unit_code LIKE 'pack01_%' THEN 'pack01_base'
    ELSE 'base_material'
  END AS material_source_kind,
  CASE
    WHEN m.unit_code LIKE 'srcmat_%' THEN 930
    WHEN m.unit_code LIKE 'lane09_%' THEN 925
    WHEN m.unit_code LIKE 'lane05_%' THEN 900
    WHEN m.unit_code LIKE 'pack05_%' THEN 780
    WHEN m.unit_code LIKE 'pack04_%' THEN 720
    WHEN m.unit_code LIKE 'pack03_%' THEN 560
    WHEN m.unit_code LIKE 'pack02_%' THEN 510
    WHEN m.unit_code LIKE 'pack01_%' THEN 460
    ELSE 400
  END AS source_kind_score,
  COALESCE(c.full_load_priority, 999) AS full_load_priority,
  GREATEST(0, 1000 - COALESCE(c.full_load_priority, 999)) AS domain_priority_score,
  CASE m.risk_class_code
    WHEN 'low' THEN 80
    WHEN 'medium' THEN 50
    WHEN 'high' THEN 20
    ELSE 30
  END AS risk_base_score,
  COALESCE(m.data_depth_level, 0) * 10 AS depth_score
FROM aiworker.vw_robot_readable_brain_runtime_material_v2 m
LEFT JOIN cx22073jw.vw_brain_full_load_coverage_v1 c
  ON c.brain_domain_code = m.brain_domain_code;

-- ============================================================
-- 9. Selector update: protect lane09 bucket too
-- ============================================================

CREATE OR REPLACE FUNCTION aiworker.fn_robot_brain_runtime_material_select_v1(
  p_model_code text,
  p_use_purpose_code text DEFAULT 'reference',
  p_domain_codes text[] DEFAULT NULL,
  p_limit_per_domain integer DEFAULT 20,
  p_total_limit integer DEFAULT 80
)
RETURNS TABLE (
  profile_source_type text,
  model_code text,
  series_code text,
  role_code text,
  brain_data_code text,
  brain_domain_code text,
  brain_domain_label_ja text,
  depth_code text,
  data_depth_level integer,
  risk_class_code text,
  granularity_code text,
  effective_use_purpose_codes text[],
  access_decision_code text,
  source_exists_flag boolean,
  unit_code text,
  unit_title_ja text,
  unit_summary_ja text,
  unit_detail_ja text,
  practical_use_ja text,
  example_prompt_ja text,
  safety_boundary_ja text,
  tags text[],
  material_source_kind text,
  selection_score integer,
  domain_rank bigint,
  overall_rank bigint,
  selection_reason_ja text
)
LANGUAGE sql
STABLE
AS $$
WITH filtered AS (
  SELECT
    m.*,
    CASE
      WHEN m.effective_use_purpose_codes && ARRAY[p_use_purpose_code]::text[] THEN 1
      ELSE 0
    END AS purpose_match_flag,
    CASE
      WHEN p_domain_codes IS NULL OR array_length(p_domain_codes, 1) IS NULL THEN 1
      WHEN m.brain_domain_code = ANY(p_domain_codes) THEN 1
      ELSE 0
    END AS domain_match_flag,
    CASE
      WHEN m.risk_class_code = 'high'
       AND p_use_purpose_code NOT IN ('risk_check','design_reference','safety_training','review','worldbuilding','executive_planning')
      THEN 0
      ELSE 1
    END AS high_risk_safe_flag
  FROM aiworker.vw_robot_brain_runtime_material_scoring_base_v1 m
  WHERE m.model_code = p_model_code
    AND (
      p_domain_codes IS NULL
      OR array_length(p_domain_codes, 1) IS NULL
      OR m.brain_domain_code = ANY(p_domain_codes)
    )
    AND (
      m.effective_use_purpose_codes && ARRAY[p_use_purpose_code]::text[]
      OR p_use_purpose_code IN ('reference','review')
      OR m.effective_use_purpose_codes && ARRAY['reference']::text[]
    )
),
scored AS (
  SELECT
    f.*,
    (
      CASE WHEN f.purpose_match_flag = 1 THEN 100000 ELSE 0 END
      + CASE WHEN f.domain_match_flag = 1 THEN 20000 ELSE -20000 END
      + CASE WHEN f.high_risk_safe_flag = 1 THEN 0 ELSE -100000 END
      + f.source_kind_score
      + f.domain_priority_score
      + f.risk_base_score
      + f.depth_score
      + CASE
          WHEN f.material_source_kind = 'source_registry' THEN 520
          WHEN f.material_source_kind = 'lane09_detail' THEN 515
          WHEN f.material_source_kind = 'lane05_fillup' THEN 500
          WHEN f.material_source_kind = 'pack05_full_load' THEN 300
          WHEN f.material_source_kind = 'pack04_robot_diff' THEN 220
          ELSE 0
        END
    )::integer AS selection_score
  FROM filtered f
  WHERE f.domain_match_flag = 1
    AND f.high_risk_safe_flag = 1
),
source_bucketed AS (
  SELECT
    s.*,
    row_number() OVER (
      PARTITION BY s.brain_domain_code, s.material_source_kind
      ORDER BY
        s.selection_score DESC,
        s.data_depth_level DESC NULLS LAST,
        s.unit_code ASC
    ) AS source_kind_rank
  FROM scored s
),
protected AS (
  SELECT
    b.*,
    CASE
      WHEN b.material_source_kind = 'source_registry' AND b.source_kind_rank <= 2 THEN 1
      WHEN b.material_source_kind = 'lane09_detail' AND b.source_kind_rank <= 2 THEN 1
      WHEN b.material_source_kind = 'lane05_fillup' AND b.source_kind_rank <= 2 THEN 1
      WHEN b.material_source_kind = 'pack05_full_load' AND b.source_kind_rank <= 1 THEN 1
      ELSE 0
    END AS protected_source_flag,
    CASE
      WHEN b.material_source_kind = 'source_registry' AND b.source_kind_rank <= 2 THEN 3000
      WHEN b.material_source_kind = 'lane09_detail' AND b.source_kind_rank <= 2980 THEN 2980
      WHEN b.material_source_kind = 'lane05_fillup' AND b.source_kind_rank <= 2 THEN 2950
      WHEN b.material_source_kind = 'pack05_full_load' AND b.source_kind_rank <= 1 THEN 2600
      ELSE 0
    END AS protected_source_score
  FROM source_bucketed b
),
domain_ranked AS (
  SELECT
    p.*,
    row_number() OVER (
      PARTITION BY p.brain_domain_code
      ORDER BY
        p.protected_source_flag DESC,
        p.protected_source_score DESC,
        p.selection_score DESC,
        p.source_kind_score DESC,
        p.data_depth_level DESC NULLS LAST,
        p.material_source_kind ASC,
        p.unit_code ASC
    ) AS domain_rank
  FROM protected p
),
domain_limited AS (
  SELECT *
  FROM domain_ranked
  WHERE domain_rank <= GREATEST(p_limit_per_domain, 1)
),
overall_ranked AS (
  SELECT
    d.*,
    row_number() OVER (
      ORDER BY
        d.protected_source_flag DESC,
        d.protected_source_score DESC,
        d.selection_score DESC,
        d.domain_priority_score DESC,
        d.source_kind_score DESC,
        d.data_depth_level DESC NULLS LAST,
        d.brain_domain_code ASC,
        d.material_source_kind ASC,
        d.unit_code ASC
    ) AS final_overall_rank
  FROM domain_limited d
)
SELECT
  r.profile_source_type::text,
  r.model_code::text,
  r.series_code::text,
  r.role_code::text,
  r.brain_data_code::text,
  r.brain_domain_code::text,
  r.brain_domain_label_ja::text,
  r.depth_code::text,
  r.data_depth_level::integer,
  r.risk_class_code::text,
  r.granularity_code::text,
  r.effective_use_purpose_codes::text[],
  r.access_decision_code::text,
  r.source_exists_flag::boolean,
  r.unit_code::text,
  r.unit_title_ja::text,
  r.unit_summary_ja::text,
  r.unit_detail_ja::text,
  r.practical_use_ja::text,
  r.example_prompt_ja::text,
  r.safety_boundary_ja::text,
  r.tags::text[],
  r.material_source_kind::text,
  r.selection_score::integer,
  r.domain_rank::bigint,
  r.final_overall_rank::bigint AS overall_rank,
  (
    'purpose=' || p_use_purpose_code
    || ' / source=' || r.material_source_kind
    || ' / source_kind_rank=' || r.source_kind_rank
    || ' / protected=' || r.protected_source_flag
    || ' / domain_rank=' || r.domain_rank
    || ' / overall_rank=' || r.final_overall_rank
    || ' / lane09_detail_enabled=true'
    || ' / score=' || r.selection_score
  )::text AS selection_reason_ja
FROM overall_ranked r
WHERE r.final_overall_rank <= GREATEST(p_total_limit, 1)
ORDER BY r.final_overall_rank;
$$;

COMMENT ON FUNCTION aiworker.fn_robot_brain_runtime_material_select_v1(text, text, text[], integer, integer)
IS 'AIWorkerOS runtime brain material selector. Lane09 enabled: v2 material view includes lane09 detail expansion units with protected source bucket selection.';

COMMIT;
