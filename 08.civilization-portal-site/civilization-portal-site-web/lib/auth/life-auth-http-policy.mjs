/**
 * LifeOS HTTP response policy.
 *
 * Pure response mapping for server routes.
 * Does not connect to DB, set cookies,
 * issue handoffs, or authenticate Persona.
 */

const NO_STORE = Object.freeze({
  "cache-control": "no-store",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff"
});

function result(status, body, clearCookie = false) {
  return Object.freeze({
    status,
    headers: NO_STORE,
    body: Object.freeze(body),
    clearCookie
  });
}

export function lifeSessionHttpResult(auth) {
  switch (auth?.status) {
    case "ok":
      if (
        typeof auth.actorId !== "string" ||
        typeof auth.sessionId !== "string" ||
        !Number.isSafeInteger(auth.expiresAtMs) ||
        auth.expiresAtMs <= Date.now()
      ) {
        return result(
          401,
          {ok: false, error: "unauthorized"},
          true
        );
      }

      // Session identifiers must never be sent to
      // browser-facing JSON responses.
      return result(200, {
        ok: true,
        authenticated: true,
        expiresAtMs: auth.expiresAtMs
      });

    case "unavailable":
      return result(503, {
        ok: false,
        error: "service_unavailable"
      });

    default:
      return result(
        401,
        {ok: false, error: "unauthorized"},
        true
      );
  }
}

export function lifeLogoutHttpResult(auth) {
  switch (auth?.status) {
    case "revoked":
      return result(
        200,
        {ok: true, loggedOut: true},
        true
      );

    case "forbidden":
      return result(403, {
        ok: false,
        error: "forbidden"
      });

    case "unavailable":
      // Do not clear a valid cookie when DB revocation
      // could not be confirmed.
      return result(503, {
        ok: false,
        error: "service_unavailable"
      });

    default:
      return result(
        401,
        {ok: false, error: "unauthorized"},
        true
      );
  }
}
