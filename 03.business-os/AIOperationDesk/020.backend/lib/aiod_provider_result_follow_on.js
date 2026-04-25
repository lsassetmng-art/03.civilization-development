import { readEnv } from "./aiod_env.js";
import { classifyProviderResult } from "./aiod_notification_retry_policy.js";
import { createProviderDispatchJournalStub } from "./aiod_provider_dispatch_journal_stub.js";
import { backwriteNotificationDeliveryResultPsql } from "./aiod_provider_result_backwrite_psql.js";

function dataMode() {
  return readEnv("AIOD_DATA_MODE", "mock");
}

export async function processProviderDispatchResult(input = {}) {
  const providerResult = input.provider_result || {};
  const notificationEvent = input.notification_event || null;

  const retryPolicy = classifyProviderResult(providerResult);

  const dispatchJournal = createProviderDispatchJournalStub({
    notification_event_id: notificationEvent?.notification_event_id || null,
    provider_mode: providerResult.provider_mode || "unknown",
    delivery_status: providerResult.delivery_status || "failed",
    provider_message_ref: providerResult.provider_message_ref || null,
    provider_error_code: providerResult.provider_error_code || null,
    provider_error_summary: providerResult.provider_error_summary || null
  });

  let dbBackwrite = null;

  if (dataMode() === "db_psql" && notificationEvent?.notification_event_id) {
    try {
      dbBackwrite = await backwriteNotificationDeliveryResultPsql({
        notification_event_id: notificationEvent.notification_event_id,
        delivery_status: providerResult.delivery_status || "failed"
      });
    } catch (e) {
      dbBackwrite = {
        persisted: false,
        error: e?.message || String(e)
      };
    }
  } else {
    dbBackwrite = {
      persisted: false,
      reason: "db_backwrite_skipped"
    };
  }

  return {
    dispatch_journal: dispatchJournal,
    retry_policy: retryPolicy,
    db_backwrite: dbBackwrite
  };
}
