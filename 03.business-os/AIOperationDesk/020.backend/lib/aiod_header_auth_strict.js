import { readEnv } from "./aiod_env.js";

function authMode() {
  return readEnv("AIOD_AUTH_MODE", "stub");
}

function requiredHeader(name, headers) {
  const value = headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || null;
  if (!value) {
    throw new Error(`${name} header is required.`);
  }
  return value;
}

export function resolveStrictTrustedHeaderActor(headers = {}) {
  if (authMode() !== "header_trusted") {
    return {
      actor_id: null,
      actor_type: "unknown",
      company_ref: null,
      auth_mode: authMode(),
      authenticated: false
    };
  }

  const actorId = requiredHeader("x-aiod-actor-id", headers);
  const actorType = requiredHeader("x-aiod-actor-type", headers);
  const companyRef =
    headers["x-aiod-company-ref"] ||
    headers["X-AIOD-COMPANY-REF"] ||
    null;

  return {
    actor_id: actorId,
    actor_type: actorType,
    company_ref: companyRef,
    auth_mode: "header_trusted",
    authenticated: true
  };
}

export function assertStrictTrustedHeaderActor(actor) {
  if (!actor || actor.authenticated !== true) {
    throw new Error("Strict trusted header authentication failed.");
  }

  if (!actor.actor_id) {
    throw new Error("actor_id is required.");
  }

  if (!actor.actor_type) {
    throw new Error("actor_type is required.");
  }

  return actor;
}
