-- ============================================================
-- BusinessOS AIWorker auth/audit foundation
-- DB: Persona-side DB
-- Env: PERSONA_DATABASE_URL
-- Review: Sato DB review target
-- Change type: add-only tables/functions/views
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS business;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS business.aicm_aiworker_api_client (
  api_client_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code text NOT NULL UNIQUE,
  display_name text NOT NULL,
  token_sha256 text NOT NULL,
  token_hint text,
  status_code text NOT NULL DEFAULT 'active',
  allowed_scope_code text NOT NULL DEFAULT 'aicm_business_aiworker',
  note text,
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_aicm_aiworker_api_client_status
  ON business.aicm_aiworker_api_client(status_code, client_code);

CREATE INDEX IF NOT EXISTS idx_business_aicm_aiworker_api_client_token
  ON business.aicm_aiworker_api_client(token_sha256);

CREATE TABLE IF NOT EXISTS business.aicm_aiworker_api_audit_log (
  api_audit_log_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL DEFAULT gen_random_uuid(),
  api_client_id uuid,
  client_code text,
  company_id uuid,
  endpoint_code text NOT NULL,
  action_code text NOT NULL,
  dry_run_flag boolean NOT NULL DEFAULT true,
  allowed_flag boolean NOT NULL DEFAULT false,
  status_code text NOT NULL DEFAULT 'recorded',
  error_code text,
  reason text,
  actor_type text NOT NULL DEFAULT 'api_client',
  request_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  request_ip inet,
  user_agent text,
  metadata_jsonb jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_aicm_aiworker_api_audit_company_time
  ON business.aicm_aiworker_api_audit_log(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_aicm_aiworker_api_audit_endpoint_time
  ON business.aicm_aiworker_api_audit_log(endpoint_code, action_code, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_aicm_aiworker_api_audit_client_time
  ON business.aicm_aiworker_api_audit_log(client_code, created_at DESC);

COMMENT ON TABLE business.aicm_aiworker_api_client IS
  'API client token catalog for AICompanyManager x BusinessOS AIWorker local/production API hardening.';

COMMENT ON TABLE business.aicm_aiworker_api_audit_log IS
  'Audit log for AICompanyManager x BusinessOS AIWorker API calls and auth decisions.';

CREATE OR REPLACE FUNCTION business.fn_aicm_aiworker_token_hash(
  p_token text
)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT encode(digest(COALESCE(p_token, ''), 'sha256'), 'hex');
$$;

INSERT INTO business.aicm_aiworker_api_client (
  client_code,
  display_name,
  token_sha256,
  token_hint,
  status_code,
  allowed_scope_code,
  note,
  metadata_jsonb
)
VALUES (
  'local_aicm_aiworker_dev',
  'Local AICompanyManager BusinessOS AIWorker Dev Client',
  business.fn_aicm_aiworker_token_hash('local-aicm-aiworker-dev-token'),
  'local-...-token',
  'active',
  'aicm_business_aiworker',
  'Local development token for smoke tests only. Rotate before production.',
  '{"source":"auth_audit_foundation_seed","environment":"local_dev"}'::jsonb
)
ON CONFLICT (client_code)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  token_sha256 = EXCLUDED.token_sha256,
  token_hint = EXCLUDED.token_hint,
  status_code = EXCLUDED.status_code,
  allowed_scope_code = EXCLUDED.allowed_scope_code,
  note = EXCLUDED.note,
  metadata_jsonb = business.aicm_aiworker_api_client.metadata_jsonb || EXCLUDED.metadata_jsonb,
  updated_at = now();

CREATE OR REPLACE FUNCTION business.fn_aicm_aiworker_api_audit_write(
  p_request_id uuid,
  p_api_client_id uuid,
  p_client_code text,
  p_company_id uuid,
  p_endpoint_code text,
  p_action_code text,
  p_dry_run_flag boolean,
  p_allowed_flag boolean,
  p_status_code text,
  p_error_code text,
  p_reason text,
  p_request_jsonb jsonb DEFAULT '{}'::jsonb,
  p_response_jsonb jsonb DEFAULT '{}'::jsonb,
  p_request_ip inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_metadata_jsonb jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_audit_id uuid;
BEGIN
  INSERT INTO business.aicm_aiworker_api_audit_log (
    request_id,
    api_client_id,
    client_code,
    company_id,
    endpoint_code,
    action_code,
    dry_run_flag,
    allowed_flag,
    status_code,
    error_code,
    reason,
    request_jsonb,
    response_jsonb,
    request_ip,
    user_agent,
    metadata_jsonb
  )
  VALUES (
    COALESCE(p_request_id, gen_random_uuid()),
    p_api_client_id,
    NULLIF(btrim(COALESCE(p_client_code, '')), ''),
    p_company_id,
    COALESCE(NULLIF(btrim(COALESCE(p_endpoint_code, '')), ''), 'unknown_endpoint'),
    COALESCE(NULLIF(btrim(COALESCE(p_action_code, '')), ''), 'unknown_action'),
    COALESCE(p_dry_run_flag, true),
    COALESCE(p_allowed_flag, false),
    COALESCE(NULLIF(btrim(COALESCE(p_status_code, '')), ''), 'recorded'),
    NULLIF(btrim(COALESCE(p_error_code, '')), ''),
    NULLIF(btrim(COALESCE(p_reason, '')), ''),
    COALESCE(p_request_jsonb, '{}'::jsonb),
    COALESCE(p_response_jsonb, '{}'::jsonb),
    p_request_ip,
    NULLIF(btrim(COALESCE(p_user_agent, '')), ''),
    COALESCE(p_metadata_jsonb, '{}'::jsonb)
  )
  RETURNING api_audit_log_id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

CREATE OR REPLACE FUNCTION business.fn_aicm_aiworker_api_auth_check(
  p_token text,
  p_company_id uuid DEFAULT NULL,
  p_endpoint_code text DEFAULT 'unknown_endpoint',
  p_action_code text DEFAULT 'unknown_action',
  p_dry_run_flag boolean DEFAULT true,
  p_request_jsonb jsonb DEFAULT '{}'::jsonb,
  p_request_ip inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_request_id uuid := gen_random_uuid();
  v_client business.aicm_aiworker_api_client%ROWTYPE;
  v_token_sha256 text;
  v_allowed boolean := false;
  v_reason text := 'unknown';
  v_error_code text := NULL;
  v_audit_id uuid;
BEGIN
  IF p_token IS NULL OR btrim(p_token) = '' THEN
    v_allowed := false;
    v_reason := 'token_missing';
    v_error_code := 'TOKEN_MISSING';
  ELSE
    v_token_sha256 := business.fn_aicm_aiworker_token_hash(p_token);

    SELECT *
      INTO v_client
    FROM business.aicm_aiworker_api_client
    WHERE token_sha256 = v_token_sha256
    LIMIT 1;

    IF NOT FOUND THEN
      v_allowed := false;
      v_reason := 'token_not_found';
      v_error_code := 'TOKEN_NOT_FOUND';
    ELSIF v_client.status_code <> 'active' THEN
      v_allowed := false;
      v_reason := 'client_inactive';
      v_error_code := 'CLIENT_INACTIVE';
    ELSE
      v_allowed := true;
      v_reason := 'allowed';
      v_error_code := NULL;
    END IF;
  END IF;

  v_audit_id := business.fn_aicm_aiworker_api_audit_write(
    v_request_id,
    CASE WHEN v_allowed THEN v_client.api_client_id ELSE NULL END,
    CASE WHEN v_allowed THEN v_client.client_code ELSE NULL END,
    p_company_id,
    p_endpoint_code,
    p_action_code,
    COALESCE(p_dry_run_flag, true),
    v_allowed,
    CASE WHEN v_allowed THEN 'allowed' ELSE 'denied' END,
    v_error_code,
    v_reason,
    COALESCE(p_request_jsonb, '{}'::jsonb),
    jsonb_build_object(
      'allowed', v_allowed,
      'reason', v_reason,
      'error_code', v_error_code
    ),
    p_request_ip,
    p_user_agent,
    jsonb_build_object('source', 'fn_aicm_aiworker_api_auth_check')
  );

  RETURN jsonb_build_object(
    'ok', true,
    'request_id', v_request_id,
    'audit_id', v_audit_id,
    'allowed', v_allowed,
    'reason', v_reason,
    'error_code', v_error_code,
    'client_code', CASE WHEN v_allowed THEN v_client.client_code ELSE NULL END,
    'company_id', p_company_id,
    'endpoint_code', p_endpoint_code,
    'action_code', p_action_code,
    'dry_run', COALESCE(p_dry_run_flag, true)
  );
END;
$$;

CREATE OR REPLACE VIEW business.vw_aicm_aiworker_api_audit_recent AS
SELECT
  api_audit_log_id,
  request_id,
  client_code,
  company_id,
  endpoint_code,
  action_code,
  dry_run_flag,
  allowed_flag,
  status_code,
  error_code,
  reason,
  created_at
FROM business.aicm_aiworker_api_audit_log
ORDER BY created_at DESC, api_audit_log_id DESC
LIMIT 200;

COMMIT;
