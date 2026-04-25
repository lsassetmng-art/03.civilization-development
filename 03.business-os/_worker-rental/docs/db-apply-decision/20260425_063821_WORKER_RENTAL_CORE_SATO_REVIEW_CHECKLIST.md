# WorkerRentalCore 佐藤（DB担当）レビュー チェックリスト

status: review-required
generated_at: 20260425_063821

## 1. レビュー対象

migration_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql

apply_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh

verify_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql

verify_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh

static_audit:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_STATIC_AUDIT.md

## 2. 佐藤レビュー必須観点

### 2-1. 汎用WorkerRentalCore

- [ ] worker_rental_* がチャット専用ではなく汎用レンタル基盤になっている
- [ ] minute / hour / day / month / year を扱える
- [ ] 汎用最大2年の制約が表現されている
- [ ] app_code / service_code でアプリ別価格を分離している
- [ ] app別の最短契約・最大契約が service_catalog にある
- [ ] contract trigger が app別上限を確認している

### 2-2. CasualChatWorker固有条件

- [ ] app_code = CasualChatWorker
- [ ] service_code = casual_chat_worker
- [ ] minimum contract = minute 30
- [ ] app max contract = minute 120
- [ ] 30分 = 500円
- [ ] 60分 = 1,000円
- [ ] 90分 = 1,500円
- [ ] 120分 = 2,000円
- [ ] 120分超を拒否できる

### 2-3. 月初無料チケット

- [ ] monthly_free_ticket_source_rule = shortest_contract_duration
- [ ] CasualChatWorker では 1枚 = 30分無料
- [ ] 月初2枚
- [ ] 合計60分無料
- [ ] 別アプリでは最短契約時間に応じて 10分 / 60分 などに変えられる
- [ ] entitlement_* がアプリ別に保持できる

### 2-4. 安全性

- [ ] DROP TABLE なし
- [ ] TRUNCATE TABLE なし
- [ ] DELETE FROM なし
- [ ] ERP側 DATABASE_URL を使っていない
- [ ] PERSONA_DATABASE_URL 前提
- [ ] service_role / secret を含まない
- [ ] 既存businessテーブルへの破壊的変更なし

## 3. 佐藤判定欄

- [ ] GO
- [ ] STOP
- [ ] 条件付きGO

コメント:

