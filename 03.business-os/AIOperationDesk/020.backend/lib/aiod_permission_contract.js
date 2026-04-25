import { readEnv } from "./aiod_env.js";

export function getPermissionMode() {
  return readEnv("AIOD_PERMISSION_MODE", "stub");
}

export function evaluatePermissionContract(input = {}) {
  const mode = getPermissionMode();

  if (mode === "stub") {
    return {
      permission_mode: mode,
      allowed: true,
      review_required_override: false,
      approval_required_override: false,
      denial_reason: null
    };
  }

  if (mode === "policy_check") {
    const riskClass = input.risk_class || "low";
    const laneType = input.lane_type || "consult";

    const approvalRequiredOverride =
      riskClass === "high" || riskClass === "privileged";

    const reviewRequiredOverride =
      laneType !== "consult" || riskClass !== "low";

    return {
      permission_mode: mode,
      allowed: true,
      review_required_override: reviewRequiredOverride,
      approval_required_override: approvalRequiredOverride,
      denial_reason: null
    };
  }

  return {
    permission_mode: mode,
    allowed: false,
    review_required_override: false,
    approval_required_override: false,
    denial_reason: "unsupported_permission_mode"
  };
}

export function assertAllowedPermission(result) {
  if (!result || result.allowed !== true) {
    throw new Error(result?.denial_reason || "Permission denied.");
  }
  return result;
}
