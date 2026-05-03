============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し最終確認カード

現在位置:
- 承認/差し戻しの既存server route接続は済み
- ただし確認カード表示直後はボタンがdisabledのまま
- metadata等をタップするとclickイベントで補正が走り、押せるようになる
- つまり本質は「初期表示時の自動補正不足」

今回:
1. core/server syntax確認
2. core backup
3. 最終確認カード表示直後に自動primeを走らせる
4. clickを待たず、load/pageshow/visibilitychange/scroll/touchstart/pointerdown/render後/短期intervalで補正
5. server patchなし
6. DB/API操作なし
7. browser起動

禁止:
- DB write
- API POST
- server patch
- 承認/差し戻しの自動実行

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2d_review_confirm_auto_prime_20260504_054645
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. marker precheck
============================================================
V10GC2B_CORE_MARKER_COUNT=2
V10GC2C_MARKER_COUNT=0
V10GC_SERVER_MARKER_COUNT=0

============================================================
4. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2d_review_confirm_auto_prime_20260504_054645/aicm-production-core.before_v10gc2d.js

============================================================
5. patch core
============================================================
PATCH_APPLIED: V10GC2D review confirm auto-prime appended\n
============================================================
6. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
7. static verify
============================================================
V10GC2D_MARKER_COUNT=2
V10GC2D_APPROVE_ACTION_COUNT=4
V10GC2D_RETURN_ACTION_COUNT=4
V10GC2D_SHORT_INTERVAL_COUNT=4
V10GC2D_MUTATION_OBSERVER_COUNT=1
V10GC2B_CORE_MARKER_COUNT=2
V10GC_SERVER_MARKER_COUNT=0
DB_WRITE=NO
API_POST=NO

============================================================
8. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=4ebc209032af8421813ff895b372759b1f9c2ad6e8fb27f0ec4c263bfda7e58e
SERVED_SHA=4ebc209032af8421813ff895b372759b1f9c2ad6e8fb27f0ec4c263bfda7e58e
SERVED_V10GC2D_COUNT=2

============================================================
9. final
============================================================
FINAL_JUDGEMENT=V10GC2D_REVIEW_CONFIRM_AUTO_PRIME_READY_BROWSER_OPENED
V10GC2D_MARKER_COUNT=2
V10GC2D_APPROVE_ACTION_COUNT=4
V10GC2D_RETURN_ACTION_COUNT=4
V10GC2D_SHORT_INTERVAL_COUNT=4
V10GC2D_MUTATION_OBSERVER_COUNT=1
V10GC2B_CORE_MARKER_COUNT=2
V10GC_SERVER_MARKER_COUNT=0
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10GC2D_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc2d_20260504_054645
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2d_review_confirm_auto_prime_20260504_054645/000_R8Z_V10GC2D_REVIEW_CONFIRM_AUTO_PRIME_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2d_review_confirm_auto_prime_20260504_054645/aicm-production-core.before_v10gc2d.js
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 成果物を確認
3. 承認確認へ進む
4. metadataを触らなくても、1秒以内に「承認を実行する」が押せる状態になること
5. まず1件だけ実行
6. 実行後、レビュー一覧が 2件 -> 1件 になればOK

注意:
- 押すと本当にDB更新します。
- 1件だけで止めてください。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2d_review_confirm_auto_prime_20260504_054645/aicm-production-core.before_v10gc2d.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
