import { requireSecret } from "../020.backend/lib/aiod_secret_contract.js";

export async function dispatchLineHttpSkeleton(eventPayload = {}) {
  const accessToken = requireSecret("AIOD_LINE_CHANNEL_ACCESS_TOKEN");

  return {
    provider_mode: "line_http",
    delivery_status: "failed",
    provider_message_ref: null,
    provider_error_code: "HTTP_PROVIDER_NOT_IMPLEMENTED",
    provider_error_summary: "line_http skeleton exists but outbound provider call is not yet implemented.",
    token_present: !!accessToken,
    echoed_payload: eventPayload
  };
}
