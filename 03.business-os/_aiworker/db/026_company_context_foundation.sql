BEGIN;

CREATE OR REPLACE FUNCTION business.fn_aicm_aiworker_current_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_company_id text;
BEGIN
  v_company_id := NULLIF(current_setting('app.current_company_id', true), '');

  IF v_company_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN v_company_id::uuid;
END;
$$;

CREATE OR REPLACE FUNCTION business.fn_aicm_aiworker_current_api_client_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_api_client_id text;
BEGIN
  v_api_client_id := NULLIF(current_setting('app.current_api_client_id', true), '');

  IF v_api_client_id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN v_api_client_id::uuid;
END;
$$;

CREATE OR REPLACE FUNCTION business.fn_aicm_aiworker_company_context_check(
  p_company_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_current_company_id uuid;
  v_current_api_client_id uuid;
BEGIN
  v_current_company_id := business.fn_aicm_aiworker_current_company_id();
  v_current_api_client_id := business.fn_aicm_aiworker_current_api_client_id();

  RETURN jsonb_build_object(
    'ok', true,
    'expected_company_id', p_company_id,
    'current_company_id', v_current_company_id,
    'current_api_client_id', v_current_api_client_id,
    'matched', v_current_company_id IS NOT NULL AND v_current_company_id = p_company_id
  );
END;
$$;

COMMENT ON FUNCTION business.fn_aicm_aiworker_current_company_id()
IS 'Returns app.current_company_id from current DB session for future company-scoped RLS.';

COMMENT ON FUNCTION business.fn_aicm_aiworker_current_api_client_id()
IS 'Returns app.current_api_client_id from current DB session for future company-scoped RLS/audit context.';

COMMENT ON FUNCTION business.fn_aicm_aiworker_company_context_check(uuid)
IS 'Checks whether requested company_id matches app.current_company_id in current DB session.';

COMMIT;
