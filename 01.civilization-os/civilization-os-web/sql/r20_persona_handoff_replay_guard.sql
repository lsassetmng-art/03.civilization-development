-- R20-7B-3C-R1
-- ISOLATED DATABASE ONLY.
-- NOT APPROVED FOR PRODUCTION.
--
-- Requires a separately provisioned owner role.
-- Runtime role grants are intentionally excluded.
--
-- The explicit execution gate prevents accidental application
-- without a session-local approval setting.

BEGIN;

DO $$
BEGIN
  IF current_setting(
    'r20.isolated_migration_approved',
    true
  ) IS DISTINCT FROM 'yes'
  THEN
    RAISE EXCEPTION
      'R20_ISOLATED_MIGRATION_APPROVAL_REQUIRED';
  END IF;
END;
$$;



CREATE TABLE civilization.persona_auth_handoff_consumption (
  code_hash text PRIMARY KEY,
  consumed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz NOT NULL,
  CONSTRAINT persona_handoff_hash_format
    CHECK (code_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT persona_handoff_expiry
    CHECK (expires_at > consumed_at)
);

ALTER TABLE civilization.persona_auth_handoff_consumption
  OWNER TO r20_persona_handoff_owner;

ALTER TABLE civilization.persona_auth_handoff_consumption
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE civilization.persona_auth_handoff_consumption
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON civilization.persona_auth_handoff_consumption
  FROM PUBLIC;

CREATE POLICY r20_persona_handoff_insert
ON civilization.persona_auth_handoff_consumption
FOR INSERT
TO r20_persona_handoff_owner
WITH CHECK (
  code_hash ~ '^[0-9a-f]{64}$'
  AND expires_at > consumed_at
);

CREATE FUNCTION civilization.consume_persona_auth_handoff(
  p_code_hash text,
  p_expires_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_inserted integer;
  v_now timestamptz;
  v_constraint_name text;
BEGIN
  v_now := clock_timestamp();

  IF p_code_hash IS NULL
     OR p_code_hash !~ '^[0-9a-f]{64}$'
     OR p_expires_at IS NULL
     OR p_expires_at <= v_now
     OR p_expires_at > v_now + interval '150 seconds'
  THEN
    RETURN false;
  END IF;

  INSERT INTO civilization.persona_auth_handoff_consumption (
    code_hash,
    expires_at
  )
  VALUES (
    p_code_hash,
    p_expires_at
  );

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

    RETURN v_inserted = 1;

  EXCEPTION
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS
        v_constraint_name = CONSTRAINT_NAME;

      IF v_constraint_name =
         'persona_auth_handoff_consumption_pkey'
      THEN
        RETURN false;
      END IF;

      RAISE;
END;
$$;

ALTER FUNCTION
  civilization.consume_persona_auth_handoff(
    text,
    timestamptz
  )
OWNER TO r20_persona_handoff_owner;

REVOKE ALL ON FUNCTION
  civilization.consume_persona_auth_handoff(
    text,
    timestamptz
  )
FROM PUBLIC;

-- Runtime GRANT EXECUTE is deliberately omitted.
-- Runtime role must be separately identified and approved.
--
-- A cleanup operation must retain consumed hashes until
-- the corresponding handoff codes can no longer be accepted.
-- Cleanup implementation and permissions are a separate gate.

COMMIT;
