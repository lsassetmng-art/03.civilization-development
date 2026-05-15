# B6R96R1E 佐藤レビュー依頼

## レビュー対象

- 040_column_exact_apply_sql_NOT_APPLIED.sql
- aiworker.business_support_task_domain への仕事内容domain追加案
- AIWorkerOS側の既存profile/proficiency/brain policy優先方針
- PersonaOS側のparameter/growth/memoryから算出する方針
- HD-R2軍事/警備/危機対応系domainの安全境界

## 佐藤に確認してほしいこと

1. aiworker.business_support_task_domainに今回のtask domainを追加してよいか
2. domain code名はこのままでよいか
3. military/security系domainを同じtableに置いてよいか
4. worker_domain_proficiencyは個体worker用か、model defaultにも使えるか
5. worker_domain_proficiencyが個体専用なら、model/domain overlay tableを小さく追加すべきか
6. PersonaOSはpersona_parameter_value/growth_axisからderived viewでよいか
7. persona_task_profile_snapshotが必要か、まだviewだけでよいか
8. robot_brain_model_domain_policy / role_policyへCX参照制御を寄せる方針でよいか

## まだ実行しないこと

- DB apply
- INSERT
- UPDATE
- DELETE
- API POST
- git push
