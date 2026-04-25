export function runAuditRetentionReviewJob() {
  return {
    job: "audit_retention_review",
    status: "stub_ready"
  };
}

export function runSummaryCleanupReviewJob() {
  return {
    job: "summary_cleanup_review",
    status: "stub_ready"
  };
}

export function runNotificationEventCleanupReviewJob() {
  return {
    job: "notification_event_cleanup_review",
    status: "stub_ready"
  };
}
