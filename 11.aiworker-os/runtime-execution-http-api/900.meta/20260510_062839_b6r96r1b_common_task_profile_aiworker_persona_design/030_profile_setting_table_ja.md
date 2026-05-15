# 仕事内容プロファイル 設定内容 日本語表

## 1. 共通カテゴリ

| 分類 | コード | 日本語名 | 説明 |
|---|---|---|---|
| 通常 | programming | プログラム作成 | コード、パッチ、テスト、実装レポート |
| 通常 | db_analysis | DB調査 | DB定義、view、function、RLSのread-only確認 |
| 通常 | document_writing | 文書作成 | 設計書、仕様書、報告書、引き継ぎ |
| 通常 | research | 調査 | 情報整理、比較、出典整理 |
| 通常 | historical_reference | 歴史資料作成 | 歴史、人物、制度、時系列、史料注意 |
| 通常 | ui_ux | UI/UX作成 | 画面構成、文言、操作導線 |
| 通常 | data_formatting | データ整形 | CSV、JSON、Markdown、台帳 |
| 通常 | review_audit | レビュー/監査 | 設計、実装、DB、成果物のレビュー |
| 通常 | customer_communication | 接客/コミュニケーション | メール、チャット文、接客文 |
| 通常 | creative_planning | 企画/アイデア出し | 企画、構想、ロードマップ |
| 通常 | operations_execution | 運用作業 | 手順実行、状態確認、運用レポート |
| 通常 | cx_reference_authoring | CX参照データ作成 | CX投入用の知識データ構造化 |
| 軍事/安全 | security_crisis_response | 警備/危機対応 | 防災、避難、警備、危機対応 |
| 軍事/安全 | fictional_combat_design | フィクション戦闘設計 | 物語、ゲーム、世界観上の戦闘設定 |
| 軍事/安全 | game_tactical_balance | ゲーム戦術/バランス | ゲーム内ユニット、戦闘バランス |
| 軍事/安全 | defense_planning_non_harmful | 防衛計画/非加害設計 | 守る側の配置、通報、避難導線 |
| 軍事/安全 | threat_modeling_safe | 安全な脅威モデリング | 危険想定、防御策、リスク整理 |
| 軍事/安全 | combat_lore_reference | 戦闘/軍事ロア参照 | 架空世界、歴史、戦術用語、設定資料 |

## 2. AIWorkerOS ロボット別設定

| ロボット | 主な得意仕事 | 注意点 |
|---|---|---|
| HD-R1 Helper | 補助、整形、秘書、運用補助 | 高度判断は弱い |
| HD-R1C Friend | 雑談、軽量会話、相槌、会話継続 | 業務正本判断は不可 |
| HD-R1A Lover | 親密会話、接客表現、キャラ演出 | 依存誘導、監視、脅しは禁止 |
| HD-R2 Battler | 警備、危機対応、フィクション戦闘、ゲーム戦術 | 現実の危害実行支援は禁止 |
| HD-R2S Sniper | 精密確認、安全な脅威モデリング、対象特化レビュー | 狭く深い確認向け |
| HD-R2G General | 広域警備、危機対応、統制、配置整理 | 広域整理向け |
| HD-R2T-0 Origin | 上位統括、特殊全体設計、例外判断 | 特権的だが安全境界は守る |
| HD-R3 Worker | 汎用実務、運用、実装、文書 | 堅実寄り |
| HD-R4 Leader | 作業分解、Worker指示、受入条件 | 実行ではなく分解/管理向け |
| HD-R5 Manager | 大項目分解、部門配分、進捗統制 | 部長/Manager向け |
| HD-R5P President | 方針、GO/STOP、優先順位、会社判断 | 社長/President向け |
| BYD1-001 | 単純作業、単純コード、整形 | 複雑実装は不向き |
| BYD1-002 | 反復作業、抜け漏れ補完 | 大規模設計は弱い |
| BYD1-003 | 複雑実装、DB調査、レビュー、設計文書 | 実務高性能 |
| BYD2-001 | 基本進行、形式チェック | Leader系 |
| BYD2-002 | 品質レビュー、整合性確認 | Leader/Manager系 |
| BYD2-003 | 統合設計、リスク判断、納品品質統括 | 高性能Leader/Manager系 |
| MG-NORN-001 ウルズ | 歴史、過去実績、既存設計、史料注意 | 過去重視 |
| MG-NORN-002 ヴェルザンディ | 現在状況、ログ、現場確認、運用確認 | 現在重視 |
| MG-NORN-003 スクルド | 未来設計、ロードマップ、企画 | 未来重視 |
| LoVerS Friend系 | 接客文、チャット、UI文言 | DB/実装は不向き |
| LoVerS Lover系 | 親密表現、キャラ企画、接客文 | 安全境界必須 |

## 3. PersonaOS パラメータ設定

| パラメータ | 日本語名 | 影響する仕事 |
|---|---|---|
| logic_score | 論理性 | programming, db_analysis |
| creativity_score | 創造性 | creative_planning, ui_ux |
| empathy_score | 共感性 | customer_communication |
| discipline_score | 規律性 | operations_execution, data_formatting |
| curiosity_score | 探究心 | research, historical_reference |
| source_caution_score | 出典注意力 | research, historical_reference, cx_reference_authoring |
| risk_sensitivity_score | リスク感度 | review_audit, db_analysis, security_crisis_response |
| writing_score | 文章力 | document_writing, research |
| memory_depth_score | 記憶/経験の深さ | 全般 |
| relationship_influence_score | 関係性影響度 | communication, support |
| current_focus_score | 現在集中度 | programming, db_analysis |
| current_stability_score | 現在安定度 | operations_execution, review_audit |
| experience_programming_score | プログラム経験 | programming |
| experience_research_score | 調査経験 | research |
| experience_communication_score | 会話経験 | customer_communication |
| growth_rate_by_task_type | 仕事別成長率 | 全task_type |

## 4. AIWorkerOSとPersonaOSの違い

| 項目 | AIWorkerOS | PersonaOS |
|---|---|---|
| 主体 | ロボット | Persona |
| 差分 | 機種、シリーズ、特性 | 性格、経験、記憶、状態、成長 |
| 変化 | 比較的固定 | 変化する |
| プロファイル | robot_worker_task_profile | persona_task_profile |
| context | robot_context | persona_context |
| 生成根拠 | robot_trait_basis | persona_parameter_basis |
| CX/知識参照 | ロボットbrain権限 | Persona知識/記憶/権限 |
