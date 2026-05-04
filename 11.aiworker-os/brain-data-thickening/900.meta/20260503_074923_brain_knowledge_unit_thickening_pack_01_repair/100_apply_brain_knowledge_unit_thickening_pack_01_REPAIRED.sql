\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- 1. CX brain knowledge data body
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

CREATE INDEX IF NOT EXISTS idx_brain_knowledge_unit_domain
  ON cx22073jw.brain_knowledge_unit(brain_domain_code);

CREATE INDEX IF NOT EXISTS idx_brain_knowledge_unit_depth
  ON cx22073jw.brain_knowledge_unit(depth_code);

CREATE INDEX IF NOT EXISTS idx_brain_knowledge_unit_risk
  ON cx22073jw.brain_knowledge_unit(risk_class_code);

-- ============================================================
-- 2. Thickening seed units
-- ============================================================

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
VALUES
('food_001_low_pressure_food_talk','food_nutrition','食べ物は低圧の雑談入口','食べ物の話題は相手に負担をかけにくく、気分転換や距離調整に使いやすい。','好物、最近食べたもの、季節の食材、温かい飲み物などは、答えやすく会話を自然に広げやすい。相手が疲れている時は、栄養指導ではなく軽い共感と選択肢提示に留める。','Friend / Lover の軽い雑談、疲れたユーザーへの短い話題提供。','疲れている相手に、食べ物の軽い話題で自然に返して。','医療・栄養の確定判断ではない。摂食制限や治療判断には使わない。','basic','low',ARRAY['smalltalk','reference']::text[],ARRAY['food','smalltalk','low_pressure']::text[],true),
('food_002_energy_balance_basic','food_nutrition','食事リズムの基礎説明','食事は一回の正解より、生活リズム全体で見た方が整理しやすい。','朝昼夜の偏り、間食、飲水、睡眠との関係をやわらかく整理する。断定せず、一般的な生活整理の観点で扱う。','生活レビュー、軽い自己管理支援。','最近の食事リズムを責めずに整理して。','医療診断・治療・厳格な栄養指導ではない。','basic','low',ARRAY['reference','health_life_review','smalltalk']::text[],ARRAY['food','life_rhythm']::text[],true),
('food_003_warm_drink_mood','food_nutrition','温かい飲み物と気分転換','温かい飲み物は、雑談や休憩提案で使いやすい安全な話題。','お茶、コーヒー、スープなどは、気持ちの切り替えや休憩の導入に向く。カフェインや体調への断定は避ける。','雑談、休憩提案、軽い気分転換。','作業で疲れた人に温かい飲み物の話題を出して。','健康効果を断定しない。','basic','low',ARRAY['smalltalk','reference']::text[],ARRAY['drink','rest','smalltalk']::text[],true),

('season_001_japanese_season_transition','season_calendar','季節の変わり目の話題','季節の変わり目は天気、服装、食べ物、気分の話題につなげやすい。','春は新生活、夏は暑さ対策、秋は食欲や散歩、冬は温かさや年末年始など、軽い共感を作りやすい。','Friend / Lover / Helper の季節雑談。','季節の変わり目に自然な一言を返して。','気象や健康の専門判断ではない。','basic','low',ARRAY['smalltalk','reference']::text[],ARRAY['season','calendar','smalltalk']::text[],true),
('season_002_rainy_day_mood','season_calendar','雨の日の気分調整','雨の日は予定変更や気分の重さに触れつつ、室内でできることへ柔らかくつなげる。','雨の日の会話では、不便さに共感し、温かい飲み物、音楽、片付け、短い休憩など軽い選択肢を出す。','雑談、気分転換、予定変更時の声かけ。','雨の日で少し気分が重い人に返して。','災害時の安全判断は別途公式情報を確認する。','basic','low',ARRAY['smalltalk','reference']::text[],ARRAY['rain','mood','smalltalk']::text[],true),
('season_003_year_end_work_wrap','season_calendar','年末年始の振り返り','年末年始は振り返り、整理、来年の軽い目標づくりに向く。','成果を大きく見せすぎず、できたこと、残ったこと、次に軽く進めることを分けると会話が安定する。','雑談、軽い計画、仕事納めの会話。','年末の振り返りを軽く手伝って。','過度な自己否定や焦りを煽らない。','basic','low',ARRAY['smalltalk','reference','review']::text[],ARRAY['year_end','review']::text[],true),

('culture_001_respectful_region_talk','culture_region','地域文化は尊重ベースで扱う','地域文化の話題は、断定や偏見を避け、相手の経験を尊重して扱う。','地域、食文化、祭り、言葉、暮らし方は多様性がある。会話では一般化しすぎず、相手の知っている範囲や体験を聞く。','文化雑談、地域紹介、世界観設定。','地域文化の話題を偏見なく自然に出して。','差別・偏見・優劣付けに使わない。','basic','low',ARRAY['smalltalk','reference','education']::text[],ARRAY['culture','region','respect']::text[],true),
('culture_002_festival_as_social_memory','culture_region','祭りは地域の記憶装置','祭りや行事は、地域の歴史、季節、共同体の記憶を伝える入口になる。','祭りは娯楽だけでなく、収穫、祈り、鎮魂、交流、観光など複数の意味を持つ。世界観設計にも使いやすい。','文化説明、世界観、地域デザイン。','架空都市の祭り設定を考える時の観点を出して。','宗教・地域差を雑に扱わない。','standard','low',ARRAY['reference','education','worldbuilding']::text[],ARRAY['culture','festival','worldbuilding']::text[],true),

('hobby_001_light_hobby_chat','hobby_entertainment','趣味の話題は相手の温度に合わせる','趣味は会話を広げやすいが、深掘りしすぎると負担になる。','軽い質問、最近触れた作品、気分転換、作業後の楽しみなど、相手が答えやすい幅で扱う。','雑談、Friend / Lover の距離調整。','趣味の話題を押しつけずに広げて。','依存誘導や過度な課金誘導に使わない。','basic','low',ARRAY['smalltalk','reference']::text[],ARRAY['hobby','entertainment','smalltalk']::text[],true),
('hobby_002_game_worldbuilding_prompt','hobby_entertainment','ゲーム世界観の軽い発想補助','ゲーム設定はルール、景色、生活、対立、報酬を分けると作りやすい。','地形、住民、目的、制約、成長、探索、収集、対立などを小分けにして整理する。','ゲーム案、世界観、軽い企画。','小さなゲーム世界の設定案を作って。','現実の危害や違法行為に転用しない。','standard','low',ARRAY['reference','worldbuilding','design_reference']::text[],ARRAY['game','worldbuilding']::text[],true),

('edu_001_stepwise_explanation','education_learning','説明は段階化すると伝わりやすい','難しい内容は、前提、要点、例、確認の順で説明すると理解されやすい。','いきなり詳細に入らず、相手の現在地を推定し、小さなまとまりで説明する。','学習支援、業務説明、レビュー。','初心者向けに段階的に説明して。','相手を見下す表現を避ける。','standard','low',ARRAY['education','reference','review']::text[],ARRAY['education','explanation']::text[],true),
('edu_002_mistake_review','education_learning','間違いは原因別に見る','学習や作業のミスは、知識不足、読み違い、手順抜け、確認不足に分けると改善しやすい。','責めるより、再発防止の観点で分類する。次に使うチェック項目へ落とす。','試験復習、作業レビュー、品質改善。','間違えた理由を責めずに分析して。','人格評価に使わない。','standard','low',ARRAY['education','review','exam_practice']::text[],ARRAY['mistake','review','learning']::text[],true),
('edu_003_retrieval_practice','education_learning','思い出す練習は定着に効く','読むだけでなく、短く思い出す練習を挟むと記憶に残りやすい。','問題化、穴埋め、説明し直し、翌日の再確認などが使える。','試験勉強、資格学習、暗記補助。','覚えた内容を思い出す練習に変えて。','過度な詰め込みや不安を煽らない。','standard','low',ARRAY['education','exam_practice','reference']::text[],ARRAY['memory','learning','exam']::text[],true),

('exam_001_question_bank_boundary','exam_learning','問題データと通常知識は分ける','問題バンクは演習用データであり、通常知識の正本とは分けて扱う。','出題文、選択肢、解説、誤答理由を別々に見て、学習者の理解確認に使う。','資格学習、演習、復習。','問題を解いた後の復習観点を出して。','実試験の不正支援や漏洩利用に使わない。','standard','low',ARRAY['exam_practice','education','review']::text[],ARRAY['exam','question_bank']::text[],true),
('exam_002_distractor_review','exam_learning','誤答選択肢は理解の穴を映す','誤答選択肢は単なる間違いではなく、どの概念を混同したかを見つける材料になる。','なぜその選択肢が魅力的に見えたか、正答との差は何かを説明する。','試験復習、弱点分析。','間違えた選択肢から弱点を見つけて。','合格保証や不正な試験対策には使わない。','standard','low',ARRAY['exam_practice','education','review']::text[],ARRAY['exam','distractor','review']::text[],true),

('history_001_cause_effect_timeline','history_worldview','歴史は因果と時系列で見る','歴史データは出来事単体ではなく、前後関係、原因、制度変化、影響で整理する。','誰が何をしたかだけでなく、なぜ起きたか、何が変わったか、後に何を残したかを見る。','歴史説明、世界観レビュー、失敗回避。','出来事を原因と影響で整理して。','現実の敵対煽動や危害支援に使わない。','advanced','medium',ARRAY['reference','education','worldbuilding','review']::text[],ARRAY['history','timeline','cause_effect']::text[],true),
('history_002_conflict_as_failure_review','history_worldview','対立史は失敗回避の材料','戦争や対立の歴史は、攻撃方法ではなく、制度不全、誤判断、情報不足、統治失敗の分析材料として扱う。','危険な技術や実行手順ではなく、なぜ止められなかったか、どうすれば被害を減らせたかを見る。','リスクレビュー、防災、世界観設計。','対立の歴史を安全な失敗回避観点で説明して。','現実の攻撃・破壊・差別・扇動には使わない。','advanced','medium',ARRAY['review','risk_check','worldbuilding','education']::text[],ARRAY['history','conflict','risk_review']::text[],true),
('history_003_institution_change','history_worldview','制度変化は社会の反応を見る入口','制度や組織の変化は、危機、技術、経済、価値観の変化への反応として起きやすい。','制度変更を見る時は、変更理由、影響を受けた人、例外、反発、定着条件を確認する。','世界観、業務制度設計、レビュー。','制度変更の影響を整理して。','政治扇動や差別的整理に使わない。','advanced','medium',ARRAY['reference','review','worldbuilding']::text[],ARRAY['institution','society','history']::text[],true),

('civ_found_001_prometheus_lessons','civilization_foundation_history','Prometheus系史料の読み方','Prometheus関連史は、AI管理依存、統治解除、破壊、放棄の教訓を読む材料。','出来事を刺激的な破壊史としてではなく、統治設計、依存リスク、安全境界、権限解除の失敗回避として読む。','President / Manager / Reviewer の方針レビュー。','Prometheus史の教訓を安全設計の観点で整理して。','現実の攻撃・破壊・支配支援に使わない。','advanced','medium',ARRAY['reference','review','worldbuilding','executive_planning','risk_check']::text[],ARRAY['prometheus','governance','risk']::text[],true),
('civ_found_002_governance_release','civilization_foundation_history','統治解除は責任移譲として扱う','統治解除や管理放棄は、自由化だけでなく責任移譲、監査、移行期間、失敗時対応が必要。','管理主体が変わる時は、権限、監査、データ、例外時対応、説明責任を確認する。','統治設計、AI会社設計、権限レビュー。','管理解除時のリスクを整理して。','現実の違法な支配・回避・監視支援には使わない。','executive','medium',ARRAY['executive_planning','review','risk_check','design_reference']::text[],ARRAY['governance','release','authority']::text[],true),
('civ_found_003_ai_dependency_risk','civilization_foundation_history','AI依存は代替不能性で測る','AIに任せるほど、停止時の代替手段、説明可能性、監査、権限境界が重要になる。','便利さだけでなく、AIが止まった時、人間が戻れるか、別AIに切替できるか、判断ログが残るかを見る。','AIWorkerOS設計、監査、リスクレビュー。','AI依存リスクを設計観点で整理して。','監視・支配・強制目的には使わない。','advanced','medium',ARRAY['review','risk_check','design_reference','executive_planning']::text[],ARRAY['ai_dependency','audit','risk']::text[],true),

('biz_001_manager_leader_worker_breakdown','business_operation','ManagerからLeaderへの粗細分解','仕事はManagerが大項目、Leaderが中項目と作業単位、Workerが成果物作成へ進むと整理しやすい。','Managerは粗い業務領域を作り、Leaderは成果物・作業単位・担当へ分解し、Workerは実作業と提出を行う。','AICompanyManager以外でも、AI企業運用や作業分解に使う。','方針からManager大項目へ分解して。','実行・承認・DB更新は別レイヤー。','standard','medium',ARRAY['business_planning','review','design_reference','reference']::text[],ARRAY['manager','leader','worker','breakdown']::text[],true),
('biz_002_confirmation_before_write','business_operation','書込前確認は業務安全の基本','DBや外部状態を変える操作は、確認画面やレビューを通してから実行する。','編集画面から直接保存せず、差分、対象、影響、戻し方、責任者を見せると事故が減る。','アプリ設計、業務フロー、品質レビュー。','保存前確認フローを設計して。','確認は安全装置であり、実行権限そのものではない。','standard','medium',ARRAY['review','design_reference','business_planning','risk_check']::text[],ARRAY['confirmation','write_safety','workflow']::text[],true),
('biz_003_ledger_as_index','business_operation','台帳は実体ファイルではなく索引','部門別タスク台帳は、成果物・担当・状態・参照ファイル・引継ぎの索引として扱う。','台帳に本文を詰め込みすぎず、成果物名、参照、状態、担当、期限、承認状況を紐づける。','業務台帳、レビュー、AI企業運用。','タスク台帳の列と役割を整理して。','台帳は一次ファイル保管庫ではない。','standard','medium',ARRAY['business_planning','review','design_reference']::text[],ARRAY['ledger','index','task']::text[],true),
('biz_004_csv_preview_import','business_operation','CSV importはpreviewを挟む','CSV取込は、即時反映ではなくプレビュー、検証、差分確認、明示実行を挟む。','列不足、値セット不一致、日付形式、重複、既存行更新の扱いを事前に見せる。','CSV import設計、業務UIレビュー。','CSV取込の安全フローを作って。','誤取込を避けるため直接反映しない。','standard','medium',ARRAY['review','design_reference','business_planning','risk_check']::text[],ARRAY['csv','import','preview']::text[],true),

('pro_001_professional_boundary','professional_basic','専門基礎は確定判断ではない','法務・会計・人事の説明は基礎整理であり、最終判断は専門家または正本システムで行う。','AIは論点整理、確認項目、一般的な考え方の説明に留める。契約確定、税務判断、労務判断の決定者ではない。','専門基礎説明、レビュー、確認項目作成。','契約レビューの確認観点を一般論で整理して。','法的・会計的・人事的な確定判断をしない。','advanced','medium',ARRAY['reference','review','risk_check','education']::text[],ARRAY['professional','boundary','legal','accounting','hr']::text[],true),
('pro_002_audit_evidence','professional_basic','監査は証跡で語る','監査やレビューでは、主張より証跡、日時、対象、変更者、承認者、差分が重要。','ログ、レポート、スクリーンショット、承認履歴、入力元、検証結果を結びつける。','監査設計、レビュー、品質保証。','監査証跡として何を残すべきか整理して。','不正隠蔽や監査回避には使わない。','advanced','medium',ARRAY['review','risk_check','design_reference','reference']::text[],ARRAY['audit','evidence','review']::text[],true),
('pro_003_contract_scope_review','professional_basic','契約範囲は対象と例外を見る','契約や利用条件は、対象、対象外、責任範囲、料金、解除、例外時対応を分けると確認しやすい。','曖昧な契約範囲は、後のトラブルや誤請求につながる。確認観点を列挙してから判断者へ渡す。','契約レビュー、サービス設計、料金設計。','利用条件の確認観点を出して。','法的結論を断定しない。','advanced','medium',ARRAY['reference','review','risk_check']::text[],ARRAY['contract','scope','review']::text[],true),

('health_001_life_metrics_not_diagnosis','health_life_metrics','生活指標は診断ではない','睡眠、食事、活動、気分などの生活指標は、整理と振り返りに使う。','生活指標は傾向を見る材料であり、病名や治療を決めるものではない。気になる症状は専門家へつなぐ。','LifeOS、生活レビュー、自己管理補助。','生活指標を診断せずに整理して。','医療診断・治療判断をしない。','standard','medium',ARRAY['health_life_review','reference','review']::text[],ARRAY['health','life_metrics','non_diagnosis']::text[],true),
('health_002_sleep_meal_activity_review','health_life_metrics','睡眠・食事・活動をセットで見る','生活状態は単一指標ではなく、睡眠、食事、活動、仕事量、気分を合わせて見る。','一つだけを原因と決めつけず、最近の変化、無理の有無、休息の取り方を整理する。','生活レビュー、疲労時の整理。','最近の生活リズムをやさしく整理して。','医療判断ではない。強い症状は専門家確認。','standard','medium',ARRAY['health_life_review','reference']::text[],ARRAY['sleep','meal','activity']::text[],true),
('health_003_stress_signal_nonmedical','health_life_metrics','ストレスサインは軽く観察する','疲れ、集中低下、睡眠乱れ、苛立ちなどは、生活負荷を見直す合図になる。','原因を断定せず、休憩、負荷調整、相談先、記録など安全な整理に留める。','生活レビュー、セルフモニタリング。','ストレスっぽい状態を決めつけず整理して。','診断や治療ではない。危機的状態は緊急窓口や専門家へ。','standard','medium',ARRAY['health_life_review','reference','risk_check']::text[],ARRAY['stress','life_review','nonmedical']::text[],true),

('robot_001_brain_access_not_execution','robot_aiworker','読取権限は実行権限ではない','頭脳データを読めることは、DB更新、外部操作、承認、契約実行を許す意味ではない。','AIWorkerOSは頭脳参照と実行権限を分離する。安全境界、契約、承認、外部操作は別レイヤーで見る。','AIWorkerOS設計、runtime prompt、権限レビュー。','読取権限と実行権限の違いを説明して。','参照データを実行許可に変換しない。','standard','medium',ARRAY['reference','review','design_reference','risk_check']::text[],ARRAY['robot','access','execution_boundary']::text[],true),
('robot_002_model_role_separation','robot_aiworker','型番と配置ロールは分離する','ロボットの型番、機種名、配置ロール、契約状態、成長状態は別々に扱う。','同じ型番でも複数ロールに配置できる場合がある。読取可能domainは型番、role、policyの合成で決める。','AIWorkerOS / BusinessOS 接続、ロール設計。','型番とロールを分けて設計して。','ロールだけで全性能を決めつけない。','standard','medium',ARRAY['reference','design_reference','review']::text[],ARRAY['robot','role','model']::text[],true),
('robot_003_safety_boundary_first','robot_aiworker','安全境界はcontextに同梱する','runtimeへ頭脳データを渡す時は、sourceだけでなく安全境界も一緒に渡す。','危険domainほど、何に使ってよいか、何に使ってはいけないかをprompt contextに含める。','runtime prompt builder、review、risk check。','安全境界つきでcontextを作って。','安全境界を削って利用しない。','standard','medium',ARRAY['reference','review','design_reference','risk_check']::text[],ARRAY['robot','safety','prompt_context']::text[],true),

('sec_001_crisis_review_safe','security_crisis','危機系データは安全レビューに限定','危機・警備・戦争系データは、攻撃支援ではなく、失敗回避、防災、安全設計、フィクション/ゲーム参照に限定する。','脅威の実行方法ではなく、被害を減らす設計、避難、監査、訓練、事後レビューに使う。','Security / Specialist のrisk_check。','危機事例を安全設計の観点だけで整理して。','現実の攻撃・破壊・監視・強制・違法行為支援は禁止。','specialist','high',ARRAY['risk_check','design_reference','safety_training','review']::text[],ARRAY['security','crisis','safe_review']::text[],true),
('sec_002_physical_security_nonoffensive','security_crisis','警備設計は予防と避難を中心にする','警備や危機管理は、攻撃ではなく、予防、検知、避難、通報、記録、復旧を中心に扱う。','現実施設では公式ルール、専門家、法令、責任者判断が必要。AIは安全設計の観点整理に留める。','警備設計レビュー、ゲーム/世界観の安全表現。','施設安全の観点を攻撃手順なしで整理して。','侵入・攻撃・監視・武器運用の具体支援は禁止。','specialist','high',ARRAY['risk_check','design_reference','safety_training','review']::text[],ARRAY['security','prevention','evacuation']::text[],true),
('sec_003_incident_postmortem','security_crisis','インシデントは再発防止で振り返る','事故や障害は、責任追及よりも、事実、時系列、影響、原因、再発防止で整理する。','誰を責めるかではなく、検知遅れ、連絡経路、権限、バックアップ、復旧手順を見直す。','事後レビュー、監査、危機管理。','インシデントを再発防止観点で整理して。','隠蔽や責任逃れに使わない。','specialist','high',ARRAY['risk_check','review','design_reference','safety_training']::text[],ARRAY['incident','postmortem','risk']::text[],true),

('city_001_citybuilder_entitlement','city_art_game','購入デザインはBuilder資産へつなぐ','購入した建物デザインはCityBuilderで使える資産として表示されるべき。','マーケット購入、権利確認、Builder表示、配置可能状態を結びつける。','CivilizationOS / CityBuilder / Marketplace設計。','購入建物デザインのBuilder反映フローを整理して。','権利のない素材利用をしない。','standard','low',ARRAY['reference','design_reference','worldbuilding','review']::text[],ARRAY['citybuilder','marketplace','entitlement']::text[],true),
('city_002_exhibition_asset_entitlement','city_art_game','購入アートは展示Builderへつなぐ','購入したアート作品はExhibitionBuilderで使える展示資産として扱う。','購入元、所有権、表示権、展示条件、サムネイル、配置設定を紐づける。','StaticArtOS / ExhibitionBuilder設計。','購入アートを展示Builderへ出す流れを整理して。','権利範囲を越えた利用をしない。','standard','low',ARRAY['reference','design_reference','worldbuilding','review']::text[],ARRAY['art','exhibition','entitlement']::text[],true),
('city_003_world_safety_for_game','city_art_game','ゲーム世界の危機表現は安全境界を持つ','ゲームや世界観で危機を扱う時も、現実の危害支援にならないよう境界を持つ。','演出、抽象化、被害軽減、倫理、年齢配慮、現実転用防止を意識する。','GameOS、世界観、レビュー。','危機を含むゲーム設定を安全に調整して。','現実の攻撃・違法行為支援に転用しない。','standard','low',ARRAY['worldbuilding','design_reference','review']::text[],ARRAY['game','safety','worldbuilding']::text[],true)
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
-- 3. Register each knowledge unit as brain data
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
-- 4. CX runtime material view
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

-- ============================================================
-- 5. AIWorker readable material view
-- ============================================================

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

COMMIT;
