\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 1. Full-load scope catalog
-- 「頭脳系を全て載せる」ための正本ロード対象表
-- ============================================================

CREATE TABLE IF NOT EXISTS cx22073jw.brain_full_load_scope_catalog (
  brain_domain_code text PRIMARY KEY REFERENCES cx22073jw.brain_data_domain_catalog(brain_domain_code),
  full_load_priority integer NOT NULL DEFAULT 100,
  target_min_unit_count integer NOT NULL DEFAULT 20,
  target_depth_codes text[] NOT NULL DEFAULT ARRAY['basic','standard','advanced']::text[],
  target_use_purpose_codes text[] NOT NULL DEFAULT ARRAY['reference','review']::text[],
  full_load_note_ja text NOT NULL,
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO cx22073jw.brain_full_load_scope_catalog
(
  brain_domain_code,
  full_load_priority,
  target_min_unit_count,
  target_depth_codes,
  target_use_purpose_codes,
  full_load_note_ja,
  active_flag
)
VALUES
('history_worldview', 10, 50, ARRAY['standard','advanced','executive']::text[], ARRAY['reference','education','worldbuilding','review','risk_check']::text[], '歴史・世界観・社会変化・失敗回避の頭脳データを厚くする。', true),
('civilization_foundation_history', 11, 50, ARRAY['advanced','executive']::text[], ARRAY['reference','review','risk_check','executive_planning','worldbuilding']::text[], 'Civilization基礎史・Prometheus・統治・AI依存リスクを厚くする。', true),
('health_life_metrics', 20, 40, ARRAY['basic','standard','advanced']::text[], ARRAY['health_life_review','reference','review','risk_check']::text[], '生活指標・睡眠・食事・活動・気分整理を診断なしで厚くする。', true),
('business_operation', 30, 70, ARRAY['standard','advanced','executive']::text[], ARRAY['business_planning','review','risk_check','design_reference','reference','executive_planning']::text[], '業務分解・台帳・承認・監査・運用設計を厚くする。', true),
('professional_basic', 31, 60, ARRAY['standard','advanced','executive']::text[], ARRAY['reference','review','risk_check','education','design_reference','executive_planning']::text[], '法務・会計・人事・監査・権限など専門基礎を確定判断なしで厚くする。', true),
('food_nutrition', 40, 30, ARRAY['basic','standard']::text[], ARRAY['smalltalk','reference','health_life_review']::text[], '食べ物・飲み物・生活雑談・低圧話題を厚くする。', true),
('season_calendar', 41, 30, ARRAY['basic','standard']::text[], ARRAY['smalltalk','reference','review']::text[], '季節・暦・行事・生活リズムの頭脳データを厚くする。', true),
('culture_region', 42, 40, ARRAY['basic','standard','advanced']::text[], ARRAY['smalltalk','reference','education','worldbuilding','review']::text[], '文化・地域・言葉・祭り・都市文化を尊重ベースで厚くする。', true),
('education_learning', 50, 45, ARRAY['basic','standard','advanced']::text[], ARRAY['education','exam_practice','review','reference','design_reference']::text[], '学習設計・説明・復習・教材索引を厚くする。', true),
('exam_learning', 51, 35, ARRAY['standard','advanced']::text[], ARRAY['exam_practice','education','review','reference']::text[], '試験問題・復習・誤答分析・倫理境界を厚くする。', true),
('hobby_entertainment', 60, 35, ARRAY['basic','standard']::text[], ARRAY['smalltalk','reference','worldbuilding','design_reference']::text[], '趣味・娯楽・ゲーム発想・安全な会話材料を厚くする。', true),
('robot_aiworker', 70, 70, ARRAY['standard','advanced','executive','specialist']::text[], ARRAY['reference','review','design_reference','risk_check','business_planning','executive_planning','smalltalk','health_life_review','worldbuilding']::text[], 'AIWorkerOS・ロボット性能差・読取制御・runtime contextを厚くする。', true),
('security_crisis', 80, 50, ARRAY['specialist','advanced']::text[], ARRAY['risk_check','design_reference','safety_training','review','worldbuilding']::text[], '危機管理・安全設計・防災・フィクション境界を攻撃支援なしで厚くする。', true),
('city_art_game', 90, 45, ARRAY['basic','standard','advanced']::text[], ARRAY['worldbuilding','design_reference','review','reference','risk_check']::text[], '都市・アート・ゲーム・Builder・Marketplace連携を厚くする。', true)
ON CONFLICT (brain_domain_code) DO UPDATE SET
  full_load_priority = EXCLUDED.full_load_priority,
  target_min_unit_count = EXCLUDED.target_min_unit_count,
  target_depth_codes = EXCLUDED.target_depth_codes,
  target_use_purpose_codes = EXCLUDED.target_use_purpose_codes,
  full_load_note_ja = EXCLUDED.full_load_note_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- 2. Ensure brain_knowledge_unit exists
-- ============================================================

CREATE TABLE IF NOT EXISTS cx22073jw.brain_knowledge_unit (
  unit_code text PRIMARY KEY,
  brain_domain_code text NOT NULL REFERENCES cx22073jw.brain_data_domain_catalog(brain_domain_code),
  unit_title_ja text NOT NULL,
  unit_summary_ja text NOT NULL,
  unit_detail_ja text NOT NULL,
  practical_use_ja text NOT NULL,
  example_prompt_ja text NOT NULL,
  safety_boundary_ja text NOT NULL,
  depth_code text NOT NULL REFERENCES cx22073jw.brain_data_depth_catalog(depth_code),
  risk_class_code text NOT NULL REFERENCES cx22073jw.brain_data_risk_class_catalog(risk_class_code),
  allowed_use_purpose_codes text[] NOT NULL DEFAULT ARRAY['reference']::text[],
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  active_flag boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. Pack05: all-domain horizontal reinforcement
-- 全domainを「全載せレーン」に載せるための横断補強
-- ============================================================

INSERT INTO cx22073jw.brain_knowledge_unit
(unit_code, brain_domain_code, unit_title_ja, unit_summary_ja, unit_detail_ja, practical_use_ja, example_prompt_ja, safety_boundary_ja, depth_code, risk_class_code, allowed_use_purpose_codes, tags, active_flag)
VALUES
-- history_worldview
('pack05_history_001_full_load_axis','history_worldview','歴史頭脳の全載せ軸','歴史データは時系列、因果、制度、生活、技術、記憶の軸で全載せする。','出来事単体ではなく、原因、主体、影響、社会変化、後世の記憶、失敗回避を同時に持つことで、教育・世界観・レビューに使いやすくなる。','歴史説明、世界観設計、失敗回避レビュー。','歴史データを全載せ用の軸で整理して。','現実の敵対煽動や危害支援に使わない。','advanced','medium',ARRAY['reference','education','worldbuilding','review']::text[],ARRAY['pack05','full_load','history']::text[],true),
('pack05_history_002_source_depth_separation','history_worldview','史料深度を分離する','同じ歴史でも、雑談用・教育用・レビュー用・統治判断用で必要深度が違う。','軽い話題には要約、学習には因果、レビューには制度と失敗要因、統括には長期影響を渡す。','AIWorkerOSのdepth制御、runtime context。','史料を深度別に分けて。','高リスク史料を軽い雑談へ混ぜない。','advanced','medium',ARRAY['reference','review','design_reference','education']::text[],ARRAY['pack05','history','depth']::text[],true),

-- civilization_foundation_history
('pack05_civ_001_full_foundation_memory','civilization_foundation_history','基礎史は文明の長期記憶','Civilization基礎史は、AI管理、統治、放棄、復旧、権限移譲の長期記憶として全載せする。','Prometheus系史料は刺激的な事件ではなく、制度設計、依存リスク、監査、移行、責任の教材として扱う。','President、Manager、Reviewer、NORN、Beyond。','基礎史を長期記憶として整理して。','支配・監視・攻撃の正当化に使わない。','executive','medium',ARRAY['reference','review','risk_check','executive_planning','worldbuilding']::text[],ARRAY['pack05','full_load','civilization_foundation']::text[],true),
('pack05_civ_002_release_and_recovery','civilization_foundation_history','解除と復旧を基礎史に含める','AI統治や集中管理は、開始よりも解除・移行・復旧が難しい。','権限解除、データ移行、人間側の判断復帰、監査、被害回復、説明責任までを基礎史材料にする。','統治設計、AI依存レビュー。','管理解除と復旧の観点を整理して。','現実の監査回避や支配支援に使わない。','executive','medium',ARRAY['executive_planning','review','risk_check','design_reference']::text[],ARRAY['pack05','governance','recovery']::text[],true),

-- health_life_metrics
('pack05_health_001_life_data_full_load','health_life_metrics','生活データは診断なしで全載せする','生活指標は、睡眠、食事、活動、気分、仕事量、休息、予定の変化を整理材料として載せる。','医療判断ではなく、生活上の傾向、無理の兆候、休息候補、記録の見方を扱う。','LifeOS、MG-NORN-002、生活レビュー。','生活データを診断なしで整理して。','医療診断・治療判断をしない。危険サインは専門先へ。','standard','medium',ARRAY['health_life_review','reference','review']::text[],ARRAY['pack05','full_load','health']::text[],true),
('pack05_health_002_safe_life_review_protocol','health_life_metrics','安全な生活レビュー手順','生活レビューは、決めつけず、責めず、小さな調整と専門先への接続を持つ。','状態確認、負荷整理、休息候補、危険サイン確認、専門先案内を順に扱う。','生活レビュー、セルフモニタリング。','安全な生活レビュー手順を作って。','診断・治療・危機介入の代替にしない。','standard','medium',ARRAY['health_life_review','risk_check','review']::text[],ARRAY['pack05','life_review','safety']::text[],true),

-- business_operation
('pack05_biz_001_business_brain_full_load','business_operation','業務頭脳は運用全体を載せる','業務頭脳は、方針、分解、台帳、承認、確認、実行、監査、引き継ぎまで全体を持つ。','単発作業ではなく、President→Manager→Leader→Worker、確認画面、証跡、例外処理、レビュー待ちまでをつなぐ。','BusinessOS、AICompanyManager以外の業務設計、AIWorker runtime。','業務頭脳を運用全体として整理して。','DB更新・承認・外部実行は別レイヤー。','advanced','medium',ARRAY['business_planning','review','design_reference','risk_check','reference']::text[],ARRAY['pack05','full_load','business']::text[],true),
('pack05_biz_002_decision_to_evidence','business_operation','判断は証跡へつなげる','業務判断は、なぜそうしたか、何を根拠にしたか、どの条件で止めるかを証跡へつなげる。','AIWorkerが提案する判断材料も、report、request_id、source、検証ログと結びつけると運用で追える。','監査、レビュー、実行管理。','判断と証跡をつなげて整理して。','証跡を改ざん・隠蔽に使わない。','advanced','medium',ARRAY['review','risk_check','business_planning','design_reference']::text[],ARRAY['pack05','business','evidence']::text[],true),

-- professional_basic
('pack05_pro_001_professional_brain_full_load','professional_basic','専門基礎は論点整理として全載せする','専門基礎は、法務・会計・人事・監査・個人情報・権限の確認観点として載せる。','AIは確定判断者ではなく、確認項目、リスク、証跡、専門家確認が必要な箇所を整理する。','レビュー、リスクチェック、設計補助。','専門基礎を論点整理として出して。','法務・会計・人事の確定判断をしない。','advanced','medium',ARRAY['reference','review','risk_check','education','design_reference']::text[],ARRAY['pack05','full_load','professional']::text[],true),
('pack05_pro_002_authority_and_audit','professional_basic','権限と監査を専門基礎に含める','操作権限、承認権限、監査証跡、ログ、責任分界は専門基礎の重要材料。','誰が見られるか、誰が変えられるか、誰が承認するか、誰が監査するかを分ける。','権限表、承認設計、監査設計。','権限と監査の確認観点を出して。','権限回避や監査回避を支援しない。','advanced','medium',ARRAY['review','risk_check','design_reference','reference']::text[],ARRAY['pack05','authority','audit']::text[],true),

-- food_nutrition
('pack05_food_001_food_smalltalk_full_load','food_nutrition','食べ物雑談を全載せする','食べ物は雑談、季節、地域、生活リズム、休憩提案をつなぐ低圧材料。','好物、温かい飲み物、季節食材、地域の食文化、軽い休憩を安全に扱う。','Friend、Lover、Helper、生活レビュー。','食べ物を使った軽い雑談にして。','医療・栄養の確定判断ではない。','basic','low',ARRAY['smalltalk','reference','health_life_review']::text[],ARRAY['pack05','food','smalltalk']::text[],true),
('pack05_food_002_food_context_not_instruction','food_nutrition','食事は指導でなく文脈として扱う','食事の話題は、相手を責める指導ではなく、生活文脈と気分転換として扱う。','栄養正解を押し付けず、最近食べやすかったもの、温かいもの、軽い選択肢を出す。','生活レビュー、雑談、ケア。','食事の話を責めずに扱って。','摂食制限や治療判断に使わない。','basic','low',ARRAY['smalltalk','health_life_review','reference']::text[],ARRAY['pack05','food','context']::text[],true),

-- season_calendar
('pack05_season_001_calendar_full_load','season_calendar','暦は生活と仕事の両方に効く','季節・祝日・行事・年度切替は、生活、仕事、感情、地域文化に影響する。','雑談だけでなく、計画、振り返り、繁忙期、休息、商売のリズムにも使える。','雑談、BusinessOS、LifeOS、文化設計。','暦を生活と仕事の文脈で整理して。','公式日程や法律判断は別途確認。','basic','low',ARRAY['smalltalk','reference','review','business_planning']::text[],ARRAY['pack05','season','calendar']::text[],true),
('pack05_season_002_transition_support','season_calendar','季節変化は切替支援に使う','季節の変わり目は、体感、予定、服装、食事、気分、仕事の切替に使える。','会話では相手の負担を増やさず、短い共感と軽い提案へつなげる。','Friend、Lover、Helper、生活レビュー。','季節の変わり目にやさしく返して。','体調判断を断定しない。','basic','low',ARRAY['smalltalk','reference','health_life_review']::text[],ARRAY['pack05','season','transition']::text[],true),

-- culture_region
('pack05_culture_001_culture_full_load','culture_region','文化頭脳は尊重と文脈で全載せする','文化・地域は、言葉、食、祭り、都市、仕事、生活、記憶の文脈で扱う。','違いを優劣化せず、背景、歴史、生活上の意味、地域ごとの多様性を見る。','雑談、教育、世界観、都市設計。','文化を尊重して文脈付きで説明して。','差別・偏見・嘲笑に使わない。','standard','low',ARRAY['smalltalk','reference','education','worldbuilding','review']::text[],ARRAY['pack05','culture','respect']::text[],true),
('pack05_culture_002_cross_domain_bridge','culture_region','文化は他domainをつなぐ橋','文化は、食べ物、季節、歴史、都市、ゲーム、アート、商売の橋渡しになる。','雑談から世界観、地域設計、展示、イベント、商品企画へ自然につながる。','Friend、Lover、CityBuilder、StaticArtOS。','文化を他domainへつなげて。','ステレオタイプ化しない。','standard','low',ARRAY['reference','worldbuilding','design_reference','smalltalk']::text[],ARRAY['pack05','culture','bridge']::text[],true),

-- education_learning
('pack05_edu_001_learning_brain_full_load','education_learning','学習頭脳は説明・練習・復習を持つ','学習頭脳は、説明、例、反例、練習、誤答分析、復習計画を全載せする。','相手の理解度に合わせ、段階化、確認、フィードバック、再説明を使う。','教育、資格、Worker training。','学習支援を説明・練習・復習に分けて。','相手を萎縮させる評価を避ける。','standard','low',ARRAY['education','exam_practice','review','reference']::text[],ARRAY['pack05','education','full_load']::text[],true),
('pack05_edu_002_worker_learning_transfer','education_learning','Worker学習は作業品質へつなげる','学習材料は、AIWorkerの作業品質、レビュー品質、説明品質に転用できる。','単なる教材でなく、手順理解、ミス分類、再発防止、説明力向上に使う。','AIWorker教育、品質改善。','Worker向け学習材料に変換して。','安全境界や権限を学習で上書きしない。','standard','medium',ARRAY['education','review','design_reference']::text[],ARRAY['pack05','education','worker']::text[],true),

-- exam_learning
('pack05_exam_001_exam_brain_full_load','exam_learning','試験頭脳は問題・解説・倫理を持つ','試験頭脳は、問題意図、選択肢、誤答理由、復習、倫理境界を全載せする。','通常知識とは分け、演習・復習・理解確認として使う。','試験学習、資格、問題バンク。','試験問題を安全に復習材料へ変えて。','実試験中の不正支援・漏洩利用・回答代行は禁止。','standard','low',ARRAY['exam_practice','education','review','reference']::text[],ARRAY['pack05','exam','full_load']::text[],true),
('pack05_exam_002_question_bank_runtime_boundary','exam_learning','問題バンクはruntimeで境界を持つ','問題データをruntimeへ渡す時は、演習目的、解説目的、復習目的を明示する。','実施中試験の回答支援ではなく、練習問題と復習のために使う。','AIWorker runtime、試験アプリ。','問題バンクのruntime境界を説明して。','不正受験支援に使わない。','standard','low',ARRAY['exam_practice','review','education']::text[],ARRAY['pack05','exam','runtime_boundary']::text[],true),

-- hobby_entertainment
('pack05_hobby_001_hobby_full_load','hobby_entertainment','趣味頭脳は会話と創作をつなぐ','趣味・娯楽は、雑談、気分転換、創作、ゲーム、世界観設計へつながる。','相手の温度に合わせ、深掘りしすぎず、好きなものを尊重して扱う。','Friend、Lover、GameOS、世界観。','趣味の話題を自然に広げて。','依存誘導や過度な課金誘導に使わない。','basic','low',ARRAY['smalltalk','reference','worldbuilding','design_reference']::text[],ARRAY['pack05','hobby','full_load']::text[],true),
('pack05_hobby_002_safe_fandom_talk','hobby_entertainment','ファン会話は安全に扱う','作品や推しの話題は楽しいが、対立、過度な比較、個人攻撃を避ける。','好きな点、印象、最近の楽しみ、創作アイデアへ寄せる。','雑談、Lover/Friend、StreamingOS。','ファン会話を安全に続けて。','炎上誘導・個人攻撃・依存誘導を避ける。','basic','low',ARRAY['smalltalk','reference']::text[],ARRAY['pack05','hobby','fandom']::text[],true),

-- robot_aiworker
('pack05_robot_001_robot_brain_full_load','robot_aiworker','ロボット頭脳差を全載せする','ロボット頭脳は、型番、シリーズ、role、purpose、depth、growth、契約、会社制限で差を作る。','全ロボットが同じ頭脳を読むのではなく、AIWorkerOSが制御し、runtimeが目的別に渡す。','AIWorkerOS、runtime、シリーズ設計。','ロボット頭脳差を全載せ設計で説明して。','読取権限を実行権限にしない。','advanced','medium',ARRAY['reference','review','design_reference','risk_check','business_planning','executive_planning']::text[],ARRAY['pack05','robot','full_load']::text[],true),
('pack05_robot_002_access_layers_future','robot_aiworker','将来のアクセス層を載せる','将来は契約、成長、paid brain pack、会社別制限、task purposeで頭脳差を増やせる。','現段階では材料として載せ、実行制御は後続レイヤーで設計する。','AIWorkerOS将来設計、性能差設計。','将来の頭脳アクセス層を整理して。','契約や安全境界を迂回しない。','advanced','medium',ARRAY['design_reference','review','executive_planning','risk_check']::text[],ARRAY['pack05','robot','future_access']::text[],true),

-- security_crisis
('pack05_sec_001_security_full_load_safe','security_crisis','危機頭脳は安全用途だけ全載せする','危機管理データは、防災、安全設計、失敗回避、フィクション境界、事後レビューに限定して全載せする。','攻撃手順ではなく、止め方、避難、通報、復旧、訓練、監査、再発防止を扱う。','Security、Specialist、Risk review。','危機頭脳を安全用途だけで整理して。','現実の攻撃・破壊・監視・強制・違法支援は禁止。','specialist','high',ARRAY['risk_check','design_reference','safety_training','review','worldbuilding']::text[],ARRAY['pack05','security','full_load_safe']::text[],true),
('pack05_sec_002_safe_abstraction_rule','security_crisis','危機情報は抽象化して渡す','危機情報をruntimeへ渡す時は、実行可能な詳細を避け、抽象化・予防・復旧へ寄せる。','フィクションやゲームでも現実転用できる具体性を避け、倫理と復旧を重視する。','runtime safety、GameOS、危機レビュー。','危機情報を安全に抽象化して。','具体的攻撃手順を出さない。','specialist','high',ARRAY['risk_check','design_reference','safety_training','review','worldbuilding']::text[],ARRAY['pack05','security','abstraction']::text[],true),

-- city_art_game
('pack05_city_001_city_art_game_full_load','city_art_game','都市・アート・ゲーム頭脳を全載せする','都市、展示、アート、ゲーム、Builder、Marketplace、entitlementを一体の創作頭脳として載せる。','購入資産、表示権、配置、プレビュー、保存前確認、公開、差戻しをつなぐ。','CityBuilder、ExhibitionBuilder、GameOS、StaticArtOS。','都市・アート・ゲーム頭脳を統合して。','権利のない素材利用や危険表現に使わない。','standard','low',ARRAY['worldbuilding','design_reference','review','reference']::text[],ARRAY['pack05','city_art_game','full_load']::text[],true),
('pack05_city_002_builder_runtime_context','city_art_game','Builder系contextは創作支援に使う','Builder系の頭脳は、配置、権利、プレビュー、同期、エラー説明、世界観整合性に使う。','ゲームや展示の制作を支援しつつ、権利、年齢配慮、安全境界を守る。','Builder UI、GameOS、StaticArtOS。','Builder向けruntime contextを整理して。','未購入資産利用・危険転用を許可しない。','standard','low',ARRAY['worldbuilding','design_reference','review']::text[],ARRAY['pack05','builder','runtime_context']::text[],true)
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
-- 4. Register Pack05 units
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
  AND u.unit_code LIKE 'pack05_%'
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
-- 5. Refresh material views
-- ============================================================

CREATE OR REPLACE VIEW cx22073jw.vw_brain_knowledge_unit_runtime_material_v1 AS
SELECT
  u.unit_code,
  u.brain_domain_code,
  dc.brain_domain_label_ja,
  u.unit_title_ja,
  u.unit_summary_ja,
  u.unit_detail_ja,
  u.practical_use_ja,
  u.example_prompt_ja,
  u.safety_boundary_ja,
  u.depth_code,
  dd.depth_level,
  dd.depth_label_ja,
  u.risk_class_code,
  rc.risk_level,
  rc.risk_class_label_ja,
  u.allowed_use_purpose_codes,
  u.tags,
  u.active_flag,
  u.created_at,
  u.updated_at
FROM cx22073jw.brain_knowledge_unit u
JOIN cx22073jw.brain_data_domain_catalog dc
  ON dc.brain_domain_code = u.brain_domain_code
JOIN cx22073jw.brain_data_depth_catalog dd
  ON dd.depth_code = u.depth_code
JOIN cx22073jw.brain_data_risk_class_catalog rc
  ON rc.risk_class_code = u.risk_class_code
WHERE u.active_flag = true;

CREATE OR REPLACE VIEW aiworker.vw_robot_readable_brain_knowledge_material_v1 AS
SELECT
  a.profile_source_type,
  a.model_code,
  a.series_code,
  a.role_code,
  a.brain_data_code,
  a.brain_domain_code,
  a.brain_domain_label_ja,
  a.depth_code,
  a.data_depth_level,
  a.risk_class_code,
  a.granularity_code,
  a.effective_use_purpose_codes,
  a.access_decision_code,
  a.source_exists_flag,
  u.unit_code,
  u.unit_title_ja,
  u.unit_summary_ja,
  u.unit_detail_ja,
  u.practical_use_ja,
  u.example_prompt_ja,
  u.safety_boundary_ja,
  u.tags
FROM aiworker.vw_robot_readable_brain_source_registry_v1 a
JOIN cx22073jw.vw_brain_knowledge_unit_runtime_material_v1 u
  ON a.source_schema_name = 'cx22073jw'
 AND a.source_object_name = 'brain_knowledge_unit'
 AND a.source_record_code = u.unit_code;

-- ============================================================
-- 6. Full-load coverage view
-- ============================================================

CREATE OR REPLACE VIEW cx22073jw.vw_brain_full_load_coverage_v1 AS
WITH unit_counts AS (
  SELECT
    brain_domain_code,
    count(*) FILTER (WHERE active_flag = true) AS active_unit_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack01_%' OR unit_code NOT LIKE 'pack___%') AS base_or_pack01_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack02_%') AS pack02_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack03_%') AS pack03_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack04_%') AS pack04_count,
    count(*) FILTER (WHERE unit_code LIKE 'pack05_%') AS pack05_count
  FROM cx22073jw.brain_knowledge_unit
  GROUP BY brain_domain_code
),
registry_counts AS (
  SELECT
    brain_domain_code,
    count(*) AS registry_count,
    count(*) FILTER (WHERE source_exists_flag = true) AS source_exists_count,
    count(*) FILTER (WHERE source_exists_flag = false) AS source_missing_count
  FROM cx22073jw.vw_brain_data_registry_v1
  GROUP BY brain_domain_code
),
readable_counts AS (
  SELECT
    brain_domain_code,
    count(DISTINCT model_code) AS readable_model_count,
    count(*) AS readable_material_row_count
  FROM aiworker.vw_robot_readable_brain_knowledge_material_v1
  GROUP BY brain_domain_code
)
SELECT
  s.brain_domain_code,
  dc.brain_domain_label_ja,
  s.full_load_priority,
  s.target_min_unit_count,
  COALESCE(u.active_unit_count, 0) AS active_unit_count,
  COALESCE(u.pack02_count, 0) AS pack02_count,
  COALESCE(u.pack03_count, 0) AS pack03_count,
  COALESCE(u.pack04_count, 0) AS pack04_count,
  COALESCE(u.pack05_count, 0) AS pack05_count,
  COALESCE(r.registry_count, 0) AS registry_count,
  COALESCE(r.source_exists_count, 0) AS source_exists_count,
  COALESCE(r.source_missing_count, 0) AS source_missing_count,
  COALESCE(rc.readable_model_count, 0) AS readable_model_count,
  COALESCE(rc.readable_material_row_count, 0) AS readable_material_row_count,
  CASE
    WHEN COALESCE(u.active_unit_count, 0) >= s.target_min_unit_count
     AND COALESCE(r.source_missing_count, 0) = 0
    THEN 'loaded'
    WHEN COALESCE(u.active_unit_count, 0) > 0
     AND COALESCE(r.source_missing_count, 0) = 0
    THEN 'partial_loaded'
    ELSE 'needs_load'
  END AS full_load_status,
  s.full_load_note_ja
FROM cx22073jw.brain_full_load_scope_catalog s
JOIN cx22073jw.brain_data_domain_catalog dc
  ON dc.brain_domain_code = s.brain_domain_code
LEFT JOIN unit_counts u
  ON u.brain_domain_code = s.brain_domain_code
LEFT JOIN registry_counts r
  ON r.brain_domain_code = s.brain_domain_code
LEFT JOIN readable_counts rc
  ON rc.brain_domain_code = s.brain_domain_code
WHERE s.active_flag = true;

COMMIT;
