-- ============================================================
-- NOT EXECUTED
-- Old material view drop draft
-- Requires:
-- 1. New canonical material columns added/backfilled
-- 2. New canonical material view created
-- 3. AIWorkerOS provider switched to new canonical view
-- 4. DB dependency audit = zero
-- 5. code grep = zero live references
-- 6. 佐藤(DB担当) review
-- 7. explicit Boss GO
-- ============================================================

-- BEGIN;

-- DROP VIEW IF EXISTS aiworker.vw_robot_readable_brain_runtime_material_v1;
-- DROP VIEW IF EXISTS aiworker.vw_robot_readable_brain_runtime_material_v2;
-- DROP VIEW IF EXISTS aiworker.vw_robot_readable_brain_runtime_material_v3;
-- DROP VIEW IF EXISTS aiworker.vw_robot_brain_runtime_material_quality_overlay_v1;

-- COMMIT;
