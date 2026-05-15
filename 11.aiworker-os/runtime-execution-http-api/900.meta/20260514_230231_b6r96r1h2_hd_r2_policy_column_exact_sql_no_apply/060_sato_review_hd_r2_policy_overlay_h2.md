# B6R96R1H2 佐藤レビュー依頼

## 対象

- HD-R2 / HD-R2S / HD-R2G / HD-R2T-0 の軍事/警備/危機対応系domain policy overlay
- 生成SQL: 040_hd_r2_policy_overlay_column_exact_NOT_APPLIED.sql
- model候補: 030_hd_r2_model_code_candidates.md
- 判定: 050_hd_r2_policy_overlay_decision.md

## 確認事項

1. 検出されたHD-R2系model_codeが正本と一致しているか
2. HD-R2T-0のmodel_code表記が正しいか
3. role_code案 combat / sniper / general / origin でよいか
4. robot_brain_model_domain_policy にmodel別domain参照制御を追加してよいか
5. robot_brain_role_policy にrole別安全境界を追加してよいか
6. business_support_role_domain_capability にrole別domain能力を追加してよいか
7. MANUAL_REVIEW_REQUIREDが出ている場合、未充足の必須列に何を入れるか
8. safety boundary文言はこのままでよいか

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

## まだ実行しないこと

- DB apply
- INSERT
- UPDATE
- DELETE
- API POST
- git push
