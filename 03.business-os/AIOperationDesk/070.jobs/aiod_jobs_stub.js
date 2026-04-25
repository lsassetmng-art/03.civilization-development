export function runBatchSummaryJob() {
  return {
    job: "batch_summary",
    status: "stub_ready"
  };
}

export function runRetrySchedulerJob() {
  return {
    job: "retry_scheduler",
    status: "stub_ready"
  };
}

export function runNotificationDispatchJob() {
  return {
    job: "notification_dispatch",
    status: "stub_ready"
  };
}
