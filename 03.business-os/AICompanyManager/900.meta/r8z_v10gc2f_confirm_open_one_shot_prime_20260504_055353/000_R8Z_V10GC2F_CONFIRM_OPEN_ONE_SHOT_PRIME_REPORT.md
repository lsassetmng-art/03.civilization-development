============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- レビュー承認/差し戻し確認画面

現在位置:
- V10GC2B: 既存server routeへのUI接続あり
- V10GC2C/D: 強すぎる自動primeで確認画面遷移を邪魔したため撤去対象
- 現象:
  - metadata等をタップすると「承認を実行する」が押せる
  - つまり追加タップのclickイベント後に補正が走っている

今回:
1. core/server syntax確認
2. core backup
3. V10GC2C / V10GC2D が残っていれば撤去
4. V10GC2B は残す
5. 「承認確認へ進む」「差し戻し確認へ進む」を押した直後だけ one-shot prime を走らせる
6. render後にも軽く数回だけ補正する
7. MutationObserver / 常時interval は使わない
8. server patchなし
9. DB/API操作なし
10. ブラウザ起動

確認:
- 承認確認へ進むで止まらない
- metadataをタップしなくても、1〜2秒以内に「承認を実行する」が押せる
- まず1件だけ実行

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2f_confirm_open_one_shot_prime_20260504_055353
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

============================================================
2. syntax precheck
============================================================
PASS: syntax OK

============================================================
3. backup core
============================================================
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2f_confirm_open_one_shot_prime_20260504_055353/aicm-production-core.before_v10gc2f.js

============================================================
4. patch core
============================================================
REMOVED_AICM_R8Z_V10GC2C_REVIEW_CONFIRM_BUTTON_FORCE_ENABLE=false
REMOVED_AICM_R8Z_V10GC2D_REVIEW_CONFIRM_AUTO_PRIME=false
PATCH_APPLIED: V10GC2F one-shot confirm prime appended

============================================================
5. syntax postcheck
============================================================
PASS: syntax OK after patch

============================================================
6. verify
============================================================
V10GC2B_CORE_MARKER_COUNT=2
V10GC2C_MARKER_COUNT=0
V10GC2D_MARKER_COUNT=0
V10GC2F_MARKER_COUNT=2
V10GC2F_APPROVE_ACTION_COUNT=4
V10GC2F_RETURN_ACTION_COUNT=4
V10GC2F_MUTATION_OBSERVER_COUNT=1
V10GC2F_INTERVAL_COUNT=0
V10GC_SERVER_MARKER_COUNT=0
DB_WRITE=NO
API_POST=NO
SERVER_PATCH=NO

============================================================
7. restart server
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=2d2bd072c1c95369745b1894d864935bb21744f5c06c83888f5c7e8ec8869278
SERVED_SHA=2d2bd072c1c95369745b1894d864935bb21744f5c06c83888f5c7e8ec8869278
SERVED_V10GC2F_COUNT=2

============================================================
8. final
============================================================
FINAL_JUDGEMENT=V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_READY_BROWSER_OPENED
V10GC2B_CORE_MARKER_COUNT=2
V10GC2C_MARKER_COUNT=0
V10GC2D_MARKER_COUNT=0
V10GC2F_MARKER_COUNT=2
V10GC2F_APPROVE_ACTION_COUNT=4
V10GC2F_RETURN_ACTION_COUNT=4
V10GC2F_MUTATION_OBSERVER_COUNT=1
V10GC2F_INTERVAL_COUNT=0
V10GC_SERVER_MARKER_COUNT=0
ROOT_HTTP=200
SERVED_HTTP=200
SERVED_V10GC2F_COUNT=2
BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10gc2f_20260504_055353
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2f_confirm_open_one_shot_prime_20260504_055353/000_R8Z_V10GC2F_CONFIRM_OPEN_ONE_SHOT_PRIME_REPORT.md
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2f_confirm_open_one_shot_prime_20260504_055353/aicm-production-core.before_v10gc2f.js
DB_WRITE=NO
API_POST=NO
CORE_PATCH=YES
SERVER_PATCH=NO

BROWSER_CHECK:
1. レビュー・承認待ち一覧を開く
2. 成果物を確認
3. 「承認確認へ進む」を押す
4. 止まらず、承認前の最終確認カードへ進む
5. metadataを触らず1〜2秒待つ
6. 「承認を実行する」が押せる状態になればOK
7. まず1件だけ実行
8. 実行後、レビュー一覧が 2件 -> 1件 になればOK

注意:
- 押すと本当にDB更新します。
- まず1件だけ。
- 成功後に結果を貼ってください。

Rollback:
  cp -f "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10gc2f_confirm_open_one_shot_prime_20260504_055353/aicm-production-core.before_v10gc2f.js" "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
  node --check "/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js"
