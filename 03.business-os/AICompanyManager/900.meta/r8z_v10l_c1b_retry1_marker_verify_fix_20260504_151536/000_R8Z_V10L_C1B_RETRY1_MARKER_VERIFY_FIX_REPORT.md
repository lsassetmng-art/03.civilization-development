# AICompanyManager V10L-C1B retry1 marker verification fix report

## 1. Result

FINAL_STATUS=V10L_C1B_RETRY1_MARKER_VERIFY_FIX_DONE_REVIEW_REQUIRED

## 2. What happened before

前回は RENDERER_MARKER_COUNT_NOT_1 で停止。
原因は renderer marker が JSコメントとHTMLコメントの2か所に入るため。
COREは前回スクリプトでバックアップ復元済み。

## 3. Retry1 fix

- 前回パッチャーを再利用
- renderer marker 検証を「1個限定」から「1個以上」に変更
- 実装内容は前回と同じ
- DB/API/serverは触らない

## 4. Scope

- Target: renderPmlwMajorRowsBaseAxuR1B
- CORE_PATCH: YES
- SERVER_PATCH: NO
- DB_WRITE: NO
- API_POST: NO
- SERVER_RESTART: NO

## 5. Implemented

- 登録済み大項目リスト直上に集約操作パネルを追加
- ボタン:
  - 課長へ送る
  - 削除
  - 全件選択
  - 解除
- 各大項目行にcheckboxを追加
- 個別「課長へ送る」ボタンを対象レンダラーから除去
- Yes/No確認を画面制御のみで追加
- Yes押下時もDB更新/API POSTなし

## 6. Safety

- SQL未使用
- PERSONA_DATABASE_URL未使用
- DATABASE_URL未使用
- DB_WRITE=NO
- API_POST=NO
- server/API route変更なし
- server restartなし
- 佐藤(DB担当)レビュー観点: DB作業なし

## 7. Files

- BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_retry1_marker_verify_fix_20260504_151536/aicm-production-core.before_v10l_c1b_retry1.js
- PATCHER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_retry1_marker_verify_fix_20260504_151536/900_v10l_c1b_retry1_patcher.mjs
- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_retry1_marker_verify_fix_20260504_151536/010_verify.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_retry1_marker_verify_fix_20260504_151536/020_node_check.txt
- EXTRACT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_retry1_marker_verify_fix_20260504_151536/030_patched_renderer_extract.txt

## 8. Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c1b_retry1_20260504_151536

## 9. Manual check

1. 登録済み大項目の上に「登録済み大項目 操作」パネルが出る
2. 各行にcheckboxが出る
3. 個別「課長へ送る」ボタンが消えている
4. 全件選択で未送信分だけ選択される
5. 解除で選択解除される
6. 課長へ送る/削除で対象タイトル一覧 + Yes/No が出る
7. Yes押下時にDB/API未実行メッセージが出る

