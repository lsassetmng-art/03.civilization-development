BEGIN;

DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT
      n.nspname,
      p.proname,
      pg_get_function_identity_arguments(p.oid) AS identity_args
    FROM pg_proc p
    JOIN pg_namespace n
      ON n.oid = p.pronamespace
    WHERE n.nspname = 'business'
      AND p.proname IN (
        'fn_aicm_aiworker_api_auth_check',
        'fn_aicm_aiworker_api_audit_write'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SECURITY INVOKER RESET search_path',
      rec.nspname,
      rec.proname,
      rec.identity_args
    );
  END LOOP;
END $$;

COMMIT;
