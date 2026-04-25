import { getAdminClient } from "../common/db.ts";

const db = () => getAdminClient().schema("streaming");

export async function upsertProgress(row: Record<string, unknown>) {
  const { data, error } = await db()
    .from("viewer_progress_states")
    .upsert(row, { onConflict: "viewer_profile_id,target_type,target_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listProgressByProfile(viewer_profile_id: string, limit: number) {
  const { data, error } = await db()
    .from("viewer_progress_states")
    .select("*")
    .eq("viewer_profile_id", viewer_profile_id)
    .order("last_played_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
