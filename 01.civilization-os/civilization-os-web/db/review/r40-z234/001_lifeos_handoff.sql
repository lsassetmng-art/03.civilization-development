-- R40-Z234: REVIEW ONLY. Explicit separate DB GO required.
-- Requires pre-provisioned NOLOGIN owner and LOGIN runtime roles.
-- No direct table privileges are granted to the runtime role.
-- Replace identifiers only after verifying actual role provisioning.
BEGIN;
CREATE TABLE civilization.lifeos_auth_handoff (
  handoff_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash bytea NOT NULL UNIQUE CHECK (octet_length(code_hash) = 32),
  civilization_id text NOT NULL CHECK (length(civilization_id) BETWEEN 1 AND 256),
  audience text NOT NULL DEFAULT 'portal-lifeos' CHECK (audience = 'portal-lifeos'),
  redirect_origin text NOT NULL,
  pkce_challenge text NOT NULL CHECK (pkce_challenge ~ '^[A-Za-z0-9_-]{43}$'),
  state_hash bytea NOT NULL CHECK (octet_length(state_hash) = 32),
  issued_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  CONSTRAINT lifeos_handoff_expiry_window CHECK (
    expires_at > issued_at AND expires_at <= issued_at + interval '120 seconds'
  )
);
CREATE INDEX lifeos_auth_handoff_expiry_idx
  ON civilization.lifeos_auth_handoff (expires_at);
ALTER TABLE civilization.lifeos_auth_handoff ENABLE ROW LEVEL SECURITY;
ALTER TABLE civilization.lifeos_auth_handoff FORCE ROW LEVEL SECURITY;
REVOKE ALL ON civilization.lifeos_auth_handoff FROM PUBLIC;
COMMENT ON TABLE civilization.lifeos_auth_handoff IS
  'One-time LifeOS handoff. Direct runtime access prohibited; dedicated security-definer functions require separate review.';
COMMIT;
-- DO NOT APPLY: no runtime grant or function is included until role names,
-- origin trust boundary, caller authentication and PKCE exchange are reviewed.
