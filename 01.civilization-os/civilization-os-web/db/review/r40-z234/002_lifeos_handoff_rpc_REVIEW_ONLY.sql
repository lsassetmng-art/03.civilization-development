-- REVIEW ONLY. DO NOT APPLY. Requires 001 table, verified roles and explicit DB GO.
-- Provision roles separately: lifeos_handoff_owner NOLOGIN, lifeos_handoff_runtime LOGIN NOBYPASSRLS.
-- Owner must own the table and both functions. Do not use postgres runtime credentials.
BEGIN;
REVOKE ALL ON civilization.lifeos_auth_handoff FROM PUBLIC;
REVOKE ALL ON civilization.lifeos_auth_handoff FROM lifeos_handoff_runtime;
GRANT USAGE ON SCHEMA civilization TO lifeos_handoff_runtime;
-- Existing 001 table has FORCE RLS. Only owner policy can access it through SECURITY DEFINER.
CREATE POLICY lifeos_handoff_owner_policy ON civilization.lifeos_auth_handoff
  FOR ALL TO lifeos_handoff_owner USING (true) WITH CHECK (true);
CREATE OR REPLACE FUNCTION civilization.lifeos_handoff_issue(
  p_code_hash bytea, p_civilization_id text, p_origin text,
  p_pkce_challenge text, p_state_hash bytea
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, civilization AS $$
BEGIN
  IF octet_length(p_code_hash) <> 32 OR octet_length(p_state_hash) <> 32
     OR length(p_civilization_id) NOT BETWEEN 1 AND 256
     OR p_civilization_id ~ '[[:cntrl:]]'
     OR p_origin IS NULL OR length(p_origin) NOT BETWEEN 8 AND 255
     OR p_pkce_challenge !~ '^[A-Za-z0-9_-]{43}$' THEN
    RETURN false;
  END IF;
  INSERT INTO civilization.lifeos_auth_handoff
    (code_hash, civilization_id, audience, redirect_origin, pkce_challenge, state_hash, expires_at)
  VALUES (p_code_hash, p_civilization_id, 'portal-lifeos', p_origin,
          p_pkce_challenge, p_state_hash, clock_timestamp() + interval '120 seconds');
  RETURN true;
END;
$$;
CREATE OR REPLACE FUNCTION civilization.lifeos_handoff_consume(
  p_code_hash bytea, p_origin text, p_pkce_challenge text, p_state_hash bytea
) RETURNS TABLE(civilization_id text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, civilization AS $$
BEGIN
  IF octet_length(p_code_hash) <> 32 OR octet_length(p_state_hash) <> 32
     OR p_origin IS NULL OR p_pkce_challenge !~ '^[A-Za-z0-9_-]{43}$' THEN
    RETURN;
  END IF;
  RETURN QUERY
  UPDATE civilization.lifeos_auth_handoff AS h
     SET consumed_at = clock_timestamp()
   WHERE h.code_hash = p_code_hash
     AND h.audience = 'portal-lifeos'
     AND h.redirect_origin = p_origin
     AND h.pkce_challenge = p_pkce_challenge
     AND h.state_hash = p_state_hash
     AND h.consumed_at IS NULL
     AND h.expires_at > clock_timestamp()
   RETURNING h.civilization_id;
END;
$$;
REVOKE ALL ON FUNCTION civilization.lifeos_handoff_issue(bytea,text,text,text,bytea) FROM PUBLIC;
REVOKE ALL ON FUNCTION civilization.lifeos_handoff_consume(bytea,text,text,bytea) FROM PUBLIC;
ALTER FUNCTION civilization.lifeos_handoff_issue(bytea,text,text,text,bytea) OWNER TO lifeos_handoff_owner;
ALTER FUNCTION civilization.lifeos_handoff_consume(bytea,text,text,bytea) OWNER TO lifeos_handoff_owner;
GRANT EXECUTE ON FUNCTION civilization.lifeos_handoff_issue(bytea,text,text,text,bytea) TO lifeos_handoff_runtime;
GRANT EXECUTE ON FUNCTION civilization.lifeos_handoff_consume(bytea,text,text,bytea) TO lifeos_handoff_runtime;
COMMIT;
