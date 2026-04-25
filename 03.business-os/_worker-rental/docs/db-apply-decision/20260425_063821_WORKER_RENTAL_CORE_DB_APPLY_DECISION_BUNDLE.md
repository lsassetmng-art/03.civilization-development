# WorkerRentalCore DB Apply Decision Bundle

status: decision-required
generated_at: 20260425_063821

core_name:
- WorkerRentalCore

target_app:
- CasualChatWorker
- 雑談ワーカー

## 1. 現在位置

CasualChatWorker final acceptance package は作成済み。

次工程として WorkerRentalCore DB apply の判断資料を作成した。

このワンブロックでは DB apply は実行していない。

## 2. 正本

### WorkerRentalCore

- 汎用 worker rental 基盤
- minute / hour / day / month / year 対応
- 汎用最大2年
- アプリ別価格
- アプリ別最短契約
- アプリ別最大契約
- 月初無料チケットは各アプリの最短契約時間1回分を無料にする

### CasualChatWorker

- app_code: CasualChatWorker
- service_code: casual_chat_worker
- 最短契約: 30分
- 最大契約: 120分
- 価格:
  - 30分 500円
  - 60分 1,000円
  - 90分 1,500円
  - 120分 2,000円
- 月初無料チケット:
  - 2枚
  - 1枚 = 30分無料
  - 合計60分無料
  - source_rule = shortest_contract_duration

## 3. 生成物

static_audit:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_STATIC_AUDIT.md

sato_review_checklist:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_SATO_REVIEW_CHECKLIST.md

apply_runbook:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_RUNBOOK.md

stop_conditions:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/docs/db-apply-decision/20260425_063821_WORKER_RENTAL_CORE_DB_APPLY_STOP_CONDITIONS.md

migration_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/migrations/20260425_052921_business_worker_rental_core_app_limit_free_ticket_ddl.sql

apply_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh

verify_sql:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sql

verify_script:
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/verification/20260425_052921_verify_business_worker_rental_core_app_limit_free_ticket_ddl.sh

## 4. Static Audit Result

- static_status: FAIL
- PASS_COUNT: 48
- FAIL_COUNT: 1
- WARN_COUNT: 1

## 5. Decision

現時点の判定:

- Boss approval: required
- 佐藤（DB担当）review: required
- DB apply: not executed

次の実行候補:

/data/data/com.termux/files/home/03.civilization-development/03.business-os/_worker-rental/db/apply/20260425_052921_apply_business_worker_rental_core_app_limit_free_ticket_ddl.sh

ただし、実行してよいのは以下を満たした場合のみ。

- Boss が明示的に「DB applyして」と言う
- 佐藤（DB担当）レビューで GO
- static_status が PASS
- STOP条件に該当しない

