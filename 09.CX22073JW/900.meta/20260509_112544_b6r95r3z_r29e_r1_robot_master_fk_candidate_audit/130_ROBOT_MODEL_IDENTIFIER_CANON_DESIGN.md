# Robot Model Identifier Canon Design

## 結論

model code resolver は自由入力の対応表にしない。
ロボットマスタに存在する型番だけ canonical として登録できるよう、参照制約をかける。

## 推奨構成

### 1. robot master

既存のロボットマスタ実テーブルをFK先にする。
候補:

- aiworker.worker_model_catalog
- aiworker.model_public_registry
- aiworker.model_identity_spec
- aiworker.robot_model_capability_profile

viewにはFKを張れないため、`vw_...` はFK先にしない。

### 2. robot_model_identifier_canon

公開型番、runtime型番、旧コード、aliasなどを「許可済み識別子」として持つ。

- identifier_code
- identifier_kind_code
- canonical_public_model_code
- canonical_runtime_model_code
- series_code
- active_flag

### 3. model_code_resolver

実際の解決は identifier canon を読む。
server.js は決め打ちaliasを持たず、DBをread-only参照して public model code を得る。

## FK方針

- canonical_public_model_code は、ロボットマスタの public型番列または model_code列へFK
- identifier_code は unique
- resolver入力は identifier_code として管理する
- 存在しない型番は登録不可

## 注意

FK先にする列は unique または primary key が必要。
もし既存ロボットマスタに `BYD2-003` を一意に持つ列がない場合は、先にマスタ側の正規型番列/unique制約を設計する。
