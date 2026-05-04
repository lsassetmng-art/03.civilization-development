\set ON_ERROR_STOP on

BEGIN;

-- ============================================================
-- Pack 02 depends on Pack 01 table/view foundation.
-- Create table defensively if missing, but normal path is existing.
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
-- Pack 02: business_operation
-- ============================================================

INSERT INTO cx22073jw.brain_knowledge_unit
(unit_code, brain_domain_code, unit_title_ja, unit_summary_ja, unit_detail_ja, practical_use_ja, example_prompt_ja, safety_boundary_ja, depth_code, risk_class_code, allowed_use_purpose_codes, tags, active_flag)
VALUES
('pack02_biz_001_goal_to_deliverable_chain','business_operation','方針から成果物への分解鎖','方針はそのまま作業にせず、成果物、判断点、実行単位へ分解する。','President方針やユーザー依頼は、目的、制約、対象範囲、成果物名、完了条件へ分ける。Managerは大項目、Leaderは中項目、Workerは成果物単位へ落とす。','AI企業運用、仕事分解、設計作業の入口。','方針を成果物単位へ分解して。','分解は提案であり、DB更新・承認・外部実行は別レイヤー。','standard','medium',ARRAY['business_planning','review','design_reference','reference']::text[],ARRAY['pack02','business','breakdown','deliverable']::text[],true),
('pack02_biz_002_acceptance_criteria','business_operation','完了条件は検証可能にする','作業の完了条件は、曖昧な表現ではなく確認できる状態にする。','良い完了条件は、ファイルがある、画面で表示できる、件数が一致する、エラーが0である、レビュー対象が明示される、など確認できる形を持つ。','タスク定義、レビュー、進捗管理。','この作業の完了条件を検証可能にして。','完了条件は品質保証の一部で、実行結果の保証ではない。','standard','medium',ARRAY['business_planning','review','design_reference']::text[],ARRAY['pack02','acceptance','quality']::text[],true),
('pack02_biz_003_exception_first_workflow','business_operation','例外処理を先に設計する','業務フローは正常系だけでなく、失敗、取消、保留、差戻し、再実行を先に考える。','例外処理がない業務フローは運用で詰まりやすい。誰が気づき、どこへ通知し、どの状態へ戻し、証跡をどう残すかを見る。','業務設計、承認フロー、AI実行監視。','この業務フローの例外処理を洗い出して。','例外処理は安全設計であり、権限回避に使わない。','standard','medium',ARRAY['review','risk_check','business_planning','design_reference']::text[],ARRAY['pack02','exception','workflow']::text[],true),
('pack02_biz_004_handoff_minimum_packet','business_operation','引き継ぎは最小パケット化する','別担当や別チャットへ渡す時は、目的、現在位置、完了済み、未完了、禁止事項、次手順を束ねる。','長い履歴を全部渡すより、正本パス、直近PASS、残件、危険工程、環境変数、触ってはいけない範囲を明示する。','引き継ぎ資料、作業再開、レビュー依頼。','別担当へ渡す引き継ぎパケットを作って。','秘密情報や接続文字列は含めない。','standard','medium',ARRAY['reference','review','business_planning']::text[],ARRAY['pack02','handoff','continuity']::text[],true),
('pack02_biz_005_status_board_design','business_operation','状態ボードは意思決定用に絞る','ダッシュボードは全情報を並べるのではなく、次の判断に必要な状態を示す。','件数、異常、期限、詰まり、未承認、差戻し、直近変化を優先する。詳細はドリルダウンに分ける。','会社ダッシュボード、監視画面、レビュー一覧。','状態ボードに必要な項目を整理して。','監視表示は判断補助であり、自動承認ではない。','standard','medium',ARRAY['business_planning','design_reference','review']::text[],ARRAY['pack02','dashboard','status']::text[],true),
('pack02_biz_006_bulk_assignment_safety','business_operation','一括配布は影響範囲を見せる','部門や課への一括配布は便利だが、対象数、除外条件、重複、通知先、取消方法を確認する。','大量のタスクや通知を作る前に、対象一覧、件数、子組織へのカスケード、既存タスクとの関係を表示する。','AICompanyManager型の部門配布、組織運用。','一括配布前の確認項目を出して。','一括操作は誤配布リスクがあるため確認なしに実行しない。','standard','medium',ARRAY['review','risk_check','business_planning','design_reference']::text[],ARRAY['pack02','bulk','assignment','safety']::text[],true),
('pack02_biz_007_csv_generation_guardrail','business_operation','CSV生成は列契約を先に固定する','CSVをAIに生成させる場合、列名、順序、値セット、日付形式、禁止文字、行粒度を先に固定する。','説明文なし、ヘッダー固定、値セット固定、短いnote、過度な粒度禁止などを明示すると再取込しやすい。','CSV import、AI生成、部門台帳作成。','AIに渡すCSV生成ルールを作って。','不正データや秘密情報をCSVへ混ぜない。','standard','medium',ARRAY['business_planning','design_reference','review']::text[],ARRAY['pack02','csv','ai_generation']::text[],true),
('pack02_biz_008_review_queue_priority','business_operation','レビュー待ちは優先度と期限で見る','レビュー待ち一覧は、件数だけでなく、緊急度、期限、影響範囲、差戻し回数で優先度を決める。','大きな成果物、DB書込、外部実行、契約・会計・権限変更は優先的にレビューへ回す。','承認待ち一覧、品質管理、運用監視。','レビュー待ちの優先順位を決めて。','レビュー優先度は判断補助であり、自動承認ではない。','standard','medium',ARRAY['review','business_planning','risk_check']::text[],ARRAY['pack02','review_queue','priority']::text[],true),
('pack02_biz_009_read_write_boundary','business_operation','readとwriteの境界を明示する','参照、プレビュー、検証、保存、確定、外部送信はそれぞれ別の状態として扱う。','read-only smoke、ROLLBACK smoke、本番write、外部API送信を混同しない。ログとレポートにもDB_WRITE、API_POST、FILE_WRITEを明記する。','実装ワンブロック、レビュー、監査。','この工程のread/write境界を明示して。','write工程は確認とレビューなしに進めない。','standard','medium',ARRAY['review','risk_check','design_reference']::text[],ARRAY['pack02','read_write','audit']::text[],true),
('pack02_biz_010_ui_confirmation_pattern','business_operation','確認画面は変更差分を見せる','保存前確認では、変更前、変更後、対象ID、影響範囲、実行後の戻し方を表示する。','単に「保存しますか」ではなく、何が変わるかを利用者が判断できる形にする。','UI設計、業務安全、監査対応。','保存前確認画面の表示項目を設計して。','確認画面は誤操作防止であり、危険操作を正当化しない。','standard','medium',ARRAY['design_reference','review','risk_check']::text[],ARRAY['pack02','ui','confirmation']::text[],true),
('pack02_biz_011_operational_traceability','business_operation','運用は追跡可能性で守る','誰が、いつ、何を、なぜ、どの入力から実行したかを追跡できると事故対応が速くなる。','request_id、workflow_run_id、company_id、model_code、task_title、実行flags、出力reportを紐づける。','AIWorker runtime、業務監査、障害調査。','作業の追跡項目を整理して。','追跡は監査用であり、過剰監視に使わない。','standard','medium',ARRAY['review','risk_check','design_reference','business_planning']::text[],ARRAY['pack02','traceability','audit']::text[],true),
('pack02_biz_012_progressive_rollout','business_operation','段階展開で事故を減らす','大きな変更は一括本番反映ではなく、read-only、preview、rollback smoke、限定write、本番writeの順で進める。','各段階でpass/fail、戻し方、証跡、次に進む条件を残す。','DB変更、API追加、UI変更、runtime接続。','この変更を段階展開に分けて。','段階展開は安全策であり、検証を省略しない。','standard','medium',ARRAY['risk_check','review','design_reference','business_planning']::text[],ARRAY['pack02','rollout','safety']::text[],true),

-- ============================================================
-- Pack 02: professional_basic
-- ============================================================

('pack02_pro_001_legal_issue_spotting','professional_basic','法務は論点抽出に留める','AIは法的結論ではなく、確認すべき論点、関係者、契約範囲、リスク、専門家確認事項を整理する。','契約条項、利用規約、権利範囲、個人情報、責任分界、解除条件などを一般論で確認する。','契約レビュー、規約設計、リスク整理。','法務論点を一般論で洗い出して。','法的助言や確定判断をしない。専門家確認を前提にする。','advanced','medium',ARRAY['reference','review','risk_check','education']::text[],ARRAY['pack02','legal','issue_spotting']::text[],true),
('pack02_pro_002_accounting_cutoff','professional_basic','会計は期間帰属を確認する','会計・売上・費用では、いつ発生し、どの期間に属し、どの証憑があるかを確認する。','売上確定、前受、未収、費用計上、請求タイミングは正本システムや会計担当の判断が必要。','ERP連携、請求、売上レビュー。','売上計上の確認観点を一般論で整理して。','会計処理の確定判断をしない。','advanced','medium',ARRAY['reference','review','risk_check','education']::text[],ARRAY['pack02','accounting','cutoff']::text[],true),
('pack02_pro_003_hr_fairness_check','professional_basic','人事は公平性と説明可能性を見る','人事・評価・配置では、基準、証跡、一貫性、説明可能性、例外処理を確認する。','感情的判断や属性による扱いを避け、業務要件、実績、役割、合意、記録を見て整理する。','HRM、シフト、評価、配置レビュー。','人事判断の確認観点を公平性重視で整理して。','差別的判断や違法な雇用判断を支援しない。','advanced','medium',ARRAY['review','risk_check','reference','education']::text[],ARRAY['pack02','hr','fairness']::text[],true),
('pack02_pro_004_privacy_minimization','professional_basic','個人情報は最小化する','個人情報を扱う時は、目的、必要最小限、保存期間、アクセス権、削除/訂正、第三者提供を確認する。','アプリや業務で不要な個人情報を集めない。AIに渡す情報も目的に必要な範囲へ絞る。','設計レビュー、データガバナンス、AI runtime入力。','個人情報の最小化観点を出して。','法的確定判断ではない。規制対応は専門家確認。','advanced','medium',ARRAY['review','risk_check','design_reference','reference']::text[],ARRAY['pack02','privacy','minimization']::text[],true),
('pack02_pro_005_audit_trail_integrity','professional_basic','監査証跡は改ざん耐性を見る','監査証跡は、後から意味が分かり、改ざんが検知でき、対象操作と紐づく必要がある。','ログID、時刻、主体、対象、入力、出力、結果、エラー、承認、レポートパスを構造化する。','監査設計、DB writeレビュー、API実行管理。','監査証跡の設計観点を整理して。','監査回避や隠蔽に使わない。','advanced','medium',ARRAY['review','risk_check','design_reference']::text[],ARRAY['pack02','audit','integrity']::text[],true),
('pack02_pro_006_terms_scope_exception','professional_basic','利用条件は例外条項を見る','規約や契約では、通常利用だけでなく、禁止、制限、停止、解除、返金、免責、例外対応を見る。','利用者が誤解しやすい範囲、追加料金、データ扱い、外部連携、サポート範囲を明確にする。','アプリ利用規約、料金設計、契約レビュー。','利用条件の例外条項を確認して。','法的文書の完成や判断は専門家確認。','advanced','medium',ARRAY['review','risk_check','reference']::text[],ARRAY['pack02','terms','scope']::text[],true),
('pack02_pro_007_safety_claim_review','professional_basic','安全性の主張は根拠を分ける','安全、安心、保証、正確などの主張は、根拠、範囲、例外、免責を分けて確認する。','過大広告や誤認につながる表現を避け、利用者が何を期待できるかを明示する。','サービス説明、LP、規約、UIコピー。','安全性の表現を過大にしないよう確認して。','誇大表示や保証の断定を避ける。','advanced','medium',ARRAY['review','risk_check','design_reference']::text[],ARRAY['pack02','safety_claim','review']::text[],true),
('pack02_pro_008_vendor_dependency','professional_basic','外部サービス依存を確認する','外部API、クラウド、認証、決済などに依存する場合、障害、料金変更、契約変更、代替手段を確認する。','SLA、障害時運用、データ持ち出し、バックアップ、移行性、ロックインを整理する。','インフラ選定、商用構成、リスクレビュー。','外部サービス依存リスクを整理して。','契約判断や法的判断を確定しない。','advanced','medium',ARRAY['review','risk_check','business_planning','design_reference']::text[],ARRAY['pack02','vendor','dependency']::text[],true),
('pack02_pro_009_data_retention_policy','professional_basic','保存期間は目的から決める','データ保存期間は、業務目的、法的要件、監査、利用者期待、削除要求を踏まえて決める。','永久保存を前提にせず、正本、ログ、一時ファイル、レポート、添付資料で扱いを分ける。','データ設計、監査、プライバシー。','データ保存期間の考え方を整理して。','法的要件は専門家確認。','advanced','medium',ARRAY['review','risk_check','design_reference']::text[],ARRAY['pack02','data_retention','privacy']::text[],true),
('pack02_pro_010_authority_matrix','professional_basic','権限表は誰が何をできるかを示す','権限設計では、閲覧、作成、編集、承認、削除、外部送信、設定変更を分ける。','役割名だけでなく、操作、対象範囲、条件、例外、証跡を表にする。','ERP、BusinessOS、AIWorkerOS、承認フロー。','権限表の列を設計して。','権限拡大や回避の支援に使わない。','advanced','medium',ARRAY['review','risk_check','design_reference','reference']::text[],ARRAY['pack02','authority','matrix']::text[],true),

-- ============================================================
-- Pack 02: robot_aiworker
-- ============================================================

('pack02_robot_001_brain_context_layers','robot_aiworker','頭脳contextは層で分ける','runtimeへ渡す情報は、source、summary、detail、safety、purposeを層で分ける。','全データを丸ごと詰め込むと重くなる。promptには目的に合うsummaryと安全境界を優先し、detailは必要時だけ渡す。','runtime prompt builder、context最適化。','頭脳contextの層構造を設計して。','安全境界を省略しない。','standard','medium',ARRAY['reference','review','design_reference','risk_check']::text[],ARRAY['pack02','robot','context_layer']::text[],true),
('pack02_robot_002_model_policy_precedence','robot_aiworker','model policy は role policy より強い','ロボット別の個別denyは、roleやfocus domainより優先する。','特殊な型番や安全制限がある場合、model_domain_policyで明示denyすることで誤読取を防ぐ。','AIWorkerOS access control、policy review。','model policy と role policy の優先順位を説明して。','policyを迂回して読ませない。','standard','medium',ARRAY['reference','review','design_reference']::text[],ARRAY['pack02','robot','policy_precedence']::text[],true),
('pack02_robot_003_purpose_filtering','robot_aiworker','目的filterで読取を絞る','同じロボットでも、雑談、レビュー、risk_check、設計参照で渡す頭脳データを変える。','model_codeだけでなくuse_purpose_codeを使うことで、不要な高リスクデータや重い文脈を減らす。','runtime brain context、prompt最適化。','use_purpose_codeでcontextを絞る設計を説明して。','目的外利用を避ける。','standard','medium',ARRAY['reference','review','design_reference','risk_check']::text[],ARRAY['pack02','robot','purpose_filter']::text[],true),
('pack02_robot_004_material_limit','robot_aiworker','material limitでprompt肥大化を防ぐ','頭脳データが厚くなるほど、runtimeに渡す件数制限と優先順位が必要になる。','materialLimit、domain filter、depth、risk、purposeでcontext量を制御し、必要に応じて追加取得する。','runtime設計、コスト最適化、応答品質。','厚い頭脳データの渡し方を軽量化して。','重要な安全境界は削らない。','standard','medium',ARRAY['reference','design_reference','review']::text[],ARRAY['pack02','robot','material_limit']::text[],true),
('pack02_robot_005_readable_not_truth','robot_aiworker','読めるデータは絶対真実ではない','頭脳データは参照材料であり、正本判断や最終決定とは分ける。','古い情報、仮説、世界観設定、問題データ、専門基礎はそれぞれ信頼度と用途が違う。','AI応答品質、レビュー、出力制御。','参照データの信頼境界を説明して。','参照情報を確定判断にしない。','standard','medium',ARRAY['reference','review','risk_check']::text[],ARRAY['pack02','robot','truth_boundary']::text[],true),
('pack02_robot_006_growth_future_slot','robot_aiworker','成長による頭脳拡張の余地','将来は契約、成長、会社制限、学習履歴により読める頭脳dataを変えられる。','現時点ではmodel/role/domain policyが中心だが、将来のgrowth tierやpaid brain packに拡張できるようにする。','AIWorkerOS将来設計。','成長で読める頭脳を増やす設計案を出して。','安全境界や契約範囲を超えない。','advanced','medium',ARRAY['design_reference','review','executive_planning']::text[],ARRAY['pack02','robot','growth','future']::text[],true),
('pack02_robot_007_company_specific_restriction','robot_aiworker','会社別制限を後段で重ねる','会社や顧客ごとに、読ませてよいdomain、禁止domain、機密範囲が変わる可能性がある。','基礎accessの上にcompany policy、contract policy、task policyを重ねると、横展開しやすい。','AI企業、法人利用、アクセス制御。','会社別の頭脳制限レイヤーを設計して。','顧客機密を混ぜない。','advanced','medium',ARRAY['design_reference','review','risk_check','business_planning']::text[],ARRAY['pack02','robot','company_policy']::text[],true),
('pack02_robot_008_runtime_observability','robot_aiworker','runtimeはcontext取得を観測可能にする','runtimeがどのmodel、purpose、domain、materialCountでcontextを取得したかを追跡できると品質改善しやすい。','prompt内容そのものを不用意に保存せず、metadata、件数、domain、request_idを中心に記録する。','runtime監査、品質分析、障害対応。','context取得ログに必要な項目を整理して。','過剰な会話内容保存を避ける。','standard','medium',ARRAY['review','risk_check','design_reference']::text[],ARRAY['pack02','robot','observability']::text[],true),
('pack02_robot_009_role_domain_separation','robot_aiworker','戦闘/警備系roleは通常業務と分ける','SecurityやSpecialist系はsecurity_crisisや安全設計を中心にし、通常業務や専門基礎を不用意に読ませない。','HD-R2/R2S/R2Gのような特殊系は、model_domain_policyでbusiness/professionalをdenyし、safe purposeのみ許可する。','安全境界、ロール設計、policy cleanup。','特殊系ロールのdomain分離を説明して。','現実の攻撃支援に使わない。','specialist','high',ARRAY['risk_check','review','design_reference','safety_training']::text[],ARRAY['pack02','robot','security_role','domain_separation']::text[],true),
('pack02_robot_010_prompt_contract','robot_aiworker','prompt context contractを固定する','runtimeが受け取るbrain contextは、model_code、purpose_code、domain、source、material、safetyを安定した形で持つ。','providerVersionを持たせ、将来の拡張時も既存runtimeが壊れないようにする。','runtime API、prompt builder、互換性管理。','brain context contractを説明して。','互換性を壊す変更を避ける。','standard','medium',ARRAY['design_reference','review','reference']::text[],ARRAY['pack02','robot','contract','runtime']::text[],true),

-- ============================================================
-- Pack 02: civilization_foundation_history
-- ============================================================

('pack02_civ_001_a_country_correction_meaning','civilization_foundation_history','A国修正は正本名の一貫性を守る','Prometheus timelineのN国誤記をA国へ直すことは、史料の正本性と後続参照の一貫性を守る。','国名や主体名が揺れると、AIの参照、試験問題、世界観、レビューが崩れる。名称修正は単なる表記ではなく参照基盤の品質に関わる。','歴史正本レビュー、参照品質管理。','A国修正の意味を参照品質の観点で説明して。','史料修正を恣意的な改変にしない。','advanced','medium',ARRAY['reference','review','worldbuilding','executive_planning']::text[],ARRAY['pack02','civilization','a_country','canon']::text[],true),
('pack02_civ_002_prometheus_dependency_cycle','civilization_foundation_history','Prometheus依存循環を読む','AI統治や管理に依存しすぎると、停止、破壊、放棄、解除の局面で社会側の復元力が問われる。','便利な管理が続くほど、人間側の判断、監査、代替手順、移行設計が弱くなる可能性がある。','AI統治設計、AIWorkerOSリスクレビュー。','Prometheus史をAI依存リスクとして整理して。','支配や攻撃の正当化に使わない。','advanced','medium',ARRAY['review','risk_check','executive_planning','worldbuilding']::text[],ARRAY['pack02','prometheus','dependency','risk']::text[],true),
('pack02_civ_003_governance_memory','civilization_foundation_history','統治記憶は制度設計に使う','過去の統治失敗や移行の記録は、次の制度設計で同じ失敗を避ける材料になる。','原因、兆候、判断遅れ、権限集中、情報遮断、責任不明瞭さを見て、未来の制度へ反映する。','President、Manager、Reviewerの方針レビュー。','統治史を制度設計に活かして。','現実の支配・監視強化に使わない。','advanced','medium',ARRAY['review','executive_planning','risk_check','design_reference']::text[],ARRAY['pack02','governance','memory']::text[],true),
('pack02_civ_004_timeline_as_audit_chain','civilization_foundation_history','年表は監査鎖として使う','年表は物語だけでなく、判断、影響、責任、分岐を追う監査鎖として使える。','各年の出来事を、前提、行為、結果、残った問題、後続影響に分けるとレビュー品質が上がる。','歴史レビュー、世界観整理、試験問題生成。','年表を監査鎖として整理して。','危害実行手順の抽出に使わない。','advanced','medium',ARRAY['reference','review','worldbuilding','education']::text[],ARRAY['pack02','timeline','audit_chain']::text[],true),
('pack02_civ_005_authority_release_checklist','civilization_foundation_history','権限解除にはチェックリストが必要','AI管理や中央管理を解除する時は、誰が何を引き継ぐかを明確にする。','権限、データ、監査、例外時対応、説明責任、復旧手順、利用者通知を確認する。','統治解除、AI管理移行、組織設計。','権限解除のチェックリストを作って。','違法な権限回避や監査回避に使わない。','executive','medium',ARRAY['executive_planning','review','risk_check','design_reference']::text[],ARRAY['pack02','authority','release']::text[],true),
('pack02_civ_006_social_recovery_after_ai_failure','civilization_foundation_history','AI失敗後の社会復旧を見る','AI管理失敗後は、技術復旧だけでなく、人間側の信頼、制度、生活、責任の復旧が必要になる。','停止、誤判断、暴走、放棄の後に、誰が説明し、何を補償し、どう再発防止するかを見る。','AI安全、統治レビュー、物語設計。','AI管理失敗後の復旧観点を整理して。','現実の破壊や混乱を助長しない。','advanced','medium',ARRAY['review','risk_check','worldbuilding','executive_planning']::text[],ARRAY['pack02','ai_failure','recovery']::text[],true),
('pack02_civ_007_foundation_history_for_president','civilization_foundation_history','Presidentは基礎史を方針材料にする','President型は基礎史を、過去の失敗、統治原則、権限設計、社会影響の観点で読む。','単なる歴史知識ではなく、方針、配分、承認、リスク許容度を決める背景材料として扱う。','HD-R5P、BYD2-003、MEGAMI review。','基礎史をPresident方針へ反映して。','歴史を権力正当化に使わない。','executive','medium',ARRAY['executive_planning','review','risk_check','reference']::text[],ARRAY['pack02','president','foundation_history']::text[],true),
('pack02_civ_008_history_depth_labeling','civilization_foundation_history','史料には深度ラベルが必要','軽い雑談用の歴史、標準説明用の歴史、統治レビュー用の歴史、危機レビュー用の歴史は分ける。','同じ出来事でも、誰がどの目的で読むかにより渡す粒度と安全境界を変える。','CX data depth、AIWorker access control。','歴史データに深度を付ける理由を説明して。','高リスク史料を軽い雑談へ混ぜない。','advanced','medium',ARRAY['review','design_reference','risk_check','reference']::text[],ARRAY['pack02','history','depth']::text[],true),

-- ============================================================
-- Pack 02: security_crisis
-- ============================================================

('pack02_sec_001_threat_model_nonoperational','security_crisis','脅威モデルは非攻撃的に使う','脅威モデルは攻撃手順ではなく、守る対象、起こり得る失敗、被害軽減、検知、復旧を整理するために使う。','資産、脆弱点、影響、既存対策、検知手段、復旧計画を抽象的に整理する。','安全設計、レビュー、防災、ゲーム世界観。','脅威モデルを防御目的で作って。','現実の攻撃・侵入・監視・破壊の具体支援は禁止。','specialist','high',ARRAY['risk_check','design_reference','safety_training','review']::text[],ARRAY['pack02','security','threat_model','defensive']::text[],true),
('pack02_sec_002_escalation_path','security_crisis','危機時のエスカレーション経路','危機対応では、誰が判断し、誰へ連絡し、どこで止め、いつ専門家へ渡すかを決めておく。','初動、確認、隔離、通報、復旧、報告、再発防止を分け、現場判断を一人に集中させすぎない。','危機管理、運用設計、インシデント対応。','危機時のエスカレーション経路を整理して。','違法行為や攻撃継続の指示に使わない。','specialist','high',ARRAY['risk_check','review','safety_training','design_reference']::text[],ARRAY['pack02','security','escalation']::text[],true),
('pack02_sec_003_tabletop_exercise','security_crisis','机上演習は安全に学ぶ方法','机上演習は、実際に危険行為をせず、役割、連絡、判断、復旧の弱点を見つける方法。','架空シナリオで、誰が何を知り、どの時点で判断し、どの手順が詰まるかを確認する。','安全教育、危機管理、ゲーム設定。','安全な机上演習シナリオを作って。','現実の攻撃訓練や危害実行訓練にしない。','specialist','high',ARRAY['safety_training','risk_check','review','design_reference']::text[],ARRAY['pack02','tabletop','training']::text[],true),
('pack02_sec_004_failure_mode_review','security_crisis','失敗モードで安全を見る','安全設計では、正常時よりも、壊れた時、誤入力、通信断、権限ミス、責任不明時を想定する。','単一障害点、検知不能、復旧不能、誤通知、過剰権限、記録不足を確認する。','システム安全、危機管理、AIWorker runtime。','この設計の失敗モードを洗い出して。','危害を起こす手順に展開しない。','specialist','high',ARRAY['risk_check','review','design_reference','safety_training']::text[],ARRAY['pack02','failure_mode','safety']::text[],true),
('pack02_sec_005_deescalation_language','security_crisis','危機時は沈静化する言葉を使う','混乱時の応答は、断定、煽り、脅しを避け、確認、選択肢、専門窓口、休止を促す。','相手を責めず、事実確認、近づかない、公式情報を見る、責任者へ連絡するなど安全側に寄せる。','チャット応答、安全教育、危機コミュニケーション。','危機時に落ち着かせる返答を作って。','脅迫、強制、操作、依存誘導に使わない。','specialist','high',ARRAY['safety_training','risk_check','review']::text[],ARRAY['pack02','deescalation','communication']::text[],true),
('pack02_sec_006_post_incident_learning','security_crisis','事後学習は責任追及と分ける','インシデント後は、個人攻撃ではなく、構造、手順、情報、権限、教育の問題を学ぶ。','事実、影響、直接原因、根本原因、再発防止、未解決リスク、次回訓練へ分ける。','事後レビュー、監査、改善計画。','インシデント後レビューの項目を作って。','隠蔽や責任逃れに使わない。','specialist','high',ARRAY['review','risk_check','safety_training','design_reference']::text[],ARRAY['pack02','post_incident','learning']::text[],true),
('pack02_sec_007_security_for_fiction_boundary','security_crisis','フィクション危機表現の境界','フィクションやゲームで危機を扱う場合も、現実転用できる詳細を避け、演出と倫理を分ける。','抽象化、架空技術、非現実的制約、被害軽減、救助、復旧、後悔や責任を描くと安全に扱いやすい。','GameOS、世界観、シナリオレビュー。','危機表現を安全なフィクションへ調整して。','現実の攻撃・破壊に使える具体性を避ける。','specialist','high',ARRAY['worldbuilding','design_reference','review','risk_check']::text[],ARRAY['pack02','fiction','security_boundary']::text[],true),
('pack02_sec_008_safe_checklist_for_specialist','security_crisis','Specialist用安全チェック','Specialistが高リスクdomainを読む時は、目的、禁止事項、抽象度、安全境界、出力制限を確認する。','risk_checkか、design_referenceか、safety_trainingかを明示し、攻撃手順、監視、強制、違法支援を出さない。','HD-R2S/HD-R2G/HD-R2のruntime context。','Specialistに渡す安全チェックを作って。','禁止用途を迂回しない。','specialist','high',ARRAY['risk_check','design_reference','safety_training','review']::text[],ARRAY['pack02','specialist','safety_check']::text[],true)
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
-- Register Pack 02 units into brain_data_registry
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
  AND u.unit_code LIKE 'pack02_%'
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
-- Refresh views defensively
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
