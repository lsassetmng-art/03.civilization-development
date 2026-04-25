import { optionalString, positiveLimit, requiredString } from "../common/validation.ts";

export function validateCreateProject(body: Record<string, unknown>) {
  return {
    workspace_id: requiredString(body.workspace_id, "workspace_id"),
    project_title: requiredString(body.project_title, "project_title"),
    project_summary: optionalString(body.project_summary),
    owner_creator_ref: requiredString(body.owner_creator_ref, "owner_creator_ref"),
    default_language: requiredString(body.default_language, "default_language"),
    initial_visibility_hint: optionalString(body.initial_visibility_hint),
  };
}

export function validateListProjects(search: URLSearchParams) {
  return {
    workspace_id: requiredString(search.get("workspace_id"), "workspace_id"),
    status: optionalString(search.get("status")),
    keyword: optionalString(search.get("keyword")),
    limit: positiveLimit(search.get("limit") ? Number(search.get("limit")) : undefined),
  };
}

export function validateUpdateProject(body: Record<string, unknown>) {
  return {
    project_title: optionalString(body.project_title),
    project_summary: optionalString(body.project_summary),
    default_language: optionalString(body.default_language),
  };
}
