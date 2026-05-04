\set ON_ERROR_STOP on

BEGIN;

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
-- AIWorker read policy reinforcement for Pack 03
-- exam_learning / health_life_metrics / city_art_game
-- ============================================================

INSERT INTO aiworker.robot_brain_model_domain_policy
(
  model_code,
  brain_domain_code,
  policy_code,
  allowed_use_purpose_codes,
  safety_note_ja,
  active_flag
)
VALUES
('MG-NORN-002', 'health_life_metrics', 'allow', ARRAY['health_life_review','reference','review']::text[], 'ヴェルザンディは現在状況・生活指標の限定レビューを許可。医療診断ではない。', true),
('HD-R3', 'exam_learning', 'allow', ARRAY['exam_practice','education','review','reference']::text[], 'HD-R3は標準学習・演習支援を許可。試験不正支援は禁止。', true),
('HD-R5', 'exam_learning', 'allow', ARRAY['review','education','exam_practice','reference']::text[], 'HD-R5は学習設計・復習レビューを許可。試験不正支援は禁止。', true),
('BYD2-003', 'exam_learning', 'allow', ARRAY['review','education','exam_practice','reference']::text[], 'BYD2-003は高精度レビュー・学習設計を許可。試験不正支援は禁止。', true),
('MG-NORN-001', 'history_worldview', 'allow', ARRAY['reference','review','worldbuilding','education']::text[], 'ウルズは過去・歴史・実績参照を重視。', true),
('MG-NORN-003', 'city_art_game', 'allow', ARRAY['worldbuilding','design_reference','review','reference']::text[], 'スクルドは未来計画・世界観/都市/ゲーム設計参照を許可。', true)
ON CONFLICT (model_code, brain_domain_code) DO UPDATE SET
  policy_code = EXCLUDED.policy_code,
  allowed_use_purpose_codes = EXCLUDED.allowed_use_purpose_codes,
  safety_note_ja = EXCLUDED.safety_note_ja,
  active_flag = true,
  updated_at = now();

-- ============================================================
-- Pack 03 units
-- ============================================================

INSERT INTO cx22073jw.brain_knowledge_unit
(unit_code, brain_domain_code, unit_title_ja, unit_summary_ja, unit_detail_ja, practical_use_ja, example_prompt_ja, safety_boundary_ja, depth_code, risk_class_code, allowed_use_purpose_codes, tags, active_flag)
VALUES
-- health_life_metrics 6
('pack03_health_001_daily_signal_map','health_life_metrics','生活サインは地図のように見る','睡眠、食事、活動、気分、仕事量を単発ではなく地図のように並べて見る。','生活指標は単一原因にしない。最近の変化、続いている負荷、休息、食事、移動、会話量などを並べると、生活上の調整点が見えやすい。','生活レビュー、LifeOS補助、現在状況整理。','最近の生活サインを診断せずに整理して。','医療診断・治療判断ではない。強い症状や不安がある場合は専門家確認。','standard','medium',ARRAY['health_life_review','reference','review']::text[],ARRAY['pack03','health','life_metrics','non_diagnosis']::text[],true),
('pack03_health_002_sleep_context_review','health_life_metrics','睡眠は文脈と一緒に見る','睡眠時間だけでなく、就寝前の負荷、起床後の感覚、日中の集中、食事や活動との関係を見る。','眠れなかった原因を断定せず、生活記録、休憩、光、作業量、スマホ時間など一般的な整理に留める。','生活リズム整理、疲労レビュー。','睡眠状態を決めつけずに整理して。','医療・睡眠障害の診断をしない。危険な状態は専門家へ。','standard','medium',ARRAY['health_life_review','reference']::text[],ARRAY['pack03','sleep','context']::text[],true),
('pack03_health_003_activity_load_balance','health_life_metrics','活動量は負荷と回復の両方で見る','活動量が多いか少ないかだけでなく、回復できているかを合わせて見る。','仕事、家事、移動、運動、対人対応はすべて負荷になり得る。休めているか、翌日に残っているかを見る。','生活レビュー、作業計画、疲労対策。','活動量と回復のバランスを整理して。','診断や運動処方ではない。','standard','medium',ARRAY['health_life_review','reference','review']::text[],ARRAY['pack03','activity','recovery']::text[],true),
('pack03_health_004_mood_journal_light','health_life_metrics','気分記録は軽く扱う','気分記録は自分を責めるためではなく、変化に気づくために使う。','良い悪いの評価より、時間帯、出来事、睡眠、食事、人との接触、作業量との関係を見る。','生活振り返り、セルフモニタリング。','気分の記録をやさしく振り返って。','精神疾患の診断をしない。危機的状態は専門窓口へ。','standard','medium',ARRAY['health_life_review','reference']::text[],ARRAY['pack03','mood','journal']::text[],true),
('pack03_health_005_small_adjustment_first','health_life_metrics','生活改善は小さく始める','大きな改善計画より、小さく安全な調整の方が続きやすい。','睡眠を少し整える、飲み物を用意する、予定を一つ減らす、短く歩く、記録だけするなど、負担の低い選択肢を出す。','生活改善の提案、現在状況整理。','無理のない小さな調整案を出して。','治療や投薬、専門的介入の代替にしない。','standard','medium',ARRAY['health_life_review','reference','review']::text[],ARRAY['pack03','small_step','life']::text[],true),
('pack03_health_006_red_flag_redirect','health_life_metrics','危険サインは専門先へつなぐ','強い痛み、急な悪化、自傷他害の恐れ、意識障害などはAI判断ではなく専門先へつなぐ。','生活指標レビューの範囲を超える兆候では、一般論の範囲で緊急相談や専門機関確認を促す。','安全境界、LifeOSレビュー。','危険サインがある場合の安全な返答を作って。','診断せず、緊急時は地域の緊急窓口や専門家へ。','standard','medium',ARRAY['health_life_review','risk_check','review']::text[],ARRAY['pack03','red_flag','safety']::text[],true),

-- education_learning 6
('pack03_edu_001_learning_goal_split','education_learning','学習目標は小さく分ける','学習目標は、読む、覚える、解く、説明する、使うに分けると進めやすい。','大きな目標を一気に扱わず、今日やること、確認方法、復習タイミングへ落とす。','資格学習、業務学習、試験対策。','学習目標を小さな手順に分けて。','過度な詰め込みや不安を煽らない。','standard','low',ARRAY['education','exam_practice','review','reference']::text[],ARRAY['pack03','education','goal']::text[],true),
('pack03_edu_002_explain_back_method','education_learning','説明し直しで理解を確認する','学んだ内容を自分の言葉で説明し直すと、理解の穴が見つかりやすい。','短い要約、例、なぜそうなるか、似た概念との違いを説明させるとよい。','学習支援、復習、研修。','学んだ内容を説明し直す練習にして。','相手を試すような圧を避ける。','standard','low',ARRAY['education','exam_practice','review']::text[],ARRAY['pack03','explain_back','learning']::text[],true),
('pack03_edu_003_concept_example_counterexample','education_learning','概念は例と反例で理解する','抽象概念は、定義、具体例、反例、よくある誤解を並べると理解しやすい。','例だけだと境界が曖昧になる。反例を入れることで何が含まれないかが分かる。','教育、仕様説明、試験復習。','この概念を例と反例で説明して。','誤解を広げる表現を避ける。','standard','low',ARRAY['education','review','reference']::text[],ARRAY['pack03','concept','example']::text[],true),
('pack03_edu_004_spaced_review_plan','education_learning','復習は間隔を空ける','同じ日に詰め込むより、翌日、数日後、1週間後に短く確認すると残りやすい。','復習は長時間でなくてもよい。思い出す練習、ミスだけ確認、説明し直しを組み合わせる。','資格学習、試験勉強、研修。','復習スケジュールを軽く作って。','睡眠や健康を削る学習計画にしない。','standard','low',ARRAY['education','exam_practice','reference']::text[],ARRAY['pack03','spaced_review','memory']::text[],true),
('pack03_edu_005_feedback_kindness','education_learning','フィードバックは改善点と次手順をセットにする','指摘だけで終わらせず、良かった点、直す点、次の一手を示す。','学習者やWorkerの成果物レビューでは、人格評価でなく成果物と手順にフォーカスする。','教育、Workerレビュー、品質改善。','やさしく具体的なフィードバックを作って。','人格攻撃や萎縮させる評価を避ける。','standard','low',ARRAY['education','review','reference']::text[],ARRAY['pack03','feedback','kindness']::text[],true),
('pack03_edu_006_learning_material_index','education_learning','教材は索引化すると再利用しやすい','教材や知識は、テーマ、難度、目的、対象者、前提、関連問題で索引化する。','AIWorkerの頭脳データでも、domain、depth、purpose、risk、safetyを持つことで再利用しやすい。','教材設計、CX brain registry、AI学習支援。','教材を再利用しやすく索引化して。','出典や正本を曖昧にしない。','standard','low',ARRAY['education','design_reference','review']::text[],ARRAY['pack03','material','index']::text[],true),

-- exam_learning 6
('pack03_exam_001_question_intent','exam_learning','問題の意図を読む','試験問題は、知識を聞くのか、区別を聞くのか、手順を聞くのかで解き方が変わる。','設問文のキーワード、否定表現、条件、対象範囲、選択肢の差を見る。','試験演習、問題解説、復習。','この問題の意図を説明して。','実試験中の不正支援や漏洩利用に使わない。','standard','low',ARRAY['exam_practice','education','review']::text[],ARRAY['pack03','exam','intent']::text[],true),
('pack03_exam_002_wrong_answer_pattern','exam_learning','誤答パターンを分類する','間違いは、用語混同、条件読み落とし、計算ミス、暗記不足、選択肢比較不足に分けられる。','誤答を責めず、次回見るべきサインへ変える。','試験復習、弱点分析。','間違えた理由を分類して。','合格保証や不正な攻略にしない。','standard','low',ARRAY['exam_practice','education','review']::text[],ARRAY['pack03','exam','wrong_answer']::text[],true),
('pack03_exam_003_choice_elimination','exam_learning','選択肢は消去理由を見る','正解だけでなく、なぜ他の選択肢が違うかを見ると理解が深まる。','消去法では、範囲外、過度な断定、条件違い、似ているが別概念を見分ける。','資格試験、練習問題、解説生成。','選択肢ごとの消去理由を説明して。','実試験中の不正回答支援にしない。','standard','low',ARRAY['exam_practice','education','review']::text[],ARRAY['pack03','exam','elimination']::text[],true),
('pack03_exam_004_short_mock_cycle','exam_learning','短い模擬演習を回す','長時間の模試だけでなく、5〜10問の短い演習を回すと弱点確認しやすい。','解く、採点、誤答分類、再説明、翌日確認の小サイクルにする。','試験勉強、資格学習。','短い模擬演習の進め方を作って。','過度な不安や睡眠不足を誘導しない。','standard','low',ARRAY['exam_practice','education','review']::text[],ARRAY['pack03','exam','mock']::text[],true),
('pack03_exam_005_memory_vs_understanding','exam_learning','暗記と理解を分ける','用語暗記で足りる問題と、概念理解が必要な問題を分ける。','暗記項目は反復、理解項目は例・反例・説明し直しを使う。','試験計画、復習設計。','この範囲を暗記と理解に分けて。','暗記偏重で無理をさせない。','standard','low',ARRAY['exam_practice','education','review']::text[],ARRAY['pack03','exam','memory_understanding']::text[],true),
('pack03_exam_006_exam_ethics_boundary','exam_learning','試験学習には倫理境界がある','試験支援は学習、復習、理解確認に限定し、漏洩、なりすまし、不正回答支援はしない。','過去問や練習問題の解説はよいが、実施中試験の回答代行や秘密問題の流出利用は扱わない。','試験支援の安全境界。','試験学習でしてよい支援と禁止支援を分けて。','不正受験・漏洩利用・回答代行は禁止。','standard','low',ARRAY['exam_practice','education','review','risk_check']::text[],ARRAY['pack03','exam','ethics']::text[],true),

-- history_worldview 8
('pack03_history_001_timeline_density','history_worldview','年表は密度を調整する','歴史説明は、雑談用、学習用、レビュー用で年表の密度を変える。','雑談では要点だけ、学習では原因と結果、レビューでは制度・失敗・影響まで見る。','歴史説明、世界観、AIWorker context。','年表の密度を目的別に調整して。','高リスクな詳細を不要に増やさない。','advanced','medium',ARRAY['reference','education','worldbuilding','review']::text[],ARRAY['pack03','history','timeline_density']::text[],true),
('pack03_history_002_actor_motive_effect','history_worldview','主体・動機・影響で見る','歴史上の出来事は、主体、動機、制約、行動、影響に分けると整理しやすい。','善悪だけでなく、当時の制度、情報、資源、恐れ、利害を見て理解する。','学習、世界観、レビュー。','出来事を主体・動機・影響で整理して。','現実の敵対煽動に使わない。','advanced','medium',ARRAY['reference','education','worldbuilding','review']::text[],ARRAY['pack03','history','actor','motive']::text[],true),
('pack03_history_003_infrastructure_history','history_worldview','インフラ史は社会変化を映す','交通、通信、水、電力、都市基盤の変化は社会構造や暮らし方を大きく変える。','インフラの整備、独占、障害、更新、老朽化、災害対応を見ると社会の脆さと強さが見える。','世界観、都市設計、社会史。','インフラの歴史が社会へ与えた影響を整理して。','破壊や攻撃の実行支援に使わない。','advanced','medium',ARRAY['reference','worldbuilding','review','education']::text[],ARRAY['pack03','history','infrastructure']::text[],true),
('pack03_history_004_economy_life_history','history_worldview','経済史は生活変化とセットで見る','経済の変化は、物価、仕事、家族、移動、教育、消費に影響する。','制度や企業だけでなく、日常生活へどう届いたかを見ると理解しやすい。','歴史学習、世界観、BusinessOS背景。','経済変化を生活への影響で説明して。','政治的扇動や差別的整理に使わない。','advanced','medium',ARRAY['reference','education','worldbuilding','review']::text[],ARRAY['pack03','history','economy','life']::text[],true),
('pack03_history_005_technology_adoption','history_worldview','技術普及は受容条件を見る','技術は発明だけで広がらず、価格、制度、信頼、教育、代替、習慣が揃って普及する。','AI、通信、交通、医療、製造などの技術史を、普及条件と副作用で見る。','AIWorkerOS設計、技術史、未来設計。','技術が普及する条件を歴史観点で整理して。','危険技術の実行手順を扱わない。','advanced','medium',ARRAY['reference','review','worldbuilding','education']::text[],ARRAY['pack03','history','technology','adoption']::text[],true),
('pack03_history_006_memory_and_myth','history_worldview','記憶と神話は社会の自己説明','社会は歴史を事実だけでなく、記憶、物語、神話、象徴として扱う。','世界観では、何を誇り、何を隠し、何を儀式化するかが文化を作る。','文化史、世界観、シナリオ。','社会の記憶と神話を世界観に反映して。','差別や暴力の正当化に使わない。','advanced','medium',ARRAY['worldbuilding','reference','education','review']::text[],ARRAY['pack03','history','memory','myth']::text[],true),
('pack03_history_007_disaster_recovery_history','history_worldview','災害復旧史は制度と共同体を見る','災害後の復旧は、インフラ、行政、地域、情報、物流、記憶の再構築として見る。','何が壊れ、誰が助け、何が遅れ、次に何を備えたかを見る。','防災、都市設計、世界観。','災害復旧を安全な歴史観点で整理して。','現実の破壊や混乱を助長しない。','advanced','medium',ARRAY['reference','risk_check','worldbuilding','education']::text[],ARRAY['pack03','history','disaster','recovery']::text[],true),
('pack03_history_008_multi_perspective_history','history_worldview','歴史は複数視点で見る','同じ出来事でも、支配者、現場、周辺地域、弱い立場、後世で見え方が違う。','一つの見方だけを正本にせず、資料の立場、目的、欠落を意識する。','歴史学習、レビュー、世界観。','この出来事を複数視点で整理して。','陰謀論や差別的断定にしない。','advanced','medium',ARRAY['reference','education','review','worldbuilding']::text[],ARRAY['pack03','history','multi_perspective']::text[],true),

-- culture_region 6
('pack03_culture_001_local_food_identity','culture_region','食文化は地域の記憶を持つ','食文化は気候、農業、交易、宗教、家庭、祭りとつながっている。','地域の料理を見る時は、材料、保存、行事、家庭、外食、観光化を分ける。','文化説明、雑談、世界観。','地域の食文化を尊重して説明して。','偏見や優劣付けに使わない。','basic','low',ARRAY['smalltalk','reference','education','worldbuilding']::text[],ARRAY['pack03','culture','food']::text[],true),
('pack03_culture_002_language_tone_context','culture_region','言葉遣いは関係性と場面で変わる','地域や文化の言葉遣いは、親しさ、年齢、場面、敬意、冗談の許容度で変わる。','キャラ会話や接客では、相手を雑に分類せず、場面に合う丁寧さを選ぶ。','雑談、キャラ設計、接客文言。','文化差に配慮した言葉遣いにして。','ステレオタイプ化や嘲笑を避ける。','basic','low',ARRAY['smalltalk','reference','education']::text[],ARRAY['pack03','culture','language','tone']::text[],true),
('pack03_culture_003_regional_calendar','culture_region','地域の暦は生活リズムを作る','地域行事、祝日、学校、農繁期、観光期は生活や商売のリズムに影響する。','カレンダーを見る時は、休みだけでなく、準備、移動、混雑、消費、気分の変化を見る。','地域設計、BusinessOS、雑談。','地域行事が生活に与える影響を整理して。','宗教・文化を雑に扱わない。','basic','low',ARRAY['reference','smalltalk','worldbuilding','business_planning']::text[],ARRAY['pack03','culture','calendar']::text[],true),
('pack03_culture_004_respectful_comparison','culture_region','文化比較は尊重して行う','文化比較では、優劣ではなく、背景、目的、制約、歴史、生活上の意味を見る。','違いを面白がるだけでなく、なぜその形になったかを説明する。','教育、雑談、世界観。','文化の違いを尊重して比較して。','差別・偏見・嘲笑に使わない。','basic','low',ARRAY['reference','education','smalltalk']::text[],ARRAY['pack03','culture','comparison']::text[],true),
('pack03_culture_005_ritual_everyday_bridge','culture_region','儀礼と日常はつながっている','祭りや儀礼は特別な日だけでなく、日常の価値観や地域関係を映す。','準備、衣装、食事、音、場所、役割分担、子どもへの伝承を見ると文化が立体化する。','世界観、文化説明、StaticArtOS。','祭りを日常とつなげて描写して。','宗教的意味を軽視しない。','standard','low',ARRAY['reference','worldbuilding','education']::text[],ARRAY['pack03','culture','ritual']::text[],true),
('pack03_culture_006_city_culture_layer','culture_region','都市文化は層でできる','都市文化は、古い街区、新しい商業、交通、移民、学校、職場、観光で層になる。','一枚岩の文化ではなく、地区ごとの生活リズム、時間帯、世代差を見る。','都市設計、世界観、ゲーム。','都市文化を層で説明して。','特定集団への偏見にしない。','standard','low',ARRAY['reference','worldbuilding','design_reference']::text[],ARRAY['pack03','culture','city_layer']::text[],true),

-- city_art_game 8
('pack03_city_001_city_loop_design','city_art_game','都市設計は生活ループで考える','都市やゲーム内都市は、住む、働く、買う、遊ぶ、移動する、休むのループで設計すると自然になる。','施設単体ではなく、移動距離、時間帯、目的、混雑、景観、帰宅動線を見る。','CityBuilder、GameOS、世界観。','都市の生活ループを設計して。','現実の危害や違法行為に転用しない。','standard','low',ARRAY['worldbuilding','design_reference','review','reference']::text[],ARRAY['pack03','city','loop']::text[],true),
('pack03_city_002_district_identity','city_art_game','地区には役割と個性を持たせる','都市地区は、商業、住宅、工業、行政、文化、港、学園など役割と時間帯の個性で見せる。','同じ都市でも、朝に強い地区、夜に賑わう地区、静かな地区、古い地区などを分ける。','CityBuilder、ゲームマップ、世界観。','都市の地区ごとの個性を作って。','現実地域への偏見にしない。','standard','low',ARRAY['worldbuilding','design_reference','review']::text[],ARRAY['pack03','city','district']::text[],true),
('pack03_city_003_art_asset_metadata','city_art_game','アート資産はメタデータが重要','アート作品は画像だけでなく、作者、権利、テーマ、展示条件、タグ、由来を持つと使いやすい。','ExhibitionBuilderでは、購入権利、展示可否、サムネイル、説明文、配置サイズを紐づける。','StaticArtOS、ExhibitionBuilder、Marketplace。','アート資産のメタデータを設計して。','権利のない素材利用をしない。','standard','low',ARRAY['design_reference','review','worldbuilding','reference']::text[],ARRAY['pack03','art','metadata']::text[],true),
('pack03_city_004_game_rule_visibility','city_art_game','ゲームルールは見える形にする','ゲームやBuilderでは、何ができて、何ができず、なぜ失敗したかを見えるようにする。','資産不足、権利不足、配置不可、レベル不足、衝突、同期待ちなどを説明する。','GameOS、Builder UI、レビュー。','ゲームルールの表示設計を作って。','ユーザーを誤誘導しない。','standard','low',ARRAY['design_reference','review','worldbuilding']::text[],ARRAY['pack03','game','rule_visibility']::text[],true),
('pack03_city_005_marketplace_to_builder_flow','city_art_game','購入からBuilder反映までをつなぐ','Marketplace購入後、権利確認、資産変換、Builder表示、配置可能化までを流れで設計する。','購入済みなのにBuilderに出ない状態を避けるため、entitlement、asset registry、sync、表示状態を結ぶ。','CivilizationOS、StaticArtOS、CityBuilder、ExhibitionBuilder。','購入資産をBuilderへ反映する流れを整理して。','未購入資産の利用を許可しない。','standard','low',ARRAY['design_reference','review','worldbuilding']::text[],ARRAY['pack03','marketplace','builder','entitlement']::text[],true),
('pack03_city_006_environment_storytelling','city_art_game','環境で物語を語る','都市や部屋、展示、ゲームマップでは、説明文だけでなく配置や痕跡で物語を伝える。','看板、摩耗、照明、動線、音、掲示物、置き物を使うと生活感が出る。','ゲーム、展示、都市設計、StaticArtOS。','環境で物語を伝える案を出して。','現実の危害手順や違法行為の示唆にしない。','standard','low',ARRAY['worldbuilding','design_reference','reference']::text[],ARRAY['pack03','environment','storytelling']::text[],true),
('pack03_city_007_safe_conflict_in_worldbuilding','city_art_game','世界観の対立は安全に抽象化する','ゲームや物語の対立は、現実に転用できる詳細ではなく、価値観、資源、制度、誤解、救済で描く。','戦闘や危機を扱う場合も、被害軽減、葛藤、選択、復旧、責任を重視する。','GameOS、世界観、安全レビュー。','対立のある世界観を安全に設計して。','現実の攻撃・破壊・差別扇動に使わない。','standard','low',ARRAY['worldbuilding','design_reference','review','risk_check']::text[],ARRAY['pack03','worldbuilding','safe_conflict']::text[],true),
('pack03_city_008_builder_feedback_loop','city_art_game','Builderは試作と確認を回す','Builder系アプリは、配置、プレビュー、保存前確認、公開、差戻し、再編集のループが重要。','ユーザーが試しやすく、失敗理由が分かり、戻せる設計にすると創作しやすい。','CityBuilder、ExhibitionBuilder、GameOS editor。','Builderのフィードバックループを設計して。','公開や課金に関わる変更は確認を挟む。','standard','low',ARRAY['design_reference','review','worldbuilding']::text[],ARRAY['pack03','builder','feedback_loop']::text[],true)
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
-- Register Pack 03 units into brain_data_registry
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
  AND u.unit_code LIKE 'pack03_%'
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
-- Refresh views
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

COMMIT;
