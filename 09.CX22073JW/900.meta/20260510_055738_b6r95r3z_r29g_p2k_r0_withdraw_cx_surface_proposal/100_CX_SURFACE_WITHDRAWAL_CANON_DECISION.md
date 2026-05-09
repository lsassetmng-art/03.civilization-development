# CX22073JW / AIWorkerOS R29G-P2K-R0
# CX専用 app_surface 案 取り下げ正本

## 1. Final decision

`cx22073jw_e2e_quality_gate` は追加しない。

CX22073JW は、意思を持たない knowledge / reference / data foundation であり、実行主体ではない。
そのため、CX22073JW 自体に実行アプリ・実行画面・実行surfaceを追加しない。

## 2. Canonical responsibility split

### CX22073JW

- 実行しない
- 指示を受けて自律的に動かない
- app_surface を持たない
- UI / 実行画面を持たない
- knowledge / reference / brain / material / data foundation として保持される
- 他OS / 他アプリから参照される

### AIWorkerOS

- ロボットを実行する
- CX22073JW の参照データを読む
- brain access / model / role / series / control profile を制御する
- 成果物本文・成果物サマリ・generated_artifacts・納品zipを生成する

### 各OS / 各アプリ

- どのロボットを表示・選択可能にするかを制御する
- 契約 / 権限 / プラン / UI表示 / app別利用条件を制御する
- CX22073JW のデータを見る・読む・参照する側になる

## 3. Withdrawn proposals

以下は不採用 / superseded とする。

- `cx22073jw_e2e_quality_gate` app_surface 追加
- `aiworker.app_runtime_control_policy` への CX専用surface seed
- `app_surface × model allowlist` の今回追加
- `vw_app_aiworker_runtime_control_profile_v2` の今回追加
- `runtime_execution_request` への seed 案
- CX専用 execution app / screen / route の追加

## 4. Accepted runtime posture for current R29G work

R29G成果物生成E2Eでは、既存の実行surfaceを利用する。

- `app_surface_code = ai_company_manager`
- `source_app_ref = cx22073jw`
- `model_code = byd2_003_asic_leader3`
- `source_route_code = aiworkeros_direct_instruction_to_zip_smoke_after_r29g`

意味:

- 実行主体 / runtime surface は AIWorkerOS 側の既存経路
- 参照元・材料元として CX22073JW を示す
- CX22073JW 自体は実行surfaceを持たない

## 5. Why this is safer

`vw_app_aiworker_runtime_control_profile_v1` は以下の合成viewである。

- `app_runtime_control_policy a`
- `CROSS JOIN vw_app_aiworker_model_selection_capability_card_v1 c`
- `LEFT JOIN role_runtime_control_default r`
- `LEFT JOIN series_runtime_control_default s`
- `LEFT JOIN model_runtime_control_override m`

そのため、`app_runtime_control_policy` に CX専用surface を1行追加すると、そのsurfaceで全 selectable model の runtime control profile が生成される。

これは「CXは実行主体ではない」という正本方針と合わないため、追加しない。

## 6. No action taken

この取り下げ整理では以下を行わない。

- DB write
- SQL apply
- API POST
- server.js patch
- AICM修正
- git push
- 既存ファイル削除
- 旧view DROP
- CASCADE / DROP / DELETE / TRUNCATE

## 7. Future rule

CX22073JW に app_surface を追加するのは原則禁止。

例外が必要になる場合でも、以下を満たすこと。

1. CX22073JW 自体を実行主体にしない
2. 実行surfaceは AIWorkerOS / BusinessOS / 他OS 側に置く
3. CX側は reference / material / brain data としてのみ参照される
4. 佐藤レビュー + Boss明示GOがある
