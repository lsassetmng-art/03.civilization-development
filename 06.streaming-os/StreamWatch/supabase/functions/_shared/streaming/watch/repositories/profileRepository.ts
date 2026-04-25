import { getAdminClient } from "../common/db.ts";

export async function listProfiles(actor_civilization_id: string) {
  const db = getAdminClient();
  const { data, error } = await db
    .from("v_streamwatch_profiles")
    .select("*")
    .eq("actor_civilization_id", actor_civilization_id)
    .order("is_default_profile", { ascending: false })
    .order("display_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getProfile(actor_civilization_id: string, viewer_profile_id: string) {
  const db = getAdminClient();
  const { data, error } = await db
    .from("v_streamwatch_profiles")
    .select("*")
    .eq("actor_civilization_id", actor_civilization_id)
    .eq("viewer_profile_id", viewer_profile_id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
