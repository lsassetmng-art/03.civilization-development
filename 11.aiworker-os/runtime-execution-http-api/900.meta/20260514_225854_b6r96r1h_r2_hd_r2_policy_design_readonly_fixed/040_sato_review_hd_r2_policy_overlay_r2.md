# B6R96R1H_R2 佐藤レビュー観点

## 確認対象

- HD-R2 / HD-R2S / HD-R2G / HD-R2T-0 を軍事/警備/危機対応系domainに紐付ける方針
- 既存tableのどれを使うか
- safety boundaryをどのtableに置くか
- CX/brain参照制御をmodel policyかrole policyのどちらで持つか

## R2での修正

R1の固定列参照を廃止。
列一覧とsampleを使って、model_code正本と投入先tableを確認する。

## 佐藤確認事項

1. HD-R2系のmodel_code正本
2. business_support_role_domain_capability はrole別domain能力に使ってよいか
3. robot_brain_model_domain_policy にmodel別domain参照制御を追加してよいか
4. robot_brain_role_policy にrole別安全境界を追加してよいか
5. military/security系domainは通常業務domainと同じtableに置いてよいか
6. 安全境界文言はmetadata/policy側に置くか、別table化するか

## apply前提

- この段階ではDB writeしない
- B6R96R1H2でcolumn-exact SQL案を作る
- applyは明示GO後
