import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';

const sql = fs.readFileSync(
  new URL('./001_life_auth_foundation.sql', import.meta.url),
  'utf8'
);

const tables = [
  'auth_actor',
  'auth_identity_binding',
  'auth_session',
  'auth_audit_event'
];

test('all LifeOS auth tables are defined', () => {
  for (const table of tables) {
    assert.match(sql, new RegExp(`CREATE TABLE life\\.${table}\\s*\\(`));
  }
});

test('RLS is enabled and forced on every table', () => {
  for (const table of tables) {
    assert.ok(sql.includes(
      `ALTER TABLE life.${table}\n  ENABLE ROW LEVEL SECURITY`
    ));
    assert.ok(sql.includes(
      `ALTER TABLE life.${table}\n  FORCE ROW LEVEL SECURITY`
    ));
  }
});

test('session actor must match identity binding actor', () => {
  assert.match(
    sql,
    /FOREIGN KEY \(binding_id, actor_id\)\s+REFERENCES life\.auth_identity_binding\(binding_id, actor_id\)/
  );
});

test('identity bindings reference LifeOS actor authority', () => {
  assert.match(
    sql,
    /actor_id uuid NOT NULL REFERENCES life\.auth_actor\(actor_id\)/
  );
});

test('external subjects cannot be duplicated', () => {
  assert.match(sql, /UNIQUE \(issuer, issuer_subject\)/);
});

test('session expiry and revocation constraints exist', () => {
  assert.match(sql, /expires_at > issued_at/);
  assert.match(sql, /revoked_at IS NULL OR revoked_at >= issued_at/);
});

test('authentication remains disabled by default', () => {
  assert.doesNotMatch(sql, /\bCREATE\s+POLICY\b/i);
  assert.doesNotMatch(sql, /\bGRANT\b/i);
  assert.doesNotMatch(sql, /\bSECURITY\s+DEFINER\b/i);
  assert.doesNotMatch(sql, /\bINSERT\s+INTO\b/i);
});

test('migration has a transaction boundary', () => {
  assert.match(sql, /\bBEGIN;/);
  assert.match(sql, /\bCOMMIT;/);
});
