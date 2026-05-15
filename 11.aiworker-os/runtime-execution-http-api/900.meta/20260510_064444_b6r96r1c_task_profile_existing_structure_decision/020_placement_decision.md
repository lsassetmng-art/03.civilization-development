# B6R96R1C 配置判定ドラフト

## 1. 監査からの暫定結論

既存DBには、仕事内容プロファイルを支える候補が既に多く存在する。
そのため、最初から新しい巨大tableを作るのは避ける。

## 2. AIWorkerOS側

優先して使う候補:

| 目的 | 既存候補 |
|---|---|
| 仕事内容カテゴリ | aiworker.business_support_task_domain |
| role x domain能力 | aiworker.business_support_role_domain_capability |
| worker仕事熟練度 | aiworker.worker_domain_proficiency |
| role熟練度 | aiworker.worker_role_proficiency |
| worker能力snapshot | aiworker.worker_capability_snapshot |
| model能力 | aiworker.worker_model_capability_profile / aiworker.robot_model_capability_profile |
| シリーズ傾向 | aiworker.series_tendency_profile |
| Beyond性能 | aiworker.beyond_model_quality_profile |
| MEGAMI特性 | aiworker.megami_model_profile |
| CX/brain制御 | aiworker.robot_brain_model_domain_policy / aiworker.robot_brain_role_policy / aiworker.robot_breadth_domain_runtime_policy |

暫定方針:
- worker_task_type_catalogを新設する前に、business_support_task_domainに統合できるか確認する。
- robot_worker_task_profile新設は最後の手段。
- 既存worker_domain_proficiencyにtask_type/domainを追加できるなら、そこを優先する。
- HD-R2系の軍事/警備/危機対応は、通常仕事とは別domainとしてbusiness_support_task_domainに足す方向を検討する。
- 現実の危害実行支援は禁止し、安全境界はrole/domain policyで明示する。

## 3. PersonaOS側

優先して使う候補:

| 目的 | 既存候補 |
|---|---|
| Persona現在値 | personaos.persona_parameter_state |
| Personaパラメータ値 | personaos.persona_parameter_value |
| 成長軸 | personaos.growth_axis |
| 成長状態 | personaos.growth_core_state / personaos.persona_growth_state |
| 経験ログ | personaos.growth_events |
| 記憶状態 | personaos.memory_state |
| 記憶ログ | personaos.memory_events |
| Persona本体 | personaos.personas / personaos.persona_state |

暫定方針:
- PersonaOSではmodel_codeを使わない。
- persona_task_profileを固定tableとして持つより、persona_parameter_valueとgrowth/memoryから算出するviewを優先する。
- 必要ならpersonaos.persona_task_profile_snapshotを追加し、現在値のcache/snapshotとして扱う。
- Personaは性格/特性/状態が変化するので、固定正本ではなくsnapshot/derived view中心にする。

## 4. 共通カテゴリの置き場所

app_commonは今回の監査に出ていない。
したがって今はapp_common新設に進まない。

候補:
1. AIWorkerOSのbusiness_support_task_domainを基点にする
2. PersonaOS側には同一task_type_codeを参照・同期する
3. 将来CommonOS/app_commonが確定したら共通catalogへ移行できるよう、code体系だけ揃える

## 5. 次の判定に必要なもの

今回のDUMP_OUTで確認すること:
- business_support_task_domainの列
- worker_domain_proficiencyの列
- model_code / worker_id / domain_codeの持ち方
- persona_parameter_valueの軸名と値形式
- growth_axisの既存axis
- RLS/unique制約
- app-read viewへの影響

## 6. 現時点の推奨

B6R96R1Dでやること:
- DUMP_OUTから列定義を読み、既存tableへ統合するapply案を作る
- DB applyはまだしない
- 佐藤レビュー用に、既存table利用案と新table最小追加案を比較する
