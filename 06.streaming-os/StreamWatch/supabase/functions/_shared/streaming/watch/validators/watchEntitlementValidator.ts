import { requiredString, requiredUuid } from "../common/validation.ts";

export function validateEntitlementRead(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    target_type: requiredString(body.target_type, "target_type"),
    target_id: requiredUuid(body.target_id, "target_id"),
  };
}

export function validatePurchaseQuote(body: Record<string, unknown>) {
  return validateEntitlementRead(body);
}

export function validateCommerceExecute(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    target_type: requiredString(body.target_type, "target_type"),
    target_id: requiredUuid(body.target_id, "target_id"),
  };
}
