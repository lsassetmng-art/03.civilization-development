# B6R96R1C 次apply設計メモ NOT APPLIED

## 方針

現時点ではapplyしない。

## apply案の方向

### AIWorkerOS

第一候補:
- aiworker.business_support_task_domain に仕事内容カテゴリを追加
- aiworker.worker_domain_proficiency にmodel/workerごとの熟練度を追加できるか確認
- aiworker.worker_role_proficiency にrole別の得意不得意を追加できるか確認
- aiworker.robot_brain_model_domain_policy / role_policy にCX参照深度/広さを寄せる

第二候補:
- 不足する場合のみ aiworker.robot_worker_task_profile_summary または task_profile_overlay を追加

避ける:
- 既存worker_domain_proficiencyと重複する巨大table新設

### PersonaOS

第一候補:
- personaos.persona_parameter_value / growth_axis に仕事適性用axisを追加できるか確認
- personaos上にderived viewを作る
- persona_task_profileは固定正本ではなく、算出結果viewまたはsnapshotにする

第二候補:
- personaos.persona_task_profile_snapshot を追加し、現在値cacheとして扱う

避ける:
- Personaをロボットmodel_codeで扱うこと
- 性格や特性を固定値として扱うこと

## 軍事/警備系

追加候補task/domain:
- security_crisis_response
- fictional_combat_design
- game_tactical_balance
- defense_planning_non_harmful
- threat_modeling_safe
- combat_lore_reference

安全境界:
- real_world_harm_execution_support_forbidden
- defensive_only
- fictional_or_game_allowed
- emergency_prevention_allowed
