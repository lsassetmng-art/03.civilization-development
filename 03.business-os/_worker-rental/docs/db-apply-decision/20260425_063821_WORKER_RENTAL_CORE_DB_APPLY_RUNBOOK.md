# WorkerRentalCore DB Apply Runbook

status: apply-runbook
generated_at: 20260425_063821

## 1. 前提

DB apply はこのワンブロックでは実行していない。

実行条件:

- Boss が明示的に DB apply を承認
- 佐藤（DB担当）レビューで GO
- PERSONA_DATABASE_URL が設定済み
- WorkerRentalCore migration / apply / verify package が存在

## 2. 対象

migration_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql

apply_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh

verify_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql

verify_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh

## 3. 実行コマンド

適用:

/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh

検証のみ:

/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh

## 4. 実行前確認

- echo $PERSONA_DATABASE_URL は表示しない
- env名が存在するかだけ確認する
- ERP用 DATABASE_URL では実行しない
- Termuxで実行する
- psql "$PERSONA_DATABASE_URL" を使用する

## 5. 期待されるverify結果

以下が確認できること。

- business.worker_rental_unit_policy
- business.worker_rental_service_catalog
- business.worker_rental_price_catalog
- business.worker_rental_contract
- business.worker_rental_entitlement_grant
- business.worker_rental_entitlement_balance
- business.worker_rental_entitlement_usage
- business.v_worker_rental_service_catalog_active
- business.v_worker_rental_monthly_free_ticket_rule
- business.v_worker_rental_price_catalog_active

CasualChatWorker service row:

- minimum_contract_unit_kind = minute
- minimum_contract_unit_count = 30
- app_max_contract_unit_kind = minute
- app_max_contract_unit_count = 120
- monthly_free_ticket_quantity = 2
- monthly_free_ticket_source_rule = shortest_contract_duration
- monthly_free_ticket_unit_count = 30

## 6. 実行後

適用ログと検証ログを保存し、次に以下を行う。

- apply result を CasualChatWorker docs/meta に参照メモとして追加
- implementation mock payload とDB viewの項目差分確認
- API実接続フェーズへ進むか判断

