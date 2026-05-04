BEGIN;

-- ============================================================
-- company_robot_entitlement
-- ============================================================

ALTER TABLE business.company_robot_entitlement ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_robot_entitlement_company_select
ON business.company_robot_entitlement;

CREATE POLICY company_robot_entitlement_company_select
ON business.company_robot_entitlement
FOR SELECT
USING (
  company_id::text = current_setting('app.current_company_id', true)
);

DROP POLICY IF EXISTS company_robot_entitlement_company_insert
ON business.company_robot_entitlement;

CREATE POLICY company_robot_entitlement_company_insert
ON business.company_robot_entitlement
FOR INSERT
WITH CHECK (
  company_id::text = current_setting('app.current_company_id', true)
);

DROP POLICY IF EXISTS company_robot_entitlement_company_update
ON business.company_robot_entitlement;

CREATE POLICY company_robot_entitlement_company_update
ON business.company_robot_entitlement
FOR UPDATE
USING (
  company_id::text = current_setting('app.current_company_id', true)
)
WITH CHECK (
  company_id::text = current_setting('app.current_company_id', true)
);

-- ============================================================
-- company_robot_placement
-- ============================================================

ALTER TABLE business.company_robot_placement ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_robot_placement_company_select
ON business.company_robot_placement;

CREATE POLICY company_robot_placement_company_select
ON business.company_robot_placement
FOR SELECT
USING (
  company_id::text = current_setting('app.current_company_id', true)
);

DROP POLICY IF EXISTS company_robot_placement_company_insert
ON business.company_robot_placement;

CREATE POLICY company_robot_placement_company_insert
ON business.company_robot_placement
FOR INSERT
WITH CHECK (
  company_id::text = current_setting('app.current_company_id', true)
);

DROP POLICY IF EXISTS company_robot_placement_company_update
ON business.company_robot_placement;

CREATE POLICY company_robot_placement_company_update
ON business.company_robot_placement
FOR UPDATE
USING (
  company_id::text = current_setting('app.current_company_id', true)
)
WITH CHECK (
  company_id::text = current_setting('app.current_company_id', true)
);

COMMIT;
