# B6R96R1H4_R4A 佐藤レビュー依頼

## 原因

R4は `aiworker.brain_data_domain_catalog` を前提にしたが、そのtableは存在しなかった。

正しくは、`robot_brain_model_domain_policy.brain_domain_code` のFK定義から参照先schema/table/columnを取得し、その実参照先へseed SQL案を作る必要がある。

## 今回の修正

- pg_constraintから `brain_domain_code` の実FK参照先を取得
- 実FK参照先tableのcolumns/constraints/existing rowsをread-onlyで確認
- 実FK参照先へ6件を追加するSQL案を作成
- SQLは未適用

## 追加候補6件

- security_crisis_response
- fictional_combat_design
- game_tactical_balance
- defense_planning_non_harmful
- threat_modeling_safe
- combat_lore_reference

## 安全境界

許可:
- 防災
- 避難
- 警備配置
- フィクション
- ゲーム
- 戦闘/軍事ロア
- 防御策整理
- 安全な脅威モデリング

禁止:
- 現実の危害実行支援
- 武器製造
- 攻撃手順
- 実在対象への襲撃支援
- 侵入/破壊手順
- 暴力の実行可能性を高める具体指示

## 佐藤確認事項

1. 実FK参照先tableへ6件を追加してよいか
2. task_domain_code と brain_domain_code を同じコードで持たせてよいか
3. 追加後にHD-R2 policy overlayを再applyしてよいか
4. 先にCX側の知識データ実体を追加すべきか、domain catalogだけ先に許可してよいか

## まだ実行しないこと

- DB apply
- INSERT
- UPDATE
- DELETE
- API POST
- git push
