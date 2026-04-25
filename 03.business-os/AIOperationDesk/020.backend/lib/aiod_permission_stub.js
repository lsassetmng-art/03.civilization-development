export function evaluatePermission(input = {}) {
  return {
    permission_mode: "stub",
    actor_id: input.actor_id || "dev_stub_actor",
    supported_app_code: input.supported_app_code || null,
    lane_type: input.lane_type || null,
    allowed: true,
    review_required_override: false,
    approval_required_override: false,
    reason: "stub_allow"
  };
}

export function assertPermission(result) {
  if (!result || result.allowed !== true) {
    throw new Error("Permission denied.");
  }
  return result;
}
