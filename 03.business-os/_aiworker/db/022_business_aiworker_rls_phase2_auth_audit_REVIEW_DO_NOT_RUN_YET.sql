-- ============================================================
-- DO NOT RUN YET
-- BusinessOS AIWorker RLS Phase2 Auth/Audit Lock-down Review SQL
-- Reviewer: 佐藤(DB担当)
-- ============================================================
-- This is a review draft only.
-- Do not apply until Boss gives explicit GO.
-- ============================================================

BEGIN;

-- ============================================================
-- Strategy A candidate:
-- Make controlled auth/audit functions SECURITY DEFINER.
-- Use explicit search_path.
-- ============================================================
-- 注意:
-- ALTER FUNCTION does not rewrite function bodies.
-- Function owner and table ownership must be reviewed.
-- SECURITY DEFINER must not expose unsafe dynamic SQL or untrusted search_path.

-- ALTER FUNCTION business.fn_aicm_aiworker_api_auth_check(
--   text, uuid, text, text, boolean, jsonb, inet, text
-- )
-- SECURITY DEFINER
-- SET search_path = business, aiworker, cx22073jw, public, pg_temp;

-- ALTER FUNCTION business.fn_aicm_aiworker_api_audit_write(
--   uuid, uuid, text, uuid, text, text, boolean, boolean, text, text, text, jsonb, jsonb, inet, text, jsonb
-- )
-- SECURITY DEFINER
-- SET search_path = business, aiworker, cx22073jw, public, pg_temp;

-- ============================================================
-- API client table lock-down candidate
-- ============================================================

-- ALTER TABLE business.aicm_aiworker_api_client ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_select
-- ON business.aicm_aiworker_api_client;

-- CREATE POLICY aicm_aiworker_api_client_no_public_select
-- ON business.aicm_aiworker_api_client
-- FOR SELECT
-- USING (false);

-- DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_insert
-- ON business.aicm_aiworker_api_client;

-- CREATE POLICY aicm_aiworker_api_client_no_public_insert
-- ON business.aicm_aiworker_api_client
-- FOR INSERT
-- WITH CHECK (false);

-- DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_update
-- ON business.aicm_aiworker_api_client;

-- CREATE POLICY aicm_aiworker_api_client_no_public_update
-- ON business.aicm_aiworker_api_client
-- FOR UPDATE
-- USING (false)
-- WITH CHECK (false);

-- DROP POLICY IF EXISTS aicm_aiworker_api_client_no_public_delete
-- ON business.aicm_aiworker_api_client;

-- CREATE POLICY aicm_aiworker_api_client_no_public_delete
-- ON business.aicm_aiworker_api_client
-- FOR DELETE
-- USING (false);

-- ============================================================
-- Audit log table lock-down candidate
-- ============================================================
-- 初回は SELECT/UPDATE/DELETE を閉じる。
-- INSERTは controlled function 経由に寄せる前提。
-- SECURITY DEFINER化とセットでレビュー。

-- ALTER TABLE business.aicm_aiworker_api_audit_log ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS aicm_aiworker_api_audit_log_no_public_select
-- ON business.aicm_aiworker_api_audit_log;

-- CREATE POLICY aicm_aiworker_api_audit_log_no_public_select
-- ON business.aicm_aiworker_api_audit_log
-- FOR SELECT
-- USING (false);

-- DROP POLICY IF EXISTS aicm_aiworker_api_audit_log_no_public_update
-- ON business.aicm_aiworker_api_audit_log;

-- CREATE POLICY aicm_aiworker_api_audit_log_no_public_update
-- ON business.aicm_aiworker_api_audit_log
-- FOR UPDATE
-- USING (false)
-- WITH CHECK (false);

-- DROP POLICY IF EXISTS aicm_aiworker_api_audit_log_no_public_delete
-- ON business.aicm_aiworker_api_audit_log;

-- CREATE POLICY aicm_aiworker_api_audit_log_no_public_delete
-- ON business.aicm_aiworker_api_audit_log
-- FOR DELETE
-- USING (false);

-- ============================================================
-- Explicitly not in Phase2
-- ============================================================
-- DO NOT ENABLE YET:
-- ALTER TABLE business.company_robot_entitlement ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE business.company_robot_placement ENABLE ROW LEVEL SECURITY;

ROLLBACK;
