import {
  verifyLifeSessionCookie,
  lifeSessionCookieKeyFromEnv
} from './life-session-cookie.mjs';

import {
  createLifeSessionAccessRepository
} from './session-access-repository.mjs';

export function createLifeSessionAccessService({
  repository,
  key = lifeSessionCookieKeyFromEnv(),
  now = () => Date.now()
} = {}) {
  if (!repository ||
      typeof repository.readActive !== 'function' ||
      typeof repository.revoke !== 'function') {
    throw new Error('not_configured');
  }

  if (!Buffer.isBuffer(key) || key.length !== 32) {
    throw new Error('not_configured');
  }

  if (typeof now !== 'function') {
    throw new Error('not_configured');
  }

  function verifyToken(token) {
    return verifyLifeSessionCookie({
      token,
      key,
      now: now()
    });
  }

  async function authenticate(token) {
    const cookie = verifyToken(token);

    if (cookie.status !== 'ok') {
      return Object.freeze({status: 'unauthorized'});
    }

    let session;

    try {
      session = await repository.readActive(cookie.sessionId);
    } catch {
      return Object.freeze({status: 'unavailable'});
    }

    if (!session) {
      return Object.freeze({status: 'unauthorized'});
    }

    if (session.sessionId.toLowerCase() !==
        cookie.sessionId.toLowerCase() ||
        session.expiresAtMs <= now()) {
      return Object.freeze({status: 'unauthorized'});
    }

    return Object.freeze({
      status: 'ok',
      sessionId: session.sessionId,
      actorId: session.actorId,
      expiresAtMs: Math.min(
        session.expiresAtMs,
        cookie.expiresAtMs
      )
    });
  }

  async function revokeAuthenticated(token) {
    const auth = await authenticate(token);

    if (auth.status !== 'ok') {
      return Object.freeze({status: auth.status});
    }

    try {
      const revoked = await repository.revoke(auth.sessionId);

      return Object.freeze({
        status: revoked ? 'revoked' : 'unauthorized'
      });
    } catch {
      return Object.freeze({status: 'unavailable'});
    }
  }

  return Object.freeze({
    authenticate,
    revokeAuthenticated
  });
}

export function createLifeSessionAccessServiceFromPool({
  pool,
  key = lifeSessionCookieKeyFromEnv()
} = {}) {
  return createLifeSessionAccessService({
    repository: createLifeSessionAccessRepository({pool}),
    key
  });
}
