export function runNotificationCleanupExecutorStub() {
  return {
    job: "notification_cleanup_executor",
    status: "stub_ready"
  };
}

export function runAuditCleanupExecutorStub() {
  return {
    job: "audit_cleanup_executor",
    status: "stub_ready"
  };
}

export function runReplayExecutorStub() {
  return {
    job: "notification_replay_executor",
    status: "stub_ready"
  };
}
