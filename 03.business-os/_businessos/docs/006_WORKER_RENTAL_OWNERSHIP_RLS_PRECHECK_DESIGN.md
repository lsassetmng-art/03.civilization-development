# WorkerRentalCore Ownership/RLS Precheck Design

## Status
- phase: precheck
- DB write: none
- RLS apply: none
- API post: none

## Scope
WorkerRentalCore / RobotRentalStore rental transactional data should be owned by owner_civilization_id.

## Required access boundary
- owner_civilization_id is the primary access boundary.
- company_id is not the BusinessOS owner boundary.
- app.current_civilization_id should be the runtime RLS context.

## Tables reviewed
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

## Preconditions before RLS apply
1. All transactional tables have owner_civilization_id.
2. Parent-child owner_civilization_id values match.
3. No orphan rows exist.
4. API write path sets app.current_civilization_id or equivalent trusted owner context.
5. Read paths are compatible with RLS.
6. Explicit GO is required before RLS apply.

## Current report
- REPORT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/verification/20260520_170500_ownership_rls_precheck/000_OWNERSHIP_RLS_PRECHECK_REPORT.md
- RUN_DIR: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/verification/20260520_170500_ownership_rls_precheck
- RLS_DRAFT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/060_worker_rental_owner_civilization_rls_DRAFT_NOT_APPLIED.sql
