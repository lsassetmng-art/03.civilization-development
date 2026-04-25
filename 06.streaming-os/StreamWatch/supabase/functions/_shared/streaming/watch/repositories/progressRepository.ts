import { getAdminClient } from "../common/db.ts";

export async function upsertProgress(input: {
  actor_civilization_id: string;
  viewer_profile_id: string;
  target_type: string;
  target_id: string;
  position_seconds: number;
  duration_seconds?: number | null;
  completion_ratio?: number | null;
  device_mode?: string | null;
  route_context?: string | null;
}) {
  const db = getAdminClient();
  const { data, error } = await db.rpc("fn_streamwatch_progress_upsert", {
    p_actor_civilization_id: input.actor_civilization_id,
    p_viewer_profile_id: input.viewer_profile_id,
    p_target_type: input.target_type,
    p_target_id: input.target_id,
    p_position_seconds: input.position_seconds,
    p_duration_seconds: input.duration_seconds ?? null,
    p_completion_ratio: input.completion_ratio ?? null,
    p_device_mode: input.device_mode ?? null,
    p_route_context: input.route_context ?? null
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function readHistorySection(input: {
  viewer_profile_id: string;
  limit: number;
  offset: number;
}) {
  const db = getAdminClient();
  const { data, error } = await db
    .from("v_streamwatch_library_history")
    .select("*")
    .eq("viewer_profile_id", input.viewer_profile_id)
    .range(input.offset, input.offset + input.limit - 1);

  if (error) throw error;
  return data ?? [];
}

export async function readContinueWatching(input: {
  viewer_profile_id: string;
  limit: number;
}) {
  const db = getAdminClient();
  const { data, error } = await db
    .from("viewer_progress_states")
    .select("*")
    .eq("viewer_profile_id", input.viewer_profile_id)
    .in("continuity_state", ["in_progress", "completed"])
    .order("last_played_at", { ascending: false })
    .limit(input.limit);

  if (error) throw error;
  return data ?? [];
}
