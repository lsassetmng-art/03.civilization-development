import { getAdminClient } from "../common/db.ts";

const db = () => getAdminClient().schema("streaming");

export async function insertDraft(row: Record<string, unknown>) {
  const { data, error } = await db().from("creator_video_draft").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateDraft(creator_video_draft_id: string, patch: Record<string, unknown>) {
  const { data, error } = await db()
    .from("creator_video_draft")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("creator_video_draft_id", creator_video_draft_id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
