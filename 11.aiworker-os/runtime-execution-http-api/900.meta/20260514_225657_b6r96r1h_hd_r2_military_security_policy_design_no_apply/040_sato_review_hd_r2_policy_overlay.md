# B6R96R1H 佐藤レビュー観点

## 確認対象

- HD-R2 / HD-R2S / HD-R2G / HD-R2T-0 を軍事/警備/危機対応系domainに紐付ける方針
- 既存tableのどれを使うか
- safety boundaryをどのtableに置くか
- CX/brain参照制御をmodel policyかrole policyのどちらで持つか

## 確認したいこと

1. business_support_role_domain_capability はrole別domain能力に使ってよいか
2. HD-R2系のmodel_code正本は何か
3. HD-R2T-0 のmodel_code表記は既存と一致しているか
4. robot_brain_model_domain_policy にmodel別domain参照制御を追加してよいか
5. robot_brain_role_policy にrole別安全境界を追加してよいか
6. military/security系domainは通常業務domainと同じtableに置いてよいか
7. 安全境界文言は別table化するか、metadata/policy側に置くか

## apply前提

- この段階ではDB writeしない
- B6R96R1H2でcolumn-exact SQL案を作る
- applyは明示GO後
