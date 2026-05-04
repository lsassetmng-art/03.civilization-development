# AICompanyManager V10L-C1G visible panel checkbox polish report

## Result

FINAL_STATUS=V10L_C1G_VISIBLE_PANEL_CHECKBOX_POLISH_DONE_REVIEW_REQUIRED

## Scope

- Target: aicmRenderManagerMajorRows(rows)
- CORE_PATCH=YES
- SERVER_PATCH=NO
- SERVER_RESTART=NO
- DB_WRITE=NO
- API_POST=NO

## What changed

- C1Fで見えなかった操作パネルを、登録済み大項目のページング直前へ移動
- 操作パネル呼び出しを target renderer 内で1個に整理
- checkbox の見た目を小さく横並びに調整
- 個別「課長へ送る」action は引き続き target renderer 内で0

## Safety

- SQL未使用
- PERSONA_DATABASE_URL未使用
- DATABASE_URL未使用
- DB_WRITE=NO
- API_POST=NO
- server/API route変更なし
- server restartなし
- 佐藤(DB担当)レビュー観点: DB作業なし

## Files

- BACKUP_CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1g_visible_panel_checkbox_polish_20260504_175227/aicm-production-core.before_v10l_c1g.js
- VERIFY_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1g_visible_panel_checkbox_polish_20260504_175227/010_verify.txt
- CHECK_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1g_visible_panel_checkbox_polish_20260504_175227/020_node_check.txt
- EXTRACT_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1g_visible_panel_checkbox_polish_20260504_175227/030_active_card_renderer_extract.txt
- HTTP_OUT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1g_visible_panel_checkbox_polish_20260504_175227/040_http_check.txt

## Browser

- BROWSER_URL=http://127.0.0.1:8794/?v=r8z_v10l_c1g_20260504_175227

## Manual check

1. 登録済み大項目タイトル直下、または前ページボタンの直前に「登録済み大項目 操作」パネルが出る
2. 各カードのcheckboxが横並びで小さく表示される
3. 個別「課長へ送る」「削除」はカードから消えたまま
4. 全件選択/解除が動く
5. 課長へ送る/削除でYes/No確認が出る

