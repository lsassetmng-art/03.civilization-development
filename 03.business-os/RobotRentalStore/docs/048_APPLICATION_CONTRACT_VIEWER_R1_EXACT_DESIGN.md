# アプリケーション契約閲覧 R1 Exact Design

## Decision
アプリケーション契約閲覧は、現時点では新規 application_contract テーブルを作らず、既存 WorkerRentalCore 契約テーブルを read surface として使う。

## Canonical read surface
- business.worker_rental_contract
- business.worker_rental_contract_line
- business.worker_rental_payment_intent
- business.worker_rental_entitlement_grant
- business.worker_rental_entitlement_balance
- business.worker_rental_entitlement_usage
- business.worker_rental_status_history

## Ownership boundary
- owner_civilization_id
- X-Civilization-Id
- app.current_civilization_id

## Route
- /aiworker-menu/application-contracts

## Static UI target
- RobotRentalStore/ui/static/application-contracts.html

## Non-goals
- DB schema change
- RLS change
- write API
- payment execution
- contract mutation
- multilingual
