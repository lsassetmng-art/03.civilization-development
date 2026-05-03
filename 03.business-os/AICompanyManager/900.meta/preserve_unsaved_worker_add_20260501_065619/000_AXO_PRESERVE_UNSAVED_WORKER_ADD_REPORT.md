# AICompanyManager Phase AXO preserve unsaved values on worker add

## Result
- FINAL_STATUS=UNSAVED_WORKER_ADD_VALUES_PRESERVED_READY
- PASS_COUNT=16
- WARN_COUNT=0
- FAIL_COUNT=0

## Scope
- DB write: NO
- API POST: NO
- server change: NO
- index.html change: NO
- clean core change: YES

## Fix
- Captures current edit form values before inline-worker-slot-add rerender.
- Restores draft values after rerender.
- Clears draft after successful confirmed save.

## HTTP
- OWNER_ID=00000000-0000-4000-8000-000000000001
- INDEX_HTTP_CODE=200
- CORE_HTTP_CODE=200
- CONTEXT_HTTP_CODE=200

## UI
- OPEN_URL=http://127.0.0.1:8794/?v=20260501_065619_preserve_unsaved
- TERMUX_OPEN_STATUS=OPENED

## Files
- CORE_BACKUP=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/preserve_unsaved_worker_add_20260501_065619/aicm-production-core.before_axo_preserve_unsaved.js
- PATCH_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/preserve_unsaved_worker_add_20260501_065619/100_patch.out
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/preserve_unsaved_worker_add_20260501_065619/020_node_check.txt
- SCAN_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/preserve_unsaved_worker_add_20260501_065619/030_scan.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/preserve_unsaved_worker_add_20260501_065619/050_http_check.txt
- SERVER_LOG=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/preserve_unsaved_worker_add_20260501_065619/040_server.log

## Manual test
1. 課変更を開く。
2. 課名/目的/課長/従業員1行目などを変更する。
3. DB保存せずに「従業員行を追加」。
4. 既存入力が消えないこと。
5. 追加行が増えること。
