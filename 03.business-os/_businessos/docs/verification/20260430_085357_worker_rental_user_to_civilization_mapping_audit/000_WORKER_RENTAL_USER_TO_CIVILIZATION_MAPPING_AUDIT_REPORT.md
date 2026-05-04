# WorkerRentalCore user_id to civilization_id Mapping Audit Report

## Result
- RESULT: PASS
- FINAL_STATUS: MAPPING_REVIEW_REQUIRED
- PASS_COUNT: 9
- WARN_COUNT: 2
- FAIL_COUNT: 0

## What this did
- searched for user_id / civilization_id mapping candidates
- counted worker_rental existing user_id usage
- checked parent-child joinability
- generated mapping/backfill design docs
- generated backfill proposal only

## What this did not do
- no DB changes
- no ALTER TABLE
- no UPDATE
- no RLS changes
- no API changes
- no AICompanyManager changes

## Generated files
- MAPPING_DESIGN: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/WorkerRentalCore/040.db/030_WORKER_RENTAL_USER_TO_CIVILIZATION_MAPPING_DESIGN.md
- BACKFILL_DESIGN: /data/data/com.termux/files/home/01.civilization-system/07.applications/03.business-app/WorkerRentalCore/060.migration/030_WORKER_RENTAL_OWNER_CIVILIZATION_BACKFILL_DESIGN.md
- BACKFILL_PROPOSAL: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/db_proposals/030_worker_rental_owner_civilization_backfill_PROPOSAL_NOT_APPLIED.sql

## Evidence files
- CANDIDATE_COLUMNS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_085357_worker_rental_user_to_civilization_mapping_audit/010_mapping_candidate_columns.txt
- CANDIDATE_TABLES: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_085357_worker_rental_user_to_civilization_mapping_audit/020_mapping_candidate_tables.txt
- USER_DISTRIBUTION: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_085357_worker_rental_user_to_civilization_mapping_audit/030_worker_rental_user_distribution.txt
- PARENT_CHILD_JOINABILITY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_085357_worker_rental_user_to_civilization_mapping_audit/040_worker_rental_parent_child_joinability.txt
- DYNAMIC_MAPPING_COUNTS: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_085357_worker_rental_user_to_civilization_mapping_audit/050_dynamic_mapping_candidate_counts.txt
- RECOMMENDATION_SUMMARY: /data/data/com.termux/files/home/03.civilization-development/03.business-os/_businessos/docs/verification/20260430_085357_worker_rental_user_to_civilization_mapping_audit/060_mapping_recommendation_summary.md

## Recommendation summary
# WorkerRentalCore user_id -> civilization_id mapping recommendation

## Strong mapping candidates

## Candidate row counts

## WorkerRental existing user_id distribution
TABLE_USER_COUNT|worker_rental_contract|0|0|0
TABLE_USER_COUNT|worker_rental_period|0|0|0
TABLE_USER_COUNT|worker_rental_usage_log|0|0|0
TABLE_USER_COUNT|worker_rental_end_summary|0|0|0
TABLE_USER_COUNT|worker_rental_safety_event|0|0|0
TABLE_USER_COUNT|worker_rental_payment_intent|0|0|0
TABLE_USER_COUNT|worker_rental_entitlement_grant|0|0|0
TABLE_USER_COUNT|worker_rental_entitlement_balance|0|0|0
TABLE_USER_COUNT|worker_rental_entitlement_usage|0|0|0

## Parent-child joinability
CHILD_JOIN|worker_rental_contract_line|0|0|0
CHILD_JOIN|worker_rental_status_history|0|0|0
CHILD_JOIN|worker_rental_period|0|0|0
CHILD_JOIN|worker_rental_usage_log|0|0|0

## Next required decision
- Select the canonical user_id -> civilization_id mapping source.
- If no strong candidate exists, create/identify an identity bridge before backfill.
- Do not apply owner_civilization_id backfill yet.

## Next
If FINAL_STATUS=MAPPING_CANDIDATE_READY:
- choose the mapping source
- generate exact backfill migration, still not apply until review

If FINAL_STATUS=MAPPING_REVIEW_REQUIRED:
- inspect candidate tables
- if no valid bridge exists, design an identity bridge table before backfill

## Safety
- DB write: none
- RLS change: none
- API change: none
- delete: none
- ERP DATABASE_URL: not used
