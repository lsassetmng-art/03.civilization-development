import { assert } from "../common/errors.ts";
import { optionalString, requiredInteger, requiredString, requiredUuid } from "../common/validation.ts";

export function validateProgressUpsert(body: Record<string, unknown>) {
  const completion_ratio = Number(body.completion_ratio ?? 0);
  assert(Number.isFinite(completion_ratio) && completion_ratio >= 0 && completion_ratio <= 1, "INVALID_INPUT", "completion_ratio must be 0..1");

  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    target_type: requiredString(body.target_type, "target_type"),
    target_id: requiredUuid(body.target_id, "target_id"),
    position_seconds: requiredInteger(body.position_seconds, "position_seconds"),
    duration_seconds: requiredInteger(body.duration_seconds, "duration_seconds"),
    completion_ratio,
    device_mode: optionalString(body.device_mode),
    route_context: optionalString(body.route_context),
  };
}
