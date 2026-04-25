import { clampLimit, optionalInteger, optionalString, requiredString, requiredUuid } from "../common/validation.ts";

export function validateHomeFeedRead(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    feed_scope: requiredString(body.feed_scope, "feed_scope"),
    limit: clampLimit(body.limit, 20),
    offset: optionalInteger(body.offset) ?? 0,
    device_mode: optionalString(body.device_mode) ?? "mobile",
  };
}

export function validateCategoryTreeRead(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    root_scope: requiredString(body.root_scope, "root_scope"),
    include_personal_library_branch: Boolean(body.include_personal_library_branch),
    depth_limit: optionalInteger(body.depth_limit) ?? 3,
  };
}

export function validateSearch(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    keyword: requiredString(body.keyword, "keyword"),
    limit: clampLimit(body.limit, 20),
    offset: optionalInteger(body.offset) ?? 0,
    device_mode: optionalString(body.device_mode) ?? "mobile",
  };
}

export function validateSeriesDetailRead(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    series_id: requiredUuid(body.series_id, "series_id"),
  };
}

export function validateLibraryRead(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    section: requiredString(body.section, "section"),
    limit: clampLimit(body.limit, 20),
    offset: optionalInteger(body.offset) ?? 0,
    device_mode: optionalString(body.device_mode) ?? "mobile",
  };
}

export function validateNotificationsRead(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    cursor: optionalString(body.cursor),
    limit: clampLimit(body.limit, 20),
  };
}

export function validateSimpleMutation(body: Record<string, unknown>) {
  return {
    actor_civilization_id: requiredUuid(body.actor_civilization_id, "actor_civilization_id"),
    viewer_profile_id: requiredUuid(body.viewer_profile_id, "viewer_profile_id"),
    target_type: requiredString(body.target_type, "target_type"),
    target_id: requiredUuid(body.target_id, "target_id"),
    mutation: optionalString(body.mutation),
    list_type: optionalString(body.list_type),
    follow_flag: body.follow_flag,
  };
}
