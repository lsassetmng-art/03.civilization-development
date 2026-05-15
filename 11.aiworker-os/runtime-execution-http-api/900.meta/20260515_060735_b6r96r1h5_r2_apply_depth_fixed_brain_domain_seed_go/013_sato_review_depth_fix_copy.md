# B6R96R1H5_R1 佐藤レビュー依頼

## 原因

H5 applyで、`brain_data_domain_catalog.default_depth_code` に自動生成値を入れてしまい、`brain_data_depth_catalog` へのFKで失敗した。

## 修正

- `brain_data_domain_catalog` のFK列をread-onlyで確認
- 参照先catalogの既存値をread-onlyで取得
- `default_depth_code` などのFK placeholderを既存値へ置換
- SQLは未適用

## 佐藤確認事項

1. `default_depth_code` に選ばれた値でよいか
2. 他の default_* FK列にも補正が必要か
3. 補正版SQLで再applyしてよいか

## まだ実行しないこと

- DB apply
- INSERT
- UPDATE
- DELETE
- API POST
- git push
