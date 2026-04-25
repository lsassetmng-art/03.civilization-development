import { getAdminClient } from "../common/db.ts";

export async function createProjectViaSql(input: {
  workspace_id: string;
  project_title: string;
  project_summary?: string | null;
  owner_creator_ref?: string | null;
  default_language: string;
  initial_visibility_hint?: string | null;
}) {
  const db = getAdminClient();
  const { data, error } = await db.rpc("fn_stream_studio_create_project", {
    p_workspace_id: input.workspace_id,
    p_project_title: input.project_title,
    p_project_summary: input.project_summary ?? null,
    p_owner_creator_ref: input.owner_creator_ref ?? null,
    p_default_language: input.default_language,
    p_initial_visibility_hint: input.initial_visibility_hint ?? null
  });

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function listProjects(input: {
  workspace_id: string;
  status?: string | null;
  keyword?: string | null;
  limit?: number;
}) {
  const db = getAdminClient();
  let query = db
    .from("v_stream_studio_project_list")
    .select("*")
    .eq("workspace_id", input.workspace_id)
    .order("updated_at", { ascending: false })
    .limit(input.limit ?? 20);

  if (input.status) query = query.eq("project_status", input.status);
  if (input.keyword) query = query.ilike("project_title", `%${input.keyword}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getProjectDetail(creator_project_id: string) {
  const db = getAdminClient();
  const { data, error } = await db
    .from("creator_project")
    .select("*")
    .eq("creator_project_id", creator_project_id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
