import { DomainError, assertCondition } from "../common/errors.ts";

export function requireActorCivilizationId(value?: string): string {
  assertCondition(value && value.trim().length > 0, "VALIDATION_ERROR", "actor_civilization_id is required", 422);
  return value!.trim();
}

export function requireViewerProfileId(value?: string): string {
  assertCondition(value && value.trim().length > 0, "VALIDATION_ERROR", "viewer_profile_id is required", 422);
  return value!.trim();
}

export function requireTargetId(value?: string): string {
  assertCondition(value && value.trim().length > 0, "VALIDATION_ERROR", "target_id is required", 422);
  return value!.trim();
}

export function requireTargetType(value?: string): string {
  assertCondition(value && value.trim().length > 0, "VALIDATION_ERROR", "target_type is required", 422);
  return value!.trim();
}

export function requireRouteFamily(value?: string): string {
  assertCondition(value && value.trim().length > 0, "VALIDATION_ERROR", "route_family is required", 422);
  return value!.trim();
}

export function requireKeyword(value?: string): string {
  assertCondition(value && value.trim().length > 0, "VALIDATION_ERROR", "keyword is required", 422);
  return value!.trim();
}

export function coercePositiveLimit(value: unknown, fallback = 20): number {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.trunc(n), 100);
}

export function ensureSection(value?: string): string {
  const section = (value ?? "history").trim();
  const allowed = ["favorites", "watch_later", "history", "playlists", "queue"];
  if (!allowed.includes(section)) {
    throw new DomainError("VALIDATION_ERROR", "section is invalid", 422);
  }
  return section;
}
