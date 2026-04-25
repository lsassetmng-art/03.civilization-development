import { optionalString, requiredString } from "../common/validation.ts";

export function validateCreateDraft(body: Record<string, unknown>) {
  return {
    creator_project_id: requiredString(body.creator_project_id, "creator_project_id"),
    asset_ref: requiredString(body.asset_ref, "asset_ref"),
    title: optionalString(body.title) ?? "Untitled draft",
    description: optionalString(body.description),
    default_language: requiredString(body.default_language, "default_language"),
  };
}

export function validateUpdateDraftMetadata(body: Record<string, unknown>) {
  return {
    title: optionalString(body.title),
    description: optionalString(body.description),
    default_language: optionalString(body.default_language),
  };
}
