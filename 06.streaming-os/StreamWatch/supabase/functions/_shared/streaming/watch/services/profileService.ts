import { DomainError } from "../common/errors.ts";
import { requireActorCivilizationId, requireViewerProfileId } from "../validators/commonValidators.ts";
import { getProfile, listProfiles } from "../repositories/profileRepository.ts";

export async function readProfileList(input: { actor_civilization_id?: string }) {
  const actor_civilization_id = requireActorCivilizationId(input.actor_civilization_id);
  return { profiles: await listProfiles(actor_civilization_id) };
}

export async function selectProfile(input: {
  actor_civilization_id?: string;
  viewer_profile_id?: string;
  device_mode?: string | null;
}) {
  const actor_civilization_id = requireActorCivilizationId(input.actor_civilization_id);
  const viewer_profile_id = requireViewerProfileId(input.viewer_profile_id);
  const profile = await getProfile(actor_civilization_id, viewer_profile_id);

  if (!profile) {
    throw new DomainError("NOT_FOUND", "viewer profile not found", 404);
  }

  return {
    active_profile: profile,
    restriction_context: {
      restriction_mode: profile.restriction_mode,
      age_band: profile.age_band ?? null,
      device_mode: input.device_mode ?? null
    }
  };
}
