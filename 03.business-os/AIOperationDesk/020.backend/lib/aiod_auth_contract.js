import { readEnv } from "./aiod_env.js";

export function getAuthMode() {
  return readEnv("AIOD_AUTH_MODE", "stub");
}

export function resolveActor(headers = {}) {
  const mode = getAuthMode();

  if (mode === "stub") {
    return {
      actor_id: headers["x-aiod-actor-id"] || headers["X-AIOD-ACTOR-ID"] || "dev_stub_actor",
      actor_type: "user",
      auth_mode: "stub",
      authenticated: true
    };
  }

  if (mode === "header_trusted") {
    const actorId = headers["x-aiod-actor-id"] || headers["X-AIOD-ACTOR-ID"] || null;
    return {
      actor_id: actorId,
      actor_type: "user",
      auth_mode: "header_trusted",
      authenticated: !!actorId
    };
  }

  return {
    actor_id: null,
    actor_type: "unknown",
    auth_mode: mode,
    authenticated: false
  };
}

export function assertAuthenticatedActor(actor) {
  if (!actor || actor.authenticated !== true || !actor.actor_id) {
    throw new Error("Actor authentication is required.");
  }
  return actor;
}
