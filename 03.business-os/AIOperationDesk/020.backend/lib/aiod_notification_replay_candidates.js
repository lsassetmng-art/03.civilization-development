export function selectReplayCandidates(items = []) {
  return items.filter((item) => {
    const status = item.delivery_status || "pending";
    return status === "failed" || status === "pending";
  }).map((item) => {
    return {
      notification_event_id: item.notification_event_id,
      work_order_id: item.work_order_id || null,
      notification_type: item.notification_type || null,
      delivery_status: item.delivery_status || null,
      replay_reason:
        item.delivery_status === "failed"
          ? "provider_failed"
          : "provider_pending"
    };
  });
}

export function summarizeReplayCandidates(items = []) {
  const candidates = selectReplayCandidates(items);
  return {
    total_candidates: candidates.length,
    candidates
  };
}
