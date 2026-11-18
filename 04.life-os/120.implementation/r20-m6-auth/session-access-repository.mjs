const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validId(value) {
  return typeof value === 'string' && UUID.test(value);
}

export function createLifeSessionAccessRepository({pool} = {}) {
  if (!pool || typeof pool.connect !== 'function') {
    throw new Error('not_configured');
  }

  async function query(sql, sessionId) {
    if (!validId(sessionId)) {
      throw new Error('invalid_session');
    }

    let client;
    try {
      client = await pool.connect();
      return await client.query(sql, [sessionId]);
    } catch {
      throw new Error('session_unavailable');
    } finally {
      if (client) client.release();
    }
  }

  return Object.freeze({
    async readActive(sessionId) {
      const result = await query(
        `SELECT session_id, actor_id, expires_at
         FROM life.read_auth_session($1::uuid)`,
        sessionId
      );

      if (result.rowCount === 0) return null;

      if (result.rowCount !== 1) {
        throw new Error('session_unavailable');
      }

      const row = result.rows[0];
      const expiresAtMs =
        new Date(row?.expires_at).getTime();

      if (!validId(row?.session_id) ||
          !validId(row?.actor_id) ||
          row.session_id.toLowerCase() !==
            sessionId.toLowerCase() ||
          !Number.isFinite(expiresAtMs) ||
          expiresAtMs <= Date.now()) {
        throw new Error('session_unavailable');
      }

      return Object.freeze({
        sessionId: row.session_id,
        actorId: row.actor_id,
        expiresAtMs
      });
    },

    async revoke(sessionId) {
      const result = await query(
        `SELECT life.revoke_auth_session($1::uuid)
         AS revoked`,
        sessionId
      );

      if (result.rowCount !== 1 ||
          typeof result.rows[0]?.revoked !== 'boolean') {
        throw new Error('session_unavailable');
      }

      return result.rows[0].revoked;
    }
  });
}
