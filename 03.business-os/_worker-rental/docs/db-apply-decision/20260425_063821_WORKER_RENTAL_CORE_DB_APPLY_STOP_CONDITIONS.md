# WorkerRentalCore DB Apply STOP Conditions

status: stop-conditions
generated_at: 20260425_063821

## 1. 即STOP条件

以下のどれかに該当したらDB applyしない。

- 佐藤（DB担当）レビューが未完了
- Boss明示承認がない
- PERSONA_DATABASE_URL が未設定
- DATABASE_URL / ERP側環境変数で実行しようとしている
- migration SQL が見つからない
- apply script が見つからない
- verify SQL が見つからない
- static audit が FAIL
- DROP TABLE / TRUNCATE TABLE / DELETE FROM が含まれる
- service_role / secret が含まれる
- CasualChatWorker の最大契約120分制限が確認できない
- monthly_free_ticket_source_rule = shortest_contract_duration が確認できない

## 2. 条件付きSTOP

以下は佐藤判断。

- drop trigger if exists が含まれる
  - 同名trigger置換目的なら許容候補
  - 既存別用途trigger破壊ならSTOP

## 3. Apply後STOP

適用後verifyで以下が確認できなければSTOP。

- worker_rental_* テーブルが揃わない
- WorkerRentalCore views が揃わない
- CasualChatWorker service row がない
- price catalog 30/60/90/120 がない
- 月初無料チケット rule がない
- app max 120 minutes がない

