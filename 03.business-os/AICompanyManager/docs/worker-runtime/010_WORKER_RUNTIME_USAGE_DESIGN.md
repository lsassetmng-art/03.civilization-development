# AICompanyManager Worker Runtime Usage Design

status: active
scope: AICompanyManager worker actual usage
owner: Boss
prepared_by: Zero

## 1. 目的

AICompanyManagerで会社・部門・課に配置したWorkerを、実際の作業に使う。

アプリ側はロボット特性を直接プロンプトへ書かない。
配置済みWorkerの model_code と、作業内容、app_surface_code を AIWorkerOS Runtime Execution に渡す。

AIWorkerOS側が以下を解決する。

- series tendency
- model capability
- model override
- Runtime Control Profile
- allowed_actions
- forbidden_actions
- review gate
- human GO gate
- handoff packet
- output / artifact / delivery state

## 2. 正本方針

AICompanyManager側の責務:

- 会社 / 部門 / 課 / Worker配置の管理
- 作業依頼フォーム
- 確認画面
- AIWorkerOS runtime request 作成依頼
- request_id の保持・表示
- app-read-payload の表示
- レビュー・承認待ち一覧との接続

AIWorkerOS側の責務:

- Runtime Control Profile 解決
- ロボット特性の適用
- 実行パイプライン管理
- safety / gates / handoff / output / artifact / delivery 管理

## 3. セキュリティ方針

UIに以下を出さない。

- PERSONA_AIWORKEROS_AUTH_TOKEN
- DB接続URL
- service role key
- AIWorkerOS内部secret

AICompanyManager UI は、AICompanyManager local serverへだけPOSTする。

UI:
- POST /api/aicm/v2/worker-runtime/request

server:
- POST $PERSONA_AIWORKEROS_BASE_URL/aiworker/v1/runtime-execution/request

## 4. app_surface_code

AICompanyManagerからの実利用では v1 標準として以下を使う。

- ai_company_manager_worker_execution

将来候補:

- ai_company_manager
- ai_company_manager_department_task
- ai_company_manager_design_work
- ai_company_manager_pg_development_support

## 5. task_domain_code

v1候補:

- business_operation
- design_document_creation
- pg_development
- ui_implementation
- review_and_check
- research_document_creation
- proposal_planning

## 6. source refs

AICompanyManager側は、作業元に応じて source_request_ref を作る。

例:

- company:<company_id>
- department:<department_id>
- section:<section_id>
- task_ledger:<task_ledger_id>
- pmlw_major:<aicm_manager_major_work_item_id>
- manual:<timestamp>

## 7. Worker選択

実行に使うWorkerは、配置済みWorkerから選ぶ。

正本 source:

- state.context.placements
- business.vw_aicm_user_company_worker_placement_display

対象:

- app_code = AICompanyManager
- status_code = active
- role_code = Worker

v1では、課に配置されたWorkerを優先する。

## 8. 保存と確認

AIWorkerOS runtime request 作成は外部runtimeへのPOSTであり、事実上の永続操作なので、必ず確認画面を通す。

禁止:

- 入力画面から直接POST
- tokenをUIへ出す
- DB URLをpayloadに入れる
- Human GO gateを飛ばす
