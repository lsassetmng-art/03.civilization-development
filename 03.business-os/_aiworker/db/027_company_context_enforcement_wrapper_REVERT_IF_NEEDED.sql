BEGIN;

DROP FUNCTION IF EXISTS business.fn_company_robot_placement_deactivate_ctx(uuid, text, jsonb);
DROP FUNCTION IF EXISTS business.fn_company_robot_placement_update_ctx(uuid, text, text, text, uuid, jsonb);
DROP FUNCTION IF EXISTS business.fn_company_robot_place_ctx(uuid, text, text, text, text, uuid, text, integer, jsonb);
DROP FUNCTION IF EXISTS business.fn_company_robot_grant_entitlement_ctx(uuid, text, integer, text, text, text);
DROP FUNCTION IF EXISTS business.fn_aicm_aiworker_require_company_context(uuid, text);

COMMIT;
