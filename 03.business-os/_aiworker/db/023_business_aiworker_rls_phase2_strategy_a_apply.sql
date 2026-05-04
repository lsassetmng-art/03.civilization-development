BEGIN;

-- ============================================================
-- 1. Controlled auth/audit functions
-- ============================================================

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
SECURITY DEFINER
SET search_path = business, aiworker, cx22073jw, public, pg_temp;

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
SECURITY DEFINER
SET search_path = business, aiworker, cx22073jw, public, pg_temp;

-- ============================================================
-- 2. API client lock-down
-- ============================================================

ALTER TABLE business.aicm_aiworker_api_client ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_select
ON business.aicm_aiworker_api_client;

CREATE POLICY aicm_aiworker_api_client_no_public_select
ON business.aicm_aiworker_api_client
FOR SELECT
USING (false);

DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_insert
ON business.aicm_aiworker_api_client;

CREATE POLICY aicm_aiworker_api_client_no_public_insert
ON business.aicm_aiworker_api_client
FOR INSERT
WITH CHECK (false);

DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_update
ON business.aicm_aiworker_api_client;

CREATE POLICY aicm_aiworker_api_client_no_public_update
ON business.aicm_aiworker_api_client
FOR UPDATE
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_delete
ON business.aicm_aiworker_api_client;

CREATE POLICY aicm_aiworker_api_client_no_public_delete
ON business.aicm_aiworker_api_client
FOR DELETE
USING (false);

-- ============================================================
-- 3. Audit log lock-down
-- ============================================================

ALTER TABLE business.aicm_aiworker_api_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aicm_aiworker_api_audit_log_no_public_select
ON business.aicm_aiworker_api_audit_log;

CREATE POLICY aicm_aiworker_api_audit_log_no_public_select
ON business.aicm_aiworker_api_audit_log
FOR SELECT
USING (false);

DROP POLICY IF EXISTS aicm_aiworker_api_audit_log_no_public_update
ON business.aicm_aiworker_api_audit_log;

CREATE POLICY aicm_aiworker_api_audit_log_no_public_update
ON business.aicm_aiworker_api_audit_log
FOR UPDATE
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS aicm_aiworker_api_audit_log_no_public_delete
ON business.aicm_aiworker_api_audit_log;

CREATE POLICY aicm_aiworker_api_audit_log_no_public_delete
ON business.aicm_aiworker_api_audit_log
FOR DELETE
USING (false);

COMMIT;
