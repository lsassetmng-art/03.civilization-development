BEGIN;

DROP POLICY IF EXISTS company_robot_placement_company_update
ON business.company_robot_placement;

DROP POLICY IF EXISTS company_robot_placement_company_insert
ON business.company_robot_placement;

DROP POLICY IF EXISTS company_robot_placement_company_select
ON business.company_robot_placement;

DROP POLICY IF EXISTS company_robot_entitlement_company_update
ON business.company_robot_entitlement;

DROP POLICY IF EXISTS company_robot_entitlement_company_insert
ON business.company_robot_entitlement;

DROP POLICY IF EXISTS company_robot_entitlement_company_select
ON business.company_robot_entitlement;

ALTER TABLE business.company_robot_placement DISABLE ROW LEVEL SECURITY;
ALTER TABLE business.company_robot_entitlement DISABLE ROW LEVEL SECURITY;

COMMIT;
