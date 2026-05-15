# B6R96R1I_R1 PersonaOS Task Profile Base View Design

## 1. 結論

前回のWARNは、既存PersonaOS tableから `persona_id / parameter_key / numeric value` を安全に一意特定できなかったことが原因。
そのため、R1では実データjoinを作らず、まずapply可能な基盤ビューだけに分ける。

## 2. 今回作る基盤

| view | 目的 |
|---|---|
| personaos.vw_persona_task_domain_mapping_v1 | task_domain と Persona parameter key の対応表 |
| personaos.vw_persona_task_profile_required_parameter_v1 | PersonaOS側で必要になるparameter一覧 |
| personaos.vw_persona_task_profile_responsibility_note_v1 | PersonaOSとAIWorkerOSの責務境界 |

## 3. 作らないもの

- Persona実データとのjoin view
- ロボット性能計算
- ロボット契約判定
- AIWorkerOSのworker/robot table
- CX参照権限制御

## 4. 理由

Personaはロボットではないため、AIWorkerOSのworker profileをそのまま移植しない。
PersonaOSでは、性格・状態・記憶・成長・パラメータから、仕事傾向を派生表示するだけにする。

## 5. 軍事/警備系domain

以下はPersonaOSでは安全境界付きの傾向表示だけ。現実の危害実行支援を許可しない。

- security_crisis_response
- fictional_combat_design
- game_tactical_balance
- defense_planning_non_harmful
- threat_modeling_safe
- combat_lore_reference

## 6. Existing evidence

### PersonaOS tables
```json
[
  {
    "table_name": "growth_axis",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "growth_core_state",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "growth_events",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "memory_events",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "memory_state",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_action_log",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_apply_log",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_character_map",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_event_log",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_growth_state",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_packs",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_parameter_state",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_parameter_value",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_part_overrides",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_signing_key",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_slots",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_snapshot",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_snapshot_revocation",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "persona_state",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "personas",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  },
  {
    "table_name": "vtuber_parameter_state",
    "table_type": "BASE TABLE",
    "table_schema": "personaos"
  }
]
```

### Existing task/profile-like objects
```json
[]
```

## 7. Next

1. R1 SQL案レビュー
2. 明示GO後に base views apply
3. PersonaOSの正本parameter table/columnを決める
4. その後、実データjoin版 `vw_persona_derived_task_profile_v1` を別工程で作る