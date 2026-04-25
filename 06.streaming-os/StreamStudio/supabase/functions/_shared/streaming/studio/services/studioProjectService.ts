import { prefixedId } from "../common/ids.ts";
import { insertProject, selectProjectById, selectProjects, updateProjectById } from "../repositories/studioProjectRepository.ts";
import { validateCreateProject, validateListProjects, validateUpdateProject } from "../validators/studioProjectValidator.ts";

export async function createProject(body: Record<string, unknown>) {
  const input = validateCreateProject(body);
  const row = await insertProject({
    creator_project_id: prefixedId("cp"),
    workspace_id: input.workspace_id,
    project_code: `P-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    project_title: input.project_title,
    project_summary: input.project_summary,
    project_status: "draft",
    owner_creator_ref: input.owner_creator_ref,
    default_language: input.default_language,
    initial_visibility_hint: input.initial_visibility_hint,
    version: 1,
  });
  return { project: row };
}

export async function listProjects(search: URLSearchParams) {
  const input = validateListProjects(search);
  const items = await selectProjects(input);
  return {
    items,
    page: {
      next_cursor: null,
      limit: input.limit,
    },
  };
}

export async function getProjectDetail(creator_project_id: string) {
  const project = await selectProjectById(creator_project_id);
  return {
    project,
    members_summary: [],
    readiness_summary: {
      unresolved_blockers: 0,
      draft_count: 0,
    },
  };
}

export async function updateProject(creator_project_id: string, body: Record<string, unknown>) {
  const input = validateUpdateProject(body);
  const project = await updateProjectById(creator_project_id, input);
  return { project };
}
