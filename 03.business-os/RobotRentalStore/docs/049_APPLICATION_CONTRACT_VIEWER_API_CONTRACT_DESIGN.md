# アプリケーション契約閲覧 API Contract Design

## List
GET /api/v1/business/application-contracts

Headers:
- X-Civilization-Id

Query:
- status optional
- app_code optional
- limit optional, 1..100

Response key:
- application_contracts

## Detail
GET /api/v1/business/application-contracts/:application_contract_id

Response keys:
- application_contract
- lines
- payment_intents
- entitlement_grants
- entitlement_balances
- entitlement_usages
- status_history

## Cross-owner
Return:
- ok=false
- error=application_contract_not_found

## Implementation rule
- GET only
- no DB write
- reuse civilization context helpers
- set app.current_civilization_id inside SQL transaction
- use prefixed row parser
