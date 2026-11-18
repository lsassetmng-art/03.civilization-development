import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(
  new URL('./002_life_auth_integrity.sql', import.meta.url),
  'utf8'
);

test('transaction boundary exists', () => {
  assert.match(sql, /\bBEGIN;/);
  assert.match(sql, /\bCOMMIT;/);
});

test('audit updates and deletes are rejected', () => {
  assert.match(
    sql,
    /BEFORE UPDATE OR DELETE ON life\.auth_audit_event/
  );
  assert.match(sql, /life_auth_audit_immutable/);
});

test('binding identity is immutable', () => {
  for (const field of [
    'binding_id', 'issuer', 'issuer_subject',
    'actor_id', 'created_at'
  ]) {
    assert.ok(sql.includes(
      `NEW.${field} IS DISTINCT FROM OLD.${field}`
    ));
  }
});

test('binding revocation is one-way', () => {
  assert.match(sql, /OLD\.binding_status <> 'active'/);
  assert.match(sql, /NEW\.binding_status <> 'revoked'/);
});

test('session identity and expiry are immutable', () => {
  for (const field of [
    'session_id', 'binding_id', 'actor_id',
    'issued_at', 'expires_at'
  ]) {
    assert.ok(sql.includes(
      `NEW.${field} IS DISTINCT FROM OLD.${field}`
    ));
  }
});

test('session revocation is one-way', () => {
  assert.match(sql, /OLD\.revoked_at IS NOT NULL/);
  assert.match(sql, /NEW\.revoked_at IS NULL/);
});

test('actor cannot be reactivated', () => {
  assert.match(sql, /OLD\.actor_status <> 'active'/);
  assert.match(sql, /NEW\.actor_status <> 'disabled'/);
});

test('no privileged resolver or issuance functions', () => {
  assert.doesNotMatch(sql, /SECURITY\s+DEFINER/i);
  assert.doesNotMatch(sql, /CREATE\s+POLICY/i);
  assert.doesNotMatch(sql, /INSERT\s+INTO/i);
  assert.doesNotMatch(sql, /CREATE\s+FUNCTION\s+life\.issue/i);
});

test('all four guards exist', () => {
  for (const name of [
    'auth_audit_immutable_guard',
    'auth_binding_update_guard',
    'auth_session_update_guard',
    'auth_actor_update_guard'
  ]) {
    assert.ok(sql.includes(`life.${name}()`));
  }
});
