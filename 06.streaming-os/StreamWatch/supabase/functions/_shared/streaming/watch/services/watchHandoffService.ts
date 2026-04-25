import { claimHandoff, insertHandoff } from "../repositories/watchHandoffRepository.ts";
import { validateHandoffClaim, validateHandoffStart } from "../validators/watchHandoffValidator.ts";

export async function tvHandoffStart(body: Record<string, unknown>) {
  const input = validateHandoffStart(body);
  const handoff_session = await insertHandoff({
    handoff_session_id: crypto.randomUUID(),
    actor_civilization_id: input.actor_civilization_id,
    viewer_profile_id: input.viewer_profile_id,
    source_device_mode: "mobile",
    target_route_kind: input.route_family,
    target_route_label: input.route_target_ref,
    target_type: input.target_type,
    target_id: input.target_id,
    resume_position_seconds: 0,
    subtitle_default_code: input.subtitle_default_code,
    audio_default_code: input.audio_default_code,
    claim_code: crypto.randomUUID().slice(0, 8).toUpperCase(),
    claim_state: "pending",
    expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
  });

  return {
    result: "created",
    handoff_session,
  };
}

export async function tvHandoffClaim(body: Record<string, unknown>) {
  const input = validateHandoffClaim(body);
  const claimed = await claimHandoff(input.handoff_session_id, {
    claim_state: "claimed",
    claimed_at: new Date().toISOString(),
  });

  return {
    result: "claimed",
    claim_state: claimed.claim_state,
  };
}
