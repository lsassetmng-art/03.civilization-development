import { readEnv } from "../020.backend/lib/aiod_env.js";
import { dispatchLineStub } from "./line_provider_stub.js";
import { dispatchLineHttpImpl } from "./line_provider_http_impl.js";

export function getLineProviderMode() {
  return readEnv("AIOD_LINE_PROVIDER_MODE", "stub");
}

export async function dispatchLineProvider(eventPayload = {}) {
  const mode = getLineProviderMode();

  if (mode === "stub") {
    return dispatchLineStub(eventPayload);
  }

  if (mode === "line_http") {
    return dispatchLineHttpImpl(eventPayload);
  }

  return {
    provider_mode: mode,
    delivery_status: "failed",
    provider_message_ref: null,
    provider_error_code: "UNSUPPORTED_PROVIDER_MODE",
    provider_error_summary: "Unsupported LINE provider mode.",
    echoed_payload: {
      notification_type: eventPayload.notification_type || null,
      destination_type: eventPayload.destination_type || null
    }
  };
}
