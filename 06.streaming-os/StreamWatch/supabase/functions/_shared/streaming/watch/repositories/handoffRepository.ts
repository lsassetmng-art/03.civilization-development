import { getAdminClient } from "../common/db.ts";

function claimCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function startHandoff(input: {
  actor_civilization_id: string;
  viewer_profile_id: string;
  target_type: string;
  target_id: string;
  route_family: string;
  route_target_ref?: string | null;
}) {
  const db = getAdminClient();
  const session = {
    handoff_session_id: crypto.randomUUID(),
    actor_civilization_id: input.actor_civilization_id,
    viewer_profile_id: input.viewer_profile_id,
    source_device_mode: "mobile",
    target_route_kind: input.route_family,
    target_route_label: input.route_target_ref ?? null,
    target_type: input.target_type,
    target_id: input.target_id,
    resume_position_seconds: 0,
    subtitle_default_code: null,
    audio_default_code: null,
    claim_code: claimCode(),
    claim_state: "pending",
    expires_at: new Date(Date.now() + 1000 * 60 * 10).toISOString()
  };

  const { data, error } = await db
    .from("cast_handoff_sessions")
    .insert(session)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function claimHandoff(input: {
  actor_civilization_id: string;
  viewer_profile_id: string;
  handoff_session_id: string;
  claim_device_ref?: string | null;
}) {
  const db = getAdminClient();
  const { data, error } = await db.rpc("fn_streamwatch_claim_handoff", {
    p_actor_civilization_id: input.actor_civilization_id,
    p_viewer_profile_id: input.viewer_profile_id,
    p_handoff_session_id: input.handoff_session_id,
    p_claim_device_ref: input.claim_device_ref ?? null
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}
