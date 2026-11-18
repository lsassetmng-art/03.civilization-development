import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createHash,
  randomBytes
} from 'node:crypto';

import {
  issueLifeAuthRedirect
} from '../lib/life-auth-issuer.mjs';

import {
  verifyLifeHandoff
} from '../lib/life-auth-handoff.mjs';

const key = randomBytes(32);
const state = randomBytes(32).toString('base64url');
const verifier = randomBytes(32).toString('base64url');
const challenge = createHash('sha256')
  .update(verifier).digest('base64url');

const valid = {
  civilizationId: 'civilization-test-actor',
  state,
  codeChallenge: challenge,
  codeChallengeMethod: 'S256',
  portalOrigin: 'https://portal.example',
  sealKey: key
};

test('issues callback with verifiable proof', () => {
  const result = issueLifeAuthRedirect(valid);
  assert.equal(result.status, 'ok');

  const url = new URL(result.redirectTarget);

  assert.equal(url.origin, 'https://portal.example');
  assert.equal(url.pathname, '/api/lifeos/auth/callback');
  assert.equal(url.searchParams.get('state'), state);
  assert.equal(url.searchParams.getAll('code').length, 1);

  const verified = verifyLifeHandoff({
    code: url.searchParams.get('code'),
    state,
    codeVerifier: verifier,
    key
  });

  assert.equal(verified.status, 'ok');
  assert.equal(
    verified.proof.subject,
    valid.civilizationId
  );
});

test('rejects missing identity', () => {
  assert.equal(
    issueLifeAuthRedirect({
      ...valid,
      civilizationId: ''
    }).status,
    'invalid_request'
  );
});

test('rejects missing state', () => {
  assert.equal(
    issueLifeAuthRedirect({
      ...valid,
      state: ''
    }).status,
    'invalid_request'
  );
});

test('rejects invalid challenge', () => {
  assert.equal(
    issueLifeAuthRedirect({
      ...valid,
      codeChallenge: 'invalid'
    }).status,
    'invalid_request'
  );
});

test('requires PKCE S256', () => {
  assert.equal(
    issueLifeAuthRedirect({
      ...valid,
      codeChallengeMethod: 'plain'
    }).status,
    'invalid_request'
  );
});

test('rejects external HTTP callback origin', () => {
  assert.equal(
    issueLifeAuthRedirect({
      ...valid,
      portalOrigin: 'http://portal.example'
    }).status,
    'not_configured'
  );
});

test('rejects origin with path', () => {
  assert.equal(
    issueLifeAuthRedirect({
      ...valid,
      portalOrigin: 'https://portal.example/redirect'
    }).status,
    'not_configured'
  );
});

test('rejects missing seal key', () => {
  assert.equal(
    issueLifeAuthRedirect({
      ...valid,
      sealKey: Buffer.alloc(1)
    }).status,
    'not_configured'
  );
});

test('wrong verifier cannot validate code', () => {
  const result = issueLifeAuthRedirect(valid);
  assert.equal(result.status, 'ok');

  const url = new URL(result.redirectTarget);

  const verified = verifyLifeHandoff({
    code: url.searchParams.get('code'),
    state,
    codeVerifier:
      randomBytes(32).toString('base64url'),
    key
  });

  assert.equal(verified.status, 'invalid');
});
