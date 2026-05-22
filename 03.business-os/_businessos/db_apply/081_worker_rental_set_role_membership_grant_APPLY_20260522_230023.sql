-- ============================================================
-- WorkerRentalCore SET ROLE membership grant
-- NOT APPLIED
-- ============================================================
-- Purpose:
--   Allow current DB session role to SET ROLE aiemp_role__app_worker
--   for direct non-BYPASSRLS RLS verification.
--
-- Target role:
--   aiemp_role__app_worker
--
-- Grantee:
--   postgres
--
-- Safety:
--   No table grants.
--   No DELETE grants.
--   No RLS changes.
--   This file ends with ROLLBACK.
-- ============================================================

BEGIN;

GRANT aiemp_role__app_worker TO postgres;

COMMIT;
