# WorkerRentalCore RLS Runtime Context Design

## Status
- phase: no-patch trace
- DB write: none
- API patch: none
- RLS apply: none

## Finding
RobotRentalStore already accepts owner civilization context from request header:
- X-Civilization-Id
- x-civilization-id

However RLS requires the database session to know:
- app.current_civilization_id

Current API shape uses a psql helper that sends SQL directly to psql per call.
Therefore RLS-safe write/read SQL must set the DB session context inside the same transaction as the target SQL.

## Required API patch before RLS apply
Introduce a context wrapper pattern around SQL executed for owner-scoped operations.

Preferred pattern for write SQL:

```sql
BEGIN;
SELECT set_config('app.current_civilization_id', '<owner_civilization_id>', true);

-- existing owner-scoped SELECT/INSERT/UPDATE SQL here

COMMIT;
```

For read-only or rollback smoke:

```sql
BEGIN;
SELECT set_config('app.current_civilization_id', '<owner_civilization_id>', true);

-- target SELECT

ROLLBACK;
```

## Required behavior
- Header civilization context remains the API input source.
- API validates UUID before passing to SQL.
- SQL uses app.current_civilization_id for RLS compatibility.
- owner_civilization_id remains explicitly written into rows.
- company_id is not the owner boundary.

## RLS apply sequence
1. Patch API runtime SQL context wrapper.
2. Run API E2E with context wrapper and RLS still disabled.
3. Apply RLS only after E2E passes.
4. Run E2E after RLS apply.
5. Verify cross-owner denial.

## Evidence
- RUN_DIR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/verification/20260520_170848_rls_runtime_context_trace_no_patch
- CONTEXT_CAPABILITY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/verification/20260520_170848_rls_runtime_context_trace_no_patch/050_context_capability.txt
- DB_CONTEXT_SMOKE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/verification/20260520_170848_rls_runtime_context_trace_no_patch/060_db_context_smoke.txt
