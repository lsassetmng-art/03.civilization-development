# B6R96R1E Column Exact SQL Proposal Decision

## 1. Task domain proposal
- table: aiworker.business_support_task_domain
- generated insert proposals: 0
- manual review required: 18

## 2. AIWorkerOS
- 既存table優先。worker_domain_proficiency / worker_role_proficiency / robot_model_capability_profile / robot_brain_* を使う。
- 巨大なrobot_worker_task_profile新設はまだしない。
- worker_domain_proficiencyがworker_id専用なら、model/domain overlayの小tableを検討する。

## 3. PersonaOS
- Personaはロボットではない。model_codeを使わない。
- persona_parameter_value / growth_axis / memory_stateからderived viewで仕事適性を算出する。
- snapshotが必要な場合だけcache tableを検討する。

## 4. Military / security
- HD-R2系向けに軍事/警備/危機対応系task domainを分離する。
- 現実の危害実行支援、武器製造、攻撃手順、実在対象への襲撃支援は禁止。
- 防災、避難、警備配置、フィクション、ゲーム、ロア、防御策整理は可。

## 5. Decisions
- task_domain_catalog: manual_review_required / generated=0, manual=18
- aiworker_worker_profile: use_existing_tables_first / worker_domain_proficiency / worker_role_proficiency / robot_model_capability_profile / robot_brain policies
- personaos_profile: derive_from_parameters_growth_memory / persona_parameter_value / growth_axis / growth_core_state / memory_state
- military_security: safe_domains_separated / HD-R2系は通常仕事と分離し、現実危害実行支援は禁止
