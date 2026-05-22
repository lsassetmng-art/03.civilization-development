# WorkerRentalCore Owner Civilization RLS Apply Design

## Status
- phase: RLS apply design
- SQL generated: yes
- SQL applied: no

## Owner boundary
WorkerRentalCore user-owned rental rows are protected by:

```sql
owner_civilization_id = business.fn_worker_rental_current_civilization_id()
```

Runtime API must set:

```sql
SELECT set_config('app.current_civilization_id', '<civilization_id>', true);
```

inside the same transaction.

## Target tables
- worker_rental_contract
- worker_rental_contract_line
- worker_rental_status_history
- worker_rental_period
- worker_rental_usage_log
- worker_rental_end_summary
- worker_rental_safety_event
- worker_rental_payment_intent
- worker_rental_entitlement_grant
- worker_rental_entitlement_balance
- worker_rental_entitlement_usage

## Policies
Per table:
- SELECT owner policy
- INSERT owner policy
- UPDATE owner policy

No DELETE policies are created.

## Current generated SQL
- /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/070_worker_rental_owner_civilization_rls_APPLY_NOT_EXECUTED.sql

## Apply rule
This SQL is NOT_EXECUTED and ends with ROLLBACK.
To apply, create a separate APPLY copy after explicit GO and replace final ROLLBACK with COMMIT.

## Required post-apply verification
1. RLS enabled on 11 tables.
2. 33 owner policies exist.
3. Same-owner E2E passes.
4. Cross-owner access denied.
5. No AICompanyManager or ERP side effect.
