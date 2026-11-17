-- B1 / CivilizationOS Persona one-time handoff ledger.
-- REVIEW-ONLY. This file MUST NOT be run automatically by a Termux script.
-- Deploy only after a separate DB migration GO and privilege/security review.
-- PersonaOS project: ihrukfdlcolygyvccujd; owner schema: civilization.
-- LifeOS tables/functions are deliberately untouched.
BEGIN;

-- A group role; actual LOGIN credentials are provisioned securely, separately.
-- Never attach this role to anon, authenticated, service_role, or public client.
CREATE ROLE civilization_persona_handoff_runtime NOLOGIN;

CREATE TABLE civilization.persona_auth_handoff_ledger_v1 (
    code_hash bytea PRIMARY KEY,
    actor_key text NOT NULL,
    audience text NOT NULL DEFAULT 'persona',
    state_hash bytea NOT NULL,
    pkce_challenge text NOT NULL,
    callback_origin text NOT NULL,
    callback_path text NOT NULL,
    issued_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    expires_at timestamptz NOT NULL,
    consumed_at timestamptz,
    CONSTRAINT persona_handoff_code_hash_length_ck CHECK (octet_length(code_hash) = 32),
    CONSTRAINT persona_handoff_state_hash_length_ck CHECK (octet_length(state_hash) = 32),
    CONSTRAINT persona_handoff_actor_ck CHECK (
        length(actor_key) BETWEEN 1 AND 256 AND actor_key !~ '[[:cntrl:]]'
    ),
    CONSTRAINT persona_handoff_audience_ck CHECK (audience = 'persona'),
    CONSTRAINT persona_handoff_pkce_ck CHECK (pkce_challenge ~ '^[A-Za-z0-9_-]{43}$'),
    CONSTRAINT persona_handoff_callback_ck CHECK (
        callback_path IN ('/api/persona/auth/callback', '/persona-menu/api/auth/callback')
        AND callback_origin ~ '^https://[A-Za-z0-9.-]+(:[0-9]{1,5})?$'
    ),
    CONSTRAINT persona_handoff_expiry_ck CHECK (
        expires_at > issued_at AND expires_at <= issued_at + interval '120 seconds'
    ),
    CONSTRAINT persona_handoff_consumed_ck CHECK (
        consumed_at IS NULL OR consumed_at >= issued_at
    )
);

CREATE INDEX persona_handoff_ledger_expiry_v1_idx
    ON civilization.persona_auth_handoff_ledger_v1 (expires_at);

ALTER TABLE civilization.persona_auth_handoff_ledger_v1 ENABLE ROW LEVEL SECURITY;
-- No policies: direct table access denied to normal roles. Function owner is trusted.
REVOKE ALL ON civilization.persona_auth_handoff_ledger_v1 FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION civilization.persona_handoff_issue_v1(
    p_code_hash bytea,
    p_actor_key text,
    p_state_hash bytea,
    p_pkce_challenge text,
    p_callback_origin text,
    p_callback_path text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_count integer := 0;
BEGIN
    IF p_code_hash IS NULL OR octet_length(p_code_hash) <> 32
        OR p_state_hash IS NULL OR octet_length(p_state_hash) <> 32
        OR p_actor_key IS NULL OR length(p_actor_key) NOT BETWEEN 1 AND 256
        OR p_actor_key ~ '[[:cntrl:]]'
        OR p_pkce_challenge IS NULL OR p_pkce_challenge !~ '^[A-Za-z0-9_-]{43}$'
        OR p_callback_path IS NULL
        OR p_callback_path NOT IN ('/api/persona/auth/callback', '/persona-menu/api/auth/callback')
        OR p_callback_origin IS NULL
        OR p_callback_origin !~ '^https://[A-Za-z0-9.-]+(:[0-9]{1,5})?$'
    THEN RETURN false; END IF;

    INSERT INTO civilization.persona_auth_handoff_ledger_v1 (
        code_hash, actor_key, audience, state_hash, pkce_challenge,
        callback_origin, callback_path, issued_at, expires_at
    ) VALUES (
        p_code_hash, p_actor_key, 'persona', p_state_hash, p_pkce_challenge,
        p_callback_origin, p_callback_path,
        clock_timestamp(), clock_timestamp() + interval '115 seconds'
    ) ON CONFLICT (code_hash) DO NOTHING;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count = 1;
END;
$function$;

CREATE FUNCTION civilization.persona_handoff_consume_v1(
    p_code_hash bytea,
    p_actor_key text,
    p_state_hash bytea,
    p_pkce_challenge text,
    p_callback_origin text,
    p_callback_path text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_count integer := 0;
BEGIN
    IF p_code_hash IS NULL OR octet_length(p_code_hash) <> 32
        OR p_state_hash IS NULL OR octet_length(p_state_hash) <> 32
        OR p_actor_key IS NULL OR length(p_actor_key) NOT BETWEEN 1 AND 256
        OR p_actor_key ~ '[[:cntrl:]]'
        OR p_pkce_challenge IS NULL OR p_pkce_challenge !~ '^[A-Za-z0-9_-]{43}$'
        OR p_callback_path IS NULL
        OR p_callback_path NOT IN ('/api/persona/auth/callback', '/persona-menu/api/auth/callback')
        OR p_callback_origin IS NULL
        OR p_callback_origin !~ '^https://[A-Za-z0-9.-]+(:[0-9]{1,5})?$'
    THEN RETURN false; END IF;

    -- Concurrent requests serialize on the row; only one obtains consumed_at NULL.
    UPDATE civilization.persona_auth_handoff_ledger_v1 h
       SET consumed_at = clock_timestamp()
     WHERE h.code_hash = p_code_hash
       AND h.actor_key = p_actor_key
       AND h.audience = 'persona'
       AND h.state_hash = p_state_hash
       AND h.pkce_challenge = p_pkce_challenge
       AND h.callback_origin = p_callback_origin
       AND h.callback_path = p_callback_path
       AND h.consumed_at IS NULL
       AND h.expires_at > clock_timestamp();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count = 1;
END;
$function$;

-- PostgreSQL gives PUBLIC EXECUTE on functions by default: revoke within the transaction.
REVOKE ALL ON FUNCTION civilization.persona_handoff_issue_v1(bytea,text,bytea,text,text,text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION civilization.persona_handoff_consume_v1(bytea,text,bytea,text,text,text) FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA civilization TO civilization_persona_handoff_runtime;
GRANT EXECUTE ON FUNCTION civilization.persona_handoff_issue_v1(bytea,text,bytea,text,text,text)
    TO civilization_persona_handoff_runtime;
GRANT EXECUTE ON FUNCTION civilization.persona_handoff_consume_v1(bytea,text,bytea,text,text,text)
    TO civilization_persona_handoff_runtime;

COMMIT;

-- Deployment gate: a dedicated LOGIN principal must be provisioned and granted
-- membership in civilization_persona_handoff_runtime via separately reviewed
-- secret-provisioning procedure. No credentials are written in this repository.
-- Operations gate: install a privileged expiry cleanup job (e.g. rows >7 days)
-- before production; never grant the runtime direct DELETE privileges.
