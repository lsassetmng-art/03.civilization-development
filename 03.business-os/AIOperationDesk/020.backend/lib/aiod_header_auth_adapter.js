import { readEnv } from "./aiod_env.js";

function trustedHeaderMode() {
  return readEnv("AIOD_AUTH_MODE", "stub") === "header_trusted";
}

export function resolveTrustedHeaderActor(headers = {}) {
  if (!trustedHeaderMode()) {
    return {
      actor_id: null,
      actor_type: "unknown",
      auth_mode: readEnv("AIOD_AUTH_MODE", "stub"),
      authenticated: false
    };
  }

  const actorId =
    headers["x-aiod-actor-id"] ||
    headers["X-AIOD-ACTOR-ID"] ||
    null;

  const actorType =
    headers["x-aiod-actor-type"] ||
    headers["X-AIOD-ACTOR-TYPE"] ||
    "user";

  return {
    actor_id: actorId,
    actor_type: actorType,
    auth_mode: "header_trusted",
    authenticated: !!actorId
  };
}

export function assertTrustedHeaderActor(actor) {
  if (!actor || actor.authenticated !== true || !actor.actor_id) {
    throw new Error("Trusted header actor is required.");
  }
  return actor;
}
