============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager
- 部門別タスク台帳
- 登録済み大項目
- renderPmlwMajorRows(rows)

現在位置:
- DB/viewには大項目が存在する
- 画面にも登録済み大項目が表示される
- しかしB1系後付けUIは rows 本体に乗っておらず、0件扱いになった
- 保守性維持のため、DOM後付けではなく既存レンダラー本体へ戻す

今回:
1. core/server syntax確認
2. core backup
3. B1/B1B/B1C/B1D/B1E/B1F/B1G/B1H/B1I/B1J 系の後付けブロックを除去
4. renderPmlwMajorRows(rows) の関数本体だけを置換
5. rows 引数を正本データとして、上部集約ボタンを表示
6. 各大項目カード/行に選択チェックを表示
7. 個別の「課長へ送る」「削除」はレンダー元から出さない
8. 確認画面はタイトル一覧 + Yes / No のみ
9. Yesを押しても今回はDB更新/API POSTなし
10. server再起動
11. ブラウザ起動

保守性方針:
- DOM後付けでカード探索しない
- 既存レンダラーの rows を使う
- 変更対象は renderPmlwMajorRows(rows) と旧B1ブロック除去に限定
- server / DB / API route は触らない

禁止:
- DB write
- API POST
- server patch
- 実POST解放

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354
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
BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1_canonical_renderer_repair_20260504_113354/aicm-production-core.before_v10l_c1.js

============================================================
4. patch core
============================================================
