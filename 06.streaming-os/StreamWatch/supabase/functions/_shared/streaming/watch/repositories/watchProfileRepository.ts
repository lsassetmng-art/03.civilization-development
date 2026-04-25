import { getAdminClient } from "../common/db.ts";

const db = () => getAdminClient().schema("streaming");

export async function listProfiles(actor_civilization_id: string) {
  const { data, error } = await db()
    .from("viewer_profile_records")
    .select("*")
    .eq("actor_civilization_id", actor_civilization_id)
    .eq("is_active", true)
    .order("is_default_profile", { ascending: false })
    .order("display_name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getProfile(viewer_profile_id: string) {
  const { data, error } = await db()
    .from("viewer_profile_records")
    .select("*")
    .eq("viewer_profile_id", viewer_profile_id)
    .single();
  if (error) throw error;
  return data;
}
