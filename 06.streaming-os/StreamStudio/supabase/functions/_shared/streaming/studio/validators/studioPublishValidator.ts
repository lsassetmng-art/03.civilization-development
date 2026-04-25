import { optionalString, positiveLimit, requiredString } from "../common/validation.ts";

export function validateUpsertPublishSetting(body: Record<string, unknown>, publish_ref: string) {
  return {
    creator_publish_setting_id: `ps_${publish_ref}`,
    publish_ref,
    creator_project_id: requiredString(body.creator_project_id, "creator_project_id"),
    visibility_code: requiredString(body.visibility_scope ?? body.visibility_code, "visibility_scope"),
    destination_ref: requiredString(body.destination_ref ?? "streamingos", "destination_ref"),
    rights_check_status: "pending",
    readiness_status: "pending",
    scheduled_at: optionalString(body.scheduled_publish_at),
  };
}

export function validateCreatePublishRequest(body: Record<string, unknown>) {
  return {
    creator_project_id: requiredString(body.creator_project_id, "creator_project_id"),
    publish_ref: requiredString(body.publish_ref, "publish_ref"),
    request_note: optionalString(body.request_note),
    requested_by: requiredString(body.requested_by, "requested_by"),
  };
}

export function validateSchedulePublish(body: Record<string, unknown>) {
  return {
    creator_publish_request_id: requiredString(body.creator_publish_request_id, "creator_publish_request_id"),
    scheduled_publish_at: requiredString(body.scheduled_publish_at, "scheduled_publish_at"),
    scheduled_by: requiredString(body.scheduled_by, "scheduled_by"),
  };
}

export function validatePublishHistory(search: URLSearchParams) {
  return {
    creator_project_id: requiredString(search.get("creator_project_id"), "creator_project_id"),
    limit: positiveLimit(search.get("limit") ? Number(search.get("limit")) : undefined),
  };
}
