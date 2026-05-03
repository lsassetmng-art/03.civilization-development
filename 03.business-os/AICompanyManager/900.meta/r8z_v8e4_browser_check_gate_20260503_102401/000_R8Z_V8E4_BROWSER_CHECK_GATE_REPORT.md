
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- DBにはレビュー待ち2件あり
- context APIは正しい owner_civilization_id で review_wait_items=2 を返す
- server patch不要
- 次はブラウザ側の再読込/キャッシュ/V7 hydration確認

今回の作業:
1. server/core syntax確認
2. V8D/V8E危険patch markerがserverに残っていないか確認
3. served core と disk core の一致確認
4. 正しいcontext APIで review_wait_items=2 を確認
5. ブラウザ確認URLを出す

禁止:
- DB write
- API POST
- server patch
- core patch

============================================================
1. ENV
============================================================
PHASE=R8Z-V8E4 browser check gate
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e4_browser_check_gate_20260503_102401
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS: server exists
PASS: core exists

============================================================
2. syntax check
============================================================
PASS: server syntax PASS
PASS: core syntax PASS

============================================================
3. dangerous patch marker check
============================================================
SERVER_V8D_MARKER_COUNT=0
SERVER_V8E_MARKER_COUNT=0
PASS: server rollback clean: V8D/V8E markers absent

============================================================
4. served core vs disk core
============================================================
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 1 ms: Could not connect to server
SERVED_HTTP=000
WARN: served core fetch failed

============================================================
5. correct context API verify
============================================================
curl: (7) Failed to connect to 127.0.0.1 port 8794 after 0 ms: Could not connect to server
CONTEXT_URL=http://127.0.0.1:8794/api/aicm/v2/context?owner_civilization_id=00000000-0000-4000-8000-000000000001&v=r8z_v8e4_20260503_102401
CONTEXT_HTTP=000
FAIL: context API not 200 with owner_civilization_id
node:fs:440
    return binding.readFileUtf8(path, stringToFlags(options.flag));
                   ^

Error: ENOENT: no such file or directory, open '/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e4_browser_check_gate_20260503_102401/020_context_correct_owner.json'
    at Object.readFileSync (node:fs:440:20)
    at [stdin]:6:16
    at runScriptInThisContext (node:internal/vm:219:10)
    at node:internal/process/execution:451:12
    at [stdin]-wrapper:6:24
    at runScriptInContext (node:internal/process/execution:449:60)
    at evalFunction (node:internal/process/execution:283:30)
    at evalTypeScript (node:internal/process/execution:295:3)
    at node:internal/main/eval_stdin:51:5
    at Socket.<anonymous> (node:internal/process/execution:205:5) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8e4_browser_check_gate_20260503_102401/020_context_correct_owner.json'
}

Node.js v24.14.1
