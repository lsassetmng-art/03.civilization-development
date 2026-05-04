BEGIN;

-- ============================================================
-- BusinessOS read/catalog tables
-- ============================================================

ALTER TABLE business.robot_placement_role_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS robot_placement_role_catalog_active_read
ON business.robot_placement_role_catalog;

CREATE POLICY robot_placement_role_catalog_active_read
ON business.robot_placement_role_catalog
FOR SELECT
USING (status_code = 'active');

ALTER TABLE business.robot_pool ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS robot_pool_active_read
ON business.robot_pool;

CREATE POLICY robot_pool_active_read
ON business.robot_pool
FOR SELECT
USING (status_code = 'active');

-- ============================================================
-- AIWorkerOS read/reference canon tables
-- ============================================================

ALTER TABLE aiworker.robot_series_behavior_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS robot_series_behavior_profile_active_read
ON aiworker.robot_series_behavior_profile;

CREATE POLICY robot_series_behavior_profile_active_read
ON aiworker.robot_series_behavior_profile
FOR SELECT
USING (status_code = 'active');

ALTER TABLE aiworker.robot_model_personality_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS robot_model_personality_profile_active_read
ON aiworker.robot_model_personality_profile;

CREATE POLICY robot_model_personality_profile_active_read
ON aiworker.robot_model_personality_profile
FOR SELECT
USING (status_code = 'active');

ALTER TABLE aiworker.robot_model_public_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS robot_model_public_profile_active_read
ON aiworker.robot_model_public_profile;

CREATE POLICY robot_model_public_profile_active_read
ON aiworker.robot_model_public_profile
FOR SELECT
USING (status_code = 'active');

COMMIT;
