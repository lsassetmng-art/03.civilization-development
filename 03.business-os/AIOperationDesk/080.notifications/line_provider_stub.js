export function dispatchLineStub(eventPayload = {}) {
  return {
    provider_mode: "stub",
    delivery_status: "sent",
    provider_message_ref: `line_stub_${Date.now()}`,
    provider_error_code: null,
    provider_error_summary: null,
    echoed_payload: eventPayload
  };
}
