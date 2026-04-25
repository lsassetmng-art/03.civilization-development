-- ============================================================
-- WorkerRentalCore confirm transaction SQL template
-- ============================================================
-- template_only: true
-- do_not_execute_directly: true
-- env_when_implemented: PERSONA_DATABASE_URL
--
-- This template documents the intended transaction.
-- Backend implementation must parameterize all values.
-- ============================================================

begin;

-- 1. Read active service catalog and validate app limits.
-- select * from business.v_worker_rental_service_catalog_active
-- where app_code = :app_code
--   and service_code = :service_code
-- for share;

-- 2. Read active price row.
-- select * from business.v_worker_rental_price_catalog_active
-- where app_code = :app_code
--   and service_code = :service_code
--   and rental_unit_kind = :rental_unit_kind
--   and rental_unit_count = :rental_unit_count
--   and is_active = true
-- for share;

-- 3. Lock entitlement balance if applying ticket.
-- select * from business.worker_rental_entitlement_balance
-- where app_code = :app_code
--   and service_code = :service_code
--   and user_id = :user_id
--   and grant_period = :grant_period
--   and entitlement_kind = 'monthly_shortest_contract_free_ticket'
--   and balance_status = 'active'
-- for update;

-- 4. Insert worker_rental_contract.
-- insert into business.worker_rental_contract (...) values (...) returning *;

-- 5. Insert worker_rental_contract_line rows.
-- insert into business.worker_rental_contract_line (...) values (...);

-- 6. Insert worker_rental_period.
-- insert into business.worker_rental_period (...) values (...) returning *;

-- 7. Insert worker_rental_payment_intent.
-- insert into business.worker_rental_payment_intent (...) values (...);

-- 8. Insert worker_rental_entitlement_usage when used_quantity > 0.
-- insert into business.worker_rental_entitlement_usage (...) values (...);

-- 9. Update worker_rental_entitlement_balance after usage.
-- update business.worker_rental_entitlement_balance
-- set used_quantity = used_quantity + :used_quantity,
--     remaining_quantity = remaining_quantity - :used_quantity,
--     remaining_total_units = (remaining_quantity - :used_quantity) * entitlement_unit_count,
--     updated_at = now()
-- where entitlement_balance_id = :entitlement_balance_id
--   and remaining_quantity >= :used_quantity;

-- 10. Insert status history.
-- insert into business.worker_rental_status_history (...) values (...);

commit;
