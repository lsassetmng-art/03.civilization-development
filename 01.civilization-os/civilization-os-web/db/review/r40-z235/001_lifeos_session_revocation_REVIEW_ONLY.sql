-- R40-Z235: REVIEW ONLY. DO NOT APPLY WITHOUT SEPARATE GO.
-- Prerequisite: R40-Z234 handoff table and runtime/owner roles.
-- This migration is additive. The previous handoff RPCs are preserved.
BEGIN;

CREATE TABLE civilization.lifeos_auth_session (
  sid_hash bytea PRIMARY KEY,
  civilization_id text,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT lifeos_auth_session_sid_hash_size CHECK (octet_length(sid_hash) = 32),
  CONSTRAINT lifeos_auth_session_id_length CHECK (
    civilization_id IS NULL OR
    (length(civilization_id) BETWEEN 1 AND 256)
  )
);

ALTER TABLE civilization.lifeos_auth_session OWNER TO lifeos_handoff_owner;
ALTER TABLE civilization.lifeos_auth_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE civilization.lifeos_auth_session FORCE ROW LEVEL SECURITY;

CREATE POLICY lifeos_session_owner_policy
ON civilization.lifeos_auth_session
FOR ALL TO lifeos_handoff_owner
USING (true) WITH CHECK (true);

REVOKE ALL ON civilization.lifeos_auth_session FROM PUBLIC;
REVOKE ALL ON civilization.lifeos_auth_session FROM lifeos_handoff_runtime;

ALTER TABLE civilization.lifeos_auth_handoff
ADD COLUMN session_id text,
ADD COLUMN sid_hash bytea;

ALTER TABLE civilization.lifeos_auth_handoff
ADD CONSTRAINT lifeos_handoff_sid_hash_size
CHECK (sid_hash IS NULL OR octet_length(sid_hash) = 32);

ALTER TABLE civilization.lifeos_auth_handoff
ADD CONSTRAINT lifeos_handoff_session_id_format
CHECK (session_id IS NULL OR session_id ~ '^[A-Za-z0-9_-]{43}$');

CREATE OR REPLACE FUNCTION civilization.lifeos_session_valid(
  p_civilization_id text,
  p_sid_hash bytea
) RETURNS boolean
LANGUAGE sql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, civilization
AS $$
  SELECT EXISTS (
    SELECT 1 FROM civilization.lifeos_auth_session s
    WHERE s.sid_hash = p_sid_hash
      AND s.civilization_id = p_civilization_id
      AND s.revoked_at IS NULL
      AND s.expires_at > clock_timestamp()
  );
$$;

ALTER FUNCTION civilization.lifeos_session_valid(text,bytea)
OWNER TO lifeos_handoff_owner;

CREATE OR REPLACE FUNCTION civilization.lifeos_session_revoke(
  p_sid_hash bytea
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, civilization
AS $$
BEGIN
  IF p_sid_hash IS NULL OR octet_length(p_sid_hash) <> 32 THEN
    RETURN false;
  END IF;

  INSERT INTO civilization.lifeos_auth_session
    (sid_hash, civilization_id, expires_at, revoked_at)
  VALUES
    (p_sid_hash, NULL, clock_timestamp() + interval '15 days', clock_timestamp())
  ON CONFLICT (sid_hash) DO UPDATE
    SET revoked_at = COALESCE(
      civilization.lifeos_auth_session.revoked_at,
      clock_timestamp()
    );
  RETURN true;
END;
$$;

ALTER FUNCTION civilization.lifeos_session_revoke(bytea)
OWNER TO lifeos_handoff_owner;

CREATE FUNCTION civilization.lifeos_handoff_issue_session(
  p_code_hash bytea,
  p_civilization_id text,
  p_session_id text,
  p_sid_hash bytea,
  p_session_expires_at timestamptz,
  p_origin text,
  p_pkce_challenge text,
  p_state_hash bytea
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, civilization
AS $$
DECLARE
  v_session civilization.lifeos_auth_session%ROWTYPE;
BEGIN
  IF p_code_hash IS NULL OR octet_length(p_code_hash) <> 32
    OR p_sid_hash IS NULL OR octet_length(p_sid_hash) <> 32
    OR p_session_id IS NULL
    OR p_session_id !~ '^[A-Za-z0-9_-]{43}$'
    OR pg_catalog.sha256(pg_catalog.convert_to(p_session_id, 'UTF8')) <> p_sid_hash
    OR p_state_hash IS NULL OR octet_length(p_state_hash) <> 32
    OR p_civilization_id IS NULL
    OR length(p_civilization_id) NOT BETWEEN 1 AND 256
    OR p_session_expires_at IS NULL
    OR p_session_expires_at <= clock_timestamp()
    OR p_session_expires_at > clock_timestamp() + interval '15 days'
    OR p_origin IS NULL OR length(p_origin) NOT BETWEEN 1 AND 2048
    OR p_pkce_challenge !~ '^[A-Za-z0-9_-]{43}$'
  THEN
    RETURN false;
  END IF;

  INSERT INTO civilization.lifeos_auth_session
    (sid_hash, civilization_id, expires_at)
  VALUES
    (p_sid_hash, p_civilization_id, p_session_expires_at)
  ON CONFLICT (sid_hash) DO NOTHING;

  SELECT * INTO v_session
  FROM civilization.lifeos_auth_session
  WHERE sid_hash = p_sid_hash
  FOR UPDATE;

  IF NOT FOUND OR v_session.revoked_at IS NOT NULL
    OR v_session.civilization_id IS DISTINCT FROM p_civilization_id
    OR v_session.expires_at <= clock_timestamp()
    OR v_session.expires_at IS DISTINCT FROM p_session_expires_at
  THEN
    RETURN false;
  END IF;

  INSERT INTO civilization.lifeos_auth_handoff
    (code_hash, civilization_id, audience, redirect_origin,
     pkce_challenge, state_hash, issued_at, expires_at,
     session_id, sid_hash)
  VALUES
    (p_code_hash, p_civilization_id, 'portal-lifeos', p_origin,
     p_pkce_challenge, p_state_hash, clock_timestamp(),
     LEAST(clock_timestamp() + interval '119 seconds',
           p_session_expires_at),
     p_session_id, p_sid_hash);

  RETURN true;
EXCEPTION WHEN unique_violation THEN
  RETURN false;
END;
$$;

ALTER FUNCTION civilization.lifeos_handoff_issue_session(
  bytea,text,text,bytea,timestamptz,text,text,bytea
) OWNER TO lifeos_handoff_owner;

CREATE FUNCTION civilization.lifeos_handoff_consume_session(
  p_code_hash bytea,
  p_origin text,
  p_pkce_challenge text,
  p_state_hash bytea
) RETURNS TABLE(civilization_id text, session_id text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, civilization
AS $$
DECLARE
  v_handoff civilization.lifeos_auth_handoff%ROWTYPE;
  v_session civilization.lifeos_auth_session%ROWTYPE;
BEGIN
  IF p_code_hash IS NULL OR octet_length(p_code_hash) <> 32
    OR p_state_hash IS NULL OR octet_length(p_state_hash) <> 32
    OR p_origin IS NULL
    OR p_pkce_challenge !~ '^[A-Za-z0-9_-]{43}$'
  THEN
    RETURN;
  END IF;

  SELECT * INTO v_handoff
  FROM civilization.lifeos_auth_handoff h
  WHERE h.code_hash = p_code_hash
    AND h.redirect_origin = p_origin
    AND h.pkce_challenge = p_pkce_challenge
    AND h.state_hash = p_state_hash
    AND h.audience = 'portal-lifeos'
    AND h.sid_hash IS NOT NULL
    AND h.session_id IS NOT NULL
    AND pg_catalog.sha256(
      pg_catalog.convert_to(h.session_id, 'UTF8')
    ) = h.sid_hash
    AND h.consumed_at IS NULL
    AND h.expires_at > clock_timestamp()
  FOR UPDATE;

  IF NOT FOUND THEN RETURN; END IF;

  SELECT * INTO v_session
  FROM civilization.lifeos_auth_session s
  WHERE s.sid_hash = v_handoff.sid_hash
  FOR UPDATE;

  IF NOT FOUND OR v_session.revoked_at IS NOT NULL
    OR v_session.expires_at <= clock_timestamp()
    OR v_session.civilization_id IS DISTINCT FROM v_handoff.civilization_id
  THEN
    RETURN;
  END IF;

  UPDATE civilization.lifeos_auth_handoff h
  SET consumed_at = clock_timestamp()
  WHERE h.handoff_id = v_handoff.handoff_id
    AND h.consumed_at IS NULL;

  IF NOT FOUND THEN RETURN; END IF;

  civilization_id := v_handoff.civilization_id;
  session_id := v_handoff.session_id;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION civilization.lifeos_handoff_consume_session(
  bytea,text,text,bytea
) OWNER TO lifeos_handoff_owner;

REVOKE ALL ON FUNCTION civilization.lifeos_session_valid(text,bytea)
FROM PUBLIC;
REVOKE ALL ON FUNCTION civilization.lifeos_session_revoke(bytea)
FROM PUBLIC;
REVOKE ALL ON FUNCTION civilization.lifeos_handoff_issue_session(
  bytea,text,text,bytea,timestamptz,text,text,bytea
) FROM PUBLIC;
REVOKE ALL ON FUNCTION civilization.lifeos_handoff_consume_session(
  bytea,text,text,bytea
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION civilization.lifeos_session_valid(text,bytea)
TO lifeos_handoff_runtime;
GRANT EXECUTE ON FUNCTION civilization.lifeos_session_revoke(bytea)
TO lifeos_handoff_runtime;
GRANT EXECUTE ON FUNCTION civilization.lifeos_handoff_issue_session(
  bytea,text,text,bytea,timestamptz,text,text,bytea
) TO lifeos_handoff_runtime;
GRANT EXECUTE ON FUNCTION civilization.lifeos_handoff_consume_session(
  bytea,text,text,bytea
) TO lifeos_handoff_runtime;

COMMIT;
