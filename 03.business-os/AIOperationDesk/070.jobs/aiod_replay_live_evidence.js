export function buildReplayLiveEvidence(input = {}) {
  return {
    evidence_type: "replay_live_result",
    notification_event_id: input.notification_event_id || null,
    work_order_id: input.work_order_id || null,
    notification_type: input.notification_type || null,
    replay_reason: input.replay_reason || null,
    provider_delivery_status: input.provider_delivery_status || null,
    provider_error_code: input.provider_error_code || null,
    created_at: new Date().toISOString()
  };
}

export function summarizeReplayLiveEvidence(items = []) {
  return {
    total_count: items.length,
    success_like_count: items.filter((x) => x.provider_delivery_status === "sent").length,
    non_success_count: items.filter((x) => x.provider_delivery_status !== "sent").length
  };
}
