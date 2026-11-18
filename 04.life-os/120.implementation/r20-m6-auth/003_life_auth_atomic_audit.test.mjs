import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(
  new URL('./003_life_auth_atomic_audit.sql', import.meta.url),
  'utf8'
);

test('all lifecycle tables have audit triggers', () => {
  for (const name of [
    'auth_actor',
    'auth_identity_binding',
    'auth_session'
  ]) {
    assert.match(
      sql,
      new RegExp(`AFTER INSERT OR UPDATE ON life\\.${name}`)
    );
  }
});

test('all six lifecycle events are recorded', () => {
  for (const event of [
    'actor_created',
    'actor_disabled',
    'binding_created',
    'binding_revoked',
    'session_issued',
    'session_revoked'
  ]) {
    assert.ok(sql.includes(`'${event}'`));
  }
});

test('audit failure is not swallowed', () => {
  assert.doesNotMatch(sql, /EXCEPTION\s+WHEN/i);
});

test('no privileged authentication interface is enabled', () => {
  assert.doesNotMatch(sql, /SECURITY\s+DEFINER/i);
  assert.doesNotMatch(sql, /CREATE\s+POLICY/i);
  assert.doesNotMatch(sql, /GRANT\s+/i);
});

test('migration is transactional', () => {
  assert.match(sql, /\bBEGIN;/);
  assert.match(sql, /\bCOMMIT;/);
});
