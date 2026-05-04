BEGIN;

DROP FUNCTION IF EXISTS business.fn_aicm_aiworker_company_context_check(uuid);
DROP FUNCTION IF EXISTS business.fn_aicm_aiworker_current_company_id();
DROP FUNCTION IF EXISTS business.fn_aicm_aiworker_current_api_client_id();

COMMIT;
