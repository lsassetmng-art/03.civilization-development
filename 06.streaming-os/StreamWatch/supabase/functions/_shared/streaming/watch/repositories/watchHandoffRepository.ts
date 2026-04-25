import { getAdminClient } from "../common/db.ts";

const db = () => getAdminClient().schema("streaming");

export async function insertHandoff(row: Record<string, unknown>) {
  const { data, error } = await db()
    .from("cast_handoff_sessions")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function claimHandoff(handoff_session_id: string, patch: Record<string, unknown>) {
  const { data, error } = await db()
    .from("cast_handoff_sessions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("handoff_session_id", handoff_session_id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
