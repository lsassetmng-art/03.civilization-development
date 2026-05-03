# AICompanyManager Worker Runtime UI Flow

status: active
scope: UI flow
owner: Boss
prepared_by: Zero

## 1. 入口

候補入口:

- 部門別タスク台帳
- Manager大項目
- 課詳細
- Worker配置一覧
- レビュー・承認待ち一覧からの再依頼

v1では「Worker実行依頼」画面を独立追加する。

## 2. 画面項目

Worker実行依頼:

- 対象会社
- 対象部門
- 対象課
- 実行Worker
- task_domain_code
- task_title
- task_instruction_ja
- source_request_ref
- idempotency_key preview

## 3. 実行Worker候補

候補は以下から取得。

- state.context.placements
- role_code = Worker
- app_code = AICompanyManager
- status_code = active

表示:

- display_label
- aiworker_model_code
- internal_nickname
- department_name
- section_name

## 4. 確認画面

POST前に必ず確認画面を表示する。

確認項目:

- 実行Worker
- model_code
- app_surface_code
- task_domain_code
- task_title
- task_instruction_ja
- source_request_ref
- idempotency_key

ボタン:

- 確定して実行
- 戻る

## 5. 実行後

成功時:

- request_id を表示
- app-read-payload への読取導線を表示
- pipeline-board 導線を表示

失敗時:

- error_message を表示
- server log 確認導線を出す

## 6. 禁止

- 入力画面から即POST
- Worker未選択で実行
- task_instruction_ja 空で実行
- tokenをUIに表示
- AIWorkerOSの forbidden_actions を上書き
