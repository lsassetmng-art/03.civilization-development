import { requireDefaultLanguage, requireProjectTitle, requireWorkspaceId, type CreateProjectInput } from "../validators/projectValidators.ts";
import { createProjectViaSql, getProjectDetail, listProjects } from "../repositories/projectRepository.ts";
import { DomainError } from "../common/errors.ts";

export async function createProject(input: CreateProjectInput) {
  return await createProjectViaSql({
    workspace_id: requireWorkspaceId(input.workspace_id),
    project_title: requireProjectTitle(input.project_title),
    project_summary: input.project_summary ?? null,
    owner_creator_ref: input.owner_creator_ref ?? null,
    default_language: requireDefaultLanguage(input.default_language),
    initial_visibility_hint: input.initial_visibility_hint ?? null
  });
}

export async function readProjectList(query: URLSearchParams) {
  const workspace_id = requireWorkspaceId(query.get("workspace_id") ?? undefined);
  const status = query.get("status");
  const keyword = query.get("keyword");
  const limit = Number(query.get("limit") ?? "20");
  const items = await listProjects({ workspace_id, status, keyword, limit });
  return {
    items,
    page: { next_cursor: null, limit }
  };
}

export async function readProjectDetail(creator_project_id: string) {
  const project = await getProjectDetail(creator_project_id);
  if (!project) {
    throw new DomainError("NOT_FOUND", "Project not found", 404);
  }
  return { project };
}
