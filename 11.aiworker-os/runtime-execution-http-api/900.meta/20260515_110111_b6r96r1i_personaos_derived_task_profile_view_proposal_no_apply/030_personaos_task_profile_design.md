# B6R96R1I PersonaOS Derived Task Profile Design

## 1. 結論

AIWorkerOSで追加した `task_domain` は、PersonaOSでも共通カテゴリとして参照してよい。
ただしPersonaはロボットではないため、PersonaOS側では「性能」ではなく「パラメータから派生した得意傾向」として扱う。

## 2. 責務分離

| 領域 | 責務 |
|---|---|
| AIWorkerOS | ロボット契約、ロボット性能計算、role/model/series、CX参照、成果物生成 |
| PersonaOS | Personaの性格、状態、成長、記憶、パラメータからの傾向表示 |
| AICM/AIOperationDesk | 依頼入口、作業分類、権限/実行文脈 |
| CX22073JW | brain/reference data。実行主体ではない |

## 3. PersonaOS側で持つもの

| 項目 | 内容 |
|---|---|
| task_domain_code | AIWorkerOSと共通の仕事内容カテゴリ |
| persona_parameter_key | PersonaOS側のパラメータキー |
| task_affinity_score | Personaの現在値から派生した得意傾向スコア |
| task_affinity_level_code | high / medium / low |
| basis_jsonb | どのパラメータが根拠になったか |

## 4. 禁止する混同

- PersonaOSにロボット契約判定を持たせない
- PersonaOSにAIWorkerOSのworker実行権限を持たせない
- Personaをrobot/worker_master/employee扱いしない
- 軍事/警備domainの傾向表示を現実の危害支援許可にしない

## 5. 既存構造からの生成判断

- selected_persona_source_table: persona_parameter_value
- persona_id_col: persona_id
- user_id_col: none
- axis_col: none
- value_col: value
- can_create_value_based_view: false

## 6. task_domain count

- task_domain rows from AIWorkerOS: 25

## 7. existing PersonaOS task/profile-like views

```json
[]
```

## 8. 次工程

1. 佐藤レビュー
2. SQL案の column exact 確認
3. 明示GO後に view apply
4. AIOperationDesk開発時に API制御/契約判定と接続
