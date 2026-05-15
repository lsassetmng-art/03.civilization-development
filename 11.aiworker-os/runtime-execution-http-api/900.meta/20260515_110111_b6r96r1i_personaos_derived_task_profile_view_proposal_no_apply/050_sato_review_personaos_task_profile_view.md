# B6R96R1I 佐藤レビュー依頼

## レビュー対象

- PersonaOS derived task profile view proposal
- SQLは未適用

## 佐藤確認事項

1. PersonaOSでAIWorkerOSの `task_domain_code` を参照カテゴリとして使ってよいか
2. PersonaOS側はロボット性能ではなく、パラメータ由来の `task_affinity_score` として扱う設計でよいか
3. 選ばれたPersonaOS既存table/columnが正しいか
4. view名 `vw_persona_task_domain_mapping_proposal_v1` / `vw_persona_derived_task_profile_v1` でよいか
5. 軍事/警備系domainは safety_profile_code 付きの傾向表示に限定する方針でよいか

## まだ実行しないこと

- DB apply
- create view
- insert/update/delete
- API POST
- git push
