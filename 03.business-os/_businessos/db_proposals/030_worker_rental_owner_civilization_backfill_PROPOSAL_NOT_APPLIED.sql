-- ============================================================
-- WorkerRentalCore owner_civilization_id backfill
-- PROPOSAL ONLY - NOT APPLIED
-- Review: 佐藤(DB担当)
-- ============================================================

-- DO NOT RUN until mapping source is selected and verified.
-- Replace business.<MAPPING_TABLE> and column names after audit.
-- This file intentionally ROLLBACKs.

BEGIN;

-- Example expected mapping CTE.
-- WITH user_civ_map AS (
--   SELECT
--     user_id,
--     civilization_id
--   FROM business.<MAPPING_TABLE>
--   WHERE user_id IS NOT NULL
--     AND civilization_id IS NOT NULL
-- )

-- Parent examples:
-- UPDATE business.worker_rental_contract c
-- SET owner_civilization_id = m.civilization_id
-- FROM user_civ_map m
-- WHERE c.user_id = m.user_id
--   AND c.owner_civilization_id IS NULL;

-- Child examples:
-- UPDATE business.worker_rental_contract_line l
-- SET owner_civilization_id = c.owner_civilization_id
-- FROM business.worker_rental_contract c
-- WHERE l.rental_contract_id = c.rental_contract_id
--   AND l.owner_civilization_id IS NULL
--   AND c.owner_civilization_id IS NOT NULL;

-- Verification examples:
-- SELECT 'worker_rental_contract_unresolved', COUNT(*)
-- FROM business.worker_rental_contract
-- WHERE owner_civilization_id IS NULL;

ROLLBACK;
