# 佐藤レビュー依頼 B6R96R1D

## レビュー対象

- AIWorkerOS / PersonaOS 共通仕事内容プロファイル
- 既存table優先利用方針
- HD-R2軍事/警備系domain追加方針
- PersonaOSは固定modelではなくparameter/growth/memoryから算出する方針

## 佐藤に確認してほしい点

1. aiworker.business_support_task_domainへ仕事内容カテゴリを追加してよいか
2. aiworker.worker_domain_proficiencyをWorker仕事内容品質に使ってよいか
3. aiworker.worker_role_proficiencyをPresident/Manager/Leader/R2系role差分に使ってよいか
4. aiworker.robot_brain_model_domain_policy / role_policyでCX参照制御を継続してよいか
5. PersonaOS側はpersona_parameter_value/growth_axis/memory_stateからderived viewを作る方針でよいか
6. HD-R2軍事/警備系domainを通常仕事と分離する方針でよいか
7. app_commonが無いので、今回はapp_commonに入れずOS側既存tableを使う方針でよいか

## apply前提

- この段階ではDB writeしない
- B6R96R1Eで列完全一致のSQL案を作る
- B6R96R1F以降、明示GOがあればapply
