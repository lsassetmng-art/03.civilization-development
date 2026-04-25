import { optionalString, requiredString, requiredUuid } from "../common/validation.ts";

export function validateProfileList(search: URLSearchParams) {
  return {
    actor_civilization_id: requiredUuid(search.get("actor_civilization_id"), "actor_civilization_id"),
  };
}

export function validateProfileSelect(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    device_mode: optionalString(body.device_mode) ?? "mobile",
  };
}
