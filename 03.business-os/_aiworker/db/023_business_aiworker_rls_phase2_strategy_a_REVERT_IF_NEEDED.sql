BEGIN;

-- ============================================================
-- Revert Phase2 Strategy A if smoke fails
-- ============================================================

DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_select
ON business.aicm_aiworker_api_client;

DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_insert
ON business.aicm_aiworker_api_client;

DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_update
ON business.aicm_aiworker_api_client;

DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_delete
ON business.aicm_aiworker_api_client;

DROP POLICY IF EXISTS aicm_aiworker_api_audit_log_no_public_select
ON business.aicm_aiworker_api_audit_log;

DROP POLICY IF EXISTS aicm_aiworker_api_audit_log_no_public_update
ON business.aicm_aiworker_api_audit_log;

DROP POLICY IF EXISTS aicm_aiworker_api_audit_log_no_public_delete
ON business.aicm_aiworker_api_audit_log;

ALTER TABLE business.aicm_aiworker_api_client DISABLE ROW LEVEL SECURITY;
ALTER TABLE business.aicm_aiworker_api_audit_log DISABLE ROW LEVEL SECURITY;

ALTER FUNCTION business.fn_aicm_aiworker_api_auth_check(
  text,
  uuid,
  text,
  text,
  boolean,
  jsonb,
  inet,
  text
)
SECURITY INVOKER
RESET search_path;

ALTER FUNCTION business.fn_aicm_aiworker_api_audit_write(
  uuid,
  uuid,
  text,
  uuid,
  text,
  text,
  boolean,
  boolean,
  text,
  text,
  text,
  jsonb,
  jsonb,
  inet,
  text,
  jsonb
)
SECURITY INVOKER
RESET search_path;

COMMIT;
