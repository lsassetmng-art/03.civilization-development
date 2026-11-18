import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  randomBytes,
  createHash
} from 'node:crypto';
import {
  issueLifeHandoff,
  verifyLifeHandoff
} from '../lib/life-auth-handoff.mjs';

const key = randomBytes(32);
const wrongKey = randomBytes(32);
const state = randomBytes(32).toString('base64url');
const verifier = randomBytes(32).toString('base64url');
const challenge = createHash('sha256')
  .update(verifier)
  .digest('base64url');

const now = 1762150000000;

function issue() {
  return issueLifeHandoff({
    subject: 'life-test-subject',
    state,
    codeChallenge: challenge,
    key,
    now
  });
}

function verify(code, changes = {}) {
  return verifyLifeHandoff({
    code,
    state,
    codeVerifier: verifier,
    key,
    now: now + 1000,
    ...changes
  });
}

test('valid handoff yields DB proof', () => {
  const issued = issue();
  assert.equal(issued.status, 'ok');

  const result = verify(issued.code);
  assert.equal(result.status, 'ok');
  assert.equal(
    result.proof.issuer, 'civilization'
  );
  assert.equal(
    result.proof.subject,
    'life-test-subject'
  );
  assert.match(
    result.proof.nonceHash,
    /^[0-9a-f]{64}$/
  );
});

test('different issues have different nonce', () => {
  const a = verify(issue().code);
  const b = verify(issue().code);
  assert.notEqual(
    a.proof.nonceHash,
    b.proof.nonceHash
  );
});

test('tampered code rejected', () => {
  const code = issue().code;
  const bytes = Buffer.from(code, 'base64url');
  bytes[bytes.length - 1] ^= 1;
  assert.equal(
    verify(bytes.toString('base64url')).status,
    'invalid'
  );
});

test('wrong key rejected', () => {
  assert.equal(
    verify(issue().code, {key: wrongKey}).status,
    'invalid'
  );
});

test('wrong state rejected', () => {
  assert.equal(
    verify(issue().code, {
      state: randomBytes(32).toString('base64url')
    }).status,
    'invalid'
  );
});

test('wrong PKCE verifier rejected', () => {
  assert.equal(
    verify(issue().code, {
      codeVerifier: randomBytes(32)
        .toString('base64url')
    }).status,
    'invalid'
  );
});

test('expired handoff rejected', () => {
  assert.equal(
    verify(issue().code, {
      now: now + 120001
    }).status,
    'invalid'
  );
});

test('future-issued handoff rejected', () => {
  assert.equal(
    verify(issue().code, {
      now: now - 30001
    }).status,
    'invalid'
  );
});

test('missing key fails closed', () => {
  assert.equal(
    issueLifeHandoff({
      subject: 'test',
      state,
      codeChallenge: challenge,
      key: null
    }).status,
    'not_configured'
  );
});

test('invalid subject rejected', () => {
  assert.equal(
    issueLifeHandoff({
      subject: '',
      state,
      codeChallenge: challenge,
      key
    }).status,
    'invalid_request'
  );
});
