# Next plan

Open:
http://127.0.0.1:8794/?v=20260430_194730_async_fixed

Manual UI check:
1. 白画面が消えるか確認
2. ダッシュボードが表示されるか確認
3. 会社概要が企業変更画面に化けていたら、次に renderCompanyOverview 誤爆を修正する

Known remaining issue candidate:
- renderCompanyOverview still points to renderAicmCompanyUpdateScreen if RENDER_COMPANY_OVERVIEW_TO_EDIT_COUNT >= 1.
- This is not the direct runtime white-screen cause, but likely UI崩れ原因。
