# WorkerRentalCore 佐藤（DB担当）最新版レビュー資料

status: review-required
generated_at: 20260425_064102

## 1. レビュー依頼

佐藤（DB担当）へ。

BusinessOS の汎用 WorkerRentalCore DB apply 前レビューをお願いします。

## 2. レビュー対象

migration_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql

apply_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh

verify_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql

verify_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh

final_pre_apply_gate:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/final-pre-apply-gate/20260425_064102_WORKER_RENTAL_CORE_FINAL_PRE_APPLY_GATE.md

static_audit:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_STATIC_AUDIT.md

stop_conditions:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_STOP_CONDITIONS.md

## 3. 設計意図

WorkerRentalCore は、CasualChatWorker 専用ではなく、複数の時間レンタル型ワーカーアプリで使う汎用基盤です。

対応単位:

- minute
- hour
- day
- month
- year

汎用最大:

- 2年

ただし、各アプリは service_catalog で個別に最短契約・最大契約・価格・無料チケット単位を持ちます。

## 4. CasualChatWorker 正本

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- v1 supported unit: minute
- minimum contract: 30 minutes
- app max contract: 120 minutes
- monthly free ticket rule: shortest_contract_duration
- monthly ticket quantity: 2
- one ticket = 30 minutes free
- total monthly free = 60 minutes

価格:

- 30 minutes: 500 JPY
- 60 minutes: 1,000 JPY
- 90 minutes: 1,500 JPY
- 120 minutes: 2,000 JPY

## 5. 佐藤レビュー判定欄

- [ ] GO
- [ ] STOP
- [ ] 条件付きGO

コメント:

## 6. 特に見てほしい点

- [ ] app別上限を trigger で確認している
- [ ] CasualChatWorker は 120分超を拒否できる
- [ ] 汎用2年上限とアプリ別上限が矛盾しない
- [ ] 月初無料チケットがアプリ最短契約時間に紐づく
- [ ] 価格が app_code / service_code ごとに分離される
- [ ] DROP TABLE / TRUNCATE / DELETE がない
- [ ] PERSONA_DATABASE_URL 前提で、ERP側DATABASE_URLを使わない
- [ ] drop trigger if exists が既存同名trigger置換として妥当か

