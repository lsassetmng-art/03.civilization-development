import {
  fetchNotificationEventRetentionReview,
  fetchAuditTraceRetentionReview,
  fetchSummaryBatchRetentionReview
} from "../020.backend/lib/aiod_retention_review_psql.js";
import { readEnv } from "../020.backend/lib/aiod_env.js";

function cleanupMode() {
  return readEnv("AIOD_CLEANUP_EXECUTION_MODE", "dry_run");
}

function summarize(items = []) {
  return {
    total_count: items.length,
    newest_created_at: items.length > 0 ? items[0].created_at || null : null
  };
}

export async function runCleanupExecutor() {
  const notificationEvents = await fetchNotificationEventRetentionReview();
  const auditTraces = await fetchAuditTraceRetentionReview();
  const summaryBatches = await fetchSummaryBatchRetentionReview();

  const result = {
    cleanup_mode: cleanupMode(),
    notification_event_summary: summarize(notificationEvents),
    audit_trace_summary: summarize(auditTraces),
    summary_batch_summary: summarize(summaryBatches),
    destructive_cleanup_executed: false
  };

  if (cleanupMode() === "guarded_live") {
    return {
      ...result,
      guarded_live_result: "no_delete_in_current_phase"
    };
  }

  return result;
}
