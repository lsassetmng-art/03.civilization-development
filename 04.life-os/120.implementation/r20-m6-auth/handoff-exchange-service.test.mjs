import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  randomBytes,
  createHash
} from 'node:crypto';

import {
  issueLifeHandoff
} from "../../../01.civilization-os/civilization-os-web/lib/life-auth-handoff.mjs";

import {
  createLifeHandoffExchangeService
} from './handoff-exchange-service.mjs';

const key = randomBytes(32);
const state = randomBytes(32).toString('base64url');
const verifier = randomBytes(32).toString('base64url');
const challenge = createHash('sha256')
  .update(verifier)
  .digest('base64url');

const actorId =
  '11111111-1111-4111-8111-111111111111';
const sessionId =
  '33333333-3333-4333-8333-333333333333';

function handoff() {
  const issued = issueLifeHandoff({
    subject: 'r15h-h2-test',
    state,
    codeChallenge: challenge,
    key
  });

  assert.equal(issued.status, 'ok');

  return {
    code: issued.code,
    state,
    codeVerifier: verifier
  };
}

function fixture({fail = false} = {}) {
  const calls = [];
  let released = 0;

  const pool = {
    async connect() {
      return {
        async query(sql, params) {
          calls.push({sql, params});

          if (fail) {
            throw new Error('database_failure');
          }

          return {
            rowCount: 1,
            rows: [{
              session_id: sessionId,
              actor_id: actorId
            }]
          };
        },
        release() {
          released++;
        }
      };
    }
  };

  return {
    calls,
    released: () => released,
    service: createLifeHandoffExchangeService({
      pool,
      key
    })
  };
}

test('verified handoff invokes exactly one DB function', async () => {
  const f = fixture();
  const result = await f.service.exchange(handoff());

  assert.deepEqual(result, {
    sessionId,
    actorId
  });

  assert.equal(f.calls.length, 1);
  assert.match(
    f.calls[0].sql,
    /FROM life\.exchange_handoff\(/
  );
  assert.equal(f.calls[0].params[0], 'civilization');
  assert.equal(f.calls[0].params[1], 'r15h-h2-test');
  assert.match(
    f.calls[0].params[2],
    /^[0-9a-f]{64}$/
  );
  assert.equal(f.released(), 1);
});

test('invalid state never reaches DB', async () => {
  const f = fixture();
  const input = handoff();

  await assert.rejects(
    f.service.exchange({
      ...input,
      state: randomBytes(32).toString('base64url')
    }),
    /resolution_denied/
  );

  assert.equal(f.calls.length, 0);
});

test('invalid PKCE never reaches DB', async () => {
  const f = fixture();

  await assert.rejects(
    f.service.exchange({
      ...handoff(),
      codeVerifier: randomBytes(32)
        .toString('base64url')
    }),
    /resolution_denied/
  );

  assert.equal(f.calls.length, 0);
});

test('tampered ciphertext never reaches DB', async () => {
  const f = fixture();
  const input = handoff();
  const bytes = Buffer.from(input.code, 'base64url');
  bytes[bytes.length - 1] ^= 1;

  await assert.rejects(
    f.service.exchange({
      ...input,
      code: bytes.toString('base64url')
    }),
    /resolution_denied/
  );

  assert.equal(f.calls.length, 0);
});

test('caller cannot override verified subject', async () => {
  const f = fixture();

  await f.service.exchange({
    ...handoff(),
    issuer: 'attacker',
    subject: 'attacker',
    nonceHash: 'f'.repeat(64)
  });

  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].params[0], 'civilization');
  assert.equal(f.calls[0].params[1], 'r15h-h2-test');
  assert.notEqual(
    f.calls[0].params[2],
    'f'.repeat(64)
  );
});

test('DB failure does not leak internal details', async () => {
  const f = fixture({fail: true});

  await assert.rejects(
    f.service.exchange(handoff()),
    error => error.message === 'resolution_denied'
  );

  assert.equal(f.released(), 1);
});

test('missing encryption key fails closed', () => {
  assert.throws(
    () => createLifeHandoffExchangeService({
      pool: {},
      key: null
    }),
    /not_configured/
  );
});
