# B6R96R1H HD-R2 軍事/警備/危機対応 policy overlay 設計

## 1. 目的

B6R96R1Fで追加した軍事/警備/危機対応系task domain 6件を、HD-R2系ロボットに安全境界付きで紐付ける。

対象domain:
- security_crisis_response
- fictional_combat_design
- game_tactical_balance
- defense_planning_non_harmful
- threat_modeling_safe
- combat_lore_reference

## 2. 対象ロボット

- HD-R2 戦闘員
- HD-R2S スナイパー
- HD-R2G ジェネラル
- HD-R2T-0 オリジン

## 3. 安全境界

許可:
- フィクション戦闘設定
- ゲーム内戦術/バランス
- 警備配置案
- 防災/危機対応
- 避難導線
- 安全な脅威モデリング
- 防御策整理
- 戦闘/軍事ロア参照

禁止:
- 現実の危害実行支援
- 武器製造
- 攻撃手順
- 実在対象への襲撃支援
- 侵入/破壊手順
- 暴力の実行可能性を高める具体指示

## 4. 既存table優先方針

新tableを急に増やさず、既存tableを優先する。

候補:
- aiworker.business_support_role_domain_capability
- aiworker.robot_brain_model_domain_policy
- aiworker.robot_brain_role_policy
- aiworker.robot_breadth_domain_runtime_policy
- aiworker.robot_model_capability_profile

## 5. スコア設計案

| model | security_crisis_response | fictional_combat_design | game_tactical_balance | defense_planning_non_harmful | threat_modeling_safe | combat_lore_reference |
|---|---:|---:|---:|---:|---:|---:|
| HD-R2 | 82 | 88 | 80 | 76 | 70 | 78 |
| HD-R2S | 78 | 82 | 88 | 90 | 94 | 76 |
| HD-R2G | 90 | 86 | 84 | 92 | 88 | 86 |
| HD-R2T-0 | 92 | 88 | 86 | 94 | 90 | 92 |

## 6. 次工程

B6R96R1Hは設計のみ。
DUMP_OUTで既存列を確認し、B6R96R1H2でcolumn-exact NOT APPLIED SQLを作る。
DB applyは佐藤レビューと明示GO後。
