/*
 * App-specific requested scopes have not yet been audited.
 *
 * This registry therefore starts intentionally empty.
 * No application permission is inferred from app behavior, UI, data shape,
 * PWA metadata, or same-user data ownership.
 *
 * Missing requested scope must be treated as unresolved and fail closed.
 */
export const BUSINESS_APP_REQUESTED_SCOPE_REGISTRY = Object.freeze([]);

export const BUSINESS_APP_REQUESTED_SCOPE_AUDIT_STATUS =
  "app_specific_scopes_not_yet_audited";

function normalizedText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function listBusinessAppRequestedScopes(appCode) {
  const normalizedAppCode = normalizedText(appCode);

  if (!normalizedAppCode) {
    return Object.freeze([]);
  }

  return Object.freeze(
    BUSINESS_APP_REQUESTED_SCOPE_REGISTRY.filter(
      (scope) => scope.app_id === normalizedAppCode
    )
  );
}

export function findBusinessAppRequestedScope(
  appCode,
  resourceDomain,
  actionType
) {
  const normalizedAppCode = normalizedText(appCode);
  const normalizedResourceDomain = normalizedText(resourceDomain);
  const normalizedActionType = normalizedText(actionType);

  if (
    !normalizedAppCode ||
    !normalizedResourceDomain ||
    !normalizedActionType
  ) {
    return null;
  }

  return (
    BUSINESS_APP_REQUESTED_SCOPE_REGISTRY.find(
      (scope) =>
        scope.app_id === normalizedAppCode &&
        scope.resource_domain === normalizedResourceDomain &&
        scope.action_type === normalizedActionType
    ) || null
  );
}
