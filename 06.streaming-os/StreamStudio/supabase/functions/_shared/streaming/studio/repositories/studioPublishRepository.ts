import { getAdminClient } from "../common/db.ts";

const db = () => getAdminClient().schema("streaming");

export async function upsertPublishSetting(row: Record<string, unknown>) {
  const { data, error } = await db()
    .from("creator_publish_setting")
    .upsert(row, { onConflict: "publish_ref" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function selectPublishSettingByRef(publish_ref: string) {
  const { data, error } = await db()
    .from("creator_publish_setting")
    .select("*")
    .eq("publish_ref", publish_ref)
    .single();
  if (error) throw error;
  return data;
}

export async function insertPublishRequest(row: Record<string, unknown>) {
  const { data, error } = await db()
    .from("creator_publish_request")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updatePublishRequest(creator_publish_request_id: string, patch: Record<string, unknown>) {
  const { data, error } = await db()
    .from("creator_publish_request")
    .update(patch)
    .eq("creator_publish_request_id", creator_publish_request_id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listPublishHistory(creator_project_id: string, limit: number) {
  const { data: settings, error: settingsError } = await db()
    .from("creator_publish_setting")
    .select("publish_ref")
    .eq("creator_project_id", creator_project_id);
  if (settingsError) throw settingsError;

  const publishRefs = (settings ?? []).map((row) => row.publish_ref).filter(Boolean);
  if (publishRefs.length === 0) {
    return [];
  }

  const { data, error } = await db()
    .from("creator_publish_request")
    .select("*")
    .in("publish_ref", publishRefs)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
