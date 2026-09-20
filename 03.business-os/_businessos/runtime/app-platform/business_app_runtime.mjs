import {
  getBusinessApp,
  listBusinessApps
} from "./business_app_registry.mjs";

import {
  findBusinessAppRequestedScope,
  listBusinessAppRequestedScopes
} from "./business_app_requested_scope_registry.mjs";

import {
  resolveBusinessAppEffectiveAccess
} from "./business_app_access_resolver.mjs";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function unresolved(reason) {
  return Object.freeze({
    effective_decision: "unresolved_policy",
    decision_reason_summary: reason
  });
}

export function listApps() {
  return listBusinessApps();
}

export function getApp(appCode) {
  return getBusinessApp(appCode);
}

export function getRequestedScopes(appCode) {
  return listBusinessAppRequestedScopes(appCode);
}

/*
 * This facade does not persist grants and does not read device installation
 * state. Grant and system-policy inputs must come from BusinessOS-owned
 * runtime/API layers when those integrations are connected.
 */
export function resolveEffectiveAccess(input = {}) {
  const appCode = text(input.appCode);
  const userRef = text(input.userRef);
  const resourceDomain = text(input.resourceDomain);
  const actionType = text(input.actionType);
  const correlationId = text(input.correlationId);

  if (
    !appCode ||
    !userRef ||
    !resourceDomain ||
    !actionType ||
    !correlationId
  ) {
    return unresolved("runtime_request_incomplete");
  }

  const app = getBusinessApp(appCode);

  if (!app) {
    return unresolved("app_not_registered");
  }

  const requestedScope = findBusinessAppRequestedScope(
    appCode,
    resourceDomain,
    actionType
  );

  if (!requestedScope) {
    return unresolved("requested_scope_unresolved");
  }

  return resolveBusinessAppEffectiveAccess({
    user_ref: userRef,
    app_id: appCode,
    resource_domain: resourceDomain,
    action_type: actionType,
    requested_scope: requestedScope,
    user_granted_scope: input.userGrantedScope,
    system_policy: input.systemPolicy
  });
}
