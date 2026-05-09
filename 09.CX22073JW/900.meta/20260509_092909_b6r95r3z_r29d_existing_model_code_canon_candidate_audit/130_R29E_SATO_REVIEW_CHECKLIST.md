# R29E 佐藤レビュー チェックリスト

## レビュー対象

AIWorkerOS / CX22073JW 連携で使う model code の正本整理。

## 問題

- CX runtime material view 側は `BYD2-003` のような公開型番を持つ。
- runtime request 側は `byd2_003_asic_leader3` のような内部実行コードを持つことがある。
- どちらも `model_code` 名で扱われ、意味が混在している。

## レビュー観点

1. 既存の `aiworker.model_public_registry` / `aiworker.model_identity_spec` / `aiworker.worker_model_catalog` 等に、公開型番とruntime codeの対応正本を置けるか。
2. 既存テーブルを使う場合、破壊的UPDATEなしで add-only にできるか。
3. 既存に適切な正本がない場合、新規 `model_code_alias_resolver` 相当を作るべきか。
4. server.js に個別aliasを残さない方針でよいか。
5. runtime material fetch は resolver で公開型番へ解決してから view を読む設計でよいか。

## 禁止

- 既存コード値の破壊的UPDATE
- server.js内の機種別決め打ちalias
- AICompanyManager側での補正
