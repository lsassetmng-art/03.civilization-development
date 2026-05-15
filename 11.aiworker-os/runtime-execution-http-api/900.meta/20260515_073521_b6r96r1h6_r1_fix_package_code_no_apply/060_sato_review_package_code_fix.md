# B6R96R1H6_R1 佐藤レビュー依頼

## 原因

H6 applyで、`business_support_role_domain_capability.package_code` に `aiworker_runtime` を入れようとしてFK違反になった。

`package_code` は `business_support_control_package` へのFKであり、既存catalogにある値を使う必要がある。

## 修正

- `business_support_role_domain_capability.package_code` のFK参照先をread-onlyで確認
- 参照先catalogの既存 `package_code` をread-onlyで取得
- `aiworker_runtime` を既存値へ置換したoverlay SQLを作成
- SQLは未適用

## 佐藤確認事項

1. 選ばれた `package_code` がこのHD-R2 policy overlayに適切か
2. `business_support_role_domain_capability` にこのpackageで入れてよいか
3. 補正版SQLで再applyしてよいか

## まだ実行しないこと

- DB apply
- INSERT
- UPDATE
- DELETE
- API POST
- git push
