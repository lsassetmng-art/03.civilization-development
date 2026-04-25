import { getProfile, listProfiles } from "../repositories/watchProfileRepository.ts";
import { validateProfileList, validateProfileSelect } from "../validators/watchProfileValidator.ts";

export async function profileList(search: URLSearchParams) {
  const input = validateProfileList(search);
  const profiles = await listProfiles(input.actor_civilization_id);
  return { profiles };
}

export async function profileSelect(body: Record<string, unknown>) {
  const input = validateProfileSelect(body);
  const active_profile = await getProfile(input.viewer_profile_id);
  return {
    active_profile,
    restriction_context: {
      restriction_mode: active_profile.restriction_mode,
      age_band: active_profile.age_band,
      device_mode: input.device_mode,
    },
  };
}
