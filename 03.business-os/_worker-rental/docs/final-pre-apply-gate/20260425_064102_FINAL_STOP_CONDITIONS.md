# Final STOP Conditions Before DB Apply

status: active
generated_at: 20260425_064102

## 1. Absolute STOP

Do not apply if any are true:

- Boss has not explicitly said DB apply
- 佐藤（DB担当） has not given GO
- final_gate_status is not READY_FOR_REVIEW
- migration SQL is missing
- apply script is missing
- verify SQL is missing
- verify script is missing
- PERSONA_DATABASE_URL is not set
- attempting to use DATABASE_URL
- migration contains DROP TABLE
- migration contains TRUNCATE TABLE
- migration contains DELETE FROM
- migration contains service_role or secret
- CasualChatWorker max 120 minutes is not confirmed
- monthly free ticket source_rule shortest_contract_duration is not confirmed

## 2. Review STOP

佐藤判断でSTOP:

- trigger replacement is unsafe
- existing business schema conflicts with new objects
- check constraints are insufficient
- app-specific max duration cannot be enforced
- entitlement model cannot support future apps

## 3. Apply Result STOP

After apply, stop if verify does not show:

- worker_rental_unit_policy
- worker_rental_service_catalog
- worker_rental_price_catalog
- worker_rental_contract
- worker_rental_entitlement_grant
- worker_rental_entitlement_balance
- worker_rental_entitlement_usage
- v_worker_rental_service_catalog_active
- v_worker_rental_monthly_free_ticket_rule
- CasualChatWorker service row
- price rows for 30 / 60 / 90 / 120
- monthly free ticket 2 x 30 minutes
- app max 120 minutes

