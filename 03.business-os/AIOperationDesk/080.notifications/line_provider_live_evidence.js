export function buildProviderLiveEvidence(input = {}) {
  return {
    evidence_type: "provider_live_result",
    notification_event_id: input.notification_event_id || null,
    provider_mode: input.provider_mode || null,
    execution_mode: input.execution_mode || null,
    delivery_status: input.delivery_status || null,
    provider_error_code: input.provider_error_code || null,
    provider_error_summary: input.provider_error_summary || null,
    safe_meta: input.safe_meta || null,
    created_at: new Date().toISOString()
  };
}

export function summarizeProviderLiveEvidence(items = []) {
  return {
    total_count: items.length,
    sent_count: items.filter((x) => x.delivery_status === "sent").length,
    failed_count: items.filter((x) => x.delivery_status === "failed").length,
    cancelled_count: items.filter((x) => x.delivery_status === "cancelled").length
  };
}
