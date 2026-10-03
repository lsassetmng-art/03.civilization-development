import {
  isEntitlementActiveAt
} from "../app-commerce/business_app_commerce_contract.mjs";

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function result(input, decision, reason) {
  return Object.freeze({
    app_id: text(input.appId),
    resource_domain: text(input.resourceDomain),
    action_type: text(input.actionType),
    effective_decision: decision,
    decision_reason_summary: reason,
    policy_source: "business_app_commercial_entitlement"
  });
}

/*
 * This resolver produces the BusinessOS system-policy input consumed by
 * the existing R15A requested_scope && user_granted_scope && system_policy
 * resolver. It does not rewrite R15A.
 *
 * Commercial requirement must be explicit:
 * - required
 * - not_required
 * - unresolved
 */
export function resolveBusinessAppCommercialSystemPolicy(
  input = {}
) {
  const appId = text(input.appId);
  const resourceDomain = text(input.resourceDomain);
  const actionType = text(input.actionType);
  const userRef = text(input.userRef);
  const requirement = text(input.commercialRequirement);

  if (!appId || !resourceDomain || !actionType || !userRef) {
    return result(
      input,
      "unresolved_policy",
      "commercial_policy_request_incomplete"
    );
  }

  if (requirement === "not_required") {
    return result(
      input,
      "allowed",
      "commercial_entitlement_not_required"
    );
  }

  if (requirement !== "required") {
    return result(
      input,
      "unresolved_policy",
      "commercial_requirement_unresolved"
    );
  }

  const entitlement = input.entitlement;

  if (!entitlement || typeof entitlement !== "object") {
    return result(
      input,
      "denied",
      "commercial_entitlement_missing"
    );
  }

  if (
    text(entitlement.user_id) !== userRef ||
    text(entitlement.app_code) !== appId
  ) {
    return result(
      input,
      "unresolved_policy",
      "commercial_entitlement_identity_mismatch"
    );
  }

  if (!isEntitlementActiveAt(entitlement, input.at)) {
    return result(
      input,
      "denied",
      "commercial_entitlement_not_active"
    );
  }

  return result(
    input,
    "allowed",
    "commercial_entitlement_active"
  );
}
