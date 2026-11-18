import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(
  new URL('./006_life_auth_session_access.sql', import.meta.url),
  'utf8'
);

test('read uses session, binding and actor', () => {
  for (const fragment of [
    'life.auth_session AS s',
    'life.auth_identity_binding AS b',
    'life.auth_actor AS a',
    's.revoked_at IS NULL',
    's.expires_at > clock_timestamp()',
    "b.binding_status = 'active'",
    "a.actor_status = 'active'"
  ]) {
    assert.ok(sql.includes(fragment), fragment);
  }
});

test('functions have explicit ownership', () => {
  assert.match(sql,
    /ALTER FUNCTION life\.read_auth_session\(uuid\)\s+OWNER TO life_auth_exchange_owner/i);
  assert.match(sql,
    /ALTER FUNCTION life\.revoke_auth_session\(uuid\)\s+OWNER TO life_auth_exchange_owner/i);
});

test('PUBLIC execution is revoked', () => {
  assert.match(sql,
    /REVOKE ALL ON FUNCTION\s+life\.read_auth_session\(uuid\)\s+FROM PUBLIC/i);
  assert.match(sql,
    /REVOKE ALL ON FUNCTION\s+life\.revoke_auth_session\(uuid\)\s+FROM PUBLIC/i);
});

test('service receives function-only execution', () => {
  assert.match(sql,
    /GRANT EXECUTE ON FUNCTION\s+life\.read_auth_session\(uuid\)\s+TO life_auth_exchange_service/i);
  assert.match(sql,
    /GRANT EXECUTE ON FUNCTION\s+life\.revoke_auth_session\(uuid\)\s+TO life_auth_exchange_service/i);
  assert.doesNotMatch(sql,
    /GRANT\s+(SELECT|UPDATE|ALL)\s+ON\s+life\.auth_session\s+TO life_auth_exchange_service/i);
});

test('revocation updates only an active session', () => {
  assert.match(sql, /SET revoked_at = clock_timestamp\(\)/);
  assert.match(sql, /s\.revoked_at IS NULL/);
  assert.match(sql, /s\.expires_at > clock_timestamp\(\)/);
});

test('transaction wraps the migration', () => {
  assert.match(sql, /^--[\s\S]*?\nBEGIN;/);
  assert.match(sql, /COMMIT;\s*$/);
});
