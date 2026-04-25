import { getAdminClient } from "../common/db.ts";

const db = () => getAdminClient().schema("streaming");

export async function insertUploadJob(row: Record<string, unknown>) {
  const { data, error } = await db().from("creator_upload_job").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function selectUploadJob(creator_upload_job_id: string) {
  const { data, error } = await db()
    .from("creator_upload_job")
    .select("*")
    .eq("creator_upload_job_id", creator_upload_job_id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUploadJob(creator_upload_job_id: string, patch: Record<string, unknown>) {
  const { data, error } = await db()
    .from("creator_upload_job")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("creator_upload_job_id", creator_upload_job_id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
