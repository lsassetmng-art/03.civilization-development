import { resolveActor, assertAuthenticatedActor } from "./aiod_auth_contract.js";
import { evaluatePermissionContract, assertAllowedPermission } from "./aiod_permission_contract.js";
import { getRecommendedAuthMode } from "./aiod_auth_mode_policy.js";
import {
  resolveStrictTrustedHeaderActor,
  assertStrictTrustedHeaderActor
} from "./aiod_header_auth_strict.js";

function toHeaderObject(headers) {
  const obj = {};
  for (const [key, value] of headers.entries()) {
    obj[key] = value;
  }
  return obj;
}

function resolveActorByMode(headers) {
  const mode = getRecommendedAuthMode();

  if (mode === "header_trusted_strict") {
    return resolveStrictTrustedHeaderActor(headers);
  }

  return resolveActor(headers);
}

function assertActorByMode(actor) {
  const mode = getRecommendedAuthMode();

  if (mode === "header_trusted_strict") {
    return assertStrictTrustedHeaderActor(actor);
  }

  return assertAuthenticatedActor(actor);
}

export function buildRequestContext(req, payload = {}) {
  const headers = toHeaderObject(req.headers);
  const actor = resolveActorByMode(headers);

  const permissionInput = {
    actor_id: actor.actor_id,
    supported_app_code: payload.supported_app_code || null,
    lane_type: payload.lane_type || null,
    work_type_code: payload.work_type_code || null,
    risk_class: payload.risk_class || null,
    source_surface_type: payload.source_surface_type || null
  };

  const permission = evaluatePermissionContract(permissionInput);

  return {
    actor,
    permission,
    headers,
    permission_input: permissionInput
  };
}

export function assertContextForWrite(ctx) {
  assertActorByMode(ctx.actor);
  assertAllowedPermission(ctx.permission);
  return ctx;
}
