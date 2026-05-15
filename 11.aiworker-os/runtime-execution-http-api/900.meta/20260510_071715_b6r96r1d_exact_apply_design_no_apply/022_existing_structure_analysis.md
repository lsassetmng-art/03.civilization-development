# B6R96R1D 既存構造分析

## 1. 判定

### common_task_domain
- decision: use_existing_aiworker_business_support_task_domain_first
- reason: 既にaiworker.business_support_task_domainが存在するため、仕事内容カテゴリは新規catalog乱立より既存domainへ追加する案を優先する。

### aiworker_worker_task_quality
- decision: use_existing_worker_domain_proficiency_first
- reason: worker_domain_proficiencyが存在するため、Worker仕事品質はdomain proficiencyとして統合する案を優先する。

### personaos_task_profile
- decision: derive_from_persona_parameter_and_growth
- reason: persona_parameter_valueとgrowth_axisが存在するため、Personaは固定task profileではなく可変パラメータから算出するview/snapshot案を優先する。

### cx_brain_access
- decision: use_existing_robot_brain_policy_tables
- reason: robot_brain_model_domain_policy / robot_brain_role_policyがあるため、CX参照制御は既存brain policyへ寄せる。

### military_security_profile
- decision: add_separated_safe_task_domains
- reason: HD-R2系は通常仕事ではなく、軍事/警備/危機対応/フィクション/ゲーム系の安全境界付きdomainとして分ける。

## 2. AIWorkerOS候補
- business_support_task_domain exists: true
- worker_domain_proficiency exists: true
- worker_role_proficiency exists: true
- robot_model_capability_profile exists: true
- worker_model_capability_profile exists: true
- robot_brain_model_domain_policy exists: true
- robot_brain_role_policy exists: true

## 3. PersonaOS候補
- persona_parameter_state exists: true
- persona_parameter_value exists: true
- growth_axis exists: true
- growth_core_state exists: true
- memory_state exists: true

## 4. 推奨
- AIWorkerOSは既存domain/proficiency/brain policyを優先する。
- PersonaOSはpersona_parameter_value/growth_axis/memory_stateから算出する。
- 大きな新table追加は避け、必要ならoverlay/snapshotに限定する。
- HD-R2軍事/警備系は通常仕事と分け、安全境界付きdomainとして追加する。
