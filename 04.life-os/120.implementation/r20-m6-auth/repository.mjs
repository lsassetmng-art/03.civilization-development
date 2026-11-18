// LifeOS server-only authentication repository.
// The database function exclusively owns identity resolution,
// nonce consumption, session creation, and atomic audit.
const HASH = /^[0-9a-f]{64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createLifeAuthRepository({
  pool,
  sessionTtlSeconds = 28800
}) {
  if (!pool || typeof pool.connect !== 'function') {
    throw new Error('not_configured');
  }
  if (!Number.isSafeInteger(sessionTtlSeconds) ||
      sessionTtlSeconds < 60 || sessionTtlSeconds > 86400) {
    throw new Error('not_configured');
  }

  return Object.freeze({
    async consumeResolveIssue(proof) {
      if (!proof ||
          proof.issuer !== 'civilization' ||
          typeof proof.subject !== 'string' ||
          !proof.subject.trim() ||
          typeof proof.nonceHash !== 'string' ||
          !HASH.test(proof.nonceHash) ||
          !Number.isSafeInteger(proof.expiresAtMs)) {
        throw new Error('resolution_denied');
      }

      const expiry = new Date(proof.expiresAtMs);
      if (Number.isNaN(expiry.getTime())) {
        throw new Error('resolution_denied');
      }

      let client;
      try {
        client = await pool.connect();
        const result = await client.query(
          `SELECT session_id, actor_id
             FROM life.exchange_handoff(
               $1::text,$2::text,$3::text,
               $4::timestamptz,$5::integer
             )`,
          [
            proof.issuer,
            proof.subject,
            proof.nonceHash,
            expiry.toISOString(),
            sessionTtlSeconds
          ]
        );

        if (result.rowCount !== 1) {
          throw new Error('resolution_denied');
        }

        const row = result.rows[0];
        if (!row || !UUID.test(row.session_id) ||
            !UUID.test(row.actor_id)) {
          throw new Error('resolution_denied');
        }

        return Object.freeze({
          sessionId: row.session_id,
          actorId: row.actor_id
        });
      } catch {
        throw new Error('resolution_denied');
      } finally {
        if (client) client.release();
      }
    }
  });
}
