# B6R96R1I_R1 佐藤レビュー依頼

## レビュー対象

- PersonaOS task profile base views
- SQLは未適用

## 今回の判断

前回の `MANUAL_REVIEW_REQUIRED` は、Persona実データjoinに必要な列を安全に特定できなかったため。
R1では実データjoinを削り、mapping / required parameter / responsibility note のみをapply候補とする。

## 佐藤確認事項

1. PersonaOSに base view 3本を作ってよいか
2. `task_domain_code` をAIWorkerOSと共通カテゴリとして使ってよいか
3. PersonaOSでは性能ではなく `task tendency / affinity` に限定する方針でよいか
4. 軍事/警備系domainを安全境界付き傾向表示に限定する方針でよいか
5. 実データjoin版は別工程に分ける方針でよいか

## まだ実行しないこと

- DB apply
- create view
- insert/update/delete
- API POST
- git push