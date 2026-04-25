import { upsertProgress } from "../repositories/watchProgressRepository.ts";
import { validateProgressUpsert } from "../validators/watchContinuityValidator.ts";

export async function progressUpsert(body: Record<string, unknown>) {
  const input = validateProgressUpsert(body);
  const row = await upsertProgress({
    progress_state_id: crypto.randomUUID(),
    actor_civilization_id: input.actor_civilization_id,
    viewer_profile_id: input.viewer_profile_id,
    target_type: input.target_type,
    target_id: input.target_id,
    position_seconds: input.position_seconds,
    duration_seconds: input.duration_seconds,
    completion_ratio: input.completion_ratio,
    continuity_state: input.completion_ratio >= 0.95 ? "completed" : input.position_seconds > 0 ? "in_progress" : "not_started",
    last_device_mode: input.device_mode,
    last_route_context: input.route_context,
    last_played_at: new Date().toISOString(),
  });

  return {
    result: "upserted",
    continuity_state: row.continuity_state,
  };
}
