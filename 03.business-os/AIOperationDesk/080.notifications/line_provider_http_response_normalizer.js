export async function normalizeLineHttpResponse(response) {
  if (!response) {
    return {
      provider_mode: "line_http",
      delivery_status: "failed",
      provider_message_ref: null,
      provider_error_code: "NO_RESPONSE",
      provider_error_summary: "No provider response object."
    };
  }

  if (response.ok) {
    return {
      provider_mode: "line_http",
      delivery_status: "sent",
      provider_message_ref: null,
      provider_error_code: null,
      provider_error_summary: null
    };
  }

  return {
    provider_mode: "line_http",
    delivery_status: "failed",
    provider_message_ref: null,
    provider_error_code: `HTTP_${response.status}`,
    provider_error_summary: `Provider http response status=${response.status}`
  };
}
