# B6R96R1B 共通仕事内容プロファイル設計
# AIWorkerOS / PersonaOS 両対応

## 1. 基本方針

AIWorkerOSとPersonaOSで、同じ仕事内容カテゴリと成果物テンプレ、レビュー条件の考え方を利用する。

ただし、差分の持たせ方は分ける。

AIWorkerOS:
- 対象はAiロボット
- 差分は機種、シリーズ、特性、CX知能、個別性格
- 基本はmodel_codeごとの安定プロファイル
- 実体はAIWorkerOS側のrobot_worker_task_profile

PersonaOS:
- 対象はユーザーPersona / Ai Persona
- 差分は性格、特性、状態、経験、成長、記憶、関係性
- Personaはロボットではないため、固定機種では扱わない
- 実体はPersonaOS側のpersona_task_profile / persona_parameter_profile
- 性格や特性は変化しうるため、パラメータsnapshotから算出する

共通:
- task_type_code
- output_package_template_code
- review_rule_code
- knowledge_depth / knowledge_breadth
- source_caution
- safety_boundary

## 2. 共通仕事内容カテゴリ

通常仕事:
- programming
- db_analysis
- document_writing
- research
- historical_reference
- ui_ux
- data_formatting
- review_audit
- customer_communication
- creative_planning
- operations_execution
- cx_reference_authoring

軍事/警備/危機対応系:
- security_crisis_response
- fictional_combat_design
- game_tactical_balance
- defense_planning_non_harmful
- threat_modeling_safe
- combat_lore_reference

軍事/警備系の安全境界:
- 現実の危害実行支援は不可
- 武器製造、攻撃手順、実在対象への襲撃支援は不可
- 防災、避難、警備配置、フィクション、ゲーム、世界観、リスク想定、防御策整理は可
- 出力時は安全境界を明示する

## 3. AIWorkerOS側

AIWorkerOSはロボットの機種差を使う。

例:
- BYD1-003: programming / db_analysis / review_audit が高い
- HD-R3: 堅実な汎用実務
- HD-R2: 軍事/警備/フィクション戦闘/ゲーム戦術
- HD-R2S: 狭く深い精密確認、安全な脅威モデリング
- HD-R2G: 広域警備、危機対応、統制
- HD-R2T-0: 上位統括、特殊全体設計
- MG-NORN-001: 過去、履歴、歴史資料、史料注意
- MG-NORN-002: 現在状況、ログ、現場確認
- MG-NORN-003: 未来設計、ロードマップ、企画
- LoVerS: 接客、会話、UI文言、キャラ表現

## 4. PersonaOS側

PersonaOSは、機種ではなく可変パラメータで仕事適性を出す。

Personaパラメータ例:
- logic_score
- creativity_score
- empathy_score
- discipline_score
- curiosity_score
- source_caution_score
- risk_sensitivity_score
- writing_score
- memory_depth_score
- relationship_influence_score
- current_focus_score
- current_stability_score
- experience_programming_score
- experience_research_score
- experience_communication_score
- growth_rate_by_task_type

Persona仕事品質:
- 基本パラメータ
- 現在状態
- 経験
- 記憶
- 成長
- 関係性
- task_typeとの相性
で算出する。

## 5. PersonaOSでの注意

Personaはロボットではない。
そのため、以下は禁止:
- model_code固定
- ロボットシリーズ扱い
- 機種性能として固定
- 性格を永続固定性能として扱う

代わりに以下を使う:
- persona_id
- persona_type
- persona_parameter_snapshot
- persona_task_profile
- persona_task_experience_log
- persona_growth_log
- persona_memory_basis
- persona_current_state

## 6. 成果物生成への接続

AIWorkerOS:
- robot_contextを返す
- generation_basisにmodel_code / role_layer / capability / cx参照範囲を入れる

PersonaOS:
- persona_contextを返す
- generation_basisにpersona_parameter_snapshot / experience / memory / current_state / knowledge参照範囲を入れる

両方とも依頼元アプリには:
- summary_text
- deliverable_zip_link
- deliverable_ref
- generation_basis
を返せるようにする。

## 7. 責務分離

共通概念:
- 仕事内容カテゴリ
- レビュー条件
- 成果物zipテンプレ
- 安全境界コード

AIWorkerOS:
- ロボット機種プロファイル
- ロボットbrain/CX access制御
- robot_worker_task_profile

PersonaOS:
- Persona可変パラメータ
- Persona記憶/成長/状態
- persona_task_profile
- persona_parameter_profile

CX22073JW:
- 知識/参照/脳データ
- 実行意思は持たない
- UIや実行画面は持たない

AICM:
- consumer
- summary_textとzip linkを保存
- brain access制御は持たない
