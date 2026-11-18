import { verifyLifeHandoff } from "../../../01.civilization-os/civilization-os-web/lib/life-auth-handoff.mjs";
import { createLifeAuthRepository } from './repository.mjs';

/**
 * Server-only LifeOS handoff exchange boundary.
 *
 * The caller must be an authenticated, trusted server route.
 * This module does not expose a public HTTP endpoint.
 *
 * Verification precedes every database operation.
 * The database function atomically consumes the nonce.
 */
export function createLifeHandoffExchangeService({
  pool,
  key,
  sessionTtlSeconds = 28800
}) {
  if (!Buffer.isBuffer(key) || key.length !== 32) {
    throw new Error('not_configured');
  }

  const repository = createLifeAuthRepository({
    pool,
    sessionTtlSeconds
  });

  return Object.freeze({
    async exchange({
      code,
      state,
      codeVerifier
    } = {}) {
      const result = verifyLifeHandoff({
        code,
        state,
        codeVerifier,
        key
      });

      if (result.status === 'not_configured') {
        throw new Error('not_configured');
      }

      if (result.status !== 'ok') {
        throw new Error('resolution_denied');
      }

      // Never accept issuer, subject or nonceHash
      // from the caller. Use only verified payload data.
      try {
        return await repository.consumeResolveIssue(
          result.proof
        );
      } catch {
        throw new Error('resolution_denied');
      }
    }
  });
}
