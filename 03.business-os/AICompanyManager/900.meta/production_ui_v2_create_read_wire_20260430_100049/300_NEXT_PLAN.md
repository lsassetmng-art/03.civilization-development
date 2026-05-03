# Next plan

Open production UI:

http://127.0.0.1:8794/?v=20260430_100049

Test from production UI:

1. AI企業新規追加
2. 会社名を入力
3. AI企業を追加
4. Dashboardに戻り、作成会社が出ること
5. 部門追加
6. 部門を追加
7. 課追加
8. 課を追加
9. Dashboardで会社→部門→課が表示されること

Do not test edit/delete yet.
Do not migrate localStorage data.
Do not enable worker placement save yet.

After this passes:
- add production UI save/update for company/department/section
- add worker placement save using v2 placement endpoint
