
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- DBには既知request_id/titleが存在
- context APIには対象が出ていない
- UI/core側のhydration以前に server context exposure/filter が原因

今回の作業:
1. server/core syntax確認
2. serverをバックアップ
3. /api/aicm/v2/context route の res.json 直前に review_wait_items 補完wrapperを最小挿入
4. serverのみ node --check
5. 失敗時は即rollback
6. AICM serverを再起動
7. context APIに review_wait_items / 既知タイトル / request_id が出るか確認

禁止:
- DB write
- API POST
- core patch
- window override追加
- render関数丸ごと置換

レビュー:
- 佐藤(DB担当): DBはREAD ONLY。今回はserver context露出のみ。

============================================================
1. ENV / TARGET
============================================================
PHASE=R8Z-V8C server context review_wait_items exposure fix
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c_server_context_review_wait_exposure_fix_20260503_074656
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
3. backup server
============================================================
PASS: server backup created: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c_server_context_review_wait_exposure_fix_20260503_074656/aicm-local-ui-api-server.before_r8z_v8c.mjs

============================================================
4. patch server context route
============================================================
file:///data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c_server_context_review_wait_exposure_fix_20260503_074656/r8z_v8c_patch_server_context.mjs:304
const routeRegex = /(app\.(?:get|all)\(\s*['"]\\/api\\/aicm\\/v2\\/context['"][\\s\\S]{0,600}?=>\s*\\{)/m;
                   ^

SyntaxError: Invalid regular expression flags
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:99:18)
    at #translate (node:internal/modules/esm/loader:473:20)
    at afterLoad (node:internal/modules/esm/loader:529:29)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:534:12)
    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:577:36)
    at afterResolve (node:internal/modules/esm/loader:625:52)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:631:12)
    at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:650:32)
    at TracingChannel.tracePromise (node:diagnostics_channel:350:14)

Node.js v24.14.1
cat: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8c_server_context_review_wait_exposure_fix_20260503_074656/010_patch.log: No such file or directory
WARN: patcher could not safely patch server; restoring backup
PATCH_EXIT=1
FINAL_JUDGEMENT=PATCH_SKIPPED_CONTEXT_ROUTE_PATTERN_NOT_FOUND
