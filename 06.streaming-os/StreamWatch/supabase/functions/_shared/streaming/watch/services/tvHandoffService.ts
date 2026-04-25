import { startHandoff, claimHandoff } from "../repositories/handoffRepository.ts";
import { requireActorCivilizationId, requireRouteFamily, requireTargetId, requireTargetType, requireViewerProfileId } from "../validators/commonValidators.ts";
import { assertCondition } from "../common/errors.ts";

export async function tvHandoffStart(input: {
  actor_civilization_id?: string;
  viewer_profile_id?: string;
  target_type?: string;
  target_id?: string;
  route_family?: string;
  route_target_ref?: string | null;
}) {
  return {
    result: "ok",
    handoff_session: await startHandoff({
      actor_civilization_id: requireActorCivilizationId(input.actor_civilization_id),
      viewer_profile_id: requireViewerProfileId(input.viewer_profile_id),
      target_type: requireTargetType(input.target_type),
      target_id: requireTargetId(input.target_id),
      route_family: requireRouteFamily(input.route_family),
      route_target_ref: input.route_target_ref ?? null
    })
  };
}

export async function tvHandoffClaim(input: {
  actor_civilization_id?: string;
  viewer_profile_id?: string;
  handoff_session_id?: string;
  claim_device_ref?: string | null;
}) {
  assertCondition(input.handoff_session_id && input.handoff_session_id.trim().length > 0, "VALIDATION_ERROR", "handoff_session_id is required", 422);

  return {
    result: "ok",
    claim_state: await claimHandoff({
      actor_civilization_id: requireActorCivilizationId(input.actor_civilization_id),
      viewer_profile_id: requireViewerProfileId(input.viewer_profile_id),
      handoff_session_id: input.handoff_session_id!.trim(),
      claim_device_ref: input.claim_device_ref ?? null
    })
  };
}
