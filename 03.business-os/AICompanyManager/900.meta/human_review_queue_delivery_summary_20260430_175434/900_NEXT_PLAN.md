# Next plan

Open:
http://127.0.0.1:8794/?v=20260430_175434_human_review_queue

Manual UI check:
1. レビュー・承認待ち一覧を開く
2. 何もなければ「レビュー・承認待ちはありません」で正常
3. 人間レビュー説明が「納品サマリー確認」になっていることを確認
4. AIレビューは内部工程で通常通り、結果要約だけ表示という文言を確認

Future data flow:
- Worker/Leader/Manager側が納品時に /api/aicm/v2/human-review/create を呼ぶ
- 画面側では承認 / 差し戻しのみ行う
- API POSTは今回の検証では実行していない
