# WorkerRentalCore owner_civilization_id Pre-apply Review

## Status
- status: pre-apply-review
- apply_status: not_applied
- owner: Boss
- prepared_by: Zero
- review: 佐藤(DB担当)

## 1. Purpose
Prepare for adding owner_civilization_id columns to WorkerRentalCore rental tables.

## 2. Current conclusion
- Existing WorkerRentalCore rental tables are empty.
- Historical backfill is not required.
- RobotRentalStore local API is civilization_id-aware.
- Quote remains dry-run/no-persist.
- Persistent write is still disabled.

## 3. Required DB change after approval
Add:
- owner_civilization_id to all user-owned worker_rental transaction/log tables
- target_company_id and erp_company_id only on worker_rental_contract
- indexes for owner_civilization_id

## 4. Current evidence
- row count evidence: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_090940_worker_rental_owner_civilization_preapply_review/020_target_table_row_counts.txt
- owner column evidence: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_090940_worker_rental_owner_civilization_preapply_review/030_current_owner_column_state.txt
- DDL proposal: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/040_worker_rental_owner_civilization_empty_tables_PROPOSAL_NOT_APPLIED.sql
- RLS proposal: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/041_worker_rental_owner_civilization_empty_tables_RLS_PROPOSAL_NOT_APPLIED.sql
- RobotRentalStore API evidence: /data/data/com.termux/files/home/03.civilization-development/03.business-os/RobotRentalStore/docs/verification/20260430_090813_robot_rental_store_api_create_or_patch_v2

## 5. Important
Do not enable RLS in the same step as column addition.
RLS should be after:
1. columns exist
2. quote/contract write path uses owner_civilization_id
3. write smoke passes
4. 佐藤(DB担当) approves RLS

## 6. Apply decision
This review does not apply DB changes.
Next separate step may be:
- approved owner_civilization_id column apply
