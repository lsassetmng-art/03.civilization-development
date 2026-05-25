# AI Worker契約閲覧 API Contract Design

## Owner
- API file: RobotRentalStore/api/robot-rental-store-local-api.js
- DB: PERSONA_DATABASE_URL
- Schema: business
- Tables: worker_rental_*
- Scope: owner_civilization_id
- Runtime context: app.current_civilization_id
- Required request header: X-Civilization-Id

## New endpoints

### Contract list
GET /api/v1/business/robot-rental/contracts

Required header:
- X-Civilization-Id: civilization uuid

Query parameters:
- status: quoted | confirmed | active | ended | canceled, optional
- limit: 1..100, optional, default 50

Response fields:
- ok
- owner_civilization_id
- contracts[]
  - rental_contract_id
  - app_code
  - service_code
  - aiworker_model_code
  - role_code
  - rental_unit_kind
  - rental_unit_count
  - rental_total_minutes
  - contract_status
  - base_price_jpy
  - final_price_jpy
  - created_at
  - updated_at
  - payment_status
  - period_status
  - remaining_seconds_snapshot
  - latest_status_event

### Contract detail
GET /api/v1/business/robot-rental/contracts/:rental_contract_id

Required header:
- X-Civilization-Id: civilization uuid

Response fields:
- ok
- owner_civilization_id
- contract
- lines[]
- periods[]
- payment_intents[]
- status_history[]
- end_summaries[]
- usage_logs[]
- safety_events[]

## SQL rule
Every SELECT must run inside a transaction and set:
SELECT set_config('app.current_civilization_id', owner_civilization_id, true);

Then select from business.worker_rental_*.

## Cross-owner behavior
If another civilization_id requests an existing rental_contract_id:
- ok=false
- error=contract_not_found

Do not leak whether the ID exists.

## API helper shape
Add:
- listContracts(req, url, context)
- getContractDetail(req, rentalContractId, context)

Reuse:
- psql(sql)
- sqlSetCurrentCivilizationContext(context)

Do not add DB Pool.
Do not add POST.
Do not change RLS.
