import { requireSecret } from "../020.backend/lib/aiod_secret_contract.js";
import { readEnv } from "../020.backend/lib/aiod_env.js";
import { buildSafeProviderMeta } from "../020.backend/lib/aiod_safe_log.js";

function requireEndpoint() {
  const endpoint = readEnv("AIOD_LINE_PUSH_ENDPOINT", "");
  if (!endpoint) {
    throw new Error("AIOD_LINE_PUSH_ENDPOINT is required for line_http mode.");
  }
  return endpoint;
}

function buildRequestBody(eventPayload = {}) {
  return {
    to: eventPayload.destination_ref || null,
    messages: [
      {
        type: "text",
        text: `${eventPayload.title || "notification"}\n${eventPayload.body || ""}`.trim()
      }
    ]
  };
}

export async function dispatchLineHttpAdapter(eventPayload = {}) {
  const endpoint = requireEndpoint();
  const accessToken = requireSecret("AIOD_LINE_CHANNEL_ACCESS_TOKEN");

  const requestBody = buildRequestBody(eventPayload);
  const safeMeta = buildSafeProviderMeta({
    provider_mode: "line_http",
    endpoint,
    destination_type: eventPayload.destination_type || "line",
    destination_ref: eventPayload.destination_ref || null,
    title: eventPayload.title || null,
    body: eventPayload.body || null
  });

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (res.ok) {
      return {
        provider_mode: "line_http",
        delivery_status: "sent",
        provider_message_ref: null,
        provider_error_code: null,
        provider_error_summary: null,
        safe_meta: safeMeta
      };
    }

    return {
      provider_mode: "line_http",
      delivery_status: "failed",
      provider_message_ref: null,
      provider_error_code: `HTTP_${res.status}`,
      provider_error_summary: `Provider http response status=${res.status}`,
      safe_meta: safeMeta
    };
  } catch (e) {
    return {
      provider_mode: "line_http",
      delivery_status: "failed",
      provider_message_ref: null,
      provider_error_code: "HTTP_FETCH_ERROR",
      provider_error_summary: e?.message || String(e),
      safe_meta: safeMeta
    };
  }
}
