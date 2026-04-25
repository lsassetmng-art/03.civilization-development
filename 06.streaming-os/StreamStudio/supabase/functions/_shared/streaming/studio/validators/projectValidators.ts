import { DomainError, assertCondition } from "../common/errors.ts";

export type CreateProjectInput = {
  workspace_id?: string;
  project_title?: string;
  project_summary?: string | null;
  owner_creator_ref?: string | null;
  default_language?: string;
  initial_visibility_hint?: string | null;
};

export function requireWorkspaceId(value?: string): string {
  assertCondition(value && value.trim().length > 0, "VALIDATION_ERROR", "workspace_id is required", 422);
  return value!.trim();
}

export function requireProjectTitle(value?: string): string {
  assertCondition(value && value.trim().length > 0, "VALIDATION_ERROR", "project_title is required", 422);
  assertCondition(value!.trim().length <= 200, "VALIDATION_ERROR", "project_title max length is 200", 422);
  return value!.trim();
}

export function requireDefaultLanguage(value?: string): string {
  assertCondition(value && value.trim().length > 0, "VALIDATION_ERROR", "default_language is required", 422);
  return value!.trim();
}

export function validatePublishRequestChannel(value?: string): "publish_now" | "schedule" {
  if (value === "publish_now" || value === "schedule") return value;
  throw new DomainError("VALIDATION_ERROR", "request_channel must be publish_now or schedule", 422);
}
