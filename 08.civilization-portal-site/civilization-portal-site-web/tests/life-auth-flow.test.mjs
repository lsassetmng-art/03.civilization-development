import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

import {
  createAuthStart,
  buildLoginUrl,
  readCallback,
  trustedOrigin,
  validOpaque,
  cookieOptions
} from '../lib/auth/life-auth-flow.mjs';

test('state and verifier are independently random', () => {
  const a = createAuthStart();
  const b = createAuthStart();

  assert.notEqual(a.state, b.state);
  assert.notEqual(a.verifier, b.verifier);
  assert.equal(a.state.length, 43);
  assert.equal(a.verifier.length, 64);
});

test('PKCE S256 challenge matches verifier', () => {
  const a = createAuthStart();

  assert.equal(
    a.challenge,
    createHash('sha256')
      .update(a.verifier)
      .digest('base64url')
  );
});

test('LifeOS continuation parameters are isolated', () => {
  const a = createAuthStart();

  const url = new URL(buildLoginUrl({
    origin: 'https://civilization.example',
    state: a.state,
    challenge: a.challenge
  }));

  assert.equal(
    url.pathname,
    '/api/civilization/auth/continue'
  );
  assert.equal(
    url.searchParams.get('requested_os_code'),
    'life'
  );
  assert.equal(
    url.searchParams.get('code_challenge_method'),
    'S256'
  );
});

test('unsafe origins are rejected', () => {
  for (const value of [
    'http://evil.example',
    'https://user:pass@example.com',
    'https://example.com/path',
    'https://example.com/?next=evil',
    'javascript:alert(1)'
  ]) {
    assert.equal(trustedOrigin(value), null);
  }
});

test('HTTPS and localhost origins are accepted', () => {
  assert.equal(
    trustedOrigin('https://portal.example'),
    'https://portal.example'
  );
  assert.equal(
    trustedOrigin('http://localhost:3000'),
    'http://localhost:3000'
  );
});

test('callback rejects missing and extra fields', () => {
  for (const query of [
    '',
    '?state=a&code=b',
    '?state=a&state=b&code=c',
    '?state=a&code=b&code=c',
    '?state=a&code=b&next=evil'
  ]) {
    assert.equal(
      readCallback(
        new URL('https://portal.example/callback' + query)
      ),
      null
    );
  }
});

test('callback accepts valid opaque parameters', () => {
  const auth = createAuthStart();

  const url = new URL(
    'https://portal.example/api/lifeos/auth/callback'
  );

  url.searchParams.set('state', auth.state);
  url.searchParams.set('code', 'opaque_code');

  assert.deepEqual(
    readCallback(url),
    {state: auth.state, code: 'opaque_code'}
  );
});

test('invalid opaque values are rejected', () => {
  assert.equal(validOpaque('abc', 43, 128), false);
  assert.equal(
    validOpaque('a'.repeat(43), 43, 128),
    true
  );
  assert.equal(
    validOpaque('a+'.repeat(22), 43, 128),
    false
  );
});

test('authentication cookies are protected', () => {
  const options = cookieOptions(true);

  assert.equal(options.httpOnly, true);
  assert.equal(options.secure, true);
  assert.equal(options.sameSite, 'lax');
  assert.equal(options.maxAge, 120);
});

test('invalid origin cannot generate login URL', () => {
  const auth = createAuthStart();

  assert.equal(
    buildLoginUrl({
      origin: 'https://evil.example/path',
      state: auth.state,
      challenge: auth.challenge
    }),
    null
  );
});
