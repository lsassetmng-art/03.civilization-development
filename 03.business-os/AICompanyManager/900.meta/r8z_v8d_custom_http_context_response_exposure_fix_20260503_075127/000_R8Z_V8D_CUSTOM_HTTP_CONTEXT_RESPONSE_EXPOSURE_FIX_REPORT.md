
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- R8Z-V8B: DBには既知request_id/titleあり
- context APIには対象が出ていない
- R8Z-V8C: Express想定patchは安全スキップ
- R8Z-V8C2: custom HTTP route形式と判定済み

今回の作業:
1. server/core syntax確認
2. server backup
3. 最新V8BレポートからDB hit source relationを抽出
4. custom HTTP context route branch内に response interceptor を1点挿入
5. context response JSONへ review_wait_items を補完
6. server再起動
7. context APIに2件/既知タイトル/request_idが出るか確認

禁止:
- DB write
- API POST
- core patch
- window override追加
- render関数置換

佐藤(DB担当):
- DBはREAD ONLY。server context露出のみ。

============================================================
1. ENV
============================================================
PHASE=R8Z-V8D custom HTTP context response exposure fix
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8d_custom_http_context_response_exposure_fix_20260503_075127
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=YES
CORE_PATCH=NO
PASS: server exists
PASS: core exists

============================================================
2. precheck syntax
============================================================
PASS: precheck server syntax PASS
PASS: precheck core syntax PASS

============================================================
3. backup
============================================================
PASS: server backup created: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8d_custom_http_context_response_exposure_fix_20260503_075127/aicm-local-ui-api-server.before_r8z_v8d.mjs

============================================================
4. patch server custom HTTP context branch
============================================================
SOURCE_RELATIONS=["aiworker.runtime_execution_event_log","aiworker.runtime_execution_request","aiworker.runtime_handoff_packet","aiworker.runtime_review_gate_log","aiworker.vw_app_aiworker_runtime_execution_app_read_payload_v1","aiworker.vw_app_aiworker_runtime_execution_gate_board_v1","aiworker.vw_app_aiworker_runtime_execution_intake_payload_v1","aiworker.vw_app_aiworker_runtime_execution_request_board_v1","aiworker.vw_app_aiworker_runtime_full_pipeline_board_v1","aiworker.vw_app_aiworker_runtime_handoff_packet_board_v1","business.aicm_human_review_item","business.aicm_leader_deliverable_requirement"]
INFERRED_REQ=req
INFERRED_RES=res
PATCH_APPLIED: helper inserted
PATCH_APPLIED: custom HTTP context branch interceptor inserted
CONTEXT_LITERAL=/api/aicm/v2/context
INSERT_CALL=// AICM_R8Z_V8D_CUSTOM_HTTP_CONTEXT_REVIEW_WAIT_ITEMS_EXPOSURE: route interceptor install
    aicmR8zV8dInstallContextResponseInterceptor(req, res);
PASS: custom HTTP context route patched

============================================================
5. post-patch syntax and rollback gate
============================================================
FAIL: post-patch server syntax FAIL; rollback now
/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs:2165
if (route === "
              ^

SyntaxError: Invalid or unexpected token
    at checkSyntax (node:internal/main/check_syntax:72:5)

Node.js v24.14.1
PASS: rollback server syntax PASS
FINAL_JUDGEMENT=SERVER_PATCH_SYNTAX_FAILED_ROLLED_BACK
