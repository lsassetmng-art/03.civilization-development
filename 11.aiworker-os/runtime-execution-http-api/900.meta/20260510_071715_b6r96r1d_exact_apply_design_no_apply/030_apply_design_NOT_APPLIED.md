# B6R96R1D Apply設計案 NOT APPLIED

## 1. 現時点の結論

大きな新tableをいきなり追加しない。
既存構造を優先して使う。

## 2. AIWorkerOS側

### 採用候補

- aiworker.business_support_task_domain
  - 仕事内容カテゴリの既存置き場候補
  - programming / db_analysis / historical_reference / military-security系domainを追加する候補

- aiworker.worker_domain_proficiency
  - Workerの仕事内容別熟練度の既存置き場候補
  - Worker個体別の経験/熟練度があるならここを使う

- aiworker.worker_role_proficiency
  - role別の得意不得意の既存置き場候補
  - President/Manager/Leader/Worker/R2系role差分に使う

- aiworker.robot_model_capability_profile / worker_model_capability_profile
  - 機種別の基本能力差分に使う

- aiworker.beyond_model_quality_profile / megami_model_profile / robot_model_personality_profile
  - シリーズ/機種固有差分の補助根拠として使う

- aiworker.robot_brain_model_domain_policy / robot_brain_role_policy / robot_breadth_domain_runtime_policy
  - CX22073JW参照深度/広さ制御に使う

### 避けること

- robot_worker_task_profile巨大tableの即新設
- 既存worker_domain_proficiencyと重複する管理
- HD-R2軍事系を通常programming等に混ぜること

## 3. PersonaOS側

### 採用候補

- personaos.persona_parameter_value
  - Personaの可変パラメータ値

- personaos.persona_parameter_state
  - Personaの現在状態

- personaos.growth_axis
  - 成長軸

- personaos.growth_core_state / persona_growth_state
  - 安定度、関係性、成長状態

- personaos.memory_state / memory_events
  - 記憶/経験/行動傾向

### 方針

Personaはロボットではないため、model_codeでは扱わない。
persona_idとparameter snapshotで仕事適性を算出する。
固定profileではなく、derived viewまたはsnapshot cacheを使う。

## 4. 軍事/警備系domain

追加候補:
- security_crisis_response
- fictional_combat_design
- game_tactical_balance
- defense_planning_non_harmful
- threat_modeling_safe
- combat_lore_reference

安全境界:
- 現実の危害実行支援は禁止
- 武器製造、攻撃手順、実在対象への襲撃支援は禁止
- 防災、避難、警備配置、フィクション、ゲーム、ロア、リスク想定、防御策整理は可

## 5. 次のapply SQL設計

B6R96R1Eで作るもの:
- 既存列に合わせたINSERT案
- NOT APPLIED
- 佐藤レビュー用
- DB writeはまだしない

B6R96R1F:
- 佐藤レビュー後、明示GOがあればapply
