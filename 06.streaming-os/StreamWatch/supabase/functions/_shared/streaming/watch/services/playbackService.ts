import { upsertProgress } from "../repositories/progressRepository.ts";
import { requireActorCivilizationId, requireTargetId, requireTargetType, requireViewerProfileId } from "../validators/commonValidators.ts";

export async function progressUpsert(input: {
  actor_civilization_id?: string;
  viewer_profile_id?: string;
  target_type?: string;
  target_id?: string;
  position_seconds?: number;
  duration_seconds?: number | null;
  completion_ratio?: number | null;
  device_mode?: string | null;
  route_context?: string | null;
}) {
  const result = await upsertProgress({
    actor_civilization_id: requireActorCivilizationId(input.actor_civilization_id),
    viewer_profile_id: requireViewerProfileId(input.viewer_profile_id),
    target_type: requireTargetType(input.target_type),
    target_id: requireTargetId(input.target_id),
    position_seconds: Number(input.position_seconds ?? 0),
    duration_seconds: input.duration_seconds ?? null,
    completion_ratio: input.completion_ratio ?? null,
    device_mode: input.device_mode ?? null,
    route_context: input.route_context ?? null
  });

  return {
    result: "ok",
    continuity_state: result?.continuity_state ?? "in_progress"
  };
}
