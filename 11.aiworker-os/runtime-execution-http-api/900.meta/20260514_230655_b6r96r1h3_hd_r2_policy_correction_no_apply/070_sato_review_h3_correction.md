# B6R96R1H3 佐藤レビュー依頼

## 対象

- H3補正版SQL:
  - 050_hd_r2_policy_overlay_H3_CORRECTED_NOT_APPLIED.sql
- model/role summary:
  - 040_h3_model_role_summary.md
- correction decision:
  - 060_h3_correction_decision.md

## 確認事項

1. HD-R2 / HD-R2S / HD-R2G / HD-R2T-0 の model_code が正しいか
2. fallback model_code が使われている場合、その値でよいか
3. role_code案 combat / sniper / general / origin でよいか
4. robot_brain_model_domain_policy に入れるべきか
5. robot_brain_role_policy に入れるべきか
6. business_support_role_domain_capability に入れるべきか
7. required列をH3のgeneric補完値で埋めてよいか
8. safety boundary文言が十分か
9. military/security系domainを実行時にどのprompt/contextへ反映するか

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
