export function assertReplayCandidate(candidate = {}) {
  if (!candidate.notification_event_id) {
    throw new Error("notification_event_id is required for replay.");
  }

  const deliveryStatus = candidate.delivery_status || "unknown";
  if (!(deliveryStatus === "failed" || deliveryStatus === "pending")) {
    throw new Error("Replay is allowed only for failed or pending notification events.");
  }

  return candidate;
}

export function buildReplayLiveEnvelope(candidate = {}) {
  assertReplayCandidate(candidate);

  return {
    notification_event_id: candidate.notification_event_id,
    work_order_id: candidate.work_order_id || null,
    notification_type: candidate.notification_type || "unknown",
    replay_reason: candidate.replay_reason || "manual_replay",
    live_allowed: true
  };
}
