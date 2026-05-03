# Next plan

Open:
http://127.0.0.1:8794/?v=20260430_183709_human_review_scope_fixed

Manual UI check:
1. AI企業ダッシュボードが崩れていない
2. 部門別タスク台帳が開く
3. レビュー・承認待ち一覧を開く
4. 何もなければ「レビュー・承認待ちはありません」で正常
5. renderShell誤爆がないため、他画面の共通shell表示が崩れていないことを確認

Maintained:
- DB human review table/view
- server review_wait_items context
- server human-review create / approve / return API
