import { getAdminClient } from "../common/db.ts";

const db = () => getAdminClient().schema("streaming");

export async function insertProject(row: Record<string, unknown>) {
  const { data, error } = await db().from("creator_project").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function selectProjects(filters: {
  workspace_id: string;
  status?: string | null;
  keyword?: string | null;
  limit: number;
}) {
  let query = db()
    .from("creator_project")
    .select("*")
    .eq("workspace_id", filters.workspace_id)
    .order("updated_at", { ascending: false })
    .limit(filters.limit);

  if (filters.status) {
    query = query.eq("project_status", filters.status);
  }
  if (filters.keyword) {
    query = query.ilike("project_title", `%${filters.keyword}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function selectProjectById(creator_project_id: string) {
  const { data, error } = await db()
    .from("creator_project")
    .select("*")
    .eq("creator_project_id", creator_project_id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProjectById(creator_project_id: string, patch: Record<string, unknown>) {
  const { data, error } = await db()
    .from("creator_project")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("creator_project_id", creator_project_id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
