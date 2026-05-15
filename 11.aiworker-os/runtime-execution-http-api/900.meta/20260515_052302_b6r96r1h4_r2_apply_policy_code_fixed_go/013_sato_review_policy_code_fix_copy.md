# B6R96R1H4_R1 佐藤レビュー依頼

## 原因

B6R96R1H4 applyで、`robot_brain_model_domain_policy.policy_code` に `b6r96r1h3_*` の生成値を入れたため、`robot_brain_model_domain_policy_policy_code_check` に違反した。

## 今回の修正

- 対象tableの `policy_code` CHECK制約と既存値をread-onlyで確認
- 制約/既存値から有効な `policy_code` を推定
- H3 SQL内の `b6r96r1h3_* as policy_code` を有効値へ置換
- SQLはまだ未適用

## 佐藤確認事項

1. 推定された `policy_code` が正しいか
2. `robot_brain_role_policy` でも同じ `policy_code` でよいか
3. `business_support_role_domain_capability` に `policy_code` がある場合も同じ値でよいか
4. 補正版SQLを次工程でapplyしてよいか

## まだ実行しないこと

- DB apply
- INSERT
- UPDATE
- DELETE
- API POST
- git push
