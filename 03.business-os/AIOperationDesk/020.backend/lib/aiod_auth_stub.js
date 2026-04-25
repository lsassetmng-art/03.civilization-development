export function resolveActorFromHeaders(headers = {}) {
  const actorId =
    headers["x-aiod-actor-id"] ||
    headers["X-AIOD-ACTOR-ID"] ||
    "dev_stub_actor";

  return {
    actor_id: actorId,
    actor_type: "user",
    auth_mode: "stub",
    authenticated: true
  };
}

export function assertAuthenticated(actor) {
  if (!actor || actor.authenticated !== true) {
    throw new Error("Actor is not authenticated.");
  }
  return actor;
}
