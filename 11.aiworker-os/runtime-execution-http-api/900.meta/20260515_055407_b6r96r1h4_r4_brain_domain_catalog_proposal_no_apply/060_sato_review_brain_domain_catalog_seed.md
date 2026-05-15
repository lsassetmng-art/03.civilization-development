# B6R96R1H4_R4 佐藤レビュー依頼

## 原因

HD-R2 policy overlay apply は、`robot_brain_model_domain_policy.brain_domain_code` のFKで失敗した。

理由:
- `security_crisis_response` 等は task_domain_code としては存在
- しかし `aiworker.brain_data_domain_catalog` には存在しない
- `brain_domain_code` は task_domain_code ではなく brain catalog の正本コード

## 今回の提案

`aiworker.brain_data_domain_catalog` に以下6件を追加するSQL案を作成した。

- security_crisis_response
- fictional_combat_design
- game_tactical_balance
- defense_planning_non_harmful
- threat_modeling_safe
- combat_lore_reference

## 方針

この6件は、HD-R2系の安全な軍事/警備/危機対応用brain domainとして扱う。

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

1. brain_data_domain_catalog にこの6件を追加してよいか
2. task_domain_code と brain_domain_code を同じコードにしてよいか
3. 先にCX22073JW側のbrain/reference data登録設計を作る必要があるか
4. 追加後、HD-R2 policy overlay applyへ進んでよいか

## まだ実行しないこと

- DB apply
- INSERT
- UPDATE
- DELETE
- API POST
- git push
