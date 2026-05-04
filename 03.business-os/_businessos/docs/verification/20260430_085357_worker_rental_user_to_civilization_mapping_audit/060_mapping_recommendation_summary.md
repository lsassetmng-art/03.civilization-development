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
