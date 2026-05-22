-- ============================================================
-- WorkerRentalCore runtime role grants
-- NOT APPLIED
-- ============================================================
-- Purpose:
--   Allow non-BYPASSRLS runtime role to run direct RLS verification
--   and future runtime access through RLS.
--
-- Target role:
--   aiemp_role__app_worker
--
-- Safety:
--   No DELETE grants.
--   This file ends with ROLLBACK.
-- ============================================================

BEGIN;

GRANT USAGE ON SCHEMA business TO aiemp_role__app_worker;

GRANT SELECT, INSERT, UPDATE ON TABLE business.worker_rental_contract TO aiemp_role__app_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE business.worker_rental_contract_line TO aiemp_role__app_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE business.worker_rental_status_history TO aiemp_role__app_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE business.worker_rental_period TO aiemp_role__app_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE business.worker_rental_usage_log TO aiemp_role__app_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE business.worker_rental_end_summary TO aiemp_role__app_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE business.worker_rental_safety_event TO aiemp_role__app_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE business.worker_rental_payment_intent TO aiemp_role__app_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE business.worker_rental_entitlement_grant TO aiemp_role__app_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE business.worker_rental_entitlement_balance TO aiemp_role__app_worker;
GRANT SELECT, INSERT, UPDATE ON TABLE business.worker_rental_entitlement_usage TO aiemp_role__app_worker;

COMMIT;
