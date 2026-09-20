const DECISION = Object.freeze({
  ALLOWED: "allowed",
  DENIED: "denied",
  ASK_EACH_TIME: "ask_each_time",
  BLOCKED_BY_POLICY: "blocked_by_policy",
  UNRESOLVED_POLICY: "unresolved_policy"
});

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function result(effectiveDecision, reason) {
  return Object.freeze({
    effective_decision: effectiveDecision,
    decision_reason_summary: reason
  });
}

function unresolved(reason) {
  return result(DECISION.UNRESOLVED_POLICY, reason);
}

function sameText(actual, expected) {
  return text(actual) === text(expected);
}

function validateRequestedScope(requestedScope, expected) {
  if (!requestedScope || typeof requestedScope !== "object") {
    return "requested_scope_missing";
  }

  if (
    !sameText(requestedScope.app_id, expected.appId) ||
    !sameText(requestedScope.resource_domain, expected.resourceDomain) ||
    !sameText(requestedScope.action_type, expected.actionType)
  ) {
    return "requested_scope_identity_mismatch";
  }

  /*
   * Canon requires requested scope to be explicit.
   * Until a scope status is explicitly active, runtime does not grant access.
   */
  if (text(requestedScope.scope_status) !== "active") {
    return "requested_scope_not_active_or_unresolved";
  }

  if (!text(requestedScope.requested_scope_level)) {
    return "requested_scope_level_missing";
  }

  if (!text(requestedScope.sensitivity_level)) {
    return "requested_scope_sensitivity_missing";
  }

  return "";
}

function validateUserGrant(userGrantedScope, expected) {
  if (!userGrantedScope || typeof userGrantedScope !== "object") {
    return "user_granted_scope_missing";
  }

  if (
    !sameText(userGrantedScope.user_ref, expected.userRef) ||
    !sameText(userGrantedScope.app_id, expected.appId) ||
    !sameText(userGrantedScope.resource_domain, expected.resourceDomain) ||
    !sameText(userGrantedScope.action_type, expected.actionType)
  ) {
    return "user_granted_scope_identity_mismatch";
  }

  if (text(userGrantedScope.grant_status) !== "active") {
    return "user_granted_scope_not_active_or_unresolved";
  }

  const grantMode = text(userGrantedScope.grant_mode);

  if (
    grantMode !== "allow" &&
    grantMode !== "deny" &&
    grantMode !== "ask_each_time"
  ) {
    return "user_grant_mode_unresolved";
  }

  return "";
}

function validateSystemPolicy(systemPolicy, expected) {
  if (!systemPolicy || typeof systemPolicy !== "object") {
    return "system_policy_missing";
  }

  const identityChecks = [
    ["app_id", expected.appId],
    ["resource_domain", expected.resourceDomain],
    ["action_type", expected.actionType]
  ];

  for (const [key, expectedValue] of identityChecks) {
    if (
      Object.prototype.hasOwnProperty.call(systemPolicy, key) &&
      !sameText(systemPolicy[key], expectedValue)
    ) {
      return "system_policy_identity_mismatch";
    }
  }

  const policyDecision = text(
    systemPolicy.effective_decision || systemPolicy.decision
  );

  if (
    policyDecision !== DECISION.ALLOWED &&
    policyDecision !== DECISION.DENIED &&
    policyDecision !== DECISION.BLOCKED_BY_POLICY &&
    policyDecision !== DECISION.UNRESOLVED_POLICY
  ) {
    return "system_policy_decision_unresolved";
  }

  return "";
}

/*
 * Canonical rule:
 *
 * requested_scope
 * AND user_granted_scope
 * AND system_policy
 *
 * Any unresolved input fails closed.
 */
export function resolveBusinessAppEffectiveAccess(input = {}) {
  const expected = Object.freeze({
    userRef: text(input.user_ref),
    appId: text(input.app_id),
    resourceDomain: text(input.resource_domain),
    actionType: text(input.action_type)
  });

  if (
    !expected.userRef ||
    !expected.appId ||
    !expected.resourceDomain ||
    !expected.actionType
  ) {
    return unresolved("effective_access_request_incomplete");
  }

  const requestedError = validateRequestedScope(
    input.requested_scope,
    expected
  );

  if (requestedError) {
    return unresolved(requestedError);
  }

  const grantError = validateUserGrant(
    input.user_granted_scope,
    expected
  );

  if (grantError) {
    return unresolved(grantError);
  }

  const policyError = validateSystemPolicy(
    input.system_policy,
    expected
  );

  if (policyError) {
    return unresolved(policyError);
  }

  const policyDecision = text(
    input.system_policy.effective_decision ||
      input.system_policy.decision
  );

  if (
    policyDecision === DECISION.DENIED ||
    policyDecision === DECISION.BLOCKED_BY_POLICY
  ) {
    return result(
      DECISION.BLOCKED_BY_POLICY,
      "system_policy_blocks_action"
    );
  }

  if (policyDecision === DECISION.UNRESOLVED_POLICY) {
    return unresolved("system_policy_unresolved");
  }

  const grantMode = text(input.user_granted_scope.grant_mode);

  if (grantMode === "deny") {
    return result(
      DECISION.DENIED,
      "user_grant_denies_action"
    );
  }

  if (grantMode === "ask_each_time") {
    return result(
      DECISION.ASK_EACH_TIME,
      "user_reconfirmation_required"
    );
  }

  if (
    grantMode === "allow" &&
    policyDecision === DECISION.ALLOWED
  ) {
    return result(
      DECISION.ALLOWED,
      "requested_scope_grant_and_policy_allow"
    );
  }

  return unresolved("effective_access_could_not_be_computed");
}

export const BUSINESS_APP_ACCESS_DECISIONS = DECISION;
