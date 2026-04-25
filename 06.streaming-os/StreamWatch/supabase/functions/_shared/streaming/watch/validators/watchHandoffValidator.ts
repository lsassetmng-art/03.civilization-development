import { optionalString, requiredString, requiredUuid } from "../common/validation.ts";

export function validateHandoffStart(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    target_type: requiredString(body.target_type, "target_type"),
    target_id: requiredUuid(body.target_id, "target_id"),
    route_family: requiredString(body.route_family, "route_family"),
    route_target_ref: requiredString(body.route_target_ref, "route_target_ref"),
    subtitle_default_code: optionalString(body.subtitle_default_code),
    audio_default_code: optionalString(body.audio_default_code),
  };
}

export function validateHandoffClaim(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    handoff_session_id: requiredUuid(body.handoff_session_id, "handoff_session_id"),
    claim_device_ref: requiredString(body.claim_device_ref, "claim_device_ref"),
  };
}
