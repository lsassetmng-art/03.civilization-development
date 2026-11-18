import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {
  issueLifeSessionCookie,
  verifyLifeSessionCookie,
  lifeSessionCookieOptions
} from './life-session-cookie.mjs';

const key = randomBytes(32);
const wrongKey = randomBytes(32);
const sid = '33333333-3333-4333-8333-333333333333';
const now = 1762150000000;

function issue() {
  return issueLifeSessionCookie({
    sessionId: sid, key, now
  });
}

function verify(token, overrides = {}) {
  return verifyLifeSessionCookie({
    token, key, now: now + 1000,
    ...overrides
  });
}

test('valid session token', () => {
  const result = verify(issue());
  assert.equal(result.status, 'ok');
  assert.equal(result.sessionId, sid);
});

test('tampered payload rejected', () => {
  const parts = issue().split('.');
  const bytes = Buffer.from(parts[1], 'base64url');
  bytes[bytes.length - 1] ^= 1;
  parts[1] = bytes.toString('base64url');
  assert.equal(
    verify(parts.join('.')).status,
    'invalid'
  );
});

test('wrong signing key rejected', () => {
  assert.equal(
    verify(issue(), {key: wrongKey}).status,
    'invalid'
  );
});

test('expired session rejected', () => {
  assert.equal(
    verify(issue(), {
      now: now + 28800 * 1000
    }).status,
    'invalid'
  );
});

test('future-issued session rejected', () => {
  assert.equal(
    verify(issue(), {now: now - 1}).status,
    'invalid'
  );
});

test('invalid session ID rejected', () => {
  assert.throws(
    () => issueLifeSessionCookie({
      sessionId: 'attacker',
      key,
      now
    }),
    /invalid_session/
  );
});

test('missing key fails closed', () => {
  assert.equal(
    verify(issue(), {key: null}).status,
    'not_configured'
  );
});

test('production cookie security', () => {
  const options = lifeSessionCookieOptions({
    production: true
  });
  assert.equal(options.name, '__Host-lifeos_session');
  assert.equal(options.secure, true);
  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, 'lax');
  assert.equal(options.path, '/');
});

test('development cookie isolation', () => {
  const options = lifeSessionCookieOptions({
    production: false
  });
  assert.equal(options.name, 'lifeos_session');
  assert.equal(options.secure, false);
});

test('overlong TTL rejected', () => {
  assert.throws(
    () => issueLifeSessionCookie({
      sessionId: sid,
      key,
      now,
      ttlSeconds: 86401
    }),
    /invalid_session/
  );
});
